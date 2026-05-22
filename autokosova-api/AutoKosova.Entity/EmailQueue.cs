namespace AutoKosova.Entity
{
    public class EmailQueue
    {
        public int EmailQueueID { get; set; }

        public required string ToEmail { get; set; }

        public required string Subject { get; set; }

        public required string Body { get; set; }

        public string Status { get; set; } = "Pending";

        public int RetryCount { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? SentAt { get; set; }

        public string? ErrorMessage { get; set; }
    }
}
