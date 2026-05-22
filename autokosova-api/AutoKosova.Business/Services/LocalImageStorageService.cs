using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace AutoKosova.Business.Services
{
    public class LocalImageStorageService
    {
        private readonly IWebHostEnvironment _environment;
        private const string UploadsFolder = "uploads/cars";
        private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg", ".jpeg", ".png", ".webp"
        };
        private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "image/jpeg", "image/png", "image/webp"
        };

        public LocalImageStorageService(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        public async Task<string> SaveImageAsync(IFormFile file, int carId)
        {
            var validationError = ValidateImage(file);
            if (validationError != null)
            {
                throw new InvalidOperationException(validationError);
            }

            string carFolderPath = Path.Combine(_environment.WebRootPath, UploadsFolder, carId.ToString());
            
            if (!Directory.Exists(carFolderPath))
            {
                Directory.CreateDirectory(carFolderPath);
            }

            string extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            string fileName = $"{Guid.NewGuid():N}{extension}";
            string filePath = Path.Combine(carFolderPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return $"/uploads/cars/{carId}/{fileName}";
        }

        public void DeleteImage(string relativePath)
        {
            if (string.IsNullOrWhiteSpace(relativePath)) return;

            // Sigurohemi që path-i fillon me /
            string normalizedPath = relativePath.Replace("\\", "/");
            if (!normalizedPath.StartsWith("/"))
            {
                normalizedPath = "/" + normalizedPath;
            }

            // Kontrollojmë nëse path-i është brenda folderit të upload-eve për siguri
            if (!normalizedPath.StartsWith("/uploads/cars/")) return;

            string fullPath = Path.Combine(_environment.WebRootPath, normalizedPath.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString()));

            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }
        }

        public void DeleteCarFolder(int carId)
        {
            string carFolderPath = Path.Combine(_environment.WebRootPath, UploadsFolder, carId.ToString());
            if (Directory.Exists(carFolderPath))
            {
                Directory.Delete(carFolderPath, true);
            }
        }

        public string? ValidateImage(IFormFile? file)
        {
            if (file == null || file.Length == 0)
            {
                return "Image file is required.";
            }

            if (file.Length > 5 * 1024 * 1024)
            {
                return "Each image must be 5MB or smaller.";
            }

            var extension = Path.GetExtension(file.FileName);
            if (string.IsNullOrWhiteSpace(extension))
            {
                return "Image file extension is required.";
            }

            if (!AllowedExtensions.Contains(extension.ToLowerInvariant()))
            {
                return "Only JPG, JPEG, PNG and WEBP images are allowed.";
            }

            if (!AllowedContentTypes.Contains(file.ContentType))
            {
                return "Only image/jpeg, image/png and image/webp content types are allowed.";
            }

            return null;
        }
    }
}
