using AutoKosova.Business.DTOs.ExternalCars;
using Microsoft.Extensions.Configuration;
using StackExchange.Redis;
using System.Globalization;
using System.Net.Http.Json;
using System.Text.Json;

namespace AutoKosova.Business.Services
{
    public class ExternalCarService
    {
        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNameCaseInsensitive = true
        };

        private readonly IHttpClientFactory _httpClientFactory;
        private readonly RedisConnectionProvider _redisConnectionProvider;
        private readonly IConfiguration _configuration;

        public ExternalCarService(
            IHttpClientFactory httpClientFactory,
            RedisConnectionProvider redisConnectionProvider,
            IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _redisConnectionProvider = redisConnectionProvider;
            _configuration = configuration;
        }

        public async Task<ServiceResult<ExternalCarListResponseDto>> Search(ExternalCarSearchRequestDto request)
        {
            NormalizeRequest(request);

            var cacheKey = BuildCacheKey(request);
            IDatabase? database = null;

            var redis = _redisConnectionProvider.Connection;
            if (redis?.IsConnected == true)
            {
                database = redis.GetDatabase();
                var cachedValue = await database.StringGetAsync(cacheKey);

                if (cachedValue.HasValue)
                {
                    var cachedResponse = JsonSerializer.Deserialize<ExternalCarListResponseDto>((string)cachedValue!, JsonOptions);
                    if (cachedResponse != null)
                    {
                        cachedResponse.Cached = true;
                        return ServiceResult<ExternalCarListResponseDto>.Success(cachedResponse);
                    }
                }
            }

            var carapisResponse = await FetchFromCarapis(request);
            if (!carapisResponse.IsSuccess)
            {
                return carapisResponse;
            }

            if (database != null)
            {
                await database.StringSetAsync(
                    cacheKey,
                    JsonSerializer.Serialize(carapisResponse.Data, JsonOptions),
                    TimeSpan.FromMinutes(GetCacheMinutes()));
            }

            return carapisResponse;
        }

        private async Task<ServiceResult<ExternalCarListResponseDto>> FetchFromCarapis(ExternalCarSearchRequestDto request)
        {
            var client = _httpClientFactory.CreateClient("Carapis");
            var catalogPath = _configuration["Carapis:CatalogPath"] ?? "/apix/catalog_api/vehicles/";
            var requestUri = BuildCarapisRequestUri(catalogPath, request);

            HttpResponseMessage response;
            try
            {
                response = await client.GetAsync(requestUri);
            }
            catch (HttpRequestException ex)
            {
                return ServiceResult<ExternalCarListResponseDto>.BadRequest($"Carapis request failed: {ex.Message}");
            }
            catch (TaskCanceledException)
            {
                return ServiceResult<ExternalCarListResponseDto>.BadRequest("Carapis request timed out.");
            }

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                return ServiceResult<ExternalCarListResponseDto>.BadRequest(
                    $"Carapis returned {(int)response.StatusCode}: {error}");
            }

            var root = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
            var items = GetItems(root);
            var cars = items
                .Select(item => MapCar(item, client.BaseAddress))
                .Where(car => !string.IsNullOrWhiteSpace(car.Name))
                .ToList();

