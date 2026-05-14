namespace AutoKosova.Business.Models
{
    public class CarImageCreateCommand
    {
        public string CarImageUrl { get; set; } = string.Empty;
        public bool CarImageIsMain { get; set; }
        public int CarImageOrderNumber { get; set; }
    }

    public class CarImageModel
    {
        public int CarImageID { get; set; }
        public int CarID { get; set; }
        public string CarImageUrl { get; set; } = string.Empty;
        public bool CarImageIsMain { get; set; }
        public int CarImageOrderNumber { get; set; }
        public DateTime CarImageCreationDate { get; set; }
    }

    public class CarImageMutationResult
    {
        public int CarImageID { get; set; }
    }
}
