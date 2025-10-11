using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Event_Management_System.Models.Domain;

namespace Event_Management_System.Repositories.Interface
{
    public interface ITicketRepository
    {
        Task<List<Ticket>> GetTickets(Guid userId, string userRole);
        Task<Ticket> GetTicketById(Guid id, Guid userId, string userRole);
        Task<Ticket> CreateTicket(Ticket ticket);
        Task UpdateTicket(Ticket ticket);
        Task DeleteTicket(Guid id, Guid userId, string userRole);
    }
}