            return ServiceResult<ExternalCarListResponseDto>.Success(new ExternalCarListResponseDto
            {
                Page = request.Page,
                PageSize = request.PageSize,
                TotalRecords = GetTotalRecords(root, cars.Count),
                Cached = false,
                Data = cars
            });
        }

        private static void NormalizeRequest(ExternalCarSearchRequestDto request)
        {
            request.Page = request.Page <= 0 ? 1 : request.Page;
            request.PageSize = request.PageSize <= 0 ? 20 : request.PageSize;
            request.PageSize = request.PageSize > 50 ? 50 : request.PageSize;
            request.Brand = NormalizeString(request.Brand);
            request.Model = NormalizeString(request.Model);
            request.OrderBy = NormalizeString(request.OrderBy);
        }

        private static string? NormalizeString(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        }

        private static string BuildCacheKey(ExternalCarSearchRequestDto request)
        {
            return string.Join(
                ":",
                "external-cars",
                "carapis",
                "v8",
                $"page={request.Page}",
                $"pageSize={request.PageSize}",
                $"availableOnly={request.AvailableOnly}",
                $"brand={request.Brand?.ToLowerInvariant() ?? "all"}",
                $"model={request.Model?.ToLowerInvariant() ?? "all"}",
                $"yearFrom={request.YearFrom?.ToString(CultureInfo.InvariantCulture) ?? "any"}",
                $"yearTo={request.YearTo?.ToString(CultureInfo.InvariantCulture) ?? "any"}",
                $"priceFrom={request.PriceFrom?.ToString(CultureInfo.InvariantCulture) ?? "any"}",
                $"priceTo={request.PriceTo?.ToString(CultureInfo.InvariantCulture) ?? "any"}",
                $"mileageFrom={request.MileageFrom?.ToString(CultureInfo.InvariantCulture) ?? "any"}",
                $"mileageTo={request.MileageTo?.ToString(CultureInfo.InvariantCulture) ?? "any"}",
                $"orderBy={request.OrderBy?.ToLowerInvariant() ?? "default"}");
        }

        private static string BuildCarapisRequestUri(string catalogPath, ExternalCarSearchRequestDto request)
        {
            var query = new Dictionary<string, string?>
            {
                ["page"] = request.Page.ToString(CultureInfo.InvariantCulture),
                ["page_size"] = request.PageSize.ToString(CultureInfo.InvariantCulture),
                ["available_only"] = request.AvailableOnly.ToString().ToLowerInvariant(),
                ["brand"] = request.Brand,
                ["model"] = request.Model,
                ["year_from"] = request.YearFrom?.ToString(CultureInfo.InvariantCulture),
                ["year_to"] = request.YearTo?.ToString(CultureInfo.InvariantCulture),
                ["price_from"] = request.PriceFrom?.ToString(CultureInfo.InvariantCulture),
                ["price_to"] = request.PriceTo?.ToString(CultureInfo.InvariantCulture),
                ["mileage_from"] = request.MileageFrom?.ToString(CultureInfo.InvariantCulture),
                ["mileage_to"] = request.MileageTo?.ToString(CultureInfo.InvariantCulture),
                ["order_by"] = request.OrderBy
            };

            var queryString = string.Join(
                "&",
                query
                    .Where(pair => !string.IsNullOrWhiteSpace(pair.Value))
                    .Select(pair => $"{Uri.EscapeDataString(pair.Key)}={Uri.EscapeDataString(pair.Value!)}"));

            return $"{catalogPath}?{queryString}";
        }

        private static IEnumerable<JsonElement> GetItems(JsonElement root)
        {
            if (root.ValueKind == JsonValueKind.Array)
            {
                return root.EnumerateArray();
            }

            foreach (var propertyName in new[] { "results", "data", "items", "vehicles" })
            {
                if (root.TryGetProperty(propertyName, out var property) && property.ValueKind == JsonValueKind.Array)
                {
                    return property.EnumerateArray();
                }
            }

            return Enumerable.Empty<JsonElement>();
        }

        private static int GetTotalRecords(JsonElement root, int fallback)
        {
            foreach (var propertyName in new[] { "count", "total", "total_records", "totalRecords" })
            {
                if (root.TryGetProperty(propertyName, out var property) &&
                    property.ValueKind == JsonValueKind.Number &&
                    property.TryGetInt32(out var value))
                {
                    return value;
                }
            }

            return fallback;
        }

        private static ExternalCarResponseDto MapCar(JsonElement item, Uri? baseAddress)
        {
            var name = GetStringDeep(item, "name", "title", "car_name", "vehicle_name") ?? BuildName(item);

            return new ExternalCarResponseDto
            {
                ExternalId = GetStringDeep(item, "id", "uuid", "external_id", "vehicle_id") ?? name,
                Source = GetStringDeep(item, "source") ?? "Carapis",
                Name = name,
                Brand = GetStringDeep(item, "brand", "make", "manufacturer", "maker"),
                Model = GetStringDeep(item, "model", "model_name"),
                Trim = GetStringDeep(item, "trim", "grade", "variant", "version"),
                Year = GetIntDeep(item, "year", "model_year", "production_year"),
                Price = GetDecimalDeep(
                    item,
                    "price",
                    "sale_price",
                    "salePrice",
                    "vehicle_price",
                    "vehiclePrice",
                    "fob_price",
                    "fobPrice",
                    "total_price",
                    "totalPrice",
                    "price_usd",
                    "priceUsd",
                    "amount",
                    "value"),
                Currency = GetStringDeep(
                    item,
                    "currency",
                    "price_currency",
                    "priceCurrency",
                    "currency_code",
                    "currencyCode"),
                Mileage = GetIntDeep(item, "mileage", "odometer", "mileage_km", "odometer_km", "kilometers"),
                FuelType = GetStringDeep(item, "fuel_type", "fuelType", "fuel"),
                Transmission = GetStringDeep(item, "transmission", "transmission_type", "transmissionType", "gearbox"),
                BodyType = GetStringDeep(item, "body_type", "bodyType", "body", "vehicle_type", "vehicleType"),
                Color = GetStringDeep(item, "color", "exterior_color", "exteriorColor", "paint"),
                Engine = GetStringDeep(item, "engine", "engine_type", "engineType", "engine_size", "engineSize", "displacement"),
                Drivetrain = GetStringDeep(item, "drivetrain", "drive_type", "driveType", "drive"),
                ImageUrl = GetImageUrl(item, baseAddress),
                DetailUrl = NormalizeUrl(GetStringDeep(item, "detail_url", "detailUrl", "url", "source_url", "sourceUrl"), baseAddress),
                Available = GetBoolDeep(item, "available", "is_available", "isAvailable")
            };
        }

        private static string BuildName(JsonElement item)
        {
            var brand = GetStringDeep(item, "brand", "make", "manufacturer", "maker");
            var model = GetStringDeep(item, "model", "model_name");
            var trim = GetStringDeep(item, "trim", "grade", "variant", "version");
            var year = GetIntDeep(item, "year", "model_year", "production_year")?.ToString(CultureInfo.InvariantCulture);

            return string.Join(" ", new[] { brand, model, trim, year }.Where(value => !string.IsNullOrWhiteSpace(value)));
        }

        private static string? GetString(JsonElement item, params string[] propertyNames)
        {
            foreach (var propertyName in propertyNames)
            {
                if (item.TryGetProperty(propertyName, out var property))
                {
                    if (property.ValueKind == JsonValueKind.String)
                    {
                        return property.GetString();
                    }

                    if (property.ValueKind == JsonValueKind.Number || property.ValueKind == JsonValueKind.True || property.ValueKind == JsonValueKind.False)
                    {
                        return property.ToString();
                    }
                }
            }

            return null;
        }

        private static int? GetInt(JsonElement item, params string[] propertyNames)
        {
            foreach (var propertyName in propertyNames)
            {
                if (!item.TryGetProperty(propertyName, out var property))
                {
                    continue;
                }

                if (property.ValueKind == JsonValueKind.Number &&
                    property.TryGetInt32(out var value))
                {
                    return value;
                }

                if (property.ValueKind == JsonValueKind.String &&
                    int.TryParse(property.GetString(), NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsed))
                {
                    return parsed;
                }
            }

            return null;
        }

        private static decimal? GetDecimal(JsonElement item, params string[] propertyNames)
        {
            foreach (var propertyName in propertyNames)
            {
                if (!item.TryGetProperty(propertyName, out var property))
                {
                    continue;
                }

                if (property.ValueKind == JsonValueKind.Number &&
                    property.TryGetDecimal(out var value))
                {
                    return value;
                }

                if (property.ValueKind == JsonValueKind.String &&
                    decimal.TryParse(property.GetString(), NumberStyles.Number, CultureInfo.InvariantCulture, out var parsed))
                {
                    return parsed;
                }
            }

            return null;
        }

        private static bool? GetBool(JsonElement item, params string[] propertyNames)
        {
            foreach (var propertyName in propertyNames)
            {
                if (!item.TryGetProperty(propertyName, out var property))
                {
                    continue;
                }

                if (property.ValueKind == JsonValueKind.True)
                {
                    return true;
                }

                if (property.ValueKind == JsonValueKind.False)
                {
                    return false;
                }
            }

            return null;
        }

        private static string? GetStringDeep(JsonElement item, params string[] propertyNames)
        {
            if (!TryGetPropertyDeep(item, propertyNames, out var property))
            {
                return null;
            }

            if (property.ValueKind == JsonValueKind.String)
            {
                return property.GetString();
            }

            if (property.ValueKind == JsonValueKind.Number ||
                property.ValueKind == JsonValueKind.True ||
                property.ValueKind == JsonValueKind.False)
            {
                return property.ToString();
            }

            if (property.ValueKind == JsonValueKind.Object)
            {
                return GetString(property, "name", "title", "label", "value");
            }

            return null;
        }

        private static int? GetIntDeep(JsonElement item, params string[] propertyNames)
        {
            if (!TryGetPropertyDeep(item, propertyNames, out var property))
            {
                return null;
            }

            if (property.ValueKind == JsonValueKind.Number &&
                property.TryGetInt32(out var value))
            {
                return value;
            }

            if (property.ValueKind == JsonValueKind.String &&
                int.TryParse(property.GetString(), NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsed))
            {
                return parsed;
            }

            return null;
        }

        private static decimal? GetDecimalDeep(JsonElement item, params string[] propertyNames)
        {
            if (!TryGetPropertyDeep(item, propertyNames, out var property))
            {
                return null;
            }

            if (property.ValueKind == JsonValueKind.Number &&
                property.TryGetDecimal(out var value))
            {
                return value;
            }

            if (property.ValueKind == JsonValueKind.String &&
                decimal.TryParse(property.GetString(), NumberStyles.Number, CultureInfo.InvariantCulture, out var parsed))
            {
                return parsed;
            }

            if (property.ValueKind == JsonValueKind.Object)
            {
                return GetDecimalDeep(
                    property,
                    "amount",
                    "value",
                    "usd",
                    "eur",
                    "krw",
                    "price",
                    "raw");
            }

            return null;
        }

        private static bool? GetBoolDeep(JsonElement item, params string[] propertyNames)
        {
            if (!TryGetPropertyDeep(item, propertyNames, out var property))
            {
                return null;
            }

            if (property.ValueKind == JsonValueKind.True)
            {
                return true;
            }

            if (property.ValueKind == JsonValueKind.False)
            {
                return false;
            }

            if (property.ValueKind == JsonValueKind.String &&
                bool.TryParse(property.GetString(), out var parsed))
            {
                return parsed;
            }

            return null;
        }

        private static bool TryGetPropertyDeep(JsonElement item, string[] propertyNames, out JsonElement property)
        {
            if (item.ValueKind == JsonValueKind.Object)
            {
                foreach (var currentProperty in item.EnumerateObject())
                {
                    if (propertyNames.Any(propertyName =>
                        string.Equals(currentProperty.Name, propertyName, StringComparison.OrdinalIgnoreCase)))
                    {
                        property = currentProperty.Value;
                        return true;
                    }
                }

                foreach (var currentProperty in item.EnumerateObject())
                {
                    if (currentProperty.Value.ValueKind == JsonValueKind.Object &&
                        TryGetPropertyDeep(currentProperty.Value, propertyNames, out property))
                    {
                        return true;
                    }
                }
            }

            if (item.ValueKind == JsonValueKind.Array)
            {
                foreach (var element in item.EnumerateArray())
                {
                    if (TryGetPropertyDeep(element, propertyNames, out property))
                    {
                        return true;
                    }
                }
            }

            property = default;
            return false;
        }

        private static string? GetImageUrl(JsonElement item, Uri? baseAddress)
        {
            var directImage = GetString(
                item,
                "image_url",
                "imageUrl",
                "image",
                "main_image",
                "mainImage",
                "thumbnail",
                "thumbnail_url",
                "thumbnailUrl",
                "photo",
                "photo_url",
                "photoUrl",
                "picture",
                "picture_url",
                "pictureUrl");

            if (IsImageUrlCandidate(directImage))
            {
                return NormalizeImageUrl(directImage, baseAddress);
            }

            foreach (var propertyName in new[]
            {
                "image",
                "photo",
                "picture",
                "thumbnail",
                "main_image",
                "mainImage",
                "images",
                "photos",
                "pictures",
                "media",
                "gallery"
            })
            {
                if (item.TryGetProperty(propertyName, out var property) && property.ValueKind == JsonValueKind.Array)
                {
                    foreach (var image in property.EnumerateArray())
                    {
                        var imageUrl = GetImageUrlFromElement(image);
                        if (!string.IsNullOrWhiteSpace(imageUrl))
                        {
                            return NormalizeImageUrl(imageUrl, baseAddress);
                        }
                    }
                }

                if (item.TryGetProperty(propertyName, out var objectProperty) && objectProperty.ValueKind == JsonValueKind.Object)
                {
                    var imageUrl = GetImageUrlFromElement(objectProperty);
                    if (!string.IsNullOrWhiteSpace(imageUrl))
                    {
                        return NormalizeImageUrl(imageUrl, baseAddress);
                    }
                }
            }

            return null;
        }

        private static string? GetImageUrlFromElement(JsonElement element)
        {
            if (element.ValueKind == JsonValueKind.String)
            {
                var value = element.GetString();
                return IsImageUrlCandidate(value) ? value : null;
            }

            if (element.ValueKind != JsonValueKind.Object)
            {
                return null;
            }

            var imageUrl = GetString(
                element,
                "url",
                "src",
                "href",
                "image_url",
                "imageUrl",
                "photo_url",
                "photoUrl",
                "thumbnail",
                "thumbnail_url",
                "thumbnailUrl",
                "large",
                "medium",
                "small",
                "original");

            if (!string.IsNullOrWhiteSpace(imageUrl))
            {
                return IsImageUrlCandidate(imageUrl) ? imageUrl : null;
            }

            foreach (var child in element.EnumerateObject())
            {
                var nestedImageUrl = GetImageUrlFromElement(child.Value);
                if (!string.IsNullOrWhiteSpace(nestedImageUrl))
                {
                    return nestedImageUrl;
                }
            }

            return null;
        }

        private static bool IsImageUrlCandidate(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return false;
            }

            var trimmedValue = value.Trim();

            if (decimal.TryParse(trimmedValue, NumberStyles.Number, CultureInfo.InvariantCulture, out _))
            {
                return false;
            }

            return trimmedValue.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
                   trimmedValue.StartsWith("https://", StringComparison.OrdinalIgnoreCase) ||
                   trimmedValue.StartsWith("//", StringComparison.OrdinalIgnoreCase) ||
                   trimmedValue.StartsWith("/", StringComparison.OrdinalIgnoreCase) ||
                   trimmedValue.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase);
        }

        private static string? NormalizeImageUrl(string? value, Uri? baseAddress)
        {
            if (!IsImageUrlCandidate(value))
            {
                return null;
            }

            var trimmedValue = value!.Trim();
            if (trimmedValue.StartsWith("//", StringComparison.OrdinalIgnoreCase))
            {
                return $"https:{trimmedValue}";
            }

            if (Uri.TryCreate(trimmedValue, UriKind.Absolute, out var absoluteUri))
            {
                return absoluteUri.ToString();
            }

            if (baseAddress != null && Uri.TryCreate(baseAddress, trimmedValue, out var combinedUri))
            {
                return combinedUri.ToString();
            }

            return trimmedValue;
        }

        private static string? NormalizeUrl(string? value, Uri? baseAddress)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return null;
            }

            var trimmedValue = value.Trim();
            if (decimal.TryParse(trimmedValue, NumberStyles.Number, CultureInfo.InvariantCulture, out _))
            {
                return null;
            }

            if (trimmedValue.StartsWith("//", StringComparison.OrdinalIgnoreCase))
            {
                return $"https:{trimmedValue}";
            }

            if (Uri.TryCreate(trimmedValue, UriKind.Absolute, out var absoluteUri))
            {
                return absoluteUri.ToString();
            }

            if (trimmedValue.StartsWith("/", StringComparison.OrdinalIgnoreCase) &&
                baseAddress != null &&
                Uri.TryCreate(baseAddress, trimmedValue, out var combinedUri))
            {
                return combinedUri.ToString();
            }

            return null;
        }

        private int GetCacheMinutes()
        {
            return int.TryParse(_configuration["Carapis:CacheMinutes"], out var minutes) && minutes > 0
                ? minutes
                : 15;
        }

    }
}
