# Event Management System

A comprehensive full-stack web application for managing events, built with Angular for the frontend and ASP.NET Core for the backend. The system allows users to browse and book event tickets, organizers to create and manage events, and administrators to oversee the entire platform.

## Features

### User Management
- User registration and authentication
- Role-based access control (User, Event Organizer, Admin)
- JWT-based secure authentication
- Profile management

### Event Management
- Browse and search events
- Event creation, editing, and deletion
- Image upload for events
- Event categorization and filtering
- Event details with pricing and descriptions

### Ticket System
- Ticket purchasing and booking
- Order management with baskets
- Payment integration
- Ticket validation and management

### Feedback and Notifications
- User feedback submission for events
- Notification system for updates
- Review and rating system

### Administrative Controls
- User management (view, edit, delete users)
- Event moderation and approval
- System-wide analytics and reporting
- Content management

## Technology Stack

### Frontend
- **Framework**: Angular 16
- **Language**: TypeScript
- **Styling**: Bootstrap 5, Custom CSS
- **State Management**: RxJS for reactive programming
- **HTTP Client**: Angular HttpClient with interceptors
- **Routing**: Angular Router with guards

### Backend
- **Framework**: ASP.NET Core (.NET 6+)
- **Language**: C#
- **Database**: SQL Server with Entity Framework Core
- **Authentication**: JWT Bearer tokens with ASP.NET Identity
- **API Documentation**: Swagger/OpenAPI
- **Architecture**: Repository pattern with dependency injection
- **File Storage**: Local file system for event images

### Database
- **Primary Database**: EMS_App_Final-1 (application data)
- **Authentication Database**: EMS_Auth_Final-1 (user identities and roles)
- **ORM**: Entity Framework Core with Code-First migrations

## Project Structure

```
EventManagementSystem/
├── Backend/                          # ASP.NET Core API
│   ├── Controllers/                  # API controllers
│   ├── Models/                       # Domain models and DTOs
│   │   ├── Domain/                   # Entity models
│   │   └── DTO/                      # Data transfer objects
│   ├── Repositories/                 # Data access layer
│   │   ├── Interface/                # Repository interfaces
│   │   └── Implementation/           # Repository implementations
│   ├── Data/                         # Database contexts
│   ├── wwwroot/                      # Static files (event images)
│   ├── Migrations/                   # EF Core migrations
│   ├── Program.cs                    # Application entry point
│   ├── appsettings.json              # Configuration
│   └── Event Management System.csproj # Project file
├── Frontend/                         # Angular application
│   ├── src/
│   │   ├── app/                      # Angular components and services
│   │   │   ├── admin/                # Admin components
│   │   │   ├── event/                # Event-related components
│   │   │   ├── user/                 # User management
│   │   │   └── services/             # Angular services
│   │   ├── environments/             # Environment configurations
│   │   └── styles.css                # Global styles
│   ├── angular.json                  # Angular CLI config
│   ├── package.json                  # NPM dependencies
│   └── tsconfig.json                 # TypeScript config
├── .gitignore                        # Git ignore rules
└── README.md                         # This file
```

## Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v16 or higher) - for Angular development
- **.NET SDK** (v6.0 or higher) - for ASP.NET Core
- **SQL Server** (Express or Developer edition) - for database
- **Angular CLI** - `npm install -g @angular/cli`
- **Git** - for version control

## Installation and Setup

### Backend Setup

1. **Navigate to Backend directory:**
   ```bash
   cd Backend
   ```

2. **Restore NuGet packages:**
   ```bash
   dotnet restore
   ```

3. **Update database (apply migrations):**
   ```bash
   dotnet ef database update --context ApplicationDbContext
   dotnet ef database update --context AuthDbContext
   ```

4. **Configure connection strings (if needed):**
   - Edit `appsettings.json` to update SQL Server connection strings
   - Default server: `LTIN640267\SQLEXPRESS`
   - Databases: `EMS_App_Final-1` and `EMS_Auth_Final-1`

5. **Run the backend:**
   ```bash
   dotnet run
   ```
   - API will be available at: `https://localhost:7272`
   - Swagger documentation: `https://localhost:7272/swagger`

### Frontend Setup

1. **Navigate to Frontend directory:**
   ```bash
   cd Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API endpoint (if needed):**
   - Check `src/environments/environment.ts` for API base URL
   - Default: `https://localhost:7272/api`

4. **Run the frontend:**
   ```bash
   ng serve
   ```
   - Application will be available at: `http://localhost:4200`

## API Endpoints

### Authentication
- `POST /api/Auth/register` - User registration
- `POST /api/Auth/login` - User login
- `POST /api/Auth/refresh-token` - Token refresh

### Events
- `GET /api/Event` - Get all events (filtered by role)
- `GET /api/Event/{id}` - Get event by ID
- `POST /api/Event` - Create new event (Organizer/Admin)
- `PUT /api/Event/{id}` - Update event (Organizer/Admin)
- `DELETE /api/Event/{id}` - Delete event (Organizer/Admin)

### Users
- `GET /api/User` - Get all users (Admin)
- `GET /api/User/{id}` - Get user by ID
- `PUT /api/User/{id}` - Update user (Admin)
- `DELETE /api/User/{id}` - Delete user (Admin)

### Tickets
- `GET /api/Ticket` - Get user tickets
- `POST /api/Ticket` - Purchase tickets
- `DELETE /api/Ticket/{id}` - Cancel ticket

### Feedback
- `GET /api/Feedback` - Get feedback
- `POST /api/Feedback` - Submit feedback

### Notifications
- `GET /api/Notification` - Get notifications
- `POST /api/Notification` - Create notification

## User Roles and Permissions

### User
- Browse and search events
- View event details
- Purchase tickets
- Submit feedback
- Manage own profile

### Event Organizer
- All User permissions
- Create and manage own events
- View tickets for own events
- Manage event-related notifications

### Admin
- All permissions across the system
- Manage all users, events, and tickets
- Access administrative dashboard
- System-wide content management

## Development

### Running Tests

**Frontend:**
```bash
cd Frontend
ng test
```

**Backend:**
```bash
cd Backend
dotnet test
```

### Building for Production

**Frontend:**
```bash
cd Frontend
ng build --configuration production
```

**Backend:**
```bash
cd Backend
dotnet publish -c Release
```

### Database Migrations

To create new migrations:
```bash
cd Backend
dotnet ef migrations add MigrationName --context ApplicationDbContext
dotnet ef database update
```

## Configuration

### Environment Variables

**Backend (appsettings.json):**
- `ConnectionStrings:DefaultConnection` - Main database connection
- `ConnectionStrings:AuthDBConnectionString` - Authentication database connection
- `Jwt:Key` - JWT signing key
- `Jwt:Issuer` - Token issuer
- `Jwt:Audience` - Token audience

**Frontend (environment.ts):**
- `apiUrl` - Backend API base URL

## Deployment

1. **Database Setup:**
   - Create SQL Server databases
   - Run migrations on production server

2. **Backend Deployment:**
   - Publish the .NET application
   - Configure IIS or reverse proxy
   - Update connection strings for production

3. **Frontend Deployment:**
   - Build Angular application
   - Deploy static files to web server
   - Configure API proxy if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the API documentation at `/swagger`
- Review the code comments
- Create an issue in the repository

## Acknowledgments

- Built with ASP.NET Core and Angular
- Uses Bootstrap for responsive design
- Implements repository pattern for data access
- JWT authentication for security
