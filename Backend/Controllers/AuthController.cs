using Event_Management_System.Data;
using Event_Management_System.Models.Domain;
using Event_Management_System.Models.DTO;
using Event_Management_System.Repositories.Interface;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Event_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<IdentityUser> userManager;
        private readonly ITokenRepository tokenRepository;
        private readonly IAuthRepository authRepository;
        private readonly RoleManager<IdentityRole> roleManager;
        private readonly ApplicationDbContext _dbContext;

        public AuthController(UserManager<IdentityUser> userManager,
            ITokenRepository tokenRepository,
            IAuthRepository authRepository,
            RoleManager<IdentityRole> roleManager,
            ApplicationDbContext dbContext) // Inject ApplicationDbContext
        {
            this.userManager = userManager;
            this.tokenRepository = tokenRepository;
            this.authRepository = authRepository;
            this.roleManager = roleManager;
            this._dbContext = dbContext;
        }

        // POST: {apibaseurl}/api/auth/login
        [HttpPost]
        [Route("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            var identityUser = await userManager.FindByEmailAsync(request.Email);

            if (identityUser is not null)
            {
                var checkPasswordResult = await userManager.CheckPasswordAsync(identityUser, request.Password);

                if (checkPasswordResult)
                {
                    var roles = await userManager.GetRolesAsync(identityUser);

                    var claims = new List<Claim>
                    {
                        new Claim(ClaimTypes.Email, identityUser.Email),
                        new Claim(ClaimTypes.NameIdentifier, identityUser.Id)
                    };
                    foreach (var role in roles)
                    {
                        claims.Add(new Claim(ClaimTypes.Role, role));
                    }

                    var jwtToken = tokenRepository.CreateJwtToken(claims);

                    var response = new LoginResponseDto()
                    {
                        Email = request.Email,
                        Roles = roles.ToList(),
                        Token = jwtToken
                    };

                    return Ok(response);
                }
            }

            ModelState.AddModelError("", "Email or Password Incorrect");
            return ValidationProblem(ModelState);
        }

        // GET: {apibaseurl}/api/auth/profile
        [HttpGet]
        [Route("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out Guid userGuid))
            {
                return Unauthorized();
            }

            var userDto = await authRepository.GetUserById(userGuid);
            if (userDto == null)
            {
                return NotFound();
            }

            return Ok(userDto);
        }

        // POST: {apibaseurl}/api/auth/register
        [HttpPost]
        [Route("register")]
        public async Task<IActionResult> Register([FromBody] UserDTO userDto)
        {
            await authRepository.CreateUser(userDto);
            return Ok(userDto);
        }
    }
}