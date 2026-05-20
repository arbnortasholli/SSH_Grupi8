namespace AutoKosova.Business.DTOs.RentalBookings
{
    public class CarAvailabilityResponseDto
    {
        public int CarID { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public bool IsAvailable { get; set; }

        public string Message { get; set; } = string.Empty;
    }
}