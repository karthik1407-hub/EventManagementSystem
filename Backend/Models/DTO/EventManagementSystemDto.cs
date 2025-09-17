using System.ComponentModel.DataAnnotations;

namespace Event_Management_System.Models.DTO
{
    public class EventManagementSystemDto
    {
        [Key]
        public Guid EventID { get; set; }
        public string EventName { get; set; }
        public string EventType { get; set; }
        public DateTime EventDate { get; set; }
        public string EventLocation { get; set; }

        public string OrganizerId { get; set; } = default;
    }
}
