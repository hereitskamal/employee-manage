# API Documentation

Complete API reference for the Employee Dashboard application.

## Base URL

- Development: `http://localhost:3000`
- Production: `https://your-domain.com`

## Authentication

Most endpoints require authentication via NextAuth session. Include session cookie in requests or use the `Authorization` header where applicable.

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Optional error details"
}
```

## Endpoints

### Authentication

#### Register User
**POST** `/api/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "employee"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "employee"
  }
}
```

**Status Codes:**
- `201` - User created successfully
- `400` - Validation error
- `409` - Email already exists
- `500` - Server error

---

### Attendance

#### Clock In
**POST** `/api/attendance/clock-in`

Record clock-in time for the current day.

**Headers:**
- `Cookie`: NextAuth session cookie

**Response:**
```json
{
  "success": true,
  "attendance": {
    "_id": "attendance_id",
    "userId": "user_id",
    "loginTime": "2024-01-15T09:00:00.000Z",
    "date": "2024-01-15T00:00:00.000Z",
    "status": "present",
    "createdAt": "2024-01-15T09:00:00.000Z"
  }
}
```

**Status Codes:**
- `200` - Clock-in successful
- `400` - Already clocked in today
- `401` - Unauthorized
- `500` - Server error

---

#### Clock Out
**POST** `/api/attendance/clock-out`

Record clock-out time and calculate duration.

**Headers:**
- `Cookie`: NextAuth session cookie

**Request Body (Optional):**
```json
{
  "notes": "Optional notes about the day"
}
```

**Response:**
```json
{
  "success": true,
  "attendance": {
    "_id": "attendance_id",
    "userId": "user_id",
    "loginTime": "2024-01-15T09:00:00.000Z",
    "logoutTime": "2024-01-15T17:30:00.000Z",
    "date": "2024-01-15T00:00:00.000Z",
    "duration": 510,
    "status": "present",
    "notes": "Optional notes",
    "updatedAt": "2024-01-15T17:30:00.000Z"
  }
}
```

**Status Codes:**
- `200` - Clock-out successful
- `400` - Not clocked in today
- `401` - Unauthorized
- `500` - Server error

---

#### Get User Attendance
**GET** `/api/attendance/user/[userId]`

Get attendance records for a specific user.

**Query Parameters:**
- `limit` (number, optional): Number of records to return (default: 10)
- `startDate` (string, optional): Start date filter (ISO format)
- `endDate` (string, optional): End date filter (ISO format)

**Response:**
```json
{
  "success": true,
  "attendance": [
    {
      "_id": "attendance_id",
      "userId": "user_id",
      "loginTime": "2024-01-15T09:00:00.000Z",
      "logoutTime": "2024-01-15T17:30:00.000Z",
      "date": "2024-01-15T00:00:00.000Z",
      "duration": 510,
      "status": "present"
    }
  ],
  "total": 50
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `403` - Forbidden (if accessing another user's data without permission)
- `500` - Server error

---

#### Get Daily Attendance
**GET** `/api/attendance/daily`

Get attendance records for a specific date.

**Query Parameters:**
- `date` (string, required): Date in ISO format (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "attendance": [
    {
      "_id": "attendance_id",
      "userId": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "loginTime": "2024-01-15T09:00:00.000Z",
      "logoutTime": "2024-01-15T17:30:00.000Z",
      "duration": 510,
      "status": "present"
    }
  ],
  "stats": {
    "total": 10,
    "present": 8,
    "absent": 2,
    "partial": 0
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid date format
- `401` - Unauthorized
- `500` - Server error

---

#### Get Daily Statistics
**GET** `/api/attendance/daily-stats`

Get aggregated attendance statistics.

**Query Parameters:**
- `startDate` (string, optional): Start date (ISO format)
- `endDate` (string, optional): End date (ISO format)

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalEmployees": 50,
    "present": 45,
    "absent": 3,
    "partial": 2,
    "averageDuration": 480,
    "date": "2024-01-15"
  }
}
```

---

#### Get Attendance by ID
**GET** `/api/attendance/[id]`

Get a specific attendance record.

**Response:**
```json
{
  "success": true,
  "attendance": {
    "_id": "attendance_id",
    "userId": {
      "_id": "user_id",
      "name": "John Doe"
    },
    "loginTime": "2024-01-15T09:00:00.000Z",
    "logoutTime": "2024-01-15T17:30:00.000Z",
    "date": "2024-01-15T00:00:00.000Z",
    "duration": 510,
    "status": "present",
    "notes": "Optional notes"
  }
}
```

---

### Employees

#### Get All Employees
**GET** `/api/employees`

Get paginated list of employees with filtering.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `search` (string, optional): Search in name, email, phone
- `department` (string, optional): Filter by department
- `sortBy` (string, optional): Sort field (default: "createdAt")
- `sortOrder` (string, optional): "asc" | "desc" (default: "desc")

**Response:**
```json
{
  "success": true,
  "employees": [
    {
      "_id": "employee_id",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "1234567890",
      "department": "Sales",
      "title": "Sales Representative",
      "salary": 50000,
      "hireDate": "2024-01-01T00:00:00.000Z",
      "location": "New York",
      "age": 30,
      "performance": 85
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `403` - Forbidden
- `500` - Server error

---

#### Create Employee
**POST** `/api/employees`

Create a new employee record.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "1234567890",
  "department": "Sales",
  "title": "Sales Representative",
  "salary": 50000,
  "hireDate": "2024-01-01",
  "location": "New York",
  "age": 30,
  "performance": 85
}
```

**Response:**
```json
{
  "success": true,
  "employee": {
    "_id": "employee_id",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Status Codes:**
- `201` - Employee created
- `400` - Validation error
- `401` - Unauthorized
- `403` - Forbidden
- `409` - Email already exists
- `500` - Server error

---

#### Get Employee by ID
**GET** `/api/employees/[id]`

Get a specific employee.

**Response:**
```json
{
  "success": true,
  "employee": {
    "_id": "employee_id",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "1234567890",
    "department": "Sales",
    "title": "Sales Representative",
    "salary": 50000,
    "hireDate": "2024-01-01T00:00:00.000Z",
    "location": "New York",
    "age": 30,
    "performance": 85,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

#### Update Employee
**PUT** `/api/employees/[id]`

Update an employee record.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "salary": 55000,
  "performance": 90
}
```

**Response:**
```json
{
  "success": true,
  "employee": {
    "_id": "employee_id",
    "name": "Jane Smith",
    "salary": 55000,
    "performance": 90,
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

#### Delete Employee
**DELETE** `/api/employees/[id]`

Delete an employee record.

**Response:**
```json
{
  "success": true,
  "message": "Employee deleted successfully"
}
```

---

#### Bulk Delete Employees
**POST** `/api/employees/bulk-delete`

Delete multiple employees.

**Request Body:**
```json
{
  "ids": ["id1", "id2", "id3"]
}
```

**Response:**
```json
{
  "success": true,
  "deletedCount": 3,
  "message": "3 employees deleted successfully"
}
```

---

#### Bulk Action on Employees
**POST** `/api/employees/bulk-action`

Perform bulk actions on employees.

**Request Body:**
```json
{
  "ids": ["id1", "id2", "id3"],
  "action": "updateDepartment",
  "data": {
    "department": "Marketing"
  }
}
```

---

### Products

#### Get All Products
**GET** `/api/products`

Get paginated list of products.

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `search` (string, optional): Search term
- `category` (string, optional): Filter by category
- `brand` (string, optional): Filter by brand
- `sortBy` (string, optional): Sort field
- `sortOrder` (string, optional): "asc" | "desc"

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "_id": "product_id",
      "name": "Smart TV 55 inch",
      "category": "TV",
      "brand": "BrandName",
      "modelNo": "TV-55-2024",
      "modelYear": 2024,
      "minSaleRate": 50000,
      "tagRate": 60000,
      "stock": 25,
      "starRating": 4.5,
      "criticalSellScore": 7,
      "image": "https://example.com/image.jpg"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

**Note:** `purchaseRate` and `distributorRate` are only visible to admin/manager roles.

---

#### Create Product
**POST** `/api/products`

Create a new product.

**Request Body:**
```json
{
  "name": "Smart TV 55 inch",
  "category": "TV",
  "brand": "BrandName",
  "modelNo": "TV-55-2024",
  "modelYear": 2024,
  "minSaleRate": 50000,
  "tagRate": 60000,
  "purchaseRate": 40000,
  "distributorRate": 45000,
  "stock": 25,
  "starRating": 4.5,
  "criticalSellScore": 7,
  "image": "https://example.com/image.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "product": {
    "_id": "product_id",
    "name": "Smart TV 55 inch",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

#### Get Product by ID
**GET** `/api/products/[id]`

Get a specific product.

---

#### Update Product
**PUT** `/api/products/[id]`

Update a product.

---

#### Delete Product
**DELETE** `/api/products/[id]`

Delete a product.

---

#### Bulk Delete Products
**POST** `/api/products/bulk-delete`

Delete multiple products.

**Request Body:**
```json
{
  "ids": ["id1", "id2", "id3"]
}
```

---

#### Get Product Metadata
**GET** `/api/products/meta`

Get product metadata (categories, brands, etc.).

**Response:**
```json
{
  "success": true,
  "meta": {
    "categories": ["TV", "AC", "Refrigerator"],
    "brands": ["Brand1", "Brand2", "Brand3"],
    "totalProducts": 100
  }
}
```

---

### Sales

#### Get All Sales
**GET** `/api/sales`

Get paginated list of sales.

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `startDate` (string, optional): Start date filter
- `endDate` (string, optional): End date filter
- `soldBy` (string, optional): Filter by employee ID
- `status` (string, optional): Filter by status

**Response:**
```json
{
  "success": true,
  "sales": [
    {
      "_id": "sale_id",
      "products": [
        {
          "productId": {
            "_id": "product_id",
            "name": "Smart TV 55 inch"
          },
          "quantity": 2,
          "price": 50000,
          "subtotal": 100000
        }
      ],
      "totalAmount": 100000,
      "soldBy": {
        "_id": "user_id",
        "name": "John Doe"
      },
      "saleDate": "2024-01-15T10:00:00.000Z",
      "status": "completed"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 200,
    "pages": 20
  }
}
```

---

#### Create Sale
**POST** `/api/sales`

Create a new sale transaction.

**Request Body:**
```json
{
  "products": [
    {
      "productId": "product_id",
      "quantity": 2,
      "price": 50000
    }
  ],
  "saleDate": "2024-01-15"
}
```

**Response:**
```json
{
  "success": true,
  "sale": {
    "_id": "sale_id",
    "totalAmount": 100000,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Note:** The API automatically:
- Calculates subtotals for each product
- Calculates total amount
- Sets `soldBy` to the current user
- Updates product stock

---

#### Get Sale by ID
**GET** `/api/sales/[id]`

Get a specific sale.

---

#### Update Sale
**PUT** `/api/sales/[id]`

Update a sale.

---

#### Delete Sale
**DELETE** `/api/sales/[id]`

Delete a sale.

---

#### Get Sales Statistics
**GET** `/api/sales/stats`

Get sales statistics.

**Query Parameters:**
- `startDate` (string, optional): Start date
- `endDate` (string, optional): End date

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalSales": 200,
    "totalRevenue": 5000000,
    "averageSale": 25000,
    "topEmployee": {
      "id": "user_id",
      "name": "John Doe",
      "sales": 50,
      "revenue": 1250000
    }
  }
}
```

---

#### Get Sales Analysis
**GET** `/api/sales/analysis`

Get detailed sales analysis data.

**Query Parameters:**
- `startDate` (string, optional): Start date
- `endDate` (string, optional): End date
- `groupBy` (string, optional): "day" | "week" | "month" | "category" | "employee"

**Response:**
```json
{
  "success": true,
  "analysis": {
    "revenueByPeriod": [
      {
        "period": "2024-01-15",
        "revenue": 500000,
        "sales": 20
      }
    ],
    "categoryBreakdown": [
      {
        "category": "TV",
        "revenue": 2000000,
        "sales": 40
      }
    ],
    "topProducts": [
      {
        "productId": "product_id",
        "name": "Smart TV 55 inch",
        "quantity": 50,
        "revenue": 2500000
      }
    ]
  }
}
```

---

### Profile

#### Complete Profile
**POST** `/api/profile/complete`

Complete user profile with additional information.

**Request Body:**
```json
{
  "phone": "1234567890",
  "department": "Sales",
  "title": "Sales Representative",
  "location": "New York",
  "age": 30
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "isProfileComplete": true,
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

### Departments

#### Get All Departments
**GET** `/api/departments`

Get list of all departments.

**Response:**
```json
{
  "success": true,
  "departments": [
    "Sales",
    "Marketing",
    "IT",
    "HR",
    "Finance"
  ]
}
```

---

## Error Handling

All endpoints follow consistent error handling:

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information",
  "code": "ERROR_CODE"
}
```

## Rate Limiting

API endpoints may be rate-limited in production. Check response headers for rate limit information:
- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset time

## Pagination

Endpoints that return lists support pagination:

**Query Parameters:**
- `page`: Page number (1-indexed)
- `limit`: Items per page

**Response includes:**
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Filtering and Sorting

Most list endpoints support:

**Filtering:**
- `search`: Text search across relevant fields
- Field-specific filters (e.g., `department`, `category`)

**Sorting:**
- `sortBy`: Field to sort by
- `sortOrder`: "asc" or "desc"

## Date Formats

All dates should be in ISO 8601 format:
- Full datetime: `2024-01-15T10:00:00.000Z`
- Date only: `2024-01-15`

## Webhooks

(If applicable, document webhook endpoints here)

---

**Last Updated:** January 2024




