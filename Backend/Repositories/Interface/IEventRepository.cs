using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Event_Management_System.Models.Domain;

namespace Event_Management_System.Repositories.Interface
{
    public interface IEventRepository
    {
        Task<List<Event>> GetAllEvents();
        Task<List<Event>> GetEventsByOrganizer(Guid organizerId);
        Task<Event> GetEventById(Guid id);
        Task<Event> CreateEvent(Event eventEntity);
        Task<Event> UpdateEvent(Event eventEntity);
        Task DeleteEvent(Guid id);
    }
}
