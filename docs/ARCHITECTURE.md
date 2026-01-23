# Architecture Documentation

This document describes the architecture, design patterns, and technical decisions for the Employee Dashboard application.

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   React UI   │  │  Next.js App │  │  Material-UI │     │
│  │  Components  │  │    Router    │  │  Components  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└───────────────────────────┬───────────────────────────────┘
                            │
                            │ HTTP/HTTPS
                            │
┌───────────────────────────▼───────────────────────────────┐
│                    Next.js Server                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  API Routes  │  │  Middleware  │  │  NextAuth.js │   │
│  │  (Serverless)│  │   (Auth/RBAC)│  │  (Sessions)   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└───────────────────────────┬───────────────────────────────┘
                            │
                            │ Mongoose ODM
                            │
┌───────────────────────────▼───────────────────────────────┐
│                    MongoDB Database                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Users   │  │Employees │  │Products  │  │  Sales   │  │
│  │          │  │          │  │          │  │          │  │
│  │Attendance│  │          │  │          │  │          │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└───────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend Layer

- **Next.js 16 (App Router)**: React framework with server-side rendering
- **React 19**: UI library with hooks
- **TypeScript**: Type safety
- **Material-UI v7**: Component library
- **Tailwind CSS v4**: Utility-first styling
- **Recharts**: Data visualization

### Backend Layer

- **Next.js API Routes**: Serverless API endpoints
- **NextAuth.js**: Authentication and session management
- **Mongoose**: MongoDB object modeling
- **bcryptjs**: Password hashing

### Data Layer

- **MongoDB**: NoSQL database
- **Mongoose Schemas**: Data models and validation

## Design Patterns

### 1. Server Components vs Client Components

The application uses Next.js App Router with a mix of:
- **Server Components**: Default, for data fetching and SEO
- **Client Components**: Marked with `"use client"` for interactivity

**Example:**
```typescript
// Server Component (app/dashboard/page.tsx)
export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  // Fetch data on server
  return <DashboardContent data={data} />;
}

// Client Component (components/DashboardContent.tsx)
"use client";
export default function DashboardContent({ data }) {
  const [state, setState] = useState();
  // Interactive UI
}
```

### 2. Custom Hooks Pattern

Business logic is abstracted into reusable hooks:

```typescript
// hooks/useAttendance.ts
export function useAttendance(options) {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const clockIn = async () => {
    // Clock-in logic
  };
  
  return { attendance, loading, clockIn, clockOut };
}
```

**Benefits:**
- Reusable logic across components
- Separation of concerns
- Easier testing
- Consistent data fetching patterns

### 3. Repository Pattern

Data access is abstracted through repository functions:

```typescript
// lib/userRepo.ts
export async function findUserByEmail(email: string) {
  await connectToDB();
  return await User.findOne({ email: email.toLowerCase() });
}
```

### 4. Middleware Pattern

Route protection and authentication handled in middleware:

```typescript
// app/middleware.ts
export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  // Authentication and authorization logic
}
```

## Project Structure

### Directory Organization

```
app/                    # Next.js App Router
├── api/                # API routes (REST endpoints)
├── dashboard/          # Dashboard pages (role-specific)
├── layout.tsx          # Root layout
└── middleware.ts       # Route protection

components/             # React components
├── attendance/         # Feature-specific components
├── employees/
├── products/
└── sales/

lib/                    # Utility libraries
├── authOptions.ts     # NextAuth configuration
├── db.ts              # Database connection
├── rbac.ts            # Role-based access control
└── permissions.ts     # Permission utilities

models/                 # Mongoose models
├── User.ts
├── Employee.ts
├── Attendance.ts
├── Product.ts
└── Sale.ts

hooks/                  # Custom React hooks
├── useAttendance.ts
├── useEmployees.ts
└── useSales.ts

types/                  # TypeScript definitions
└── *.ts
```

### File Naming Conventions

- **Components**: PascalCase (e.g., `EmployeeTable.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAttendance.ts`)
- **Utilities**: camelCase (e.g., `authOptions.ts`)
- **Models**: PascalCase (e.g., `User.ts`)
- **Types**: camelCase (e.g., `employee.ts`)
- **Pages**: `page.tsx` (Next.js convention)
- **API Routes**: `route.ts` (Next.js convention)

## Authentication Flow

### 1. Login Flow

```
User → Login Page → Credentials/Google OAuth
  ↓
NextAuth Provider → Authorize Function
  ↓
Database Check → User Validation
  ↓
JWT Token Creation → Session Storage
  ↓
Redirect to Role-Specific Dashboard
```

### 2. Session Management

- **Strategy**: JWT (JSON Web Tokens)
- **Storage**: HTTP-only cookies
- **Refresh**: Automatic via NextAuth
- **Sync**: Session always synced from database

### 3. Protected Routes

```typescript
// Middleware checks:
1. Is user authenticated? → Redirect to /login
2. Is route allowed for role? → Redirect to appropriate dashboard
3. Is profile complete? → Redirect to /complete-profile (if needed)
```

## Authorization System

### Role-Based Access Control (RBAC)

**Role Hierarchy:**
```
Admin (Rank: 3)
  ├── Manager (Rank: 2)
  ├── SPC (Rank: 2)
  └── Employee (Rank: 1)
      └── Helper (Rank: 1)
```

**Implementation:**
```typescript
// lib/rbac.ts
export function hasAtLeastRole(userRole, minRole) {
  return ROLE_RANK[userRole] >= ROLE_RANK[minRole];
}
```

### Permission System

**Resource-Action Model:**
- Resources: `employees`, `products`, `sales`, `attendance`
- Actions: `read`, `create`, `update`, `delete`, `manage`, `export`

**Usage:**
```typescript
if (can(userPermissions, "employees", "create")) {
  // Allow creating employees
}
```

## Data Flow

### 1. Client-Side Data Fetching

```typescript
// Component
const { data, loading, error } = useEmployees();

// Hook
export function useEmployees() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch('/api/employees')
      .then(res => res.json())
      .then(setData);
  }, []);
  return { data };
}
```

### 2. Server-Side Data Fetching

```typescript
// Server Component
export default async function Page() {
  await connectToDB();
  const employees = await Employee.find();
  return <EmployeeList employees={employees} />;
}
```

### 3. API Route Pattern

```typescript
// app/api/employees/route.ts
export async function GET(req: Request) {
  // 1. Authenticate
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  // 2. Authorize
  if (!hasRole(session.user.role, ["admin", "manager"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  // 3. Process request
  await connectToDB();
  const employees = await Employee.find();
  
  // 4. Return response
  return NextResponse.json({ success: true, employees });
}
```

## Database Design

### Connection Management

**Singleton Pattern:**
```typescript
// lib/db.ts
let cached = global.mongoose || { conn: null, promise: null };

export async function connectToDB() {
  if (cached.conn) return cached.conn;
  // ... connection logic
}
```

**Benefits:**
- Prevents multiple connections
- Reuses connection in serverless environment
- Handles hot reloading in development

### Schema Design Principles

1. **Normalization**: Related data stored separately with references
2. **Indexing**: Strategic indexes for query performance
3. **Validation**: Mongoose schema validation
4. **Timestamps**: Automatic `createdAt` and `updatedAt`

### Relationships

```
User (1) ──< (N) Attendance
User (1) ──< (N) Sale (soldBy)
User (1) ──< (N) Employee (createdBy)
Product (1) ──< (N) Sale.products[]
```

## State Management

### Local State (useState)

For component-specific state:
```typescript
const [isOpen, setIsOpen] = useState(false);
```

### Server State (Custom Hooks)

For data fetched from API:
```typescript
const { employees, loading } = useEmployees();
```

### Session State (NextAuth)

For authentication:
```typescript
const { data: session } = useSession();
```

### No Global State Management

