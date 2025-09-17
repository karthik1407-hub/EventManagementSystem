using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Event_Management_System.Models.DTO
{
    public class ImageUploadRequest
    {
        [FromForm]
        public IFormFile File { get; set; }

        [FromForm]
        public string FileName { get; set; }

        [FromForm]
        public string Title { get; set; }

        [FromForm]
        public Guid EventId { get; set; }
    }
}