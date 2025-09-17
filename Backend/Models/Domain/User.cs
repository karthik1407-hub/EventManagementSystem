using System.ComponentModel.DataAnnotations;

namespace Event_Management_System.Models.Domain
{
    public class User
    {
        [Key]
        public Guid UserID { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string ContactNumber { get; set; }
        public string Roles { get; set; }

        public ICollection<Ticket> Tickets { get; set; }
        public ICollection<Notification> Notifications { get; set; }
        public ICollection<Feedback> Feedbacks { get; set; }
    }

}
