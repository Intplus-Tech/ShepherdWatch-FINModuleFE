# Backend Integration Guide

## Overview
The Next.js frontend is now connected to the backend microservices running on AWS. Authentication is fully integrated, and several core endpoints are available for integration.

## Backend Configuration

### Base URL
```
http://shepherdwatch-be-alb-dev-1861827838.us-east-1.elb.amazonaws.com
```

**Environment Variable:** The backend URL is available in `app/api/auth/login/route.ts`:
```typescript
const BACKEND_URL = process.env.BACKEND_URL || "http://shepherdwatch-be-alb-dev-1861827838.us-east-1.elb.amazonaws.com"
```

### Test Credentials
```
Email: test@shepherdwatch.com
Password: Test@123456
```

## Authentication (Already Integrated ✅)

### How Login Works
Authentication is already connected and working. Here's how it was implemented:

1. **Login Flow** (`app/api/auth/login/route.ts`):
```typescript
// Call backend API
const backendResponse = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
})

// Extract tokens from response
const { accessToken, refreshToken } = backendData.data

// Store tokens in httpOnly cookies
res.cookies.set("accessToken", accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24, // 1 day
  path: "/",
})
```

2. **Session Validation** (`app/api/auth/session/route.ts`):
```typescript
// Get token from cookie
const accessToken = req.cookies.get("accessToken")?.value

// Decode JWT to extract user info
const [, payload] = accessToken.split(".")
const decoded = JSON.parse(Buffer.from(payload, "base64").toString())

// Return user data
return NextResponse.json({
  user: {
    id: decoded.userId,
    email: decoded.userId,
    role: "user",
    name: decoded.userId?.split("@")[0] || "User",
  },
})
```

## Available Backend Endpoints

### ✅ Working Endpoints

#### 1. Users Endpoint
```
GET /api/v1/core/users
Authorization: Bearer {accessToken}
```

**Response Example:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "content": [
      {
        "id": "fe3ab78b-099f-4ca5-a3d5-e1ed6deebde6",
        "firstName": "Test",
        "lastName": "User",
        "email": "test@shepherdwatch.com",
        "phoneNumber": "+1234567890",
        "address": "123 Test Street",
        "role": {
          "id": "670c6e6a-781a-4c0b-be83-1e9c9109255d",
          "roleName": "Super Admin",
          "roleDescription": "Full system access",
          "permissions": ["*"],
          "status": "ACTIVE"
        },
        "tenant": {
          "id": "0ad12319-c17d-432d-a643-f6abafe11df5",
          "branchName": "Test Branch",
          "branchEmail": "testbranch@shepherdwatch.com"
        },
        "status": "ACTIVE"
      }
    ],
    "page": 1,
    "size": 20,
    "totalPages": 1,
    "totalElements": 1
  }
}
```

#### 2. Tenants Endpoint
```
GET /api/v1/core/tenants
Authorization: Bearer {accessToken}
```

**Response:** Paginated list of branches/tenants

#### 3. Regions Endpoint
```
GET /api/v1/core/regions
Authorization: Bearer {accessToken}
```

**Response:** Paginated list of regions

### ❌ Not Yet Available

The following endpoints are not implemented on the backend yet:
- `/api/v1/finance/transactions` - 404
- `/api/v1/finance/dashboard` - 404
- `/api/v1/core/dashboard` - 404
- `/api/v1/core/roles` - 500 Internal Server Error

**Current Status:** Dashboard and transaction pages are still using mock data until backend finance module is ready.

## Implementation Guide for Frontend Engineers

### Step 1: Create API Route Handler

Follow the pattern used in `app/api/auth/login/route.ts`:

```typescript
// app/api/users/route.ts (example)
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://shepherdwatch-be-alb-dev-1861827838.us-east-1.elb.amazonaws.com"

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 })
  }

  try {
    const backendResponse = await fetch(`${BACKEND_URL}/api/v1/core/users`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json()
      return NextResponse.json(
        { message: errorData.message || "Failed to fetch users" },
        { status: backendResponse.status }
      )
    }

    const data = await backendResponse.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error("API error:", err)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
```

### Step 2: Update Frontend Components

Replace mock data fetching with real API calls:

```typescript
// Before (Mock)
const users = mockUsers

// After (Real Backend)
const response = await fetch('/api/users')
const data = await response.json()
const users = data.data.content // Extract content from paginated response
```

### Step 3: Handle Pagination

Backend returns paginated responses:
```json
{
  "data": {
    "content": [...],
    "page": 1,
    "size": 20,
    "totalPages": 1,
    "totalElements": 1
  }
}
```

Add pagination parameters to your API calls:
```typescript
fetch(`/api/users?page=1&size=20`)
```

### Step 4: Error Handling

Always handle authentication errors:
```typescript
if (response.status === 401) {
  // Redirect to login
  router.push('/login')
}
```

## Testing the Integration

### Manual Testing with cURL

```bash
# 1. Get access token
TOKEN=$(curl -X POST http://shepherdwatch-be-alb-dev-1861827838.us-east-1.elb.amazonaws.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@shepherdwatch.com","password":"Test@123456"}' \
  -s | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# 2. Test users endpoint
curl -X GET http://shepherdwatch-be-alb-dev-1861827838.us-east-1.elb.amazonaws.com/api/v1/core/users \
  -H "Authorization: Bearer $TOKEN"
```

### Testing in Browser

1. **Clear browser cookies** before testing
2. Navigate to: https://pj6cptkvew.us-east-1.awsapprunner.com
3. Login with test credentials
4. Check Network tab to verify API calls are going to backend

## Next Steps for Frontend Team

### Immediate Tasks
1. ✅ **Authentication** - Already connected
2. 🔄 **Users Page** - Connect to `/api/v1/core/users`
3. 🔄 **Tenants/Branches** - Connect to `/api/v1/core/tenants`
4. 🔄 **Regions** - Connect to `/api/v1/core/regions`

### Pending Backend Implementation
5. ⏳ **Dashboard** - Waiting for `/api/v1/core/dashboard` or `/api/v1/finance/dashboard`
6. ⏳ **Transactions** - Waiting for `/api/v1/finance/transactions`
7. ⏳ **Roles** - Fix backend error on `/api/v1/core/roles`

### Incremental Approach
- Connect endpoints as they become available
- Keep mock data for features without backend endpoints
- Replace mock data incrementally as backend APIs are ready

## Environment Variables

Add to `.env.local` for local development:
```bash
BACKEND_URL=http://shepherdwatch-be-alb-dev-1861827838.us-east-1.elb.amazonaws.com
NODE_ENV=development
```

Production environment (App Runner) already has:
```bash
BACKEND_API_URL=http://shepherdwatch-be-alb-dev-1861827838.us-east-1.elb.amazonaws.com
NODE_ENV=production
PORT=3000
```

## Troubleshooting

### Issue: 401 Unauthorized
- **Cause:** Token expired or missing
- **Solution:** Clear cookies and login again

### Issue: CORS Errors
- **Cause:** Backend CORS configuration
- **Solution:** Contact backend team to add frontend domain to CORS whitelist

### Issue: 404 Not Found
- **Cause:** Endpoint not implemented on backend yet
- **Solution:** Continue using mock data until endpoint is ready

### Issue: 500 Internal Server Error
- **Cause:** Backend error (e.g., `/api/v1/core/roles`)
- **Solution:** Report to backend team for investigation

## Contact

- **DevOps:** Backend infrastructure is deployed and accessible
- **Backend Team:** For new endpoint requests or API issues
- **Frontend Team:** Responsible for integrating frontend with backend APIs

## Reference Files

Examples of already-integrated authentication:
- `app/api/auth/login/route.ts` - Login implementation
- `app/api/auth/session/route.ts` - Session validation
- Use these as templates for other API integrations
