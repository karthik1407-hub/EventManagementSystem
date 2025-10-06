﻿using Event_Management_System.Data;
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
        private readonly RoleManager<IdentityRole> roleManager;
        private readonly ApplicationDbContext _dbContext;

        public AuthController(UserManager<IdentityUser> userManager,
            ITokenRepository tokenRepository,
            RoleManager<IdentityRole> roleManager,
            ApplicationDbContext dbContext) // Inject ApplicationDbContext
        {
            this.userManager = userManager;
            this.tokenRepository = tokenRepository;
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
            var email = User.FindFirstValue(ClaimTypes.Email);
            var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(email))
            {
                return Unauthorized();
            }

            var response = new
            {
                Email = email,
                Roles = roles
            };

            return Ok(response);
        }

        // POST: {apibaseurl}/api/auth/register
        [HttpPost]
        [Route("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
        {
            var email = request.Email?.Trim();
            var username = email?.Split('@')[0];

            if (email.EndsWith("@admin.com", StringComparison.OrdinalIgnoreCase))
            {
                var allUsers = userManager.Users.ToList();
                bool adminExists = allUsers.Any(u => u.Email.EndsWith("@admin.com", StringComparison.OrdinalIgnoreCase));

                if (adminExists)
                {
                    return BadRequest(new { Message = "An Admin account already exists. Only one Admin is allowed." });
                }
            }

            var identityUser = new IdentityUser
            {
                UserName = username,
                Email = email
            };

            var identityResult = await userManager.CreateAsync(identityUser, request.Password);

            if (identityResult.Succeeded)
            {
                string roleToAssign = string.Empty;

                if (email.EndsWith("@admin.com", StringComparison.OrdinalIgnoreCase))
                {
                    roleToAssign = "Admin";
                }
                else if (email.EndsWith("@organizer.com", StringComparison.OrdinalIgnoreCase))
                {
                    roleToAssign = "Event Organizer";
                }
                else
                {
                    roleToAssign = "Attendee";
                }

                if (!string.IsNullOrEmpty(roleToAssign))
                {
                    var roleResult = await userManager.AddToRoleAsync(identityUser, roleToAssign);

                    if (roleResult.Succeeded)
                    {
                        // Create a corresponding entry in the User domain model
                        var user = new UserDto
                        {
                            UserID = Guid.Parse(identityUser.Id),
                            Name = username,
                            Email = email,
                            Password = identityUser.PasswordHash, // Store the hashed password
                            ContactNumber = string.Empty, // Or get from a registration form
                            Roles = roleToAssign
                        };
                        await _dbContext.Users.AddAsync(user);
                        await _dbContext.SaveChangesAsync();

                        return Ok(new { Message = $"User registered with role {roleToAssign}" });
                    }
                    else
                    {
                        foreach (var error in roleResult.Errors)
                        {
                            ModelState.AddModelError("", error.Description);
                        }
                    }
                }
                else
                {
                    ModelState.AddModelError("", "No matching role found for the provided email domain.");
                }
            }
            else
            {
                foreach (var error in identityResult.Errors)
                {
                    ModelState.AddModelError("", error.Description);
                }
            }

            return ValidationProblem(ModelState);
        }
    }
}