using Microsoft.AspNetCore.Mvc;
using Event_Management_System.Models.Domain;
using Event_Management_System.Models.DTO;
using Event_Management_System.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace Event_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public NotificationController(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        // GET: api/Notification
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Notification>>> GetNotifications()
        {
            var notifications = await _context.Notifications
                .Include(n => n.User)
                .Include(n => n.Event)
                .ToListAsync();

            return Ok(notifications);
        }

        // GET: api/Notification/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Notification>> GetNotification(Guid id)
        {
            var notification = await _context.Notifications
                .Include(n => n.User)
                .Include(n => n.Event)
                .FirstOrDefaultAsync(n => n.NotificationID == id);

            if (notification == null)
                return NotFound();

            return Ok(notification);
        }

        // GET: api/Notification/user/{userId}
    [HttpGet("user/{userId}")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<Notification>>> GetNotificationsByUser(Guid userId)
    {
        var currentUserIdString = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        Console.WriteLine($"[NotificationController] Incoming request for userId: {userId}");
        Console.WriteLine($"[NotificationController] Authenticated userId: {currentUserIdString}");

        if (string.IsNullOrEmpty(currentUserIdString) || !Guid.TryParse(currentUserIdString, out Guid currentUserId))
        {
            Console.WriteLine("[NotificationController] Unauthorized access attempt.");
            return Unauthorized();
        }

        if (currentUserId != userId)
        {
            Console.WriteLine("[NotificationController] Forbidden access: userId mismatch.");
            return Forbid("You can only access your own notifications.");
        }

        var notifications = await _context.Notifications
            .Where(n => n.UserID == userId)
            .Include(n => n.Event)
            .OrderByDescending(n => n.SentTimestamp)
            .ToListAsync();

        Console.WriteLine($"[NotificationController] Returning {notifications.Count} notifications for userId: {userId}");
        return Ok(notifications);
    }

        // POST: api/Notification
        [HttpPost]
        public async Task<ActionResult<Notification>> CreateNotification([FromBody] CreateNotificationDto dto)
        {
            var userExists = await _context.Users.AnyAsync(u => u.UserID == dto.UserID);
            var eventExists = await _context.Events.AnyAsync(e => e.EventID == dto.EventID);

            if (!userExists || !eventExists)
                return BadRequest("Invalid UserID or EventID.");

            var notification = new Notification
            {
                NotificationID = Guid.NewGuid(),
                UserID = dto.UserID,
                EventID = dto.EventID,
                Message = dto.Message,
                SentTimestamp = dto.SentTimestamp
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetNotification), new { id = notification.NotificationID }, notification);
        }

        // PUT: api/Notification/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNotification(Guid id, [FromBody] CreateNotificationDto dto)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null)
                return NotFound();

            var userExists = await _context.Users.AnyAsync(u => u.UserID == dto.UserID);
            var eventExists = await _context.Events.AnyAsync(e => e.EventID == dto.EventID);

            if (!userExists || !eventExists)
                return BadRequest("Invalid UserID or EventID.");

            notification.UserID = dto.UserID;
            notification.EventID = dto.EventID;
            notification.Message = dto.Message;
            notification.SentTimestamp = dto.SentTimestamp;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/Notification/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(Guid id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null)
                return NotFound();

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}