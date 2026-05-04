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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Account>()
                .HasOne(a => a.AccountRole)
                .WithMany()
                .HasForeignKey(a => a.AccountRoleID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Account>()
                .HasOne(a => a.AccountDeletedBy)
                .WithMany()
                .HasForeignKey(a => a.AccountDeletedByID)
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

            modelBuilder.Entity<CarImage>()
                .HasOne(ci => ci.Car)
                .WithMany(c => c.CarImages)
                .HasForeignKey(ci => ci.CarID)
                .OnDelete(DeleteBehavior.NoAction);

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
        }
    }
}