using System;
using System.ComponentModel.DataAnnotations;

namespace Event_Management_System.Models.Domain
{
    public class Feedback
    {
        [Key]
        public Guid FeedbackID { get; set; }
        public Guid EventID { get; set; }
        public Guid UserID { get; set; }
        public string? Comments { get; set; }
        public int Rating { get; set; }
        public string? Reply { get; set; }
        public DateTime SubmittedTimestamp { get; set; }
        public User User { get; set; }
        public Event Event { get; set; }
    }
}
