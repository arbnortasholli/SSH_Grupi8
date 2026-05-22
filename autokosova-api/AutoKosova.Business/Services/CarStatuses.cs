namespace AutoKosova.Business.Services
{
    public static class CarStatuses
    {
        // General
        public const string Available = "Available";
        public const string Inactive = "Inactive";

        // For Sale only
        public const string Reserved = "Reserved";
        public const string Sold = "Sold";

        // For Rent only
        public const string Rented = "Rented";
        public const string UnderMaintenance = "Under Maintenance";

        public static readonly string[] SaleStatuses = { Available, Reserved, Sold, Inactive };
        public static readonly string[] RentStatuses = { Available, Rented, UnderMaintenance, Inactive };
    }
}
