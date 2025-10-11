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
    public class NotificationRepository : INotificationRepository
    {
        private readonly ApplicationDbContext _dbContext;

        public NotificationRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<List<Notification>> GetAllNotifications()
        {
            return await _dbContext.Notifications
                .Include(n => n.User)
                .Include(n => n.Event)
                .ToListAsync();
        }

        public async Task<Notification> GetNotificationById(Guid id)
        {
            return await _dbContext.Notifications
                .Include(n => n.User)
                .Include(n => n.Event)
                .FirstOrDefaultAsync(n => n.NotificationID == id);
        }

        public async Task<List<Notification>> GetNotificationsByUser(Guid userId)
        {
            return await _dbContext.Notifications
                .Where(n => n.UserID == userId)
                .Include(n => n.Event)
                .OrderByDescending(n => n.SentTimestamp)
                .ToListAsync();
        }

        public async Task<Notification> CreateNotification(Notification notification)
        {
            _dbContext.Notifications.Add(notification);
            await _dbContext.SaveChangesAsync();
            return notification;
        }

        public async Task UpdateNotification(Notification notification)
        {
            _dbContext.Notifications.Update(notification);
            await _dbContext.SaveChangesAsync();
        }

        public async Task DeleteNotification(Guid id)
        {
            var notification = await _dbContext.Notifications.FindAsync(id);
            if (notification != null)
            {
                _dbContext.Notifications.Remove(notification);
                await _dbContext.SaveChangesAsync();
            }
        }
    }
}
