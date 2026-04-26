using System;
using System.Collections.Generic;
using System.Text;

namespace AutoKosova.Entity
{
    public class Account
    {
        public int AccountID { get; set; }
        public required string AccountUsername { get; set; }
        public required string AccountEmail { get; set; }
        public required string AccountPassword { get; set; }
        public required byte[] AccountPasswordSalt { get; set; }
        public required AccountRole AccountRole { get; set; }
        //public AccountStatus AccountStatus { get; set; }
        public DateTime AccountCreationDate { get; set; }
        public required string AccountName { get; set; }
        public required string AccountLastname { get; set; }
        public required string AccountPersonalNumber { get; set; }
        public required DateTime AccountBirthDate { get; set; }
        public string? AccountGender { get; set; }
        public required string AccountAddress { get; set; }
        public required string AccountPhoneNumber { get; set; }
        public int AccountPhoneConfirmationPIN { get; set; }
        public string? AccountIDImageFront { get; set; }
        public string? AccountIDImageBack { get; set; }
        public string? AccountSelfieImage { get; set; }
        public DateTime AccountIDExpirationDate { get; set; }
        public string? AccountKYCRejectReason { get; set; }
        public bool AccountVerified { get; set; }
        public DateTime AccountVerifiedDate { get; set; }
        //public Account AccountVerifiedBy { get; set; }
        public bool? AccountTwoFactorEnabled { get; set; }
        //public Account2FAType AccountTwoFactorType { get; set; }
        public string? AccountPrivateKey { get; set; }
        public bool AccountLocked { get; set; }
        public DateTime AccountLockDate { get; set; }
        //public Account AccountLockBy { get; set; }
        public int AccountFailPasswordCount { get; set; }
        public DateTime AccountLastFailedLoginDate { get; set; }
        public int AccountEmailConfirmationPIN { get; set; }
        public DateTime? AccountEmailVerifiedDate { get; set; }
        public DateTime AccountEmailConfirmationPINExpirationDate { get; set; }
        public int AccountForgetPasswordPIN { get; set; }
        public DateTime AccountForgetPasswordPINExpirationDate { get; set; }
        public DateTime AccountLastLoginDate { get; set; }
        public DateTime AccountLastPasswordChangeDate { get; set; }
        //public Account AccountUserAgent { get; set; }
        public DateTime AccountTermsAcceptedDate { get; set; }
        public DateTime AccountPrivacyPolicyAcceptedDate { get; set; }
        public string? AccountTermsVersion { get; set; }
        public string? AccountLanguage { get; set; }
        public string? AccountTimeZone { get; set; }
        public bool AccountDeleted { get; set; }
        public DateTime AccountDeletedDate { get; set; }
        public Account? AccountDeletedBy { get; set; }
        //public List<AccountDocument> ListOfDocuments { get; set; }
    }
}
