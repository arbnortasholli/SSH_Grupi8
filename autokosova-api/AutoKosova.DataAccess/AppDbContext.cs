using AutoKosova.Entity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Runtime.ConstrainedExecution;
using System.Text;

namespace AutoKosova.DataAccess
{
    public class AppDbContext(DbContextOptions options) : DbContext(options)
    {
            public DbSet<Account> Accounts { get; set; }

            public DbSet<AccountRole> AccountRoles { get; set; }

            public DbSet<Tenant> Tenants { get; set; }

            public DbSet<Cars> Cars { get; set; }

            public DbSet<CarImage> CarImages { get; set; }

            public DbSet<RentalBooking> RentalBookings{ get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // AccountRole 1 ---- * Account
            modelBuilder.Entity<Account>()
                .HasOne(a => a.AccountRole)
                .WithMany()
                .HasForeignKey(a => a.AccountRoleID)
                .OnDelete(DeleteBehavior.NoAction);

            // Account 1 ---- * Car
            modelBuilder.Entity<Cars>()
                .HasOne(c => c.CreatedByAccount)
                .WithMany(a => a.CreatedCars)
                .HasForeignKey(c => c.CreatedByAccountID)
                .OnDelete(DeleteBehavior.NoAction);

            // Tenant 1 ---- * Car
            // TenantID te Car është nullable, pra lidhja është optional.
            modelBuilder.Entity<Cars>()
                .HasOne(c => c.Tenant)
                .WithMany(t => t.Cars)
                .HasForeignKey(c => c.TenantID)
                .OnDelete(DeleteBehavior.NoAction);

            // Car 1 ---- * CarImage
            modelBuilder.Entity<CarImage>()
                .HasOne(ci => ci.Car)
                .WithMany(c => c.CarImages)
                .HasForeignKey(ci => ci.CarID)
                .OnDelete(DeleteBehavior.NoAction);

            // Tenant 1 ---- * RentalBooking
            modelBuilder.Entity<RentalBooking>()
                .HasOne(rb => rb.Tenant)
                .WithMany(t => t.RentalBookings)
                .HasForeignKey(rb => rb.TenantID)
                .OnDelete(DeleteBehavior.NoAction);

            // Car 1 ---- * RentalBooking
            modelBuilder.Entity<RentalBooking>()
                .HasOne(rb => rb.Car)
                .WithMany(c => c.RentalBookings)
                .HasForeignKey(rb => rb.CarID)
                .OnDelete(DeleteBehavior.NoAction);

            // Account 1 ---- * RentalBooking as Customer
            modelBuilder.Entity<RentalBooking>()
                .HasOne(rb => rb.CustomerAccount)
                .WithMany(a => a.RentalBookings)
                .HasForeignKey(rb => rb.CustomerAccountID)
                .OnDelete(DeleteBehavior.NoAction);

        }
    }

}
