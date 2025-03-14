# Star Wars Movies API

This API provides a comprehensive interface for managing Star Wars movie information, synchronizing with the SWAPI (Star Wars API), and allowing authenticated users to interact with the data.

# 🚀 Deployment 

The API is deployed on DigitalOcean and can be accessed at [https://conexa.ganozikovsky.tech](https://conexa.ganozikovsky.tech).

Swagger documentation is available at [https://conexa.ganozikovsky.tech/api-docs](https://conexa.ganozikovsky.tech/api-docs).

## 🛠️ Technologies Used

- **Backend:** NestJS, TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT (JSON Web Tokens)
- **Documentation:** Swagger/OpenAPI
- **Testing:** Jest
- **Containerization:** Docker and Docker Compose

## 🔍 Main Features

- User authentication and authorization with role-based access control
- Star Wars movies management (CRUD operations)
- Automatic synchronization with SWAPI (Star Wars API)
- Standardized API response format
- Centralized error handling
- Automatic API documentation with Swagger

## 📋 Prerequisites

- Node.js (v18+)
- PostgreSQL
- Docker and Docker Compose (optional for container deployment)

## 🚀 Installation and Setup

### Using Node.js Locally

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd conexa-challenge
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file to match your local PostgreSQL configuration.

4. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

5. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   ```

6. **Run the application in development mode:**
   ```bash
   npm run start:dev
   ```

7. **Build for production:**
   ```bash
   npm run build
   npm run start:prod
   ```

### Using Docker

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd conexa-challenge
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file as needed for your Docker environment.

3. **Start the application using Docker Compose:**
   ```bash
   docker-compose up -d
   ```

4. **The application will be available at http://localhost:3000**

## 🔧 Docker Troubleshooting

If you encounter issues with the Docker container, such as the error "Cannot find module '/usr/src/app/dist/main.js'", try the following:

1. **Check environment variables:**
   Ensure that all environment variables in your `.env` file are correctly defined and match the ones in `docker-compose.yml`.

2. **Check file paths:**
   The working directory in the Docker container is `/app`, so make sure all paths in your code and configuration are relative to this directory.

3. **Build with debug output:**
   ```bash
   docker-compose build --no-cache --progress=plain
   ```

4. **Inspect the container:**
   ```bash
   docker exec -it conexa-api sh
   ```
   Then navigate to `/app` and check if the necessary files exist.

## 🧪 Running Tests

```bash
# Unit tests
npm run test

# Coverage reports
npm run test:cov

# End-to-end tests
npm run test:e2e
```

## 📊 Project Structure

```
src/
├── app.module.ts          # Main module
├── main.ts               # Entry point
├── auth/                 # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── dto/
│   ├── guards/
│   ├── strategies/
│   └── decorators/
├── common/               # Shared code
│   ├── decorators/
│   ├── filters/
│   ├── interceptors/
│   ├── interfaces/
│   └── schemas/
├── database/             # Database configuration
│   └── prisma.service.ts
├── external-api/         # External API integration
│   ├── services/
│   └── interfaces/
├── health/               # Health check endpoints
│   └── health.controller.ts
├── movies/               # Movies module
│   ├── movies.controller.ts
│   ├── movies.service.ts
│   ├── movies.schedule.ts
│   └── dto/
└── users/                # Users module
    ├── users.service.ts
    └── users.module.ts
```

## 📝 API Documentation

API documentation is automatically generated with Swagger and is available at `/api-docs`.

## 🔐 Authentication

The API uses JWT authentication. To access protected endpoints:

1. **Register a new user:**
   ```bash
   POST /auth/sign-up
   {
     "email": "user@example.com",
     "password": "password123",
     "name": "User Name"
   }
   ```

2. **Login to obtain a token:**
   ```bash
   POST /auth/sign-in
   {
     "email": "user@example.com",
     "password": "password123"
   }
   ```

3. **Include the token in your Authorization header:**
   ```
   Authorization: Bearer {token}
   ```

## 👥 User Roles

The API has two user roles:

1. **USER:** Can view movies and access basic endpoints
2. **ADMIN:** Can create, update, delete movies and trigger the SWAPI synchronization

## 🎬 Movies API

The Movies API provides endpoints for:

- Getting all movies (`GET /movies`)
- Getting a specific movie by ID (`GET /movies/:id`)
- Creating a new movie (`POST /movies`) - Admin only
- Updating a movie (`PATCH /movies/:id`) - Admin only
- Deleting a movie (`DELETE /movies/:id`) - Admin only
- Syncing with SWAPI (`POST /movies/sync`) - Admin only

## 🔄 SWAPI Synchronization

The application automatically syncs with the Star Wars API daily at midnight. Admins can also trigger a manual sync using the `/movies/sync` endpoint.