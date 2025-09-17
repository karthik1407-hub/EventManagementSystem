using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using System;

namespace Event_Management_System.Models.DTO
{
    public class CreateEventDto
    {
        [Required]
        public string EventName { get; set; } = string.Empty;
        public DateTime EventDate { get; set; }
        public string EventType { get; set; } = string.Empty;
        public string EventLocation { get; set; } = string.Empty; // Corrected property name to match domain model

        [Required]
        public string EventDescription { get; set; }
        public decimal EventPrice { get; set; }
        
        [Key]
        public Guid OrganizerId { get; set; } = Guid.NewGuid();

        [Required]
        public IFormFile EventImage { get; set; } // For file upload
    }
}