using Event_Management_System.Models.Domain;
using Microsoft.AspNetCore.Http;

namespace Event_Management_System.Repositories.Interface
{

    public interface IEventImageRepository
    {
        Task<IEnumerable<EventImage>> GetAll();
        Task<EventImage> Upload(IFormFile file, EventImage eventImage);
    }

}