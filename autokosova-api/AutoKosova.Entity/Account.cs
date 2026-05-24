using System;
using System.Collections.Generic;
using System.Runtime.ConstrainedExecution;
using System.Text;

namespace AutoKosova.Entity
{
    public class Account
    {
        public int AccountID { get; set; }

        public int AccountRoleID { get; set; }

        public int? TenantID { get; set; }

        public required string AccountUsername { get; set; }

        public required string AccountEmail { get; set; }

        public required string AccountPasswordHash { get; set; }

        public required byte[] AccountPasswordSalt { get; set; }

        public required string AccountName { get; set; }

        public required string AccountLastname { get; set; }

        public string? AccountPhoneNumber { get; set; }

        public string? AccountAddress { get; set; }

        public string? AccountCity { get; set; }

        public bool AccountEmailConfirmed { get; set; }

        public int? AccountEmailConfirmationPIN { get; set; }

        public DateTime? AccountEmailVerifiedDate { get; set; }

        public DateTime? AccountEmailConfirmationPINExpirationDate { get; set; }

        public bool AccountLocked { get; set; }

        public DateTime? AccountLockDate { get; set; }

        public int AccountFailPasswordCount { get; set; }

        public DateTime? AccountLastFailedLoginDate { get; set; }

        public int? AccountForgetPasswordPIN { get; set; }

        public DateTime? AccountForgetPasswordPINExpirationDate { get; set; }

        public DateTime? AccountLastLoginDate { get; set; }

        public DateTime? AccountLastPasswordChangeDate { get; set; }

        public bool AccountIsActive { get; set; } = true;

        public bool AccountDeleted { get; set; }

        public DateTime? AccountDeletedDate { get; set; }

        public int? AccountDeletedByID { get; set; }

        public DateTime AccountCreationDate { get; set; } = DateTime.UtcNow;

        public string? AccountLanguage { get; set; }

        public string? AccountTimeZone { get; set; }

        public  AccountRole? AccountRole { get; set; }

        public Tenant? Tenant { get; set; }

        public Account? AccountDeletedBy { get; set; }

        public ICollection<Cars> CreatedCars { get; set; } = new List<Cars>();

        public ICollection<RentalBooking> RentalBookings { get; set; } = new List<RentalBooking>();

        public ICollection<PaymentOrder> PaymentOrders { get; set; } = new List<PaymentOrder>();

        public ICollection<TenantRequest> TenantRequests { get; set; } = new List<TenantRequest>();

        public ICollection<TenantRequest> ReviewedTenantRequests { get; set; } = new List<TenantRequest>();

        public ICollection<ExternalCarRequest> ExternalCarRequests { get; set; } = new List<ExternalCarRequest>();

        public ICollection<ExternalCarRequest> ReviewedExternalCarRequests { get; set; } = new List<ExternalCarRequest>();
    }
}
