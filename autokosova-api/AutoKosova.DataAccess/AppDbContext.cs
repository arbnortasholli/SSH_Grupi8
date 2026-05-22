using AutoKosova.Entity;
using Microsoft.EntityFrameworkCore;

namespace AutoKosova.DataAccess
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Account> Accounts { get; set; }
        public DbSet<AccountRole> AccountRoles { get; set; }
        public DbSet<Tenant> Tenants { get; set; }
        public DbSet<Cars> Cars { get; set; }
        public DbSet<CarImage> CarImages { get; set; }
        public DbSet<RentalBooking> RentalBookings { get; set; }
        public DbSet<RentalBookingStatus> RentalBookingStatuses { get; set; }
        public DbSet<PaymentOrder> PaymentOrders { get; set; }
        public DbSet<PaymentStatus> PaymentStatuses { get; set; }
        public DbSet<PaymentEvent> PaymentEvents { get; set; }
        public DbSet<TenantRequest> TenantRequests { get; set; }
        public DbSet<EmailQueue> EmailQueues { get; set; }

        public DbSet<CarFavorite> CarFavorites { get; set; }

        public DbSet<CarFeature> CarFeatures { get; set; }

        public DbSet<CarFeatureMapping> CarFeatureMappings { get; set; }

        public DbSet<Permission> Permissions { get; set; }
        public DbSet<AccountRolePermission> AccountRolePermissions { get; set; }



        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Account>()
                .HasOne(a => a.AccountRole)
                .WithMany()
                .HasForeignKey(a => a.AccountRoleID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Account>()
                .HasOne(a => a.Tenant)
                .WithMany()
                .HasForeignKey(a => a.TenantID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Account>()
                .HasOne(a => a.AccountDeletedBy)
                .WithMany()
                .HasForeignKey(a => a.AccountDeletedByID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Tenant>()
                .HasOne(t => t.OwnerAccount)
                .WithMany()
                .HasForeignKey(t => t.OwnerAccountID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<TenantRequest>()
                .HasOne(tr => tr.Account)
                .WithMany(a => a.TenantRequests)
                .HasForeignKey(tr => tr.AccountID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<TenantRequest>()
                .HasOne(tr => tr.ReviewedByAccount)
                .WithMany(a => a.ReviewedTenantRequests)
                .HasForeignKey(tr => tr.ReviewedByAccountID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<TenantRequest>()
                .HasOne(tr => tr.CreatedTenant)
                .WithMany(t => t.TenantRequests)
                .HasForeignKey(tr => tr.CreatedTenantID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Cars>()
                .HasOne(c => c.CreatedByAccount)
                .WithMany(a => a.CreatedCars)
                .HasForeignKey(c => c.CreatedByAccountID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Cars>()
                .HasOne(c => c.Tenant)
                .WithMany(t => t.Cars)
                .HasForeignKey(c => c.TenantID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Cars>()
                .Property(c => c.SalePrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Cars>()
                .Property(c => c.RentalDailyPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<CarImage>()
                .HasOne(ci => ci.Car)
                .WithMany(c => c.CarImages)
                .HasForeignKey(ci => ci.CarID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<CarImage>()
                .Property(ci => ci.CarImageOriginalFileName)
                .HasMaxLength(255);

            modelBuilder.Entity<CarImage>()
                .Property(ci => ci.CarImageContentType)
                .HasMaxLength(100);

            modelBuilder.Entity<CarFavorite>()
                .HasOne(cf => cf.Account)
                .WithMany()
                .HasForeignKey(cf => cf.AccountID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<CarFavorite>()
                .HasOne(cf => cf.Car)
                .WithMany()
                .HasForeignKey(cf => cf.CarID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<CarFavorite>()
                .HasIndex(cf => new { cf.AccountID, cf.CarID })
                .IsUnique();

            modelBuilder.Entity<CarFeatureMapping>()
                .HasOne(cfm => cfm.Car)
                .WithMany(c => c.CarFeatureMappings)
                .HasForeignKey(cfm => cfm.CarID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<CarFeatureMapping>()
                .HasOne(cfm => cfm.CarFeature)
                .WithMany(cf => cf.CarFeatureMappings)
                .HasForeignKey(cfm => cfm.CarFeatureID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<CarFeatureMapping>()
                .HasIndex(cfm => new { cfm.CarID, cfm.CarFeatureID })
                .IsUnique();

            modelBuilder.Entity<RentalBooking>()
                .HasOne(rb => rb.Tenant)
                .WithMany(t => t.RentalBookings)
                .HasForeignKey(rb => rb.TenantID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<RentalBooking>()
                .HasOne(rb => rb.Car)
                .WithMany(c => c.RentalBookings)
                .HasForeignKey(rb => rb.CarID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<RentalBooking>()
                .HasOne(rb => rb.CustomerAccount)
                .WithMany(a => a.RentalBookings)
                .HasForeignKey(rb => rb.CustomerAccountID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<RentalBooking>()
                .Property(rb => rb.RentalBookingDailyPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<RentalBooking>()
                .Property(rb => rb.RentalBookingTotalPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<RentalBooking>()
                .Property(rb => rb.RentalBookingStatus)
                .HasMaxLength(50);

            modelBuilder.Entity<RentalBookingStatus>()
                .HasIndex(status => status.RentalBookingStatusName)
                .IsUnique();

            modelBuilder.Entity<RentalBookingStatus>()
                .Property(status => status.RentalBookingStatusName)
                .HasMaxLength(50);

            modelBuilder.Entity<RentalBookingStatus>()
                .HasData(
                    new RentalBookingStatus { RentalBookingStatusID = 1, RentalBookingStatusName = "PendingPayment", RentalBookingStatusDescription = "Booking is waiting for payment." },
                    new RentalBookingStatus { RentalBookingStatusID = 2, RentalBookingStatusName = "Confirmed", RentalBookingStatusDescription = "Booking payment is confirmed." },
                    new RentalBookingStatus { RentalBookingStatusID = 3, RentalBookingStatusName = "Cancelled", RentalBookingStatusDescription = "Booking has been cancelled." },
                    new RentalBookingStatus { RentalBookingStatusID = 4, RentalBookingStatusName = "Completed", RentalBookingStatusDescription = "Booking has been completed." }
                );

            modelBuilder.Entity<PaymentStatus>()
                .HasIndex(status => status.PaymentStatusName)
                .IsUnique();

            modelBuilder.Entity<PaymentStatus>()
                .Property(status => status.PaymentStatusName)
                .HasMaxLength(50);

            modelBuilder.Entity<PaymentStatus>()
                .HasData(
                    new PaymentStatus { PaymentStatusID = 1, PaymentStatusName = "Pending", PaymentStatusDescription = "Payment is waiting to be completed." },
                    new PaymentStatus { PaymentStatusID = 2, PaymentStatusName = "Paid", PaymentStatusDescription = "Payment was completed successfully." },
                    new PaymentStatus { PaymentStatusID = 3, PaymentStatusName = "Failed", PaymentStatusDescription = "Payment failed." },
                    new PaymentStatus { PaymentStatusID = 4, PaymentStatusName = "Cancelled", PaymentStatusDescription = "Payment was cancelled." },
                    new PaymentStatus { PaymentStatusID = 5, PaymentStatusName = "Refunded", PaymentStatusDescription = "Payment was refunded." }
                );

            modelBuilder.Entity<PaymentOrder>()
                .HasOne(payment => payment.Account)
                .WithMany(account => account.PaymentOrders)
                .HasForeignKey(payment => payment.AccountID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<PaymentOrder>()
                .HasOne(payment => payment.RentalBooking)
                .WithMany(booking => booking.PaymentOrders)
                .HasForeignKey(payment => payment.RentalBookingID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<PaymentOrder>()
                .HasOne(payment => payment.PaymentStatus)
                .WithMany(status => status.PaymentOrders)
                .HasForeignKey(payment => payment.PaymentStatusID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<PaymentOrder>()
                .Property(payment => payment.Amount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PaymentOrder>()
                .Property(payment => payment.Currency)
                .HasMaxLength(10);

            modelBuilder.Entity<PaymentOrder>()
                .Property(payment => payment.PaymentProvider)
                .HasMaxLength(50);

            modelBuilder.Entity<PaymentOrder>()
                .Property(payment => payment.StripeCheckoutSessionID)
                .HasMaxLength(255);

            modelBuilder.Entity<PaymentOrder>()
                .Property(payment => payment.StripePaymentIntentID)
                .HasMaxLength(255);

            modelBuilder.Entity<PaymentEvent>()
                .HasOne(paymentEvent => paymentEvent.PaymentOrder)
                .WithMany()
                .HasForeignKey(paymentEvent => paymentEvent.PaymentOrderID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<PaymentEvent>()
                .HasIndex(paymentEvent => paymentEvent.StripeEventID)
                .IsUnique();

            modelBuilder.Entity<PaymentEvent>()
                .Property(paymentEvent => paymentEvent.StripeEventID)
                .HasMaxLength(255);

            modelBuilder.Entity<PaymentEvent>()
                .Property(paymentEvent => paymentEvent.EventType)
                .HasMaxLength(100);

            modelBuilder.Entity<PaymentEvent>()
                .Property(paymentEvent => paymentEvent.StripeCheckoutSessionID)
                .HasMaxLength(255);

            modelBuilder.Entity<PaymentEvent>()
                .Property(paymentEvent => paymentEvent.StripePaymentIntentID)
                .HasMaxLength(255);

            modelBuilder.Entity<EmailQueue>()
                .Property(email => email.ToEmail)
                .HasMaxLength(255);

            modelBuilder.Entity<EmailQueue>()
                .Property(email => email.Subject)
                .HasMaxLength(255);

            modelBuilder.Entity<EmailQueue>()
                .Property(email => email.Status)
                .HasMaxLength(50);
        }
    }
}
