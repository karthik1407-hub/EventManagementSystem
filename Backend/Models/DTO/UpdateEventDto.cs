using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using System;

namespace Event_Management_System.Models.DTO
{
    public class UpdateEventDto
{
    [Required]
    public string EventName { get; set; } = string.Empty;
    public DateTime EventDate { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string EventLocation { get; set; } = string.Empty;
    public string EventDescription { get; set; }
    public decimal EventPrice { get; set; }

    public IFormFile? EventImage { get; set; }
}
}