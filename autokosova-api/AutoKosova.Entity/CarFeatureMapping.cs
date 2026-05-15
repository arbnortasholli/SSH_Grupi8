using System;

namespace AutoKosova.Entity
{
    public class CarFeatureMapping
    {
        public int CarFeatureMappingID { get; set; }

        public int CarID { get; set; }

        public int CarFeatureID { get; set; }

        public DateTime CarFeatureMappingCreationDate { get; set; } = DateTime.UtcNow;

        public bool CarFeatureMappingDeleted { get; set; } = false;

        public DateTime? CarFeatureMappingDeletedDate { get; set; }

        public Cars? Car { get; set; }

        public CarFeature? CarFeature { get; set; }
    }
}
