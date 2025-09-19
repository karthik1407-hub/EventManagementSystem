using Microsoft.AspNetCore.Mvc;
using Event_Management_System.Models.Domain;
using Event_Management_System.Models.DTO;
using Event_Management_System.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Event_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FeedbackController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FeedbackController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Feedback
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Feedback>>> GetFeedbacks()
        {
            // Get current user's ID from claims
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized();
            }
            var userId = Guid.Parse(userIdClaim.Value);

            // Get the user to check role
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == userId);
            if (user == null)
            {
                return Unauthorized();
            }

            IQueryable<Feedback> query = _context.Feedbacks
                .Include(f => f.User)
                .Include(f => f.Event);

            if (user.Roles.Contains("Organizer"))
            {
                // Organizer: show feedbacks for their events
                query = query.Where(f => f.Event.OrganizerID == userId);
            }
            else
            {
                // Regular user: show only their own feedbacks
                query = query.Where(f => f.UserID == userId);
            }

            var feedbacks = await query.ToListAsync();

            return Ok(feedbacks);
        }

        // GET: api/Feedback/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Feedback>> GetFeedback(Guid id)
        {
            var feedback = await _context.Feedbacks
                .Include(f => f.User)
                .Include(f => f.Event)
                .FirstOrDefaultAsync(f => f.FeedbackID == id);

            if (feedback == null)
                return NotFound();

            return Ok(feedback);
        }

        // POST: api/Feedback
        [HttpPost]
        public async Task<ActionResult<Feedback>> CreateFeedback([FromBody] CreateFeedbackDto dto)
        {
            var userExists = await _context.Users.AnyAsync(u => u.UserID == dto.UserID);
            var eventExists = await _context.Events.AnyAsync(e => e.EventID == dto.EventID);

            if (!userExists || !eventExists)
                return BadRequest("Invalid UserID or EventID.");

            var feedback = new Feedback
            {
                FeedbackID = Guid.NewGuid(),
                EventID = dto.EventID,
                UserID = dto.UserID,
                Rating = dto.Rating,
                Comments = dto.Comments,
                SubmittedTimestamp = dto.SubmittedTimestamp
            };

            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetFeedback), new { id = feedback.FeedbackID }, feedback);
        }

        // PUT: api/Feedback/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFeedback(Guid id, [FromBody] CreateFeedbackDto dto)
        {
            var feedback = await _context.Feedbacks.FindAsync(id);
            if (feedback == null)
                return NotFound();

            var userExists = await _context.Users.AnyAsync(u => u.UserID == dto.UserID);
            var eventExists = await _context.Events.AnyAsync(e => e.EventID == dto.EventID);

            if (!userExists || !eventExists)
                return BadRequest("Invalid UserID or EventID.");

            feedback.EventID = dto.EventID;
            feedback.UserID = dto.UserID;
            feedback.Rating = dto.Rating;
            feedback.Comments = dto.Comments;
            feedback.SubmittedTimestamp = dto.SubmittedTimestamp;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/Feedback/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFeedback(Guid id)
        {
            var feedback = await _context.Feedbacks.FindAsync(id);
            if (feedback == null)
                return NotFound();

            _context.Feedbacks.Remove(feedback);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}