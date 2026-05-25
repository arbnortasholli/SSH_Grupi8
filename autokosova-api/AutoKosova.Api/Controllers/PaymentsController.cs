using AutoKosova.Business.DTOs.Payments;
using AutoKosova.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoKosova.Api.Controllers
{
    [ApiController]
    public class PaymentsController : BaseApiController
    {
        private readonly PaymentService _paymentService;

        public PaymentsController(PaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [Authorize]
        [HttpPost("api/payments/checkout-session")]
        public async Task<IActionResult> CreateCheckoutSession(CreateCheckoutSessionRequestDto request)
        {
            if (CurrentAccountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var result = await _paymentService.CreateCheckoutSession(request.RentalBookingID, CurrentAccountId.Value);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(result.Data);
        }

        [Authorize]
        [HttpGet("api/payments/{paymentOrderId:int}/status")]
        public async Task<IActionResult> GetPaymentStatus(int paymentOrderId)
        {
            if (CurrentAccountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var result = await _paymentService.GetPaymentStatusByOrder(paymentOrderId, CurrentAccountId.Value, CurrentRole, CurrentTenantId);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(result.Data);
        }

        [Authorize]
        [HttpGet("api/rental-bookings/{rentalBookingId:int}/payment-status")]
        public async Task<IActionResult> GetPaymentStatusByBooking(int rentalBookingId)
        {
            if (CurrentAccountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var result = await _paymentService.GetPaymentStatusByBooking(rentalBookingId, CurrentAccountId.Value, CurrentRole, CurrentTenantId);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(result.Data);
        }

        [AllowAnonymous]
        [HttpPost("api/payments/stripe/webhook")]
        public async Task<IActionResult> StripeWebhook()
        {
            using var reader = new StreamReader(Request.Body);
            var payload = await reader.ReadToEndAsync();
            var signature = Request.Headers["Stripe-Signature"].FirstOrDefault();

            var result = await _paymentService.ProcessStripeWebhook(payload, signature);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(new { message = result.Data });
        }
    }
}
