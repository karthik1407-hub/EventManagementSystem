
using Event_Management_System.Controllers;
using Event_Management_System.Data;
using Event_Management_System.Models.DTO;
using Event_Management_System.Repositories.Interface;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using System.Threading.Tasks;
using Xunit;

namespace Event_Management_System.Tests
{
    public class AuthControllerTests
    {
        private readonly Mock<UserManager<IdentityUser>> _userManagerMock;
        private readonly Mock<ITokenRepository> _tokenRepositoryMock;
        private readonly Mock<RoleManager<IdentityRole>> _roleManagerMock;
        private readonly Mock<ApplicationDbContext> _dbContextMock;
        private readonly AuthController _authController;

        public AuthControllerTests()
        {
            // Mock UserManager
            var userStoreMock = new Mock<IUserStore<IdentityUser>>();
            _userManagerMock = new Mock<UserManager<IdentityUser>>(userStoreMock.Object, null, null, null, null, null, null, null, null);

            // Mock ITokenRepository
            _tokenRepositoryMock = new Mock<ITokenRepository>();

            // Mock RoleManager
            var roleStoreMock = new Mock<IRoleStore<IdentityRole>>();
            _roleManagerMock = new Mock<RoleManager<IdentityRole>>(roleStoreMock.Object, null, null, null, null);

            // Mock ApplicationDbContext
            var options = new DbContextOptions<ApplicationDbContext>();
            _dbContextMock = new Mock<ApplicationDbContext>(options);

            // Instantiate AuthController with mocks
            _authController = new AuthController(
                _userManagerMock.Object,
                _tokenRepositoryMock.Object,
                _roleManagerMock.Object,
                _dbContextMock.Object
            );
        }

        [Fact]
        public async Task Register_WithValidData_ReturnsOk()
        {
            // Arrange
            var registerRequestDto = new RegisterRequestDto
            {
                Email = "test@example.com",
                Password = "Password123"
            };

            var identityUser = new IdentityUser { UserName = "test", Email = "test@example.com" };
            var identityResult = IdentityResult.Success;

            _userManagerMock.Setup(x => x.CreateAsync(It.IsAny<IdentityUser>(), It.IsAny<string>()))
                .ReturnsAsync(identityResult);

            _userManagerMock.Setup(x => x.AddToRoleAsync(It.IsAny<IdentityUser>(), It.IsAny<string>()))
                .ReturnsAsync(IdentityResult.Success);
            
            var users = new Mock<DbSet<UserDto>>();
            _dbContextMock.Setup(c => c.Users).Returns(users.Object);


            // Act
            var result = await _authController.Register(registerRequestDto);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }
    }
}
