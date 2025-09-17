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
    [ApiController]
    [Route("api/[controller]")]
    public class TicketController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public TicketController(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        // GET: api/Ticket
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Ticket>>> GetTickets()
        {
            var userIdString = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
            {
                return Unauthorized("User is not authenticated or the ID is invalid.");
            }

            var userRoles = _httpContextAccessor.HttpContext?.User?.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
            var isUser = userRoles.Contains("Attendee");
            var isAdmin = userRoles.Contains("Admin");
            var isOrganizer = userRoles.Contains("Event Organizer");

            IQueryable<Ticket> query = _context.Tickets.Include(t => t.Event);

            if (isAdmin)
            {
                // Admins see all tickets
            }
            else if (isOrganizer)
            {
                // Organizers see tickets for their events
                query = query.Where(t => t.Event.OrganizerID == userId);
            }
            else if (isUser)
            {
                // Users see their own tickets
                query = query.Where(t => t.UserID == userId);
            }
            else
            {
                return Forbid();
            }

            var tickets = await query.ToListAsync();
            return Ok(tickets);
        }

        // GET: api/Ticket/{id}
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<Ticket>> GetTicket(Guid id)
        {
            var userIdString = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
            {
                return Unauthorized("User is not authenticated or the ID is invalid.");
            }

            var userRoles = _httpContextAccessor.HttpContext?.User?.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
            var isUser = userRoles.Contains("Attendee");
            var isAdmin = userRoles.Contains("Admin");
            var isOrganizer = userRoles.Contains("Event Organizer");

            Ticket ticket;
            if (isAdmin)
            {
                ticket = await _context.Tickets
                    .Include(t => t.Event)
                    .FirstOrDefaultAsync(t => t.TicketID == id);
            }
            else if (isOrganizer)
            {
                ticket = await _context.Tickets
                    .Include(t => t.Event)
                    .FirstOrDefaultAsync(t => t.TicketID == id && t.Event.OrganizerID == userId);
            }
            else if (isUser)
            {
                ticket = await _context.Tickets
                    .Include(t => t.Event)
                    .FirstOrDefaultAsync(t => t.TicketID == id && t.UserID == userId);
            }
            else
            {
                return Forbid();
            }

            if (ticket == null)
                return NotFound();

            return Ok(ticket);
        }

        // POST: api/Ticket
        [HttpPost]
        public async Task<ActionResult<Ticket>> CreateTicket([FromBody] CreateTicketDto dto)
        {
            // Validate foreign keys
            var eventDetails = await _context.Events.FirstOrDefaultAsync(e => e.EventID == dto.EventID);
            var userExists = await _context.Users.AnyAsync(u => u.UserID == dto.UserID);

            if (eventDetails == null)
                return BadRequest("Invalid EventID. Make sure it exists in the database.");

            if (!userExists)
                return BadRequest("Invalid UserID. Make sure it exists in the database.");

            var ticket = new Ticket
            {
                TicketID = Guid.NewGuid(),
                EventID = dto.EventID,
                UserID = dto.UserID,
                BookingDate = dto.BookingDate,
                IsCancelled = dto.IsCancelled
            };

            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();

            // Create a notification for the user
            var notification = new Notification
            {
                NotificationID = Guid.NewGuid(),
                UserID = dto.UserID,
                EventID = dto.EventID,
                TicketID = ticket.TicketID, // Assign the newly created TicketID
                Message = $"You have booked a new event: {eventDetails.EventName}",
                SentTimestamp = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTicket), new { id = ticket.TicketID }, ticket);
        }

        // PUT: api/Ticket/{id}
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateTicket(Guid id, [FromBody] CreateTicketDto dto)
        {
            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null)
                return NotFound();

            var userIdString = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid currentUserId))
            {
                return Unauthorized();
            }

            var userRoles = _httpContextAccessor.HttpContext?.User?.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
            var isUser = userRoles.Contains("Attendee");
            var isAdmin = userRoles.Contains("Admin");
            var isOrganizer = userRoles.Contains("Event Organizer");

            if (isAdmin)
            {
                // Admins can update any ticket fully
                var eventExists = await _context.Events.AnyAsync(e => e.EventID == dto.EventID);
                if (!eventExists)
                    return BadRequest("Invalid EventID.");

                ticket.EventID = dto.EventID;
                ticket.UserID = dto.UserID;
                ticket.BookingDate = dto.BookingDate;
                ticket.IsCancelled = dto.IsCancelled;
            }
            else if (isOrganizer)
            {
                // Organizers can only update tickets for their own events
                var eventExists = await _context.Events.AnyAsync(e => e.EventID == dto.EventID && e.OrganizerID == currentUserId);
                if (!eventExists)
                    return BadRequest("Invalid EventID or you do not own this event.");

                // Also check if the current ticket's event belongs to the organizer
                if (ticket.Event.OrganizerID != currentUserId)
                    return Forbid("You can only update tickets for your own events.");

                ticket.EventID = dto.EventID;
                ticket.UserID = dto.UserID;
                ticket.BookingDate = dto.BookingDate;
                ticket.IsCancelled = dto.IsCancelled;
            }
            else if (isUser)
            {
                // Users can only cancel their own tickets
                if (ticket.UserID != currentUserId)
                {
                    return Forbid("You can only cancel your own tickets.");
                }

                if (!dto.IsCancelled)
                {
                    return BadRequest("You can only set IsCancelled to true.");
                }
                
                // Only allow updating the IsCancelled flag
                ticket.IsCancelled = dto.IsCancelled;
            }
            else
            {
                return Forbid();
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/Ticket/{id}
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteTicket(Guid id)
        {
            var userIdString = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
            {
                return Unauthorized("User is not authenticated or the ID is invalid.");
            }

            var userRoles = _httpContextAccessor.HttpContext?.User?.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
            var isUser = userRoles.Contains("Attendee");
            var isAdmin = userRoles.Contains("Admin");
            var isOrganizer = userRoles.Contains("Event Organizer");

            var ticket = await _context.Tickets
                .Include(t => t.Event)
                .FirstOrDefaultAsync(t => t.TicketID == id);
            if (ticket == null)
                return NotFound();

            if (isAdmin)
            {
                // Admins can delete any ticket
            }
            else if (isOrganizer)
            {
                // Organizers can delete tickets for their events
                if (ticket.Event.OrganizerID != userId)
                    return Forbid("You can only delete tickets for your own events.");
            }
            else if (isUser)
            {
                // Users can delete their own tickets if the ticket is cancelled or the event has ended
                if (ticket.UserID != userId)
                    return Forbid("You can only delete your own tickets.");

                if (!ticket.IsCancelled && ticket.Event.EventDate > DateTime.UtcNow)
                    return BadRequest("You can only delete cancelled tickets or tickets for events that have ended.");
            }
            else
            {
                return Forbid();
            }

            _context.Tickets.Remove(ticket);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}