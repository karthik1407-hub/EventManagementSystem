using Event_Management_System.Data;
using Event_Management_System.Models.Domain;
using Event_Management_System.Repositories.Interface;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Event_Management_System.Repositories.Implementation
{
    public class EventImageRepository : IEventImageRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public EventImageRepository(ApplicationDbContext context, IWebHostEnvironment webHostEnvironment)
        {
            _context = context;
            _webHostEnvironment = webHostEnvironment;
        }

        public async Task<IEnumerable<EventImage>> GetAll()
        {
            return await _context.EventImages.ToListAsync();
        }

        public async Task<EventImage> Upload(IFormFile file, EventImage eventImage)
        {
            var folderPath = Path.Combine(_webHostEnvironment.WebRootPath, "EventImages");

            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }

            var filePath = Path.Combine(folderPath, $"{Guid.NewGuid()}{eventImage.FileExtension}");

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            eventImage.Url = $"/EventImages/{Path.GetFileName(filePath)}";

            await _context.EventImages.AddAsync(eventImage);
            await _context.SaveChangesAsync();

            return eventImage;
        }
    }
}