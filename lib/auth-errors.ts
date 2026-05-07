import { CredentialsSignin } from "next-auth";

/**
 * Sign-in failed because the user has not yet verified their email.
 * Frontend should redirect to /verify-email?email=...
 */
export class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified";
}

/**
 * Sign-in failed because the account is suspended/deactivated.
 */
export class AccountInactiveError extends CredentialsSignin {
  code = "account_inactive";
}

/**
 * Generic invalid email/password.
 */
export class InvalidCredentialsError extends CredentialsSignin {
  code = "invalid_credentials";
}

/**
 * Backend unreachable / server error.
 */
export class BackendUnavailableError extends CredentialsSignin {
  code = "backend_unavailable";
}

/**
 * Map a backend login error response (status + body) to one of our typed
 * CredentialsSignin subclasses. Lets the frontend distinguish "verify email"
 * from "wrong password".
 */
export function mapLoginErrorToAuthError(
  status: number,
  body: unknown
): CredentialsSignin {
  const message = extractMessage(body).toLowerCase();

  if (
    message.includes("verify") ||
    message.includes("verif") || // covers "not verified", "unverified"
    message.includes("confirm email") ||
    message.includes("confirm your email") ||
    message.includes("email not confirm")
  ) {
    return new EmailNotVerifiedError();
  }

  if (
    message.includes("suspend") ||
    message.includes("deactivat") ||
    message.includes("disabled") ||
    message.includes("inactive")
  ) {
    return new AccountInactiveError();
  }

  if (status >= 500) {
    return new BackendUnavailableError();
  }

  return new InvalidCredentialsError();
}

function extractMessage(body: unknown): string {
  if (typeof body === "string") return body;
  if (!body || typeof body !== "object") return "";
  const rec = body as Record<string, unknown>;
  const candidates = [rec.message, rec.error, rec.detail];
  const data = rec.data && typeof rec.data === "object" ? (rec.data as Record<string, unknown>) : null;
  if (data) candidates.push(data.message, data.error);
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c;
  }
  return "";
}
