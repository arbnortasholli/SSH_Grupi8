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

        public DbSet<CarFavorite> CarFavorites { get; set; }

        public DbSet<CarFeature> CarFeatures { get; set; }

        public DbSet<CarFeatureMapping> CarFeatureMappings { get; set; }



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
        }
    }
}
