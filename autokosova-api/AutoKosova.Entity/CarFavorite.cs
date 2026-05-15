using System;

namespace AutoKosova.Entity
{
    public class CarFavorite
    {
        public int CarFavoriteID { get; set; }

        public int AccountID { get; set; }

        public int CarID { get; set; }

        public DateTime CarFavoriteCreationDate { get; set; } = DateTime.UtcNow;

        public bool CarFavoriteDeleted { get; set; }

        public DateTime? CarFavoriteDeletedDate { get; set; }

        public Account? Account { get; set; }

        public Cars? Car { get; set; }
    }
}