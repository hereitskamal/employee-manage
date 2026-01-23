# Quick Start Guide

Get the Employee Dashboard up and running in minutes.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] MongoDB installed or MongoDB Atlas account
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

## 5-Minute Setup

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd employee-dashboard

# Install dependencies
npm install
```

### Step 2: Set Up Environment Variables

Create `.env.local` in the root directory:

```env
# Required
MONGODB_URI=mongodb://localhost:27017/employee-dashboard
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Optional (for Google OAuth)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

**Generate NEXTAUTH_SECRET:**
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Step 3: Start MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service
# On Windows (as Administrator)
net start MongoDB

# On Mac
brew services start mongodb-community

# On Linux
sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Whitelist IP (0.0.0.0/0 for development)
5. Get connection string and update `MONGODB_URI`

### Step 4: Run the Application

```bash
npm run dev
```

### Step 5: Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

## First User Setup

### Create Admin User

1. Go to `/register`
2. Register with:
   - Email: `admin@example.com`
   - Password: `admin123`
   - Role: `admin` (if available in registration form)

**OR** Create via MongoDB:

```javascript
// Connect to MongoDB
use employee-dashboard

// Create admin user (password: admin123)
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$10$...", // bcrypt hash of "admin123"
  role: "admin",
  provider: "credentials",
  isProfileComplete: true,
  mustSetPassword: false,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Generate password hash:**
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('admin123', 10))"
```

### Login

1. Go to `/login`
2. Enter credentials
3. You'll be redirected to your role-specific dashboard

## Common Tasks

### Create Test Data

#### Create Employees

```bash
# Via API (after login)
POST http://localhost:3000/api/employees
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "department": "Sales",
  "title": "Sales Representative",
  "salary": 50000,
  "hireDate": "2024-01-01"
}
```

#### Create Products

```bash
POST http://localhost:3000/api/products
{
  "name": "Smart TV 55 inch",
  "category": "TV",
  "brand": "BrandName",
  "modelNo": "TV-55-2024",
  "minSaleRate": 50000,
  "stock": 25
}
```

### Test Attendance

1. Login as employee
2. Go to `/dashboard/employee`
3. Click "Clock In"
4. Work for a bit
5. Click "Clock Out"

### Test Sales

1. Go to `/dashboard/sales`
2. Click "Add Sale"
3. Select products and quantities
4. Complete the sale

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
# On Windows
netstat -ano | findstr :3000

# On Mac/Linux
lsof -i :3000

# Kill the process or use different port
PORT=3001 npm run dev
```

### MongoDB Connection Error

**Check MongoDB is running:**
```bash
# Windows
net start MongoDB

# Mac
brew services list

# Linux
sudo systemctl status mongod
```

**Check connection string:**
- Local: `mongodb://localhost:27017/employee-dashboard`
- Atlas: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

### NextAuth Secret Error

Make sure `NEXTAUTH_SECRET` is set in `.env.local`:
```env
NEXTAUTH_SECRET=your-generated-secret-here
```

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

### TypeScript Errors

```bash
# Check TypeScript configuration
npx tsc --noEmit
```

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/my-feature
```

### 2. Make Changes

Edit files in your code editor.

### 3. Test Locally

```bash
npm run dev
# Test in browser
```

### 4. Run Linter

```bash
npm run lint
```

### 5. Commit Changes

```bash
git add .
git commit -m "Add my feature"
```

### 6. Push and Create PR

```bash
git push origin feature/my-feature
# Create pull request on GitHub
```

## Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run linter

# Database
mongosh              # MongoDB shell
use employee-dashboard  # Switch database

# Testing
npm test             # Run tests
npm test -- --watch  # Watch mode
```

## Project Structure Overview

```
employee-dashboard/
├── app/              # Pages and API routes
├── components/       # React components
├── lib/              # Utilities
├── models/           # Database models
├── hooks/            # Custom hooks
└── types/            # TypeScript types
```

## Next Steps

1. **Read the [README.md](../README.md)** for full documentation
2. **Check [API.md](./API.md)** for API endpoints
3. **Review [ARCHITECTURE.md](./ARCHITECTURE.md)** for system design
4. **Explore the codebase** starting with `app/page.tsx`
5. **Create your first feature** following the project structure

## Getting Help

- Check existing issues on GitHub
- Review documentation in `/docs`
- Ask questions in team chat
- Contact the development team

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `MONGODB_URI` | Yes | MongoDB connection string | `mongodb://localhost:27017/employee-dashboard` |
| `NEXTAUTH_URL` | Yes | Application URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Yes | Secret for JWT signing | Generated secret |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID | `123456.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth secret | `GOCSPX-...` |

## Quick Reference

### Default Ports
- Application: `3000`
- MongoDB: `27017`

### Default Routes
- Home: `/`
- Login: `/login`
- Register: `/register`
- Admin Dashboard: `/dashboard/admin`
- Employee Dashboard: `/dashboard/employee`

### Default Roles
- `admin` - Full access
- `manager` - Management access
- `employee` - Standard user
- `spc` - Special role
- `helper` - Helper role

---

**Happy Coding! 🚀**




