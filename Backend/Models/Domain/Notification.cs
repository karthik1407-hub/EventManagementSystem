using System.ComponentModel.DataAnnotations;

namespace Event_Management_System.Models.Domain
{
    public class Notification
    {
        [Key]
        public Guid NotificationID { get; set; }
        public Guid UserID { get; set; }
        public Guid EventID { get; set; }
        public Guid? TicketID { get; set; }
        public string Message { get; set; }
        public DateTime SentTimestamp { get; set; }

        public User User { get; set; }
        public Event Event { get; set; }
    }


}
