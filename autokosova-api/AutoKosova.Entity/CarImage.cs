using System;
using System.Collections.Generic;
using System.Runtime.ConstrainedExecution;
using System.Text;

namespace AutoKosova.Entity
{
    public class CarImage
    {
        public int CarImageID { get; set; }

        public int CarID { get; set; }

        public required string CarImageUrl { get; set; }

        public bool CarImageIsMain { get; set; }

        public int CarImageOrderNumber { get; set; }

        public DateTime CarImageCreationDate { get; set; } = DateTime.UtcNow;

        public bool CarImageDeleted { get; set; }

        public DateTime? CarImageDeletedDate { get; set; }
        public required Cars Car { get; set; }
    }
}
