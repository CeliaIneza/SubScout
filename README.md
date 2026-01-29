# SubScout Setup Guide

This guide will walk you through setting up the SubScout application step by step.

## Prerequisites Checklist

Before you begin, ensure you have the following installed:

- [ ] Node.js (version 18 or higher) - [Download](https://nodejs.org/)
- [ ] PostgreSQL (version 14 or higher) - [Download](https://www.postgresql.org/download/)
- [ ] npm (comes with Node.js)
- [ ] A text editor (VS Code recommended)
- [ ] A terminal/command prompt

## Step 1: Verify Prerequisites

Open your terminal and run these commands to verify installations:

```bash
node --version

npm --version

psql --version
# Should show PostgreSQL 14.x or higher
```

## Step 2: Set Up the Database

### Option A: Using PostgreSQL Command Line

1. Create the database:
```sql
CREATE DATABASE subscout_db;
\q
```

2. Run the schema file:
```bash
# From the project root
psql -U postgres -d subscout_db -f backend/database/schema.sql
```

### Option B: Using pgAdmin (GUI)

1. Open pgAdmin
2. Right-click on "Databases" → "Create" → "Database"
3. Name it `subscout_db` and click "Save"
4. Right-click on `subscout_db` → "Query Tool"
5. Open `backend/database/schema.sql` and execute it

## Step 3: Configure the Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
# On macOS/Linux
cp .env.example .env

# On Windows
copy .env.example .env
```

4. Edit the `.env` file with your configuration:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=subscout_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT Secret (IMPORTANT: Change this!)
JWT_SECRET=generate_a_random_secret_key_here_at_least_32_characters_long

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration (for password reset)
# For Gmail, you need an App Password:
# 1. Go to Google Account → Security
# 2. Enable 2-Step Verification
# 3. Go to App Passwords
# 4. Generate password for "Mail"
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_16_char_app_password
EMAIL_FROM=noreply@subscout.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Generating a JWT Secret

You can generate a secure random secret using Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 4: Configure the Frontend

1. Navigate to the frontend directory:
```bash
cd ../frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
# On macOS/Linux
cp .env.example .env

# On Windows
copy .env.example .env
```

4. Edit the `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Step 5: Start the Application

You'll need TWO terminal windows/tabs.

### Terminal 1 - Backend Server

```bash
cd backend
npm start

# You should see:
# ╔═══════════════════════════════════════╗
# ║     SubScout API Server Started      ║
# ╠═══════════════════════════════════════╣
# ║  Port: 5000                          ║
# ║  Environment: development            ║
# ╚═══════════════════════════════════════╝
```

### Terminal 2 - Frontend Development Server

```bash
cd frontend
npm start

# Browser should automatically open to http://localhost:3000
# If not, manually navigate to http://localhost:3000
```

## Step 6: Test the Application

### Create Your First Account

1. Click "Sign up" on the login page
2. Fill in your details:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Password: Password123 (must have uppercase, lowercase, and number)
   - Confirm Password: Password123

3. Click "Create Account"
4. You should be redirected to the dashboard

### Add Your First Subscription

1. Click "Add Subscription" button
2. Fill in the details:
   - Name: Netflix
   - Cost: 15.99
   - Currency: USD
   - Frequency: Monthly
   - Category: Entertainment
   - Next Billing Date: (select a future date)
   - Notes: Premium plan

3. Click "Add Subscription"
4. The subscription should appear in your list

### Test the Dashboard

1. Click "Dashboard" in the navigation
2. You should see:
   - Monthly Spend: $15.99
   - Yearly Spend: $191.88
   - Total Subscriptions: 1
   - Category breakdown showing Entertainment
   - Upcoming renewals

### Test Filtering

1. Go to "Subscriptions" page
2. Try filtering by category: "Entertainment"
3. Try filtering by status: "Active"
4. Click "Clear Filters"

### Test Password Reset (Optional)

1. Logout
2. Click "Forgot password?"
3. Enter your email
4. Check your email for the reset link
5. Follow the link and set a new password
