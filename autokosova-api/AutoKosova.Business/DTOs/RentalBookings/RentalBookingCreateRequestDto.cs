namespace AutoKosova.Business.DTOs.RentalBookings
{
    public class RentalBookingCreateRequestDto
    {
        public int CarID { get; set; }

        public DateTime RentalBookingStartDate { get; set; }

        public DateTime RentalBookingEndDate { get; set; }
    }
}