using Microsoft.AspNetCore.Mvc;
using System.Reflection;

namespace Event_Management_System.Controllers
{
    [ApiController] //model validation and binding behavior.
    [Route("[controller]")] //Sets the route for HTTP requests
    public class WeatherForecastController : ControllerBase //Defines the controller class. ControllerBase is used for APIs (without views). It provides methods like Ok(), BadRequest(), etc.
    {
        private static readonly string[] Summaries = new[]  //A static array of weather descriptions. readonly ensures it can't be reassigned after initialization.
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };

        private readonly ILogger<WeatherForecastController> _logger; //Declares a logger for logging information, warnings, or errors. It's injected via constructor (see below).


        //Dependency Injection (DI): ASP.NET Core injects the ILogger instance.This follows the D in SOLID:
        //D - Dependency Inversion Principle: High-level modules should not depend on low-level modules.Both shoulld depend on abstractions.
        public WeatherForecastController(ILogger<WeatherForecastController> logger)
        {
            _logger = logger;
        }

        [HttpGet(Name = "GetWeatherForecast")]  //method to HTTP GET requests
        public IEnumerable<WeatherForecast> Get() //Returns a collection of WeatherForecast objects. IEnumerable<T> is a flexible return type for collections.
        {

             /*Enumerable.Range(1, 5): Generates numbers from 1 to 5.
            .Select(...): Projects each number into a WeatherForecast object.
            DateOnly.FromDateTime(...): Converts DateTime to DateOnly for cleaner date representation.
            Random.Shared.Next(...): Generates random temperature and summary.
            .ToArray(): Converts the result to an array.*/
            return Enumerable.Range(1, 5).Select(index => new WeatherForecast
            {
                Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                TemperatureC = Random.Shared.Next(-20, 55),
                Summary = Summaries[Random.Shared.Next(Summaries.Length)]
            })
            .ToArray();
        }
    }
}
