using Microsoft.AspNetCore.Mvc;
using Event_Management_System.Models.Domain;
using Event_Management_System.Models.DTO;
using Event_Management_System.Repositories.Interface;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace Event_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public NotificationController(INotificationRepository notificationRepository, IHttpContextAccessor httpContextAccessor)
        {
            _notificationRepository = notificationRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        // GET: api/Notification
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Notification>>> GetNotifications()
        {
            var notifications = await _notificationRepository.GetAllNotifications();
            return Ok(notifications);
        }

        // GET: api/Notification/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Notification>> GetNotification(Guid id)
        {
            var notification = await _notificationRepository.GetNotificationById(id);
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
            if (string.IsNullOrEmpty(currentUserIdString) || !Guid.TryParse(currentUserIdString, out Guid currentUserId))
            {
                return Unauthorized();
            }
            if (currentUserId != userId)
            {
                return Forbid("You can only access your own notifications.");
            }
            var notifications = await _notificationRepository.GetNotificationsByUser(userId);
            return Ok(notifications);
        }

        // POST: api/Notification
        [HttpPost]
        public async Task<ActionResult<Notification>> CreateNotification([FromBody] CreateNotificationDto dto)
        {
            var notification = new Notification
            {
                NotificationID = Guid.NewGuid(),
                UserID = dto.UserID,
                EventID = dto.EventID,
                Message = dto.Message,
                SentTimestamp = dto.SentTimestamp
            };
            var createdNotification = await _notificationRepository.CreateNotification(notification);
            return CreatedAtAction(nameof(GetNotification), new { id = createdNotification.NotificationID }, createdNotification);
        }

        // PUT: api/Notification/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNotification(Guid id, [FromBody] CreateNotificationDto dto)
        {
            var notification = await _notificationRepository.GetNotificationById(id);
            if (notification == null)
                return NotFound();
            notification.UserID = dto.UserID;
            notification.EventID = dto.EventID;
            notification.Message = dto.Message;
            notification.SentTimestamp = dto.SentTimestamp;
            await _notificationRepository.UpdateNotification(notification);
            return NoContent();
        }

        // DELETE: api/Notification/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(Guid id)
        {
            var notification = await _notificationRepository.GetNotificationById(id);
            if (notification == null)
                return NotFound();
            await _notificationRepository.DeleteNotification(id);
            return NoContent();
        }
    }
}