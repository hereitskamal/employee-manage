# Employee Dashboard

A comprehensive employee management system built with Next.js, featuring role-based access control, attendance tracking, product management, and sales analytics.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Authentication & Authorization](#authentication--authorization)
- [Database Models](#database-models)
- [API Documentation](#api-documentation)
- [Role-Based Access Control](#role-based-access-control)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🎯 Overview

Employee Dashboard is a full-stack web application designed to manage employees, track attendance, manage products, and analyze sales. The application supports multiple user roles with different permission levels, ensuring secure and organized access to various features.

### Key Capabilities

- **User Management**: Complete user registration, authentication, and profile management
- **Employee Management**: Add, edit, delete, and manage employee records
- **Attendance Tracking**: Clock in/out functionality with daily attendance logs
- **Product Management**: Comprehensive product catalog with pricing tiers
- **Sales Management**: Track sales transactions and generate reports
- **Analytics**: Visual charts and insights for sales and attendance data
- **Role-Based Access**: Secure access control based on user roles

## ✨ Features

### 🔐 Authentication
- Email/password authentication
- Google OAuth integration
- Secure session management with NextAuth
- Profile completion workflow
- Password reset functionality

### 👥 Employee Management
- Create, read, update, and delete employees
- Bulk operations (bulk delete, bulk actions)
- Employee filtering and search
- Department management
- Salary tracking
- Performance metrics

### ⏰ Attendance Tracking
- Clock in/out functionality with time window validation
- Daily attendance logs
- Attendance statistics and charts
- User-specific attendance views
- Daily report generation
- Attendance status tracking (present, absent, partial)
- **Enhanced Business Rules**:
  - Clock-in time window restriction (configurable, default: 6 AM - 10 AM)
  - Automatic partial day marking if duration < configured hours (default: 8 hours)
  - Double clock-in/out prevention with clear error messages
  - Configurable attendance policies via constants

### 📦 Product Management
- Product catalog with categories
- Multiple pricing tiers (purchase rate, distributor rate, min sale rate, tag rate)
- Stock management
- Product ratings and critical sell scores
- Product filtering and search
- Bulk product operations

### 💰 Sales Management
- Create and track sales transactions
- Multi-product sales support
- Sales analytics and reporting
- Revenue charts and visualizations
- Sales by employee tracking
- Category-wise sales analysis
- Top products tracking

### 📊 Analytics & Reporting
- Sales analysis dashboard
- Revenue charts
- Category sales breakdown
- Employee performance metrics
- Attendance statistics
- Interactive data visualizations using Apache ECharts
- ChartCard component for consistent chart presentation

## 🛠 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Material-UI (MUI) v7** - Component library
- **Tailwind CSS v4** - Utility-first CSS framework
- **Apache ECharts** - Powerful chart library for data visualization
- **echarts-for-react** - React wrapper for ECharts
- **NextAuth.js** - Authentication library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **NextAuth.js** - Authentication and session management

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **Jest** - Testing framework

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm**, **yarn**, **pnpm**, or **bun** package manager
- **MongoDB** database (local or cloud instance like MongoDB Atlas)
- **Google OAuth Credentials** (optional, for Google sign-in)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd employee-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/employee-dashboard
   # or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/employee-dashboard

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here

   # Google OAuth (optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Email (optional, for notifications)
   EMAIL_SERVER_HOST=smtp.gmail.com
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=your-email@gmail.com
   EMAIL_SERVER_PASSWORD=your-app-password
   EMAIL_FROM=your-email@gmail.com
   ```

4. **Generate NextAuth secret**
   ```bash
   openssl rand -base64 32
   ```
   Use the output as your `NEXTAUTH_SECRET` value.

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuration

### Attendance Configuration

The attendance system uses configurable business rules defined in `lib/constants/attendance.ts`:

**Clock-In Time Window:**
```typescript
export const CLOCK_IN_WINDOW = {
  start: 6,  // 6:00 AM
  end: 10,  // 10:00 AM
} as const;
```

**Minimum Work Hours:**
```typescript
export const MINIMUM_WORK_HOURS = {
  fullDay: 8,  // 8 hours = 480 minutes
} as const;
```

To customize these rules, edit `lib/constants/attendance.ts` and restart the application.

**For detailed attendance logic documentation, see:** `docs/ATTENDANCE_LOGIC.md`

### MongoDB Setup

#### Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/employee-dashboard`

#### MongoDB Atlas (Cloud)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address
5. Get connection string and update `MONGODB_URI`

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env.local`

## 📁 Project Structure

```
employee-dashboard/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   │   ├── attendance/       # Attendance endpoints
│   │   ├── auth/             # Authentication endpoints
│   │   ├── employees/        # Employee endpoints
│   │   ├── products/         # Product endpoints
│   │   ├── sales/            # Sales endpoints
│   │   └── profile/          # Profile endpoints
│   ├── dashboard/            # Dashboard pages
│   │   ├── admin/            # Admin dashboard
│   │   ├── manager/          # Manager dashboard
│   │   ├── employee/         # Employee dashboard
│   │   ├── spc/              # SPC dashboard
│   │   ├── employees/        # Employee management
│   │   ├── products/         # Product management
│   │   ├── sales/            # Sales management
│   │   └── attendance/       # Attendance tracking
│   ├── login/                # Login page
│   ├── register/             # Registration page
│   ├── complete-profile/     # Profile completion
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page (redirects)
│   └── middleware.ts         # Route protection
├── components/               # React components
│   ├── attendance/           # Attendance components
│   ├── dashboard/            # Dashboard components
│   │   ├── ChartCard.tsx     # Reusable chart card wrapper
│   │   └── StatCard.tsx      # Statistics card component
│   ├── employees/            # Employee components
│   ├── layout/               # Layout components
│   ├── products/             # Product components
│   └── sales/                # Sales components
│       ├── RevenueChart.tsx   # Revenue line chart (ECharts)
│       ├── TopProductsChart.tsx # Top products bar chart (ECharts)
│       ├── CategorySalesChart.tsx # Category pie chart (ECharts)
│       └── SalesByEmployeeChart.tsx # Employee sales chart (ECharts)
├── configs/                  # Configuration files
│   └── theme.js              # MUI theme configuration
├── data/                     # Static data
│   ├── departments.ts        # Department list
│   └── employees.json        # Sample data
├── hooks/                    # Custom React hooks
│   ├── useAttendance.ts      # Attendance hook
│   ├── useEmployee.ts        # Employee hook
│   ├── useEmployees.ts       # Employees hook
│   ├── useProducts.ts        # Products hook
│   ├── useSales.ts           # Sales hook
│   └── useSalesAnalysis.ts   # Sales analysis hook
├── lib/                      # Utility libraries
│   ├── authOptions.ts        # NextAuth configuration
│   ├── db.ts                 # Database connection
│   ├── permissions.ts        # Permission utilities
│   ├── rbac.ts               # Role-based access control
│   ├── userRepo.ts           # User repository
│   ├── constants/            # Configuration constants
│   │   └── attendance.ts     # Attendance business rules
│   ├── utils/                # Utility functions
│   │   └── attendance.ts    # Attendance helper functions
│   └── validators/           # Zod validation schemas
│       └── attendance.ts     # Attendance validators
├── models/                   # Mongoose models
│   ├── Attendance.ts         # Attendance model
│   ├── Employee.ts           # Employee model
│   ├── Product.ts            # Product model
│   ├── Sale.ts               # Sale model
│   ├── Role.ts               # Role model
│   └── User.ts               # User model
├── types/                    # TypeScript type definitions
│   ├── attendance.ts         # Attendance types
│   ├── employee.ts           # Employee types
│   ├── product.ts            # Product types
│   ├── sale.ts               # Sale types
│   └── next-auth.d.ts        # NextAuth type extensions
├── docs/                     # Documentation
│   ├── API.md                # API documentation
│   ├── ARCHITECTURE.md       # Architecture documentation
│   └── ATTENDANCE_LOGIC.md   # Attendance logic documentation
├── public/                   # Static assets
├── test-utils/               # Testing utilities
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── next.config.ts            # Next.js configuration
```

## 🔐 Authentication & Authorization

### Authentication Methods

1. **Credentials (Email/Password)**
   - Users can register with email and password
   - Passwords are hashed using bcryptjs
   - Session management via NextAuth JWT

2. **Google OAuth**
   - One-click sign-in with Google account
   - Automatic user creation for new Google users
   - Profile synchronization

### User Roles

The application supports the following roles:

- **Admin**: Full system access
  - Manage all employees
  - View all attendance logs
  - Access sales analysis
  - Manage products and sales
  - System configuration

- **Manager**: Management-level access
  - View employees
  - Access sales analysis
  - Manage products and sales
  - View attendance data

- **SPC**: Special role with product/sales access
  - Manage products
  - View and create sales
  - View attendance
  - Access SPC dashboard

- **Employee**: Standard user access
  - View own profile
  - Clock in/out
  - View own attendance
  - Create sales
  - View products

- **Helper**: Similar to employee
  - Same permissions as employee role

### Route Protection

Routes are protected using Next.js middleware:

- Unauthenticated users are redirected to `/login`
- Authenticated users are redirected based on role
- Role-specific routes are enforced at middleware level
- API routes check authentication and permissions

## 📊 Database Models

### User Model

```typescript
{
  name: string;
  email: string (unique);
  password?: string;
  role: "admin" | "manager" | "employee" | "helper" | "spc";
  image?: string;
  provider: "credentials" | "google";
  phone?: string;
  department?: string;
  title?: string;
  salary?: number;
  hireDate?: Date;
  location?: string;
  age?: number;
  performance?: number;
  createdBy?: ObjectId;
  isProfileComplete: boolean;
  mustSetPassword: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Employee Model

```typescript
{
  name: string;
  email: string (unique);
  phone: string;
  department: string;
  title: string;
  salary: number;
  hireDate: Date;
  location?: string;
  age?: number;
  performance?: number;
  createdBy?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

### Attendance Model

```typescript
{
  userId: ObjectId (ref: User);
  loginTime: Date;
  logoutTime?: Date;
  date: Date;
  duration?: number; // in minutes
  status: "present" | "absent" | "partial";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Product Model

```typescript
{
  name: string;
  category: string;
  brand: string;
  modelNo: string;
  modelYear?: number;
  image?: string;
  purchaseRate?: number;
  distributorRate?: number;
  minSaleRate: number;
  tagRate?: number;
  starRating?: number; // 1-5
  criticalSellScore?: number; // 1-10
  stock: number;
  createdBy?: ObjectId;
  updatedBy?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

### Sale Model

```typescript
{
  products: [{
    productId: ObjectId (ref: Product);
    quantity: number;
    price: number;
    subtotal: number;
  }];
  totalAmount: number;
  soldBy: ObjectId (ref: User);
  saleDate: Date;
  status: "completed" | "pending" | "cancelled";
  createdBy?: ObjectId;
  updatedBy?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔌 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "employee"
}
```

#### POST `/api/auth/signup`
Alternative signup endpoint.

### Attendance Endpoints

#### POST `/api/attendance/clock-in`
Clock in for the day.

**Business Rules:**
- Clock-in is only allowed within configured time window (default: 6:00 AM - 10:00 AM)
- Prevents double clock-in (returns existing record if already clocked in)

**Response (Success):**
```json
{
  "attendance": {
    "userId": "...",
    "loginTime": "2024-01-01T09:00:00Z",
    "date": "2024-01-01",
    "status": "present"
  },
  "message": "Clocked in successfully",
  "alreadyClockedIn": false
}
```

**Response (Already Clocked In):**
```json
{
  "attendance": { /* existing record */ },
  "message": "You have already clocked in for today",
  "alreadyClockedIn": true,
  "error": "ALREADY_CLOCKED_IN"
}
```

**Error Response (Outside Time Window):**
```json
{
  "message": "Clock-in is only allowed between 6:00 and 10:00. Please clock in during the allowed time window.",
  "error": "CLOCK_IN_OUTSIDE_WINDOW"
}
```

**Status Codes:**
- `201` - Clock-in successful
- `200` - Already clocked in (returns existing record)
- `400` - Clock-in outside time window or invalid request
- `401` - Unauthorized
- `500` - Server error

#### PUT `/api/attendance/clock-out`
Clock out for the day.

**Business Rules:**
- Prevents double clock-out (returns existing record if already clocked out)
- Automatically marks attendance as "partial" if duration < configured hours (default: 8 hours)
- Automatically marks attendance as "present" if duration >= configured hours

**Response (Success):**
```json
{
  "attendance": {
    "userId": "...",
    "loginTime": "2024-01-01T09:00:00Z",
    "logoutTime": "2024-01-01T17:00:00Z",
    "duration": 480,
    "status": "present"
  },
  "message": "Clocked out successfully",
  "alreadyClockedOut": false,
  "duration": 480,
  "status": "present"
}
```

**Response (Already Clocked Out):**
```json
{
  "attendance": { /* existing record */ },
  "message": "You have already clocked out for today",
  "alreadyClockedOut": true,
  "error": "ALREADY_CLOCKED_OUT"
}
```

**Error Response (Not Clocked In):**
```json
{
  "message": "You must clock in before clocking out.",
  "error": "NOT_CLOCKED_IN"
}
```

**Status Codes:**
- `200` - Clock-out successful or already clocked out
- `400` - Not clocked in or invalid request
- `404` - No attendance record found
- `401` - Unauthorized
- `500` - Server error

**Note:** See `docs/ATTENDANCE_LOGIC.md` for detailed documentation on attendance rules and configuration.

#### GET `/api/attendance/user/[userId]`
Get attendance records for a specific user.

**Query Parameters:**
- `limit`: Number of records to return
- `startDate`: Start date filter
- `endDate`: End date filter

#### GET `/api/attendance/daily`
Get daily attendance statistics.

#### GET `/api/attendance/daily-stats`
Get aggregated daily statistics.

### Employee Endpoints

#### GET `/api/employees`
Get all employees with filtering.

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `search`: Search term
- `department`: Filter by department
- `sortBy`: Sort field
- `sortOrder`: "asc" | "desc"

#### POST `/api/employees`
Create a new employee.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "1234567890",
  "department": "Sales",
  "title": "Sales Representative",
  "salary": 50000,
  "hireDate": "2024-01-01"
}
```

#### GET `/api/employees/[id]`
Get employee by ID.

#### PUT `/api/employees/[id]`
Update employee.

#### DELETE `/api/employees/[id]`
Delete employee.

#### POST `/api/employees/bulk-delete`
Delete multiple employees.

**Request Body:**
```json
{
  "ids": ["id1", "id2", "id3"]
}
```

### Product Endpoints

#### GET `/api/products`
Get all products with filtering.

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `search`: Search term
- `category`: Filter by category
- `brand`: Filter by brand

#### POST `/api/products`
Create a new product.

**Request Body:**
```json
{
  "name": "Product Name",
  "category": "TV",
  "brand": "Brand Name",
  "modelNo": "MODEL123",
  "minSaleRate": 1000,
  "stock": 50
}
```

#### GET `/api/products/[id]`
Get product by ID.

#### PUT `/api/products/[id]`
Update product.

#### DELETE `/api/products/[id]`
Delete product.

#### GET `/api/products/meta`
Get product metadata (categories, brands, etc.).

### Sales Endpoints

#### GET `/api/sales`
Get all sales with filtering.

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `startDate`: Start date filter
- `endDate`: End date filter
- `soldBy`: Filter by employee ID

#### POST `/api/sales`
Create a new sale.

**Request Body:**
```json
{
  "products": [
    {
      "productId": "product_id",
      "quantity": 2,
      "price": 1000
    }
  ],
  "saleDate": "2024-01-01"
}
```

#### GET `/api/sales/[id]`
Get sale by ID.

#### PUT `/api/sales/[id]`
Update sale.

#### DELETE `/api/sales/[id]`
Delete sale.

#### GET `/api/sales/stats`
Get sales statistics.

#### GET `/api/sales/analysis`
Get sales analysis data.

## 🎭 Role-Based Access Control

### Role Hierarchy

```
Admin (Rank: 3)
  ├── Manager (Rank: 2)
  ├── SPC (Rank: 2)
  └── Employee (Rank: 1)
      └── Helper (Rank: 1)
```

### Route Access Matrix

| Route | Admin | Manager | SPC | Employee | Helper |
|-------|-------|---------|-----|----------|--------|
| `/dashboard/admin` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/dashboard/manager` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/dashboard/spc` | ✅ | ❌ | ✅ | ❌ | ❌ |
| `/dashboard/employee` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/dashboard/employees` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/dashboard/products` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/dashboard/sales` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/dashboard/sales/analysis` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/dashboard/attendance` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/dashboard/attendance/daily-logs` | ✅ | ❌ | ❌ | ❌ | ❌ |

### Permission System

The application uses a flexible permission system:

- **Resource-based**: Permissions are tied to resources (employees, products, sales, etc.)
- **Action-based**: Actions include read, create, update, delete, manage, export
- **Role-based**: Roles have default permission sets
- **Granular control**: Can check specific permissions using `can()` function

Example:
```typescript
import { can } from "@/lib/permissions";

if (can(userPermissions, "employees", "create")) {
  // Allow creating employees
}
```

## 💻 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run tests
npm test
```

### Code Style

- Follow TypeScript best practices
- Use ESLint configuration
- Follow Next.js conventions
- Use Material-UI components consistently
- Maintain consistent file structure

### Adding New Features

1. **Create API Route**: Add endpoint in `app/api/`
2. **Create Model**: Define Mongoose schema in `models/`
3. **Create Component**: Add React component in `components/`
4. **Create Page**: Add page in `app/dashboard/`
5. **Update Types**: Add TypeScript types in `types/`
6. **Update Permissions**: Add permissions in `lib/permissions.ts`
7. **Update Middleware**: Update route protection if needed

### Creating Charts

All charts in the application use **Apache ECharts** wrapped in the `ChartCard` component:

```typescript
import ReactECharts from "echarts-for-react";
import ChartCard from "@/components/dashboard/ChartCard";

export default function MyChart({ data }) {
  const option = {
    // ECharts configuration
  };

  return (
    <ChartCard title="Chart Title">
      <ReactECharts
        option={option}
        style={{ height: "400px", width: "100%" }}
        opts={{ renderer: "svg" }}
      />
    </ChartCard>
  );
}
```

**Available Chart Components:**
- `RevenueChart` - Line chart for revenue trends
- `TopProductsChart` - Horizontal bar chart for top products
- `CategorySalesChart` - Pie/donut chart for category sales
- `SalesByEmployeeChart` - Bar chart for employee sales
- `AttendanceChart` - Line chart for attendance trends
- `SalaryChart` - Bar chart for salary by department

## 🚢 Deployment

### Environment Variables

Ensure all environment variables are set in your production environment:

- `MONGODB_URI`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID` (if using Google OAuth)
- `GOOGLE_CLIENT_SECRET` (if using Google OAuth)

### Build for Production

```bash
npm run build
npm start
```

### Deployment Platforms

#### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

#### Other Platforms

The application can be deployed to any platform supporting Node.js:
- AWS
- Azure
- DigitalOcean
- Heroku
- Railway

### Database Setup

For production:
- Use MongoDB Atlas or managed MongoDB service
- Enable connection string authentication
- Set up proper IP whitelisting
- Enable database backups

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines

- Write clear commit messages
- Follow existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass

## 📝 License

This project is private and proprietary.

## 🆘 Support

For support, please contact the development team or open an issue in the repository.

## 📚 Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Material-UI Documentation](https://mui.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Apache ECharts Documentation](https://echarts.apache.org/)
- [ECharts for React](https://github.com/hustcc/echarts-for-react)

### Project Documentation
- `docs/API.md` - Complete API documentation
- `docs/ARCHITECTURE.md` - System architecture details
- `docs/ATTENDANCE_LOGIC.md` - Attendance business rules and logic

## 🔄 Recent Updates

### Chart Library Migration
- **Migrated from Recharts to Apache ECharts** for better performance and more chart options
- All charts now use `ChartCard` component for consistent presentation
- Charts updated: Revenue, Top Products, Category Sales, Sales by Employee, Attendance, Salary

### Enhanced Attendance System
- **Time Window Validation**: Clock-in restricted to configurable time window (default: 6 AM - 10 AM)
- **Auto Partial Day Marking**: Automatically marks attendance as "partial" if duration < 8 hours
- **Double Clock Prevention**: Prevents duplicate clock-in/out with clear error messages
- **Configurable Rules**: All attendance rules configurable via constants
- **Comprehensive Documentation**: Detailed attendance logic documentation

---

**Built with ❤️ using Next.js and TypeScript**
