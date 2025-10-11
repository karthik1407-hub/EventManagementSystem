using Microsoft.AspNetCore.Mvc;
using Event_Management_System.Models.Domain;
using Event_Management_System.Models.DTO;
using Event_Management_System.Repositories.Interface;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Event_Management_System.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TicketController : ControllerBase
    {
        private readonly ITicketRepository _ticketRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public TicketController(ITicketRepository ticketRepository, IHttpContextAccessor httpContextAccessor)
        {
            _ticketRepository = ticketRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        private (Guid userId, List<string> userRoles) GetUserInfo()
        {
            var userIdString = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRoles = _httpContextAccessor.HttpContext?.User?.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList() ?? new List<string>();
            return (Guid.TryParse(userIdString, out Guid userId) ? userId : Guid.Empty, userRoles);
        }

        // GET: api/Ticket
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Ticket>>> GetTickets()
        {
            var (userId, userRoles) = GetUserInfo();
            if (userId == Guid.Empty) return Unauthorized("User is not authenticated or the ID is invalid.");
            if (!userRoles.Any()) return Forbid();

            var tickets = await _ticketRepository.GetTickets(userId, string.Join(",", userRoles));
            return Ok(tickets);
        }

        // GET: api/Ticket/{id}
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<Ticket>> GetTicket(Guid id)
        {
            var (userId, userRoles) = GetUserInfo();
            if (userId == Guid.Empty) return Unauthorized("User is not authenticated or the ID is invalid.");
            if (!userRoles.Any()) return Forbid();

            var ticket = await _ticketRepository.GetTicketById(id, userId, string.Join(",", userRoles));
            if (ticket == null) return NotFound();

            return Ok(ticket);
        }

        // POST: api/Ticket
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Ticket>> CreateTicket([FromBody] CreateTicketDto dto)
        {
            var ticket = new Ticket
            {
                TicketID = Guid.NewGuid(),
                EventID = dto.EventID,
                UserID = dto.UserID,
                BookingDate = dto.BookingDate,
                IsCancelled = dto.IsCancelled
            };

            try
            {
                var createdTicket = await _ticketRepository.CreateTicket(ticket);
                return CreatedAtAction(nameof(GetTicket), new { id = createdTicket.TicketID }, createdTicket);
            }
            catch (Exception ex) when (ex.Message.Contains("Invalid"))
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/Ticket/{id}
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateTicket(Guid id, [FromBody] CreateTicketDto dto)
        {
            var (userId, userRoles) = GetUserInfo();
            if (userId == Guid.Empty) return Unauthorized();
            if (!userRoles.Any()) return Forbid();

            var ticket = await _ticketRepository.GetTicketById(id, userId, string.Join(",", userRoles));
            if (ticket == null) return NotFound();

            if (userRoles.Contains("Attendee") && (!dto.IsCancelled || ticket.UserID != userId))
            {
                return BadRequest("You can only set IsCancelled to true for your own tickets.");
            }

            ticket.EventID = dto.EventID;
            ticket.UserID = dto.UserID;
            ticket.BookingDate = dto.BookingDate;
            ticket.IsCancelled = dto.IsCancelled;

            try
            {
                await _ticketRepository.UpdateTicket(ticket);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // DELETE: api/Ticket/{id}
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteTicket(Guid id)
        {
            var (userId, userRoles) = GetUserInfo();
            if (userId == Guid.Empty) return Unauthorized("User is not authenticated or the ID is invalid.");
            if (!userRoles.Any()) return Forbid();

            await _ticketRepository.DeleteTicket(id, userId, string.Join(",", userRoles));
            return NoContent();
        }
    }
}