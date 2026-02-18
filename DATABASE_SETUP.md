# Database Setup Guide

This document provides instructions for setting up the PostgreSQL and Redis databases for the Time Tracker application.

## Prerequisites

Since Docker is not available in this environment, you'll need to set up the databases either locally or using cloud services.

## Option 1: Local PostgreSQL Setup

### macOS (using Homebrew)
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database
createdb clockify

# Set password for postgres user (optional)
psql postgres -c "ALTER USER postgres PASSWORD 'postgres';"
```

### Ubuntu/Debian Linux
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres createdb clockify

# Set password for postgres user
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
```

### Windows
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Use pgAdmin or psql to create the database:
   ```sql
   CREATE DATABASE clockify;
   ```

## Option 2: Cloud PostgreSQL Services

### Neon (Recommended for Development)
1. Visit https://neon.tech
2. Sign up for a free account
3. Create a new project named "clockify"
4. Copy the connection string provided
5. Update `DATABASE_URL` in `/workspace/api/.env` with the connection string

### Supabase
1. Visit https://supabase.com
2. Create a new project
3. Go to Project Settings > Database
4. Copy the connection string (URI format)
5. Update `DATABASE_URL` in `/workspace/api/.env`

### Railway
1. Visit https://railway.app
2. Create a new project
3. Add a PostgreSQL database
4. Copy the connection string
5. Update `DATABASE_URL` in `/workspace/api/.env`

## Local Redis Setup

### macOS (using Homebrew)
```bash
# Install Redis
brew install redis

# Start Redis service
brew services start redis

# Verify Redis is running
redis-cli ping  # Should return "PONG"
```

### Ubuntu/Debian Linux
```bash
# Install Redis
sudo apt update
sudo apt install redis-server

# Start Redis service
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify Redis is running
redis-cli ping  # Should return "PONG"
```

### Windows
1. Download Redis from https://github.com/microsoftarchive/redis/releases
2. Install and run Redis
3. Or use WSL2 and follow Linux instructions

## Cloud Redis Services

### Upstash (Recommended for Development)
1. Visit https://upstash.com
2. Create a new Redis database
3. Copy the connection details
4. Update Redis configuration in `/workspace/api/.env`:
   ```
   REDIS_HOST=your-upstash-host.upstash.io
   REDIS_PORT=6379
   REDIS_PASSWORD=your-password
   ```

### Redis Cloud
1. Visit https://redis.com/try-free/
2. Create a free database
3. Copy connection details
4. Update Redis configuration in `/workspace/api/.env`

## Environment Configuration

1. Navigate to the API directory:
   ```bash
   cd /workspace/api
   ```

2. The `.env` file has been created with default values. Update it with your actual database credentials:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   REDIS_HOST=your-redis-host
   REDIS_PORT=6379
   REDIS_PASSWORD=your-redis-password-if-any
   ```

3. The JWT_SECRET has been pre-generated with a secure random value. In production, ensure this is kept secret.

## Database Schema Migration

Once your databases are set up and the `.env` file is configured, you can push the schema to the database:

### Push Schema to Database
```bash
cd /workspace/api
npm run db:push
```

This command uses Drizzle Kit to push the schema directly to your database without creating migration files. It's useful for development.

### Generate Migration Files (Alternative)
If you prefer to generate migration files:
```bash
cd /workspace/api
npm run db:generate
```

### Apply Migrations (Alternative)
```bash
cd /workspace/api
npm run db:migrate
```

### Open Drizzle Studio (Database GUI)
```bash
cd /workspace/api
npm run db:studio
```

This will open a web interface at http://localhost:4983 where you can browse and edit your database.

## Verification Steps

1. **Test PostgreSQL Connection:**
   ```bash
   psql "postgresql://postgres:postgres@localhost:5432/clockify" -c "SELECT version();"
   ```

2. **Test Redis Connection:**
   ```bash
   redis-cli ping
   ```

3. **Verify Schema Files:**
   ```bash
   ls -la /workspace/api/src/db/schema/
   ```

   You should see 25 schema files including:
   - users.ts
   - workspaces.ts
   - projects.ts
   - timeEntries.ts
   - clients.ts
   - tasks.ts
   - And many more...

4. **Check Drizzle Configuration:**
   ```bash
   cat /workspace/api/drizzle.config.ts
   ```

5. **Verify Environment Variables:**
   ```bash
   cd /workspace/api && node -e "require('dotenv').config(); console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@')); console.log('REDIS_HOST:', process.env.REDIS_HOST);"
   ```

## Database Schema Overview

The application includes comprehensive schema files for:

- **Core Entities:** users, workspaces, workspace members
- **Project Management:** projects, tasks, clients, project templates
- **Time Tracking:** time entries, timesheets, time entry tags, tags
- **Advanced Features:**
  - Activity tracking and screenshots
  - Location tracking
  - Custom fields and values
  - Budgets and estimates
  - Expenses and invoices
  - Time off policies and requests
  - Audit logs and webhooks

## Troubleshooting

### Connection Refused
- Ensure PostgreSQL/Redis is running: `systemctl status postgresql` or `brew services list`
- Check if the port is correct (PostgreSQL: 5432, Redis: 6379)
- Verify firewall settings

### Authentication Failed
- Double-check username and password in DATABASE_URL
- Ensure the database user has proper permissions

### Database Does Not Exist
- Create the database: `createdb clockify`
- Or use SQL: `CREATE DATABASE clockify;`

### Drizzle Kit Errors
- Ensure all dependencies are installed: `npm install`
- Verify DATABASE_URL is set correctly in .env
- Check that schema files are valid TypeScript

## Next Steps

After completing the database setup:

1. Push the schema to your database: `npm run db:push`
2. (Optional) Seed the database with initial data
3. Start the API server: `npm run dev`
4. Verify the API is running: http://localhost:3000
5. Test database operations through the API endpoints

## Security Notes

- The generated JWT_SECRET is for development only
- Never commit `.env` files to version control (already in .gitignore)
- Use strong passwords for production databases
- Enable SSL/TLS for production database connections
- Regularly backup your database
- Use environment-specific credentials (dev, staging, prod)
