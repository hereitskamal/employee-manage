# Audit Log System

The Audit Log system automatically tracks important actions in the application for compliance, debugging, and security purposes.

## Overview

The audit log system:
- ✅ **Non-blocking**: Logging never blocks the main request
- ✅ **Automatic**: Integrated into API routes
- ✅ **Reusable**: Simple helper function for easy integration
- ✅ **Indexed**: Optimized database queries with proper indexes

## Model Structure

### AuditLog Model

```typescript
{
  userId: ObjectId (ref: User),      // Who performed the action
  action: "create" | "update" | "delete" | "login",
  resource: "employee" | "product" | "sale" | "user",
  resourceId: ObjectId,              // ID of the affected resource
  metadata: Object,                  // Optional additional data
  createdAt: Date                   // Auto-generated timestamp
}
```

## Usage

### Basic Integration

Import the audit helper and use it after successful operations:

```typescript
import { logAudit, getUserIdFromSession } from "@/lib/audit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  // ... perform your operation ...
  const result = await SomeModel.create(data);
  
  // Log the action (non-blocking)
  logAudit({
    userId: getUserIdFromSession(session) || result._id.toString(),
    action: "create",
    resource: "employee",
    resourceId: result._id,
    metadata: {
      name: result.name,
      email: result.email,
    },
  });
  
  return NextResponse.json({ success: true, data: result });
}
```

## Example: Employee API Integration

The employee routes demonstrate complete integration:

### Create Employee

```typescript
// app/api/employees/route.ts
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  // ... validation and creation ...
  
  const employee = await User.create({ /* ... */ });
  
  // Log audit event
  logAudit({
    userId: getUserIdFromSession(session) || employee._id.toString(),
    action: "create",
    resource: "employee",
    resourceId: employee._id,
    metadata: {
      name: employee.name,
      email: employee.email,
      department: employee.department,
      title: employee.title,
    },
  });
  
  return NextResponse.json({ employee });
}
```

### Update Employee

```typescript
// app/api/employees/[id]/route.ts
export async function PUT(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  // ... validation and update ...
  
  await employee.save();
  
  // Log audit event with changed fields
  const changedFields = Object.keys(validatedData);
  logAudit({
    userId: getUserIdFromSession(session) || id,
    action: "update",
    resource: "employee",
    resourceId: id,
    metadata: {
      changedFields,
      previousEmail: employee.email,
      newEmail: email ? email.toLowerCase() : employee.email,
    },
  });
  
  return NextResponse.json({ employee });
}
```

### Delete Employee

```typescript
// app/api/employees/[id]/route.ts
export async function DELETE(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  // ... validation ...
  
  // Store info before deletion
  const deletedEmployeeInfo = {
    name: employee.name,
    email: employee.email,
    department: employee.department,
  };
  
  await User.findByIdAndDelete(id);
  
  // Log audit event
  logAudit({
    userId: getUserIdFromSession(session) || id,
    action: "delete",
    resource: "employee",
    resourceId: id,
    metadata: deletedEmployeeInfo,
  });
  
  return NextResponse.json({ message: "Deleted successfully" });
}
```

## Integration Checklist

To add audit logging to a new API route:

1. ✅ Import the helper:
   ```typescript
   import { logAudit, getUserIdFromSession } from "@/lib/audit";
   ```

2. ✅ Get the session:
   ```typescript
   const session = await getServerSession(authOptions);
   ```

3. ✅ After successful operation, log the action:
   ```typescript
   logAudit({
     userId: getUserIdFromSession(session) || resourceId,
     action: "create" | "update" | "delete",
     resource: "employee" | "product" | "sale",
     resourceId: resource._id,
     metadata: { /* optional context */ },
   });
   ```

4. ✅ Place the log call **after** the operation succeeds but **before** returning the response

## Supported Actions

### Employee Operations
- ✅ Create: `POST /api/employees`
- ✅ Update: `PUT /api/employees/[id]`
- ✅ Delete: `DELETE /api/employees/[id]`

### Product Operations (To Be Integrated)
- ⏳ Create: `POST /api/products`
- ⏳ Update: `PUT /api/products/[id]`
- ⏳ Delete: `DELETE /api/products/[id]`

### Sale Operations (To Be Integrated)
- ⏳ Create: `POST /api/sales`

## Querying Audit Logs

### Example Queries

```typescript
import { AuditLog } from "@/models/AuditLog";
import { connectToDB } from "@/lib/db";

// Get all audit logs for a user
await connectToDB();
const userLogs = await AuditLog.find({ userId: userId })
  .sort({ createdAt: -1 })
  .limit(50);

// Get all employee-related actions
const employeeActions = await AuditLog.find({
  resource: "employee",
  action: { $in: ["create", "update", "delete"] },
})
  .populate("userId", "name email")
  .sort({ createdAt: -1 });

// Get recent deletions
const deletions = await AuditLog.find({
  action: "delete",
  createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
})
  .populate("userId", "name email")
  .sort({ createdAt: -1 });
```

## Database Indexes

The AuditLog model includes optimized indexes for common queries:

- `userId` - Single field index
- `action` - Single field index
- `resource` - Single field index
- `resourceId` - Single field index
- `{ resource, resourceId }` - Compound index
- `{ userId, createdAt }` - Compound index (descending)
- `{ action, resource, createdAt }` - Compound index (descending)

## Best Practices

1. **Always log after success**: Only log when the operation completes successfully
2. **Include relevant metadata**: Store useful context (names, IDs, changed fields)
3. **Don't log sensitive data**: Avoid logging passwords, tokens, or PII
4. **Use consistent resource names**: Stick to "employee", "product", "sale", "user"
5. **Non-blocking**: The `logAudit()` function is fire-and-forget, so it won't slow down your API

## Error Handling

The audit logging system is designed to never break your main flow:

- Errors are caught and logged to console
- Failed audit logs don't affect API responses
- Database connection issues are handled gracefully

## Future Enhancements

Potential improvements:
- API endpoint to query audit logs
- Admin UI for viewing audit logs
- Export functionality for compliance
- Retention policies for old logs
- Real-time audit log streaming




