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
    public class FeedbackRepository : IFeedbackRepository
    {
        private readonly ApplicationDbContext _dbContext;

        public FeedbackRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<IEnumerable<object>> GetFeedbacks(Guid userId, string userRole)
        {
            IQueryable<Feedback> query = _dbContext.Feedbacks
                .Include(f => f.User)
                .Include(f => f.Event);

            if (userRole.Contains("Admin"))
            {
                // No additional filtering needed
            }
            else if (userRole.Contains("Organizer"))
            {
                query = query.Where(f => f.Event.OrganizerID == userId);
            }
            else
            {
                query = query.Where(f => f.UserID == userId);
            }

            var feedbacks = await query
                .Select(f => new
                {
                    f.FeedbackID,
                    f.Rating,
                    f.Comments,
                    f.SubmittedTimestamp,
                    UserEmail = f.User.Email,
                    EventName = f.Event.EventName,
                    f.EventID,
                    f.UserID,
                    Reply = f.Reply
                })
                .ToListAsync();

            return feedbacks;
        }

        public async Task<Feedback> GetFeedbackById(Guid id)
        {
            return await _dbContext.Feedbacks
                .Include(f => f.User)
                .Include(f => f.Event)
                .FirstOrDefaultAsync(f => f.FeedbackID == id);
        }

        public async Task<Feedback> CreateFeedback(Feedback feedback)
        {
            _dbContext.Feedbacks.Add(feedback);
            await _dbContext.SaveChangesAsync();
            return feedback;
        }

        public async Task UpdateFeedback(Feedback feedback)
        {
            _dbContext.Feedbacks.Update(feedback);
            await _dbContext.SaveChangesAsync();
        }

        public async Task DeleteFeedback(Guid id)
        {
            var feedback = await _dbContext.Feedbacks.FindAsync(id);
            if (feedback != null)
            {
                _dbContext.Feedbacks.Remove(feedback);
                await _dbContext.SaveChangesAsync();
            }
        }
    }
}
