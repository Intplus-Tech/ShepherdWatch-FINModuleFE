# Frontend-Backend Integration Issue

**Date:** 2026-03-23
**Reported by:** DevOps Team
**Priority:** High - Blocking end-to-end testing
**Component:** Authentication (Login)

---

## Problem Summary

The frontend login functionality is currently using a **mock implementation** that accepts any email/password combination without validating against the backend database. This prevents proper testing of the deployed infrastructure and authentication flow.

### Current Behavior
- User can login with ANY password (e.g., `test@example.com` + `wrongpassword123` → success)
- No actual validation against the backend Identity Service
- Mock implementation always creates a successful session

### Expected Behavior
- Frontend should call the backend `/auth/login` API endpoint
- Backend validates credentials against the database
- Invalid credentials return proper error messages
- Only valid users can authenticate

---

## Technical Details

### Current Implementation

**File:** `app/api/auth/login/route.ts` (Lines 12-44)

The current code:
1. Validates schema format only (email is valid email, password is at least 6 chars)
2. Creates a mock user object from the email
3. Always succeeds if schema validation passes
4. Never contacts the backend API

```typescript
// Current mock implementation
const user = {
  id: data.email,
  email: data.email,
  role: "director",  // Hardcoded role
  name: data.email.split("@")[0],
}
// No backend API call happens
```

### Backend API Endpoint

**Service:** Identity Service
**Endpoint:** `POST /api/v1/identity/auth/login`
**Location:** `ShepherdWatchBE-V3/apps/identity-service/src/modules/auth/auth.controller.ts:33`

**Request Format:**
```json
{
  "email": "user@example.com",
  "password": "actualPassword123"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "name": "User Name",
      "role": "director"
    },
    "token": "jwt-token-here"
  }
}
```

**Error Response (400/401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

## Required Changes

### 1. Update Login Route to Call Backend API

**File to modify:** `app/api/auth/login/route.ts`

**Changes needed:**
1. Add a fetch call to the backend API using `process.env.BACKEND_API_URL`
2. Handle successful authentication (200 OK)
3. Handle authentication failures (400, 401, 500)
4. Extract user data from backend response
5. Maintain existing JWT token creation for frontend session
6. Return appropriate error messages to the user

**Backend URL:**
- Environment variable: `BACKEND_API_URL`
- Current value: `http://shepherdwatch-be-alb-dev-1861827838.us-east-1.elb.amazonaws.com`
- Full endpoint: `${BACKEND_API_URL}/api/v1/identity/auth/login`

### 2. Error Handling Requirements

The implementation should handle:
- Network errors (backend unreachable)
- Invalid credentials (401)
- Validation errors (400)
- Server errors (500)
- Timeout scenarios

### 3. Response Mapping

Map the backend response to the frontend's expected format:
- Extract user details from `response.data.user`
- Store backend JWT token (may be needed for future API calls)
- Create frontend session token for middleware
- Maintain existing cookie-based session management

---

## Implementation Notes

### Environment Variables
The frontend already has access to:
- `BACKEND_API_URL` - configured in AWS App Runner
- `NODE_ENV` - set to "production" in deployment

### Existing Code to Preserve
- Schema validation using Zod (`loginSchema`)
- Frontend JWT token creation (`createToken`)
- Session store management (`sessionStore.createSession`)
- Cookie configuration (httpOnly, secure, maxAge)
- Remember me functionality

### Suggested Approach
1. Keep existing schema validation
2. Add backend API call after validation passes
3. If backend returns success → extract user data → create frontend session
4. If backend returns error → return appropriate error message with correct status code
5. Handle network/timeout errors gracefully

---

## Testing Requirements

After implementation, test the following scenarios:

### Valid Credentials
- [ ] User can login with correct email/password
- [ ] JWT token is set in cookies
- [ ] User is redirected to dashboard
- [ ] Session persists across page refreshes

### Invalid Credentials
- [ ] Wrong password returns error message
- [ ] Non-existent email returns error message
- [ ] Error message is user-friendly
- [ ] No session is created on failure

### Error Scenarios
- [ ] Backend unreachable → graceful error message
- [ ] Network timeout → appropriate error
- [ ] Malformed response → handled properly

### Remember Me Functionality
- [ ] Session duration respects rememberMe flag
- [ ] Cookie maxAge is set correctly

---

## Infrastructure Context

### Current Deployment Architecture
- **Frontend:** AWS App Runner (https://pj6cptkvew.us-east-1.awsapprunner.com/)
- **Backend ALB:** http://shepherdwatch-be-alb-dev-1861827838.us-east-1.elb.amazonaws.com
- **Identity Service:** Running on ECS (port 6003)
- **API Gateway:** Proxies requests to Identity Service

### Why This Blocks DevOps
The DevOps team cannot validate:
- End-to-end authentication flow
- ALB → ECS → Database connectivity
- CORS configuration
- Session management across services
- Production readiness of the stack

Without real authentication, we cannot confirm the infrastructure is working correctly.

---

## Additional Considerations

### Security Notes
- Ensure HTTPS is used in production (currently HTTP for ALB)
- Backend tokens should be stored securely
- Consider token refresh mechanism
- CORS headers must allow frontend domain

### Future Enhancements (Not Required Now)
- Token refresh logic
- Multi-factor authentication support
- Password strength validation
- Rate limiting on failed attempts

---

## Questions?

If you have questions about:
- **Backend API contract:** Check `ShepherdWatchBE-V3/apps/identity-service/src/modules/auth/`
- **Environment variables:** Contact DevOps team
- **Infrastructure issues:** Contact DevOps team
- **Testing credentials:** Ask backend team for test user accounts

---

## Priority Justification

This is blocking:
1. End-to-end infrastructure testing
2. Security validation
3. Production deployment readiness
4. User acceptance testing

**Estimated effort:** 1-2 hours for experienced developer
**Risk level:** Low (well-defined interface, straightforward change)

---

**Document created by:** DevOps Team
**For questions:** Contact infrastructure team
