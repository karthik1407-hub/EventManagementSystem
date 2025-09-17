using System;

namespace Event_Management_System.Models.DTO
{
    public class EventImageDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string FileName { get; set; }
        public string FileExtension { get; set; }
        public string Url { get; set; }
        public DateTime DateCreated { get; set; }
        public Guid EventId { get; set; }
    }
}
