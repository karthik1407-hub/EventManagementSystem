using System;

namespace Event_Management_System.Models.Domain
{
    public class EventImage
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string FileName { get; set; }
        public string FileExtension { get; set; }
        public string Url { get; set; }
        public DateTime DateCreated { get; set; }

        // Foreign key to Event
        public Guid EventId { get; set; }
        public Event Event { get; set; }
    }
}