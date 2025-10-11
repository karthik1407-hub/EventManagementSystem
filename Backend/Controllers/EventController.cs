using Event_Management_System.Models.Domain;
using Event_Management_System.Models.DTO;
using Event_Management_System.Repositories.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Event_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventController : ControllerBase
    {
        private readonly IEventRepository _eventRepository;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public EventController(IEventRepository eventRepository, IWebHostEnvironment webHostEnvironment, IHttpContextAccessor httpContextAccessor)
        {
            _eventRepository = eventRepository;
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
                var events = await _eventRepository.GetEventsByOrganizer(userId);
                return Ok(events);
            }
            else
            {
                var events = await _eventRepository.GetAllEvents();
                return Ok(events);
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetEventById(Guid id)
        {
            var existingEvent = await _eventRepository.GetEventById(id);
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
            var events = await _eventRepository.GetEventsByOrganizer(organizerId);
            return Ok(events);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Event Organizer")]
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

            await _eventRepository.CreateEvent(newEvent);

            return CreatedAtAction(nameof(GetEventById), new { id = newEvent.EventID }, newEvent);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Event Organizer")]
        public async Task<IActionResult> UpdateEvent(Guid id, [FromForm] UpdateEventDto updateEventDto)
        {
            var userIdString = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
            {
                return Unauthorized("User is not authenticated or the ID is invalid.");
            }

            var existingEvent = await _eventRepository.GetEventById(id);
            if (existingEvent == null)
            {
                return NotFound();
            }

            var userRoles = _httpContextAccessor.HttpContext?.User?.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
            var isAdmin = userRoles.Contains("Admin");
            if (!isAdmin && existingEvent.OrganizerID != userId)
            {
                return Forbid("You do not have permission to update this event.");
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

            await _eventRepository.UpdateEvent(existingEvent);
            return Ok(existingEvent);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Event Organizer")]
        public async Task<IActionResult> DeleteEvent(Guid id)
        {
            var userIdString = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
            {
                return Unauthorized("User is not authenticated or the ID is invalid.");
            }

            var ev = await _eventRepository.GetEventById(id);
            if (ev == null)
            {
                return NotFound();
            }

            var userRoles = _httpContextAccessor.HttpContext?.User?.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
            var isAdmin = userRoles.Contains("Admin");
            if (!isAdmin && ev.OrganizerID != userId)
            {
                return Forbid("You do not have permission to delete this event.");
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
            await _eventRepository.DeleteEvent(id);
            return Ok($"Event with Id {id}  is deleted successfully.");
        }
    }
}