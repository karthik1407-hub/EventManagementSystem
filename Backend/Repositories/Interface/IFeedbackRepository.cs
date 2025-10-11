using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Event_Management_System.Models.Domain;

namespace Event_Management_System.Repositories.Interface
{
    public interface IFeedbackRepository
    {
        Task<IEnumerable<object>> GetFeedbacks(Guid userId, string userRole);
        Task<Feedback> GetFeedbackById(Guid id);
        Task<Feedback> CreateFeedback(Feedback feedback);
        Task UpdateFeedback(Feedback feedback);
        Task DeleteFeedback(Guid id);
    }
}