The application doesn't use Redux or Zustand because:
- Next.js App Router handles server state
- Custom hooks manage API state
- Session state handled by NextAuth
- Minimal client-side state needed

## Error Handling

### API Error Handling

```typescript
try {
  const result = await someOperation();
  return NextResponse.json({ success: true, data: result });
} catch (error) {
  console.error(error);
  return NextResponse.json(
    { success: false, error: error.message },
    { status: 500 }
  );
}
```

### Client Error Handling

```typescript
const { data, error, loading } = useEmployees();

if (error) {
  return <ErrorDisplay message={error.message} />;
}
```

## Performance Optimizations

### 1. Database Indexing

```typescript
// models/Attendance.ts
AttendanceSchema.index({ userId: 1, date: -1 });
AttendanceSchema.index({ date: -1 });
```

### 2. Pagination

All list endpoints support pagination to limit data transfer.

### 3. Server Components

Use server components for initial data loading to reduce client bundle.

### 4. Code Splitting

Next.js automatically code-splits by route.

### 5. Image Optimization

Use Next.js Image component for optimized images.

## Security Considerations

### 1. Authentication

- Passwords hashed with bcryptjs
- JWT tokens in HTTP-only cookies
- Session validation on every request

### 2. Authorization

- Role-based access control
- Route-level protection via middleware
- API-level permission checks

### 3. Input Validation

- Mongoose schema validation
- TypeScript type checking
- API request validation

### 4. SQL Injection Prevention

- Mongoose parameterized queries
- No raw string concatenation

### 5. XSS Prevention

- React automatically escapes content
- Sanitize user input
- Use MUI components (XSS-safe)

### 6. CSRF Protection

- NextAuth handles CSRF tokens
- SameSite cookie attributes

## Testing Strategy

### Unit Tests

Test individual functions and components:
```typescript
// __tests__/lib/rbac.test.ts
describe('hasRole', () => {
  it('should return true for valid role', () => {
    expect(hasRole('admin', ['admin', 'manager'])).toBe(true);
  });
});
```

### Integration Tests

Test API endpoints:
```typescript
// __tests__/api/employees.test.ts
describe('GET /api/employees', () => {
  it('should return employees for admin', async () => {
    const res = await fetch('/api/employees', {
      headers: { Cookie: adminSessionCookie }
    });
    expect(res.status).toBe(200);
  });
});
```

### E2E Tests

(If using Playwright/Cypress)

## Deployment Architecture

### Recommended: Vercel

```
GitHub Repository
  ↓
Vercel (Automatic Deploy)
  ↓
Next.js Serverless Functions
  ↓
MongoDB Atlas (Cloud Database)
```

### Environment Variables

- Development: `.env.local`
- Production: Vercel Environment Variables

### Build Process

1. `npm run build` - Creates optimized production build
2. Static pages pre-rendered
3. API routes become serverless functions
4. Assets optimized and cached

## Future Improvements

### Potential Enhancements

1. **Caching Layer**
   - Redis for session storage
   - API response caching

2. **Real-time Features**
   - WebSocket for live updates
   - Server-Sent Events for notifications

3. **Advanced Analytics**
   - Data warehouse integration
   - Business intelligence tools

4. **Microservices**
   - Split into separate services
   - API gateway pattern

5. **GraphQL API**
   - Alternative to REST
   - Better data fetching

6. **Mobile App**
   - React Native app
   - Shared business logic

## Best Practices

### Code Organization

1. **Feature-based structure** for components
2. **Separation of concerns** (UI, logic, data)
3. **Reusable components** and hooks
4. **Type safety** with TypeScript

### Development Workflow

1. **Feature branches** for new features
2. **Code reviews** before merging
3. **Testing** before deployment
4. **Documentation** for complex logic

### Performance

1. **Optimize database queries**
2. **Use pagination** for large datasets
3. **Lazy load** heavy components
4. **Monitor** performance metrics

---

**Last Updated:** January 2024




