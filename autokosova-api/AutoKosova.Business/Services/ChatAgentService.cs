using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using AutoKosova.Business.DTOs.Chat;
using AutoKosova.Business.Interfaces;
using AutoKosova.DataAccess;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AutoKosova.Business.Services
{
    public class ChatAgentService : IChatAgentService
    {
        private const int MaxMessages = 20;
        private const int MaxMessageLength = 2000;
        private const int CatalogSampleSize = 12;

        private readonly HttpClient _httpClient;
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<ChatAgentService> _logger;

        public ChatAgentService(
            HttpClient httpClient,
            AppDbContext context,
            IConfiguration configuration,
            ILogger<ChatAgentService> logger)
        {
            _httpClient = httpClient;
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<ServiceResult<ChatAgentResponseDto>> SendMessageAsync(
            ChatAgentRequestDto request,
            CancellationToken cancellationToken = default)
        {
            var enabled = _configuration.GetValue("OpenAI:Enabled", true);
            if (!enabled)
            {
                return ServiceResult<ChatAgentResponseDto>.BadRequest("Chat assistant is currently disabled.");
            }

            var apiKey = ResolveOpenAiApiKey();
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                return ServiceResult<ChatAgentResponseDto>.BadRequest(
                    "OpenAI API key is not configured. Set OpenAI:ApiKey in user secrets, appsettings.Development.json, or OPENAI_API_KEY.");
            }

            var validationError = ValidateRequest(request);
            if (validationError != null)
            {
                return ServiceResult<ChatAgentResponseDto>.BadRequest(validationError);
            }

            var model = _configuration["OpenAI:Model"] ?? "gpt-4o-mini";
            var maxTokens = _configuration.GetValue("OpenAI:MaxTokens", 600);
            var temperature = _configuration.GetValue("OpenAI:Temperature", 0.4);

            var catalogContext = await BuildCatalogContextAsync(cancellationToken);
            var systemPrompt = BuildSystemPrompt(catalogContext);

            var openAiMessages = new List<OpenAiMessage>
            {
                new("system", systemPrompt)
            };

            foreach (var message in request.Messages)
            {
                openAiMessages.Add(new OpenAiMessage(message.Role, message.Content.Trim()));
            }

            var payload = new OpenAiChatRequest
            {
                Model = model,
                Messages = openAiMessages,
                MaxTokens = maxTokens,
                Temperature = temperature
            };

            try
            {
                using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions");
                httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
                httpRequest.Content = new StringContent(
                    JsonSerializer.Serialize(payload, JsonOptions),
                    Encoding.UTF8,
                    "application/json");

                using var response = await _httpClient.SendAsync(httpRequest, cancellationToken);
                var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("OpenAI API error {StatusCode}: {Body}", response.StatusCode, responseBody);
                    return ServiceResult<ChatAgentResponseDto>.BadRequest(
                        MapOpenAiErrorMessage(responseBody, response.StatusCode));
                }

                var completion = JsonSerializer.Deserialize<OpenAiChatResponse>(responseBody, JsonOptions);
                var reply = completion?.Choices?.FirstOrDefault()?.Message?.Content?.Trim();

                if (string.IsNullOrWhiteSpace(reply))
                {
                    return ServiceResult<ChatAgentResponseDto>.BadRequest("The assistant returned an empty response.");
                }

                return ServiceResult<ChatAgentResponseDto>.Success(new ChatAgentResponseDto
                {
                    Reply = reply,
                    Model = completion?.Model ?? model
                });
            }
            catch (TaskCanceledException)
            {
                return ServiceResult<ChatAgentResponseDto>.BadRequest("The assistant request timed out. Please try again.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "OpenAI chat request failed.");
                return ServiceResult<ChatAgentResponseDto>.BadRequest(
                    "An unexpected error occurred while contacting the assistant.");
            }
        }

        private static string MapOpenAiErrorMessage(string responseBody, System.Net.HttpStatusCode statusCode)
        {
            try
            {
                using var doc = JsonDocument.Parse(responseBody);
                if (doc.RootElement.TryGetProperty("error", out var error))
                {
                    var code = error.TryGetProperty("code", out var codeEl)
                        ? codeEl.GetString()
                        : null;
                    var type = error.TryGetProperty("type", out var typeEl)
                        ? typeEl.GetString()
                        : null;

                    if (code == "insufficient_quota" || type == "insufficient_quota")
                    {
                        return "Llogaria OpenAI nuk ka kredit/billing aktiv. Shtoni metodë pagese në platform.openai.com dhe provoni përsëri.";
                    }

                    if (code == "invalid_api_key")
                    {
                        return "Çelësi OpenAI nuk është valid. Kontrolloni OpenAI:ApiKey dhe krijoni një çelës të ri.";
                    }

                    if (code == "rate_limit_exceeded")
                    {
                        return "Kufiri i kërkesave OpenAI u tejkalua. Prisni pak dhe provoni përsëri.";
                    }

                    if (error.TryGetProperty("message", out var messageEl))
                    {
                        var message = messageEl.GetString();
                        if (!string.IsNullOrWhiteSpace(message))
                        {
                            return message;
                        }
                    }
                }
            }
            catch
            {
                // Fall through to generic message.
            }

            return statusCode == System.Net.HttpStatusCode.Unauthorized
                ? "Autentifikimi me OpenAI dështoi. Kontrolloni API key."
                : "Nuk u mor përgjigje nga asistenti. Provoni përsëri më vonë.";
        }

        private string? ResolveOpenAiApiKey()
        {
            var fromConfig = _configuration["OpenAI:ApiKey"];
            if (!string.IsNullOrWhiteSpace(fromConfig))
            {
                return fromConfig.Trim();
            }

            var fromOpenAiEnv = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
            if (!string.IsNullOrWhiteSpace(fromOpenAiEnv))
            {
                return fromOpenAiEnv.Trim();
            }

            var fromDotNetEnv = Environment.GetEnvironmentVariable("OpenAI__ApiKey");
            if (!string.IsNullOrWhiteSpace(fromDotNetEnv))
            {
                return fromDotNetEnv.Trim();
            }

            return null;
        }

        private static string? ValidateRequest(ChatAgentRequestDto request)
        {
            if (request.Messages == null || request.Messages.Count == 0)
            {
                return "At least one message is required.";
            }

            if (request.Messages.Count > MaxMessages)
            {
                return $"A maximum of {MaxMessages} messages is allowed per request.";
            }

            var hasUserMessage = false;

            foreach (var message in request.Messages)
            {
                if (string.IsNullOrWhiteSpace(message.Role) || string.IsNullOrWhiteSpace(message.Content))
                {
                    return "Each message must have a role and content.";
                }

                var role = message.Role.Trim().ToLowerInvariant();
                if (role is not "user" and not "assistant")
                {
                    return "Message role must be 'user' or 'assistant'.";
                }

                if (role == "user")
                {
                    hasUserMessage = true;
                }

                if (message.Content.Length > MaxMessageLength)
                {
                    return $"Each message must be at most {MaxMessageLength} characters.";
                }
            }

            if (!hasUserMessage)
            {
                return "At least one user message is required.";
            }

            var lastMessage = request.Messages[^1];
            if (!string.Equals(lastMessage.Role.Trim(), "user", StringComparison.OrdinalIgnoreCase))
            {
                return "The last message must be from the user.";
            }

            return null;
        }

        private async Task<string> BuildCatalogContextAsync(CancellationToken cancellationToken)
        {
            try
            {
                return await BuildCatalogContextCoreAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not load car catalog for chat context.");
                return "Catalog snapshot unavailable (database not connected). Answer using general AutoKosova platform knowledge only.";
            }
        }

        private async Task<string> BuildCatalogContextCoreAsync(CancellationToken cancellationToken)
        {
            var saleCars = await _context.Cars
                .AsNoTracking()
                .Where(c => c.IsForSale && c.CarStatus == "Available")
                .OrderByDescending(c => c.CarCreationDate)
                .Take(CatalogSampleSize)
                .Select(c => new
                {
                    c.CarsID,
                    c.CarBrand,
                    c.CarModel,
                    c.CarYear,
                    c.SalePrice,
                    c.CarFuelType,
                    c.CarTransmission
                })
                .ToListAsync(cancellationToken);

            var rentCars = await _context.Cars
                .AsNoTracking()
                .Where(c => c.IsForRent && c.CarStatus == "Available")
                .OrderByDescending(c => c.CarCreationDate)
                .Take(CatalogSampleSize)
                .Select(c => new
                {
                    c.CarsID,
                    c.CarBrand,
                    c.CarModel,
                    c.CarYear,
                    c.RentalDailyPrice,
                    c.CarFuelType,
                    c.CarTransmission
                })
                .ToListAsync(cancellationToken);

            var sb = new StringBuilder();

            sb.AppendLine("Cars for sale (sample):");
            if (saleCars.Count == 0)
            {
                sb.AppendLine("- No available sale listings in the database right now.");
            }
            else
            {
                foreach (var car in saleCars)
                {
                    sb.AppendLine(
                        $"- ID {car.CarsID}: {car.CarBrand} {car.CarModel} ({car.CarYear}), " +
                        $"price {car.SalePrice:0.##} EUR, {car.CarFuelType}, {car.CarTransmission}");
                }
            }

            sb.AppendLine();
            sb.AppendLine("Cars for rent (sample):");
            if (rentCars.Count == 0)
            {
                sb.AppendLine("- No available rental listings in the database right now.");
            }
            else
            {
                foreach (var car in rentCars)
                {
                    sb.AppendLine(
                        $"- ID {car.CarsID}: {car.CarBrand} {car.CarModel} ({car.CarYear}), " +
                        $"daily {car.RentalDailyPrice:0.##} EUR, {car.CarFuelType}, {car.CarTransmission}");
                }
            }

            return sb.ToString();
        }

        private static string BuildSystemPrompt(string catalogContext)
        {
            return $"""
                You are AutoKosova Assistant, a helpful agent for the AutoKosova car marketplace in Kosovo.
                You help users with:
                - buying cars (browse /buy, car details by ID)
                - renting cars (browse /rent, check availability before booking)
                - account registration and login
                - favorites, seller listings, and tenant rental business requests
                - general navigation of the website

                Rules:
                - Be concise, friendly, and professional. Reply in the same language the user uses (Albanian or English).
                - Only answer topics related to AutoKosova, cars, rentals, and the platform.
                - If you do not know something, say so and suggest contacting support or browsing the site.
                - Never invent specific car IDs, prices, or availability that are not in the catalog snapshot below.
                - For bookings or payments, direct users to the website flows; you cannot complete transactions.

                Current catalog snapshot (may be incomplete):
                {catalogContext}
                """;
        }

        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        private sealed record OpenAiMessage(
            [property: JsonPropertyName("role")] string Role,
            [property: JsonPropertyName("content")] string Content);

        private sealed class OpenAiChatRequest
        {
            [JsonPropertyName("model")]
            public string Model { get; set; } = string.Empty;

            [JsonPropertyName("messages")]
            public List<OpenAiMessage> Messages { get; set; } = [];

            [JsonPropertyName("max_tokens")]
            public int MaxTokens { get; set; }

            [JsonPropertyName("temperature")]
            public double Temperature { get; set; }
        }

        private sealed class OpenAiChatResponse
        {
            [JsonPropertyName("model")]
            public string? Model { get; set; }

            [JsonPropertyName("choices")]
            public List<OpenAiChoice>? Choices { get; set; }
        }

        private sealed class OpenAiChoice
        {
            [JsonPropertyName("message")]
            public OpenAiMessage? Message { get; set; }
        }
    }
}
