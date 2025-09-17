namespace Event_Management_System.Models.DTO
{
    public class CreateNotificationDto
    {

        public Guid UserID { get; set; }
        public Guid EventID { get; set; }
        public string Message { get; set; }
        public DateTime SentTimestamp { get; set; }

    }
}
