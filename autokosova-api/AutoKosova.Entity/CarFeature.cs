using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace AutoKosova.Entity
{
    public class CarFeature
    {
        public int CarFeatureID { get; set; }

        [Required]
        public required string CarFeatureName { get; set; }

        public string? CarFeatureDescription { get; set; }

        public bool CarFeatureIsActive { get; set; } = true;

        public int CarFeatureOrderNumber { get; set; }

        public DateTime CarFeatureCreationDate { get; set; } = DateTime.UtcNow;

        public bool CarFeatureDeleted { get; set; } = false;

        public DateTime? CarFeatureDeletedDate { get; set; }

        public ICollection<CarFeatureMapping> CarFeatureMappings { get; set; } = new List<CarFeatureMapping>();
    }
}
