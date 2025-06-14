# Task Management System API

A robust, scalable Task Management System built with NestJS, TypeScript, and PostgreSQL. Features comprehensive authentication, task CRUD operations, and extensive API documentation.

## 🚀 Features

- **JWT Authentication** - Secure user registration and login
- **Task Management** - Complete CRUD operations for tasks
- **Advanced Filtering** - Filter tasks by status, due date, and more
- **RESTful API Design** - Clean, intuitive API endpoints
- **Swagger Documentation** - Interactive API documentation
- **TypeScript** - Full type safety and modern JavaScript features
- **Database Integration** - PostgreSQL with TypeORM
- **Input Validation** - Comprehensive request validation
- **Error Handling** - Structured error responses

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Contributing](#contributing)

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/task-management-api.git
   cd task-management-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   # Create database
   createdb task_management
   
   # Run migrations
   npm run migration:run
   ```

5. **Start the application**
   ```bash
   npm run start:dev
   ```

6. **Access the API**
   - API Base URL: `http://localhost:3000/api/v1`
   - Swagger Documentation: `http://localhost:3000/api`

## 📊 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | Register a new user | ❌ |
| POST | `/auth/login` | Authenticate user and return JWT token | ❌ |

### User Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/me` | Get logged-in user profile | ✅ |

### Task Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/tasks` | Create a new task | ✅ |
| GET | `/tasks` | Get list of tasks (with optional filters) | ✅ |
| GET | `/tasks/:id` | Get a single task by ID | ✅ |
| PUT | `/tasks/:id` | Update task details | ✅ |
| PATCH | `/tasks/:id/complete` | Mark a task as complete | ✅ |
| DELETE | `/tasks/:id` | Delete a task | ✅ |

### Query Parameters for GET /tasks
- `status` - Filter by task status (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- `dueDate` - Filter by due date (YYYY-MM-DD)
- `priority` - Filter by priority (LOW, MEDIUM, HIGH)
- `page` - Page number for pagination (default: 1)
- `limit` - Number of items per page (default: 10)

## 🛠 Installation & Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=task_management

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=24h

# Application Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration (optional)
CORS_ORIGIN=http://localhost:3000
```

### Database Setup

1. **Create PostgreSQL database**
   ```bash
   createdb task_management
   ```

2. **Run database migrations**
   ```bash
   npm run migration:run
   ```

3. **Seed database (optional)**
   ```bash
   npm run seed
   ```

## 👨‍💻 Development

### Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debugging

# Building
npm run build              # Build the application
npm run start:prod         # Start production build

# Database
npm run migration:generate # Generate new migration
npm run migration:run      # Run migrations
npm run migration:revert   # Revert last migration

# Testing
npm run test               # Run unit tests
npm run test:e2e          # Run end-to-end tests
npm run test:cov          # Run tests with coverage

# Linting
npm run lint              # Check linting
npm run lint:fix          # Fix linting issues
```

### Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── controllers
│   ├── services
│   ├── guards/
│   └── dto/
├── tasks/               # Task management module
│   ├── controllers
│   ├── services
│   ├── entities/
│   └── dto/
├── users/               # User management module
│   ├── controllers
│   ├── services
│   ├── entities/
│   └── dto/
├── common/              # Shared utilities
│   ├── decorators/
│   ├── interface/
│   
├── config/              # Configuration files
└── main.ts              # Application bootstrap
```

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Test Structure

- **Unit Tests**: Located alongside source files (`*.spec.ts`)
- **E2E Tests**: Located in `test/` directory
- **Test Database**: Uses separate test database configuration

## 📡 API Usage Examples

### User Registration

```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### User Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

### Create Task

```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive docs for the task management API",
    "dueDate": "2024-12-31",
    "priority": "HIGH"
  }'
```

### Get Tasks with Filters

```bash
curl -X GET "http://localhost:3000/api/v1/tasks?status=PENDING&priority=HIGH&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🚀 Deployment

### Docker Deployment

1. **Build Docker image**
   ```bash
   docker build -t task-management-api .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```bash
   export NODE_ENV=production
   export DATABASE_URL=your_production_db_url
   export JWT_SECRET=your_production_jwt_secret
   ```

3. **Run migrations**
   ```bash
   npm run migration:run
   ```

4. **Start the application**
   ```bash
   npm run start:prod
   ```

### Environment-Specific Configurations

- **Development**: Uses local PostgreSQL, detailed logging
- **Staging**: Uses cloud database, moderate logging
- **Production**: Uses production database, minimal logging, performance optimizations

## 📚 Documentation

### API Documentation

- **Swagger UI**: Available at `/api` endpoint when running the application
- **OpenAPI Spec**: Generated automatically from decorators and DTOs
- **Postman Collection**: Available in `/docs` directory

### Additional Documentation

- [Functional Documentation](./docs/functional-documentation.md)
- [API Flow Diagrams](./docs/api-flow-diagrams.md)
- [Database Schema](./docs/database-schema.md)
- [Authentication Guide](./docs/authentication.md)

## 🔧 Configuration Options

### JWT Configuration

```typescript
{
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  issuer: 'task-management-api',
  audience: 'task-management-users'
}
```

### Database Configuration

```typescript
{
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development'
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure proper Authorization header format

3. **Port Conflicts**
   - Change PORT in `.env` file
   - Check if port is already in use

### Debug Mode

Run the application in debug mode:

```bash
npm run start:debug
```

Enable debug logging:

```bash
DEBUG=* npm run start:dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Follow the existing code style
- Use conventional commit messages


## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - The progressive Node.js framework
- [TypeORM](https://typeorm.io/) - ORM for TypeScript and JavaScript
- [PostgreSQL](https://www.postgresql.org/) - The world's most advanced open source database
- [JWT](https://jwt.io/) - JSON Web Token standard



**Happy Coding! 🚀**