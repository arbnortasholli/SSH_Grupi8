using Microsoft.AspNetCore.Http;

namespace AutoKosova.Business.DTOs.CarImages
{
    public class CarImageUploadRequestDto
    {
        public List<IFormFile>? Images { get; set; }

        public int? MainImageIndex { get; set; }
    }
}
