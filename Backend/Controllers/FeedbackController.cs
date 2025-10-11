using Microsoft.AspNetCore.Mvc;
using Event_Management_System.Models.Domain;
using Event_Management_System.Models.DTO;
using Event_Management_System.Repositories.Interface;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Event_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FeedbackController : ControllerBase
    {
        private readonly IFeedbackRepository _feedbackRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public FeedbackController(IFeedbackRepository feedbackRepository, IHttpContextAccessor httpContextAccessor)
        {
            _feedbackRepository = feedbackRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        private (Guid userId, List<string> userRoles) GetUserInfo()
        {
            var userIdString = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRoles = _httpContextAccessor.HttpContext?.User?.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList() ?? new List<string>();
            return (Guid.TryParse(userIdString, out Guid userId) ? userId : Guid.Empty, userRoles);
        }

        // GET: api/Feedback
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<object>>> GetFeedbacks()
        {
            var (userId, userRoles) = GetUserInfo();
            if (userId == Guid.Empty) return Unauthorized();
            if (!userRoles.Any()) return Forbid();
            var feedbacks = await _feedbackRepository.GetFeedbacks(userId, string.Join(",", userRoles));
            return Ok(feedbacks);
        }

        // GET: api/Feedback/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Feedback>> GetFeedback(Guid id)
        {
            var feedback = await _feedbackRepository.GetFeedbackById(id);
            if (feedback == null) return NotFound();
            return Ok(feedback);
        }

        // POST: api/Feedback
        [HttpPost]
        public async Task<ActionResult<Feedback>> CreateFeedback([FromBody] CreateFeedbackDto dto)
        {
            var feedback = new Feedback
            {
                FeedbackID = Guid.NewGuid(),
                EventID = dto.EventID,
                UserID = dto.UserID,
                Rating = dto.Rating,
                Comments = dto.Comments,
                SubmittedTimestamp = dto.SubmittedTimestamp,
                Reply = dto.Reply
            };
            var createdFeedback = await _feedbackRepository.CreateFeedback(feedback);
            return CreatedAtAction(nameof(GetFeedback), new { id = createdFeedback.FeedbackID }, createdFeedback);
        }

        // PUT: api/Feedback/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFeedback(Guid id, [FromBody] CreateFeedbackDto dto)
        {
            var feedback = await _feedbackRepository.GetFeedbackById(id);
            if (feedback == null) return NotFound();
            feedback.EventID = dto.EventID;
            feedback.UserID = dto.UserID;
            feedback.Rating = dto.Rating;
            feedback.Comments = dto.Comments;
            feedback.SubmittedTimestamp = dto.SubmittedTimestamp;
            feedback.Reply = dto.Reply;
            await _feedbackRepository.UpdateFeedback(feedback);
            return NoContent();
        }

        // DELETE: api/Feedback/{id}
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteFeedback(Guid id)
        {
            var (userId, userRoles) = GetUserInfo();
            if (userId == Guid.Empty) return Unauthorized();
            if (!userRoles.Any()) return Forbid();
            var feedback = await _feedbackRepository.GetFeedbackById(id);
            if (feedback == null) return NotFound();
            // Permission checks should be handled here if needed
            await _feedbackRepository.DeleteFeedback(id);
            return NoContent();
        }
    }
}