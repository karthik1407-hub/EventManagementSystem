using System.ComponentModel.DataAnnotations;

namespace Event_Management_System.Models.Domain
{
    public class Ticket
    {
        [Key]
        public Guid TicketID { get; set; }
        public Guid EventID { get; set; }
        public Event Event { get; set; }

        public Guid UserID { get; set; }
        public UserDto User { get; set; }

        public DateTime BookingDate { get; set; }
        public bool IsCancelled { get; set; }
    }


}
