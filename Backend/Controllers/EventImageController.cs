using Event_Management_System.Models.Domain;
using Event_Management_System.Models.DTO;
using Event_Management_System.Repositories.Interface;
using Microsoft.AspNetCore.Mvc;

namespace Event_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventImagesController : ControllerBase
    {
        private readonly IEventImageRepository eventImageRepository;

        public EventImagesController(IEventImageRepository eventImageRepository)
        {
            this.eventImageRepository = eventImageRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllImages()
        {
            var images = await eventImageRepository.GetAll();

            var response = images.Select(image => new EventImageDto
            {
                Id = image.Id,
                Title = image.Title,
                FileName = image.FileName,
                FileExtension = image.FileExtension,
                Url = image.Url,
                DateCreated = image.DateCreated,
                EventId = image.EventId
            }).ToList();

            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> UploadImage([FromForm] ImageUploadRequest request)
        {
            var file = request.File;
            ValidateFileUpload(file);

            if (ModelState.IsValid)
            {
                var eventImage = new EventImage
                {
                    FileExtension = Path.GetExtension(file.FileName).ToLower(),
                    FileName = request.FileName,
                    Title = request.Title,
                    DateCreated = DateTime.Now,
                    EventId = request.EventId
                };

                eventImage = await eventImageRepository.Upload(file, eventImage);

                var response = new EventImageDto
                {
                    Id = eventImage.Id,
                    Title = eventImage.Title,
                    FileName = eventImage.FileName,
                    FileExtension = eventImage.FileExtension,
                    Url = eventImage.Url,
                    DateCreated = eventImage.DateCreated,
                    EventId = eventImage.EventId
                };

                return Ok(response);
            }

            return BadRequest(ModelState);
        }

        private void ValidateFileUpload(IFormFile file)
        {
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };

            if (!allowedExtensions.Contains(Path.GetExtension(file.FileName).ToLower()))
            {
                ModelState.AddModelError("file", "Unsupported file format");
            }

            if (file.Length > 10485760)
            {
                ModelState.AddModelError("file", "File size cannot be more than 10MB");
            }
        }
    }
}