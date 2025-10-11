using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Event_Management_System.Models.Domain;

namespace Event_Management_System.Repositories.Interface
{
    public interface INotificationRepository
    {
        Task<List<Notification>> GetAllNotifications();
        Task<Notification> GetNotificationById(Guid id);
        Task<List<Notification>> GetNotificationsByUser(Guid userId);
        Task<Notification> CreateNotification(Notification notification);
        Task UpdateNotification(Notification notification);
        Task DeleteNotification(Guid id);
    }
}
