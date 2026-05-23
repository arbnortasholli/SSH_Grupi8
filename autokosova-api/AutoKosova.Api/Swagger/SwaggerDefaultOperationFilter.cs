using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace AutoKosova.Api.Swagger
{
    public class SwaggerDefaultOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var actionName = context.MethodInfo.Name;
            var controllerName = context.MethodInfo.DeclaringType?.Name.Replace("Controller", string.Empty) ?? "Endpoint";
            var route = context.ApiDescription.RelativePath ?? string.Empty;
            var httpMethod = context.ApiDescription.HttpMethod?.ToUpperInvariant() ?? "HTTP";

            operation.Summary ??= BuildSummary(actionName, controllerName);
            operation.Description ??= BuildDescription(httpMethod, route, controllerName);

            AddResponse(operation, "200", "Kerkesa u procesua me sukses.");
            AddResponse(operation, "400", "Kerkesa nuk eshte valide.");
            AddResponse(operation, "404", "Resursi nuk u gjet.");

            if (RequiresAuthorization(context))
            {
                AddResponse(operation, "401", "Token mungon ose nuk eshte valid.");
                AddResponse(operation, "403", "Perdoruesi nuk ka leje per kete veprim.");
            }
        }

        private static string BuildSummary(string actionName, string controllerName)
        {
            return actionName switch
            {
                "GetAll" => $"Merr listen e {controllerName}.",
                "GetById" => $"Merr nje rekord nga {controllerName} sipas ID-se.",
                "Create" => $"Krijon nje rekord te ri ne {controllerName}.",
                "Update" => $"Perditeson nje rekord ekzistues ne {controllerName}.",
                "Delete" => $"Fshin ose deaktivizon nje rekord nga {controllerName}.",
                "Register" => "Regjistron nje llogari te re.",
                "Login" => "Autentikon perdoruesin dhe kthen JWT token.",
                "Search" => "Kerkon vetura sipas filtrave.",
                "GetForSale" => "Merr veturat qe jane ne shitje.",
                "GetForRent" => "Merr veturat qe jane me qira.",
                "GetMyCars" => "Merr veturat e nje llogarie.",
                "GetByTenant" => "Merr te dhenat sipas tenant-it.",
                "GetMyRequests" => "Merr tenant requests te perdoruesit aktual.",
                "Review" => "Aprovon ose refuzon nje tenant request.",
                "CreateCheckoutSession" => "Krijon sesion pagese per rezervim.",
                "GetPaymentStatus" => "Merr statusin e pageses.",
                "GetPaymentStatusByBooking" => "Merr statusin e pageses per rezervim.",
                "StripeWebhook" => "Pranon njoftime nga Stripe per pagesat.",
                "GetImagesByCarId" => "Merr imazhet e nje veture.",
                "GetImageById" => "Merr nje imazh sipas ID-se.",
                "UploadImages" => "Ngarkon imazhe per nje veture.",
                "UploadImage" => "Ngarkon nje ose me shume imazhe per nje veture.",
                "AddImageUrl" => "Shton URL te imazhit per nje veture.",
                "SetMainImage" => "Vendos imazhin kryesor.",
                "ReorderImages" => "Ndryshon renditjen e imazheve.",
                "DeleteImage" => "Fshin nje imazh.",
                "AddToFavorite" => "Shton veturen ne favorite.",
                "RemoveFromFavorite" => "Heq veturen nga favorite.",
                "GetMyFavorites" => "Merr listen e favoriteve te perdoruesit.",
                "GetFavoriteStatus" => "Kontrollon nese vetura eshte ne favorite.",
                "GetCarFeatures" => "Merr karakteristikat e nje veture.",
                "AssignFeatureToCar" => "I cakton nje karakteristike vetures.",
                "RemoveFeatureFromCar" => "Heq nje karakteristike nga vetura.",
                "GetMyBookings" => "Merr rezervimet e perdoruesit aktual.",
                "CheckAvailability" => "Kontrollon disponueshmerine e vetures per data te caktuara.",
                "UpdateStatus" => "Perditeson statusin e rezervimit.",
                _ => $"{actionName} ne {controllerName}."
            };
        }

        private static string BuildDescription(string httpMethod, string route, string controllerName)
        {
            return $"Endpoint {httpMethod} /{route} per modulin {controllerName}. Per endpointet e mbrojtura perdor JWT Bearer token nga butoni Authorize.";
        }

        private static bool RequiresAuthorization(OperationFilterContext context)
        {
            var methodAttributes = context.MethodInfo.GetCustomAttributes(true);
            var controllerAttributes = context.MethodInfo.DeclaringType?.GetCustomAttributes(true) ?? Array.Empty<object>();

            var hasAllowAnonymous = methodAttributes.Concat(controllerAttributes).Any(attribute => attribute is AllowAnonymousAttribute);
            if (hasAllowAnonymous)
            {
                return false;
            }

            return methodAttributes.Concat(controllerAttributes).Any(attribute =>
                attribute is AuthorizeAttribute ||
                attribute.GetType().Name.Contains("HasPermission", StringComparison.OrdinalIgnoreCase));
        }

        private static void AddResponse(OpenApiOperation operation, string statusCode, string description)
        {
            if (!operation.Responses.ContainsKey(statusCode))
            {
                operation.Responses.Add(statusCode, new OpenApiResponse { Description = description });
                return;
            }

            if (string.IsNullOrWhiteSpace(operation.Responses[statusCode].Description))
            {
                operation.Responses[statusCode].Description = description;
            }
        }
    }
}
