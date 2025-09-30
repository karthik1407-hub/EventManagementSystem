using Event_Management_System.Data;
using Event_Management_System.Models.Domain;
using Event_Management_System.Models.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IO;
using System.Threading.Tasks;
using System;
using System.Security.Claims;

namespace Event_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public EventController(ApplicationDbContext dbContext, IWebHostEnvironment webHostEnvironment, IHttpContextAccessor httpContextAccessor)
        {
            _dbContext = dbContext;
            _webHostEnvironment = webHostEnvironment;
            _httpContextAccessor = httpContextAccessor;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllEvents()
        {
            var userIdString = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
            {
                return Unauthorized("User is not authenticated or the ID is invalid.");
            }

            var userRoles = _httpContextAccessor.HttpContext?.User?.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
            var isOrganizer = userRoles.Contains("Event Organizer");

            if (isOrganizer)
            {
                var events = await _dbContext.Events.Where(e => e.OrganizerID == userId).ToListAsync();
                return Ok(events);
            }
            else
            {
                var events = await _dbContext.Events.ToListAsync();
                return Ok(events);
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetEventById(Guid id)
        {
            var existingEvent = await _dbContext.Events.FirstOrDefaultAsync(x => x.EventID == id);
            if (existingEvent == null)
            {
                return NotFound();
            }
            return Ok(existingEvent);
        }

        [HttpGet("by-organizer/{organizerId}")]
        [Authorize]
        public async Task<IActionResult> GetEventsByOrganizer(Guid organizerId)
        {
            var events = await _dbContext.Events.Where(e => e.OrganizerID == organizerId).ToListAsync();
            return Ok(events);
        }

        [HttpPost]
        
        public async Task<IActionResult> CreateEvent([FromForm] CreateEventDto createEventDto)
        {
            //if (createEventDto.EventImage == null || createEventDto.EventImage.Length == 0)
            //{
            //    return BadRequest("Image file is required.");
            //}

            // Get the user ID from the authenticated user's claims
            var userIdString = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
            {
                return Unauthorized("User is not authenticated or the ID is invalid.");
            }

            var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(createEventDto.EventImage.FileName)}";
            var uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "EventImages");

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var imagePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(imagePath, FileMode.Create))
            {
                await createEventDto.EventImage.CopyToAsync(stream);
            }

            var newEvent = new Event
            {
                EventID = Guid.NewGuid(),
                EventName = createEventDto.EventName,
                EventType = createEventDto.EventType,
                EventLocation = createEventDto.EventLocation,
                EventDate = createEventDto.EventDate,
                EventImageUrl = uniqueFileName,
                EventDescription = createEventDto.EventDescription,
                EventPrice = createEventDto.EventPrice,// Ensure this is mapped
                OrganizerID = userId // Assign the user ID from the token
            };

            await _dbContext.Events.AddAsync(newEvent);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEventById), new { id = newEvent.EventID }, newEvent);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Event Organizer")]
        public async Task<IActionResult> UpdateEvent(Guid id, [FromForm] UpdateEventDto updateEventDto)
        {
            var userIdString = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
            {
                return Unauthorized("User is not authenticated or the ID is invalid.");
            }

            var existingEvent = await _dbContext.Events.FirstOrDefaultAsync(x => x.EventID == id && x.OrganizerID == userId);
            if (existingEvent == null)
            {
                return NotFound();
            }

            if (updateEventDto.EventImage != null && updateEventDto.EventImage.Length > 0)
            {
                // Delete old image
                var oldImagePath = Path.Combine(_webHostEnvironment.WebRootPath, "EventImages", existingEvent.EventImageUrl);
                if (System.IO.File.Exists(oldImagePath))
                {
                    System.IO.File.Delete(oldImagePath);
                }

                // Save new image
                var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(updateEventDto.EventImage.FileName)}";
                var newImagePath = Path.Combine(_webHostEnvironment.WebRootPath, "EventImages", uniqueFileName);
                using (var stream = new FileStream(newImagePath, FileMode.Create))
                {
                    await updateEventDto.EventImage.CopyToAsync(stream);
                }
                existingEvent.EventImageUrl = uniqueFileName;
            }

            existingEvent.EventName = updateEventDto.EventName;
            existingEvent.EventType = updateEventDto.EventType;
            existingEvent.EventLocation = updateEventDto.EventLocation;
            existingEvent.EventDate = updateEventDto.EventDate;
            existingEvent.EventDescription = updateEventDto.EventDescription;
            existingEvent.EventPrice = updateEventDto.EventPrice;// Ensure this is updated

            _dbContext.Events.Update(existingEvent);
            await _dbContext.SaveChangesAsync();
            return Ok(existingEvent);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Event Organizer")]
        public async Task<IActionResult> DeleteEvent(Guid id)
        {
            var userIdString = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
            {
                return Unauthorized("User is not authenticated or the ID is invalid.");
            }

            var ev = await _dbContext.Events.FirstOrDefaultAsync(e => e.EventID == id && e.OrganizerID == userId);
            if (ev == null)
            {
                return NotFound();
            }

            // Delete the associated image file
            if (!string.IsNullOrEmpty(ev.EventImageUrl))
            {
                var imagePath = Path.Combine(_webHostEnvironment.WebRootPath, "EventImages", ev.EventImageUrl);
                if (System.IO.File.Exists(imagePath))
                {
                    System.IO.File.Delete(imagePath);
                }
            }

            _dbContext.Events.Remove(ev);
            await _dbContext.SaveChangesAsync();
            return NoContent();
        }
    }
}