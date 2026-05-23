namespace AutoKosova.Entity
{
    public class RentalBookingStatus
    {
        public int RentalBookingStatusID { get; set; }

        public required string RentalBookingStatusName { get; set; }

        public string? RentalBookingStatusDescription { get; set; }
    }
}
