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
    public class EventRepository : IEventRepository
    {
        private readonly ApplicationDbContext _dbContext;

        public EventRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<List<Event>> GetAllEvents()
        {
            return await _dbContext.Events.ToListAsync();
        }

        public async Task<List<Event>> GetEventsByOrganizer(Guid organizerId)
        {
            return await _dbContext.Events.Where(e => e.OrganizerID == organizerId).ToListAsync();
        }

        public async Task<Event> GetEventById(Guid id)
        {
            return await _dbContext.Events.FirstOrDefaultAsync(x => x.EventID == id);
        }

        public async Task<Event> CreateEvent(Event eventEntity)
        {
            await _dbContext.Events.AddAsync(eventEntity);
            await _dbContext.SaveChangesAsync();
            return eventEntity;
        }

        public async Task<Event> UpdateEvent(Event eventEntity)
        {
            _dbContext.Events.Update(eventEntity);
            await _dbContext.SaveChangesAsync();
            return eventEntity;
        }

        public async Task DeleteEvent(Guid id)
        {
            var eventEntity = await _dbContext.Events.FirstOrDefaultAsync(e => e.EventID == id);
            if (eventEntity != null)
            {
                _dbContext.Events.Remove(eventEntity);
                await _dbContext.SaveChangesAsync();
            }
        }
    }
}
