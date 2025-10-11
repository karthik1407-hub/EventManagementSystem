using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Event_Management_System.Data;
using Event_Management_System.Models.Domain;
using Event_Management_System.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace Event_Management_System.Repositories.Implementation
{
    public class TicketRepository : ITicketRepository
    {
        private readonly ApplicationDbContext _dbContext;

        public TicketRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<List<Ticket>> GetTickets(Guid userId, string userRole)
        {
            IQueryable<Ticket> query = _dbContext.Tickets.Include(t => t.Event);

            if (userRole.Contains("Admin"))
            {
                // No filter
            }
            else if (userRole.Contains("Event Organizer"))
            {
                query = query.Where(t => t.Event.OrganizerID == userId);
            }
            else if (userRole.Contains("Attendee"))
            {
                query = query.Where(t => t.UserID == userId);
            }

            return await query.ToListAsync();
        }

        public async Task<Ticket> GetTicketById(Guid id, Guid userId, string userRole)
        {
            Ticket ticket;
            if (userRole.Contains("Admin"))
            {
                ticket = await _dbContext.Tickets
                    .Include(t => t.Event)
                    .FirstOrDefaultAsync(t => t.TicketID == id);
            }
            else if (userRole.Contains("Event Organizer"))
            {
                ticket = await _dbContext.Tickets
                    .Include(t => t.Event)
                    .FirstOrDefaultAsync(t => t.TicketID == id && t.Event.OrganizerID == userId);
            }
            else if (userRole.Contains("Attendee"))
            {
                ticket = await _dbContext.Tickets
                    .Include(t => t.Event)
                    .FirstOrDefaultAsync(t => t.TicketID == id && t.UserID == userId);
            }
            else
            {
                ticket = null;
            }

            return ticket;
        }

        public async Task<Ticket> CreateTicket(Ticket ticket)
        {
            _dbContext.Tickets.Add(ticket);
            await _dbContext.SaveChangesAsync();
            return ticket;
        }

        public async Task UpdateTicket(Ticket ticket)
        {
            _dbContext.Tickets.Update(ticket);
            await _dbContext.SaveChangesAsync();
        }

        public async Task DeleteTicket(Guid id, Guid userId, string userRole)
        {
            var ticket = await _dbContext.Tickets
                .Include(t => t.Event)
                .FirstOrDefaultAsync(t => t.TicketID == id);

            if (ticket == null) return;

            bool canDelete = false;
            if (userRole.Contains("Admin"))
            {
                canDelete = true;
            }
            else if (userRole.Contains("Event Organizer"))
            {
                if (ticket.Event.OrganizerID == userId)
                    canDelete = true;
            }
            else if (userRole.Contains("Attendee"))
            {
                if (ticket.UserID == userId && (ticket.IsCancelled || ticket.Event.EventDate <= DateTime.UtcNow))
                    canDelete = true;
            }

            if (canDelete)
            {
                _dbContext.Tickets.Remove(ticket);
                await _dbContext.SaveChangesAsync();
            }
        }
    }
}
