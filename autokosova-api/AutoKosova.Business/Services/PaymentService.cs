using System.Globalization;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using AutoKosova.Business.DTOs.Payments;
using AutoKosova.DataAccess;
using AutoKosova.Entity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace AutoKosova.Business.Services
{
    public class PaymentService
    {
        private readonly AppDbContext _context;
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public PaymentService(AppDbContext context, HttpClient httpClient, IConfiguration configuration)
        {
            _context = context;
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<ServiceResult<CheckoutSessionResponseDto>> CreateCheckoutSession(int rentalBookingId, int accountId)
        {
            var booking = await _context.RentalBookings
                .Include(rb => rb.Car)
                .Include(rb => rb.PaymentOrders)
                .FirstOrDefaultAsync(rb => rb.RentalBookingID == rentalBookingId && !rb.RentalBookingDeleted);

            if (booking == null)
            {
                return ServiceResult<CheckoutSessionResponseDto>.NotFound("Rental booking not found.");
            }

            if (booking.CustomerAccountID != accountId)
            {
                return ServiceResult<CheckoutSessionResponseDto>.Forbidden("You are not allowed to pay this booking.");
            }

            if (booking.RentalBookingStatus != PaymentConstants.RentalStatusPendingPayment)
            {
                return ServiceResult<CheckoutSessionResponseDto>.BadRequest("Only bookings waiting for payment can be paid.");
            }

            if (booking.RentalBookingTotalPrice <= 0)
            {
                return ServiceResult<CheckoutSessionResponseDto>.BadRequest("Booking total price is not valid.");
            }

            var secretKey = _configuration["Stripe:SecretKey"];
            if (string.IsNullOrWhiteSpace(secretKey))
            {
                return ServiceResult<CheckoutSessionResponseDto>.BadRequest("Stripe secret key is not configured.");
            }

            var order = booking.PaymentOrders
                .Where(po => po.PaymentStatusID == PaymentConstants.PaymentStatusPending)
                .OrderByDescending(po => po.CreatedDate)
                .FirstOrDefault();

            if (order == null)
            {
                order = new PaymentOrder
                {
                    AccountID = accountId,
                    RentalBookingID = booking.RentalBookingID,
                    Amount = booking.RentalBookingTotalPrice,
                    Currency = GetCurrency(),
                    PaymentStatusID = PaymentConstants.PaymentStatusPending,
                    PaymentProvider = PaymentConstants.ProviderStripe,
                    CreatedDate = DateTime.UtcNow
                };

                _context.PaymentOrders.Add(order);
                await _context.SaveChangesAsync();
            }

            var checkoutResult = await CreateStripeCheckoutSession(order, booking, secretKey);
            if (!checkoutResult.IsSuccess)
            {
                return ServiceResult<CheckoutSessionResponseDto>.BadRequest(checkoutResult.Error!);
            }

            order.StripeCheckoutSessionID = checkoutResult.Data!.SessionId;
            order.StripePaymentIntentID = checkoutResult.Data.PaymentIntentId;
            await _context.SaveChangesAsync();

            return ServiceResult<CheckoutSessionResponseDto>.Success(new CheckoutSessionResponseDto
            {
                PaymentOrderID = order.PaymentOrderID,
                RentalBookingID = booking.RentalBookingID,
                CheckoutUrl = checkoutResult.Data.CheckoutUrl,
                StripeCheckoutSessionID = checkoutResult.Data.SessionId
            });
        }

        public async Task<ServiceResult<PaymentStatusResponseDto>> GetPaymentStatusByOrder(int paymentOrderId, int accountId, string? role, int? tenantId)
        {
            var order = await GetOrderQuery()
                .FirstOrDefaultAsync(po => po.PaymentOrderID == paymentOrderId);

            if (order == null)
            {
                return ServiceResult<PaymentStatusResponseDto>.NotFound("Payment order not found.");
            }

            if (!CanAccessOrder(order, accountId, role, tenantId))
            {
                return ServiceResult<PaymentStatusResponseDto>.Forbidden("You are not allowed to view this payment.");
            }

            await SyncPendingOrderWithStripe(order);

            return ServiceResult<PaymentStatusResponseDto>.Success(ToStatusDto(order));
        }

        public async Task<ServiceResult<PaymentStatusResponseDto>> GetPaymentStatusByBooking(int rentalBookingId, int accountId, string? role, int? tenantId)
        {
            var order = await GetOrderQuery()
                .Where(po => po.RentalBookingID == rentalBookingId)
                .OrderByDescending(po => po.CreatedDate)
                .FirstOrDefaultAsync();

            if (order == null)
            {
                return ServiceResult<PaymentStatusResponseDto>.NotFound("Payment order not found.");
            }

            if (!CanAccessOrder(order, accountId, role, tenantId))
            {
                return ServiceResult<PaymentStatusResponseDto>.Forbidden("You are not allowed to view this payment.");
            }

            await SyncPendingOrderWithStripe(order);

            return ServiceResult<PaymentStatusResponseDto>.Success(ToStatusDto(order));
        }

        public async Task<ServiceResult<string>> ProcessStripeWebhook(string payload, string? signatureHeader)
        {
            var webhookSecret = _configuration["Stripe:WebhookSecret"];
            if (string.IsNullOrWhiteSpace(webhookSecret))
            {
                return ServiceResult<string>.BadRequest("Stripe webhook secret is not configured.");
            }

            if (!VerifyStripeSignature(payload, signatureHeader, webhookSecret))
            {
                return ServiceResult<string>.BadRequest("Invalid Stripe signature.");
            }

            using var document = JsonDocument.Parse(payload);
            var root = document.RootElement;
            var stripeEventId = root.GetProperty("id").GetString();
            var eventType = root.GetProperty("type").GetString();

            if (string.IsNullOrWhiteSpace(stripeEventId) || string.IsNullOrWhiteSpace(eventType))
            {
                return ServiceResult<string>.BadRequest("Invalid Stripe event payload.");
            }

            var existingEvent = await _context.PaymentEvents
                .FirstOrDefaultAsync(evt => evt.StripeEventID == stripeEventId);

            if (existingEvent != null)
            {
                return ServiceResult<string>.Success("Stripe event already processed.");
            }

            var paymentObject = root.GetProperty("data").GetProperty("object");
            var checkoutSessionId = GetString(paymentObject, "id");
            var paymentIntentId = GetString(paymentObject, "payment_intent");

            var paymentEvent = new PaymentEvent
            {
                StripeEventID = stripeEventId,
                EventType = eventType,
                StripeCheckoutSessionID = eventType.StartsWith("checkout.session", StringComparison.OrdinalIgnoreCase) ? checkoutSessionId : null,
                StripePaymentIntentID = eventType.StartsWith("payment_intent", StringComparison.OrdinalIgnoreCase) ? checkoutSessionId : paymentIntentId,
                Payload = payload,
                ReceivedDate = DateTime.UtcNow
            };

            _context.PaymentEvents.Add(paymentEvent);

            var order = await FindOrderForStripeObject(eventType, checkoutSessionId, paymentIntentId);
            if (order != null)
            {
                paymentEvent.PaymentOrderID = order.PaymentOrderID;
                await ApplyStripeEventToOrder(order, eventType, paymentObject);
            }

            paymentEvent.ProcessedDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return ServiceResult<string>.Success("Stripe event processed.");
        }

        private async Task<ServiceResult<(string SessionId, string CheckoutUrl, string? PaymentIntentId)>> CreateStripeCheckoutSession(
            PaymentOrder order,
            RentalBooking booking,
            string secretKey)
        {
            var amountInCents = (long)Math.Round(order.Amount * 100, MidpointRounding.AwayFromZero);
            var productName = booking.Car == null
                ? $"Rental booking #{booking.RentalBookingID}"
                : $"{booking.Car.CarBrand} {booking.Car.CarModel} rental";

            var values = new Dictionary<string, string>
            {
                ["mode"] = "payment",
                ["success_url"] = BuildReturnUrl("Stripe:SuccessUrl", order.PaymentOrderID, booking.RentalBookingID),
                ["cancel_url"] = BuildReturnUrl("Stripe:CancelUrl", order.PaymentOrderID, booking.RentalBookingID),
                ["line_items[0][quantity]"] = "1",
                ["line_items[0][price_data][currency]"] = order.Currency,
                ["line_items[0][price_data][unit_amount]"] = amountInCents.ToString(CultureInfo.InvariantCulture),
                ["line_items[0][price_data][product_data][name]"] = productName,
                ["metadata[paymentOrderID]"] = order.PaymentOrderID.ToString(CultureInfo.InvariantCulture),
                ["metadata[rentalBookingID]"] = booking.RentalBookingID.ToString(CultureInfo.InvariantCulture),
                ["metadata[accountID]"] = order.AccountID.ToString(CultureInfo.InvariantCulture)
            };

            using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.stripe.com/v1/checkout/sessions")
            {
                Content = new FormUrlEncodedContent(values)
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", secretKey);

            using var response = await _httpClient.SendAsync(request);
            var body = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                return ServiceResult<(string SessionId, string CheckoutUrl, string? PaymentIntentId)>.BadRequest($"Stripe checkout session failed: {body}");
            }

            using var document = JsonDocument.Parse(body);
            var root = document.RootElement;
            var sessionId = GetString(root, "id");
            var checkoutUrl = GetString(root, "url");
            var paymentIntentId = GetString(root, "payment_intent");

            if (string.IsNullOrWhiteSpace(sessionId) || string.IsNullOrWhiteSpace(checkoutUrl))
            {
                return ServiceResult<(string SessionId, string CheckoutUrl, string? PaymentIntentId)>.BadRequest("Stripe did not return a valid checkout session.");
            }

            return ServiceResult<(string SessionId, string CheckoutUrl, string? PaymentIntentId)>.Success((sessionId, checkoutUrl, paymentIntentId));
        }

        private async Task SyncPendingOrderWithStripe(PaymentOrder order)
        {
            if (order.PaymentStatusID != PaymentConstants.PaymentStatusPending ||
                string.IsNullOrWhiteSpace(order.StripeCheckoutSessionID))
            {
                return;
            }

            var secretKey = _configuration["Stripe:SecretKey"];
            if (string.IsNullOrWhiteSpace(secretKey))
            {
                return;
            }

            using var request = new HttpRequestMessage(
                HttpMethod.Get,
                $"https://api.stripe.com/v1/checkout/sessions/{order.StripeCheckoutSessionID}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", secretKey);

            using var response = await _httpClient.SendAsync(request);
            var body = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                return;
            }

            using var document = JsonDocument.Parse(body);
            var session = document.RootElement;
            var sessionStatus = GetString(session, "status");
            var paymentStatus = GetString(session, "payment_status");
            var paymentIntentId = GetString(session, "payment_intent");
            var now = DateTime.UtcNow;

            if (sessionStatus == "complete" && paymentStatus == "paid")
            {
                order.StripePaymentIntentID ??= paymentIntentId;
                order.PaymentStatusID = PaymentConstants.PaymentStatusPaid;
                order.PaidDate = now;

                if (order.RentalBooking != null)
                {
                    order.RentalBooking.RentalBookingStatus = PaymentConstants.RentalStatusConfirmed;
                    order.RentalBooking.RentalBookingUpdatedDate = now;
                }

                await AddStripeSyncEvent(order, "checkout.session.completed.sync", body, now);
                await _context.SaveChangesAsync();
            }
            else if (sessionStatus == "expired")
            {
                order.PaymentStatusID = PaymentConstants.PaymentStatusCancelled;
                order.CancelledDate = now;

                if (order.RentalBooking != null)
                {
                    order.RentalBooking.RentalBookingStatus = PaymentConstants.RentalStatusCancelled;
                    order.RentalBooking.RentalBookingUpdatedDate = now;
                }

                await AddStripeSyncEvent(order, "checkout.session.expired.sync", body, now);
                await _context.SaveChangesAsync();
            }
        }

        private async Task AddStripeSyncEvent(PaymentOrder order, string eventType, string payload, DateTime now)
        {
            var stripeEventId = $"{eventType}:{order.StripeCheckoutSessionID}";
            var exists = await _context.PaymentEvents.AnyAsync(evt => evt.StripeEventID == stripeEventId);

            if (exists)
            {
                return;
            }

            _context.PaymentEvents.Add(new PaymentEvent
            {
                StripeEventID = stripeEventId,
                EventType = eventType,
                StripeCheckoutSessionID = order.StripeCheckoutSessionID,
                StripePaymentIntentID = order.StripePaymentIntentID,
                PaymentOrderID = order.PaymentOrderID,
                Payload = payload,
                ReceivedDate = now,
                ProcessedDate = now
            });
        }

        private async Task<PaymentOrder?> FindOrderForStripeObject(string eventType, string? objectId, string? paymentIntentId)
        {
            var query = _context.PaymentOrders
                .Include(po => po.RentalBooking)
                .Include(po => po.PaymentStatus)
                .AsQueryable();

            if (eventType.StartsWith("checkout.session", StringComparison.OrdinalIgnoreCase))
            {
                return await query.FirstOrDefaultAsync(po => po.StripeCheckoutSessionID == objectId);
            }

            if (eventType.StartsWith("payment_intent", StringComparison.OrdinalIgnoreCase))
            {
                return await query.FirstOrDefaultAsync(po => po.StripePaymentIntentID == objectId);
            }

            return paymentIntentId == null
                ? null
                : await query.FirstOrDefaultAsync(po => po.StripePaymentIntentID == paymentIntentId);
        }

        private static Task ApplyStripeEventToOrder(PaymentOrder order, string eventType, JsonElement paymentObject)
        {
            var now = DateTime.UtcNow;

            if (eventType == "checkout.session.completed" && GetString(paymentObject, "payment_status") == "paid")
            {
                order.StripePaymentIntentID ??= GetString(paymentObject, "payment_intent");
                order.PaymentStatusID = PaymentConstants.PaymentStatusPaid;
                order.PaidDate = now;

                if (order.RentalBooking != null)
                {
                    order.RentalBooking.RentalBookingStatus = PaymentConstants.RentalStatusConfirmed;
                    order.RentalBooking.RentalBookingUpdatedDate = now;
                }
            }
            else if (eventType == "checkout.session.expired")
            {
                order.PaymentStatusID = PaymentConstants.PaymentStatusCancelled;
                order.CancelledDate = now;

                if (order.RentalBooking != null)
                {
                    order.RentalBooking.RentalBookingStatus = PaymentConstants.RentalStatusCancelled;
                    order.RentalBooking.RentalBookingUpdatedDate = now;
                }
            }
            else if (eventType is "payment_intent.payment_failed" or "checkout.session.async_payment_failed")
            {
                order.PaymentStatusID = PaymentConstants.PaymentStatusFailed;
                order.FailedDate = now;
            }

            return Task.CompletedTask;
        }

        private IQueryable<PaymentOrder> GetOrderQuery()
        {
            return _context.PaymentOrders
                .Include(po => po.PaymentStatus)
                .Include(po => po.RentalBooking)
                    .ThenInclude(rb => rb!.Car)
                .AsQueryable();
        }

        private static PaymentStatusResponseDto ToStatusDto(PaymentOrder order)
        {
            return new PaymentStatusResponseDto
            {
                PaymentOrderID = order.PaymentOrderID,
                RentalBookingID = order.RentalBookingID,
                Amount = order.Amount,
                Currency = order.Currency,
                PaymentStatus = order.PaymentStatus?.PaymentStatusName ?? string.Empty,
                PaymentProvider = order.PaymentProvider,
                StripeCheckoutSessionID = order.StripeCheckoutSessionID,
                StripePaymentIntentID = order.StripePaymentIntentID,
                RentalBookingStatus = order.RentalBooking?.RentalBookingStatus ?? string.Empty,
                CreatedDate = order.CreatedDate,
                PaidDate = order.PaidDate,
                FailedDate = order.FailedDate,
                CancelledDate = order.CancelledDate
            };
        }

        private static bool CanAccessOrder(PaymentOrder order, int accountId, string? role, int? tenantId)
        {
            var isCustomer = order.AccountID == accountId;
            var isCarOwner = order.RentalBooking?.Car?.CreatedByAccountID == accountId;
            var isAdmin = IsSuperAdmin(role);
            var isTenantMember =
                IsRentalRole(role) &&
                tenantId.HasValue &&
                order.RentalBooking?.TenantID == tenantId.Value;

            return isCustomer || isCarOwner || isAdmin || isTenantMember;
        }

        private static bool IsSuperAdmin(string? role)
        {
            return string.Equals(role, "SuperAdmin", StringComparison.OrdinalIgnoreCase);
        }

        private static bool IsRentalRole(string? role)
        {
            return string.Equals(role, "Rental", StringComparison.OrdinalIgnoreCase) ||
                   string.Equals(role, "Seller", StringComparison.OrdinalIgnoreCase);
        }

        private string GetCurrency()
        {
            return (_configuration["Stripe:Currency"] ?? "eur").Trim().ToLowerInvariant();
        }

        private string BuildReturnUrl(string configKey, int paymentOrderId, int rentalBookingId)
        {
            var baseUrl = _configuration[configKey] ?? "http://localhost:3000/payment-status";
            var separator = baseUrl.Contains('?') ? "&" : "?";

            return $"{baseUrl}{separator}paymentOrderId={paymentOrderId}&rentalBookingId={rentalBookingId}&session_id={{CHECKOUT_SESSION_ID}}";
        }

        private static bool VerifyStripeSignature(string payload, string? signatureHeader, string webhookSecret)
        {
            if (string.IsNullOrWhiteSpace(signatureHeader))
            {
                return false;
            }

            var parts = signatureHeader.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            var timestamp = parts.FirstOrDefault(part => part.StartsWith("t=", StringComparison.OrdinalIgnoreCase))?[2..];
            var signature = parts.FirstOrDefault(part => part.StartsWith("v1=", StringComparison.OrdinalIgnoreCase))?[3..];

            if (string.IsNullOrWhiteSpace(timestamp) || string.IsNullOrWhiteSpace(signature))
            {
                return false;
            }

            if (long.TryParse(timestamp, out var timestampSeconds))
            {
                var eventTime = DateTimeOffset.FromUnixTimeSeconds(timestampSeconds);
                if (DateTimeOffset.UtcNow - eventTime > TimeSpan.FromMinutes(5))
                {
                    return false;
                }
            }

            var signedPayload = $"{timestamp}.{payload}";
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(webhookSecret));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(signedPayload));
            var expectedSignature = Convert.ToHexString(hash).ToLowerInvariant();

            return CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(expectedSignature),
                Encoding.UTF8.GetBytes(signature));
        }

        private static string? GetString(JsonElement element, string propertyName)
        {
            if (!element.TryGetProperty(propertyName, out var property) || property.ValueKind == JsonValueKind.Null)
            {
                return null;
            }

            return property.ValueKind == JsonValueKind.String
                ? property.GetString()
                : property.ToString();
        }
    }
}
