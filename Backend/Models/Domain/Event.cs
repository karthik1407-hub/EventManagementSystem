using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Event_Management_System.Models.Domain
{
    public class Event
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid EventID { get; set; }

        public string EventName { get; set; }
        public string EventType { get; set; }
        public string EventLocation { get; set; }
        public DateTime EventDate { get; set; }
        public string EventDescription { get; set; }
        public decimal EventPrice { get; set; }
        public string EventImageUrl { get; set; } // Added for image URL

        public Guid OrganizerID { get; set; }
        
        public UserDto Organizer { get; set; }

        // Navigation properties
        public ICollection<Ticket> Tickets { get; set; }
        public ICollection<Notification> Notifications { get; set; }
        public ICollection<Feedback> Feedbacks { get; set; }
    }
}