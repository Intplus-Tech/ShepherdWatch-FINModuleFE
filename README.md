# ShepherdWatch Financial Module Frontend

A production-oriented **Next.js App Router** frontend for ShepherdWatch's church finance workflows.

This app provides:
- Auth screens and authenticated screen areas by role
- Server-side API proxy routes under `app/api/*` (especially auth)
- Cookie-based session handling for backend JWT + refresh token flows
- Multiple role dashboards (director, branch lead pastor, branch accountant, branch admin)

---

## Table Of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Getting Started](#getting-started)
4. [Environment Variables](#environment-variables)
5. [Authentication Architecture](#authentication-architecture)
6. [Auth API Proxy Endpoints](#auth-api-proxy-endpoints)
7. [User Flows](#user-flows)
8. [Role Routing](#role-routing)
9. [Development Workflow](#development-workflow)
10. [Build And Deployment](#build-and-deployment)
11. [Auth API Examples](#auth-api-examples)
12. [Screenshots And GIF Walkthrough](#screenshots-and-gif-walkthrough)
13. [Contributor Guide And PR Checklist](#contributor-guide-and-pr-checklist)
14. [Troubleshooting](#troubleshooting)
15. [Security Notes](#security-notes)
16. [Known Gaps / Future Improvements](#known-gaps--future-improvements)

---

## Tech Stack

- **Framework:** Next.js `16.1.6` (App Router)
- **Language:** TypeScript
- **UI:** React `19`, Tailwind CSS 4, shadcn primitives, Radix UI components
- **Forms & Validation:** react-hook-form + zod
- **Auth token handling:** httpOnly cookies + backend JWT/refresh tokens
- **Linting:** ESLint 9
- **Containerization:** Multi-stage Docker build (`node:20-alpine`)

---

## Project Structure

```text
app/
  (auth)/
    login/
    signin/
    sign-up/
    signup/
    verify-email/
    forgot-password/
    reset-password/
    reset-success/

  (screens)/
    director-screen/
    branchlead-pastor/
    branchaccount-pastor/
    branch-admin/

  api/
    auth/
      login/
      register/
      verify-email/
      refresh-token/
      me/
      session/
      logout/
      resend-otp/
      forgot-password/
      reset-password/
      change-password/
      profile/
      check-email/
      remember-me/
    core/
    financial/
    users/
    sessions/
    ...

components/
  auth/
    AuthProvider.tsx
    ProtectedRoute.tsx
  forms/
    LoginForm.tsx
    SignInForm.tsx
    VerifyEmailForm.tsx
    ResetPasswordForm.tsx
    SetNewPasswordForm.tsx
  navigation/
  ui/

lib/
  auth-config.ts
  backend-auth-url.ts
  cors.ts
  api.ts
  jwt.ts
  session.ts

public/
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+

### Install

```bash
npm ci
```

### Run Dev Server

```bash
npm run dev
```

Open `http://localhost:3000`.

By default, root (`/`) redirects to `/signup`.

### Lint

```bash
npm run lint
```

### Production Build

```bash
npm run build
npm run start
```

---

## Environment Variables

Create a local `.env` file in the repo root.

### Required

```env
BACKEND_LOGIN_URL=https://your-backend-domain/api/v1/auth/login
BACKEND_API_URL=https://your-backend-domain
JWT_SECRET=replace-with-a-long-random-secret
```

### Optional

```env
BACKEND_REGISTER_URL=https://your-backend-domain/api/v1/auth/register
FRONTEND_ORIGIN=http://localhost:3000,https://your-frontend-domain
AUTH_ISSUER=shepherdwatch-finmodule
AUTH_AUDIENCE=shepherdwatch-web
```

### Important Notes

- Prefer setting **`BACKEND_LOGIN_URL`** to a full auth login endpoint.
- `lib/backend-auth-url.ts` derives sibling endpoints (`register`, `verify-email`, `refresh-token`, etc.) from that value.
- If `BACKEND_API_URL` accidentally includes `/api-docs`, resolver logic strips it.
- Never commit production secrets.

---

## Authentication Architecture

This frontend implements a backend-driven JWT + refresh token flow using server proxy routes.

### Cookie Names

Defined in `lib/auth-config.ts`:
- `backend_token` (access token, 15 min)
- `backend_refresh_token` (refresh token, 7 days)
- `remember_me`
- `csrf_token` (reserved)

### Core Components

- `components/auth/AuthProvider.tsx`
  - Holds `user` and `loading` state
  - Calls `/api/auth/session` on app load
  - On `401`, attempts `/api/auth/refresh-token`
  - Exposes: `login`, `logout`, `refreshUser`, `forgotPassword`, `resendOtp`, `changePassword`, `updateProfile`

- `components/auth/ProtectedRoute.tsx`
  - Redirects unauthenticated users to `/login`

- `app/api/auth/*`
  - Server-side proxy layer from frontend to backend auth API
  - Handles cookie writes/rotation and normalizes response handling

### Access/Refresh Timing

- Access token max age: `15m`
- Refresh token max age: `7d`

These values align with backend expectations and are configured in `lib/auth-config.ts`.

---

## Auth API Proxy Endpoints

These are frontend routes consumed by UI components:

- `POST /api/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-otp`
- `GET /api/auth/check-email`
- `POST /api/auth/refresh-token`
- `GET /api/auth/me`
- `GET /api/auth/session`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/change-password`
- `PATCH /api/auth/profile`
- `GET /api/auth/remember-me`

### URL Resolution Strategy

`lib/backend-auth-url.ts`:
1. If `BACKEND_LOGIN_URL` is present, derive sibling endpoint from it.
2. Else fallback to sanitized `BACKEND_API_URL`.
3. Some routes additionally attempt fallback candidates for resiliency.

### Failover Behavior

`login`, `register`, and `resend-otp` include fallback URL attempts for transient backend edge cases (404/405/5xx gateway variants).

---

## User Flows

### 1 Sign Up

UI: `components/forms/SignInForm.tsx`

Flow:
1. Validates fields with zod
2. Optional email existence check via `GET /api/auth/check-email`
3. Calls `POST /api/auth/register`
4. On success: navigates to `/verify-email?email=<user-email>`

Existing-account UX:
- When backend says account already exists, the form shows action buttons:
  - Verify email
  - Resend OTP
  - Go to login

### 2 Verify Email

UI: `components/forms/VerifyEmailForm.tsx`

Flow:
1. Reads `email` from query string if present
2. Calls `POST /api/auth/verify-email` with `{ email, code }`
3. On success redirects to `/login`

### 3 Login

UI: `components/forms/LoginForm.tsx`

Flow:
1. Calls `AuthProvider.login(...)`
2. `POST /api/v1/auth/login`
3. Backend tokens are set as httpOnly cookies by proxy route
4. Fetches current user from `/api/auth/me`
5. Redirects by role

### 4 Refresh Token

When access token expires:
1. Client hits an auth route and receives `401`
2. AuthProvider calls `POST /api/auth/refresh-token`
3. Proxy rotates cookies from backend response
4. Original request can be retried

---

## Role Routing

Current login role mapping in `components/forms/LoginForm.tsx`:

- `super_admin`, `director` -> `/director-screen/dashboard`
- `pastor`, `regional_pastor`, `branch_pastor` -> `/branchlead-pastor/dashboard`
- `accountant` -> `/branchaccount-pastor/dashboard`
- `branch_admin`, `admin`, `hr`, `employee` -> `/branch-admin/dashboard`
- fallback -> `/director-screen/dashboard`

---

## Development Workflow

### Typical Commands

```bash
npm ci
npm run dev
npm run lint
npm run build
```

### Useful During API Integration

- Confirm env values loaded correctly
- Test auth routes directly in browser dev tools (Network tab)
- Check response payload shape and cookie set behavior

### Code Style

- Use TypeScript strict-ish patterns in route handlers
- Keep route handlers defensive: validate input, parse JSON safely, guard non-JSON responses
- Preserve `credentials: "include"` on client fetch calls that rely on cookies

---

## Build And Deployment

### Vercel

`vercel.json`:
- install: `npm ci`
- build: `npm run build`
- output: `.next`

### Docker

`Dockerfile` uses multi-stage build:
1. Install deps
2. Build Next.js with standalone output
3. Run minimal runtime image with non-root user

Run locally:

```bash
docker build -t shepherdwatch-finmodule-fe .
docker run -p 3000:3000 --env-file .env shepherdwatch-finmodule-fe
```

---

## Auth API Examples

Examples below are against the frontend proxy routes (`/api/auth/*`), not direct backend endpoints.

### Register

Request:

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "rememberMe": true
}
```

Success response (example):

```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "email": "john@example.com",
    "status": "pending"
  }
}
```

Error response (example):

```json
{
  "success": false,
  "message": "An account with this email already exists."
}
```

### Verify Email

Request:

```http
POST /api/auth/verify-email
Content-Type: application/json
```

```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

Success response (example):

```json
{
  "success": true,
  "message": "Email verified successfully."
}
```

### Login

Request:

```http
POST /api/v1/auth/login
Content-Type: application/json
```

```json
{
  "email": "john@example.com",
  "password": "Password123!",
  "rememberMe": true
}
```

Success response (example):

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "john@example.com",
      "role": "director"
    },
    "tokens": {
      "accessToken": "....",
      "refreshToken": "...."
    }
  }
}
```

Also sets cookies:
- `backend_token`
- `backend_refresh_token`
- optionally `remember_me`

### Get Current User

Request:

```http
GET /api/auth/me
```

Success response (example):

```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "john@example.com",
    "role": "director",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Refresh Token

Request:

```http
POST /api/auth/refresh-token
Content-Type: application/json
```

```json
{
  "refreshToken": "optional-if-cookie-exists"
}
```

Success response (example):

```json
{
  "success": true,
  "data": {
    "accessToken": "....",
    "refreshToken": "...."
  }
}
```

Also rotates cookie values for:
- `backend_token`
- `backend_refresh_token`

### Resend OTP

Request:

```http
POST /api/auth/resend-otp
Content-Type: application/json
```

```json
{
  "email": "john@example.com",
  "purpose": "email_verification"
}
```

Success response (example):

```json
{
  "success": true,
  "message": "OTP sent successfully."
}
```

### Logout

Request:

```http
POST /api/auth/logout
```

Success response (example):

```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

Proxy clears cookies after logout.

---

## Screenshots And GIF Walkthrough

Create a `docs/media/` folder and keep UI walkthrough assets there. Suggested structure:

```text
docs/
  media/
    auth/
      login.png
      signup.png
      verify-email.png
      login-flow.gif
    dashboards/
      director-dashboard.png
      branch-admin-dashboard.png
```

Example embed:

```md
![Login Screen](docs/media/auth/login.png)
![Signup Flow](docs/media/auth/login-flow.gif)
```

Recommended walkthrough order:
1. Sign up page
2. Verify email page
3. Login page
4. Role-based redirect result
5. One dashboard per major role

Capture tips:
- Use 1366x768 or 1440x900 for desktop consistency.
- Keep browser zoom at 100%.
- Redact real tokens, emails, and IDs.
- Prefer short GIFs (5-15s) for flows, PNG for static screens.

---

## Contributor Guide And PR Checklist

### Branching

- Create feature branches from current mainline.
- Recommended branch style: `feature/<short-topic>` or `fix/<short-topic>`.

### Local Quality Gate

Before opening a PR:
1. `npm ci`
2. `npm run lint`
3. `npm run build`
4. Manually test affected auth/screen flows

### Coding Guidelines

- Keep API route handlers defensive (input checks, safe JSON parsing, graceful fallbacks).
- Preserve cookie auth behavior (`credentials: "include"` in client calls where needed).
- Keep UI changes responsive for desktop and mobile.
- Avoid large unrelated refactors in a single PR.

### Pull Request Checklist

Copy this into your PR description:

```md
## Summary
- [ ] Clear description of what changed
- [ ] Linked issue/ticket (if available)

## Scope
- [ ] No unrelated file changes
- [ ] README/docs updated if behavior changed

## Validation
- [ ] npm run lint passes
- [ ] npm run build passes
- [ ] Manually tested key flows

## Auth Impact (if applicable)
- [ ] Tested register/login/refresh/logout paths
- [ ] Verified cookies are set/cleared as expected
- [ ] Verified role-based redirects still work

## UI Impact (if applicable)
- [ ] Added screenshots/GIFs for major UI changes
- [ ] Checked desktop + mobile layout

## Risk
- [ ] Identified potential regressions
- [ ] Added rollback plan for sensitive changes
```

---

## Troubleshooting

### Login fails with valid backend users

Checklist:
1. Confirm user status on backend is active and email verified.
2. Confirm frontend is using the correct backend host.
3. Inspect `POST /api/v1/auth/login` response in Network tab.
4. Confirm `backend_token` and `backend_refresh_token` cookies are set.

### Register returns: `Unable to complete registration: This operation was aborted`

Cause:
- Upstream register endpoint timeout/abort.

What frontend already does:
- `register` route attempts multiple endpoint candidates and uses timeout failover.

Action:
- Inspect response `detail` field showing attempted URLs.
- Fix backend route/availability for those URLs.

### "An account with this email already exists"

This is a backend validation response and means registration path is functioning.

Use:
- Verify email flow
- Resend OTP flow
- Or login if already verified

### OTP not received

Frontend checks:
1. Ensure `POST /api/auth/resend-otp` returns success.
2. Use verify page `Resend OTP` action.
3. Confirm email address is correct and normalized.

If API success but no email arrives:
- backend mail transport (SMTP/API key/domain) is likely the issue.

### `BACKEND_API_URL` set to `/api-docs`

If env value looks like:

```env
BACKEND_API_URL=https://example.com/api-docs/
```

the resolver strips `/api-docs`, but best practice is:

```env
BACKEND_API_URL=https://example.com
```

### Middleware vs Screen Protection

- `app/middleware.ts` currently matches `/dashboard/:path*` and `/admin/:path*`.
- Screen groups are primarily protected using `ProtectedRoute` wrappers in layout/components.

If you add new protected areas, ensure either:
1. They are wrapped by `ProtectedRoute`, or
2. Middleware matcher includes those paths.

---

## Security Notes

- Auth tokens are set as **httpOnly** cookies to reduce JS-access risk.
- CORS helper (`lib/cors.ts`) supports explicit `FRONTEND_ORIGIN` allowlist.
- Do not expose raw backend secrets in client bundles.
- Rotate `JWT_SECRET` and use strong random values per environment.

---

## Known Gaps / Future Improvements

1. Unify endpoint candidate logic into a single helper for all auth routes (some routes still have custom fallback builders).
2. Expand middleware matcher to include all protected screen trees for defense in depth.
3. Add automated integration tests for auth route handlers (`register/login/refresh/resend-otp`).
4. Add observability hooks (request IDs, structured logs) in proxy routes.
5. Add rate limiting / anti-abuse controls for auth endpoints.

---

## Maintainers' Quick Reference

- App entry: `app/layout.tsx`
- Home redirect: `app/page.tsx`
- Auth context: `components/auth/AuthProvider.tsx`
- Auth route resolver: `lib/backend-auth-url.ts`
- Auth constants: `lib/auth-config.ts`
- Auth proxies: `app/api/auth/*`

If you are onboarding a new engineer, start with:
1. `components/auth/AuthProvider.tsx`
2. `app/api/v1/auth/login/route.ts`
3. `app/api/auth/register/route.ts`
4. `lib/backend-auth-url.ts`
