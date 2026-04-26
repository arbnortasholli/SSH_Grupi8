using AutoKosova.Entity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace AutoKosova.DataAccess
{
    public class AppDbContext(DbContextOptions options) : DbContext(options)
    {
        public DbSet<Account> Accounts { get; set; }
        public DbSet<AccountRole> AccountsRole { get; set; }
    }
}
