type DashboardTargetInput = {
  role?: string | null;
  email?: string | null;
};

/**
 * The five route groups under `app/(screens)`. A user belongs to exactly one,
 * or to none when their role is not recognised.
 */
export type Workspace =
  | "director-screen"
  | "finance-controller"
  | "branchlead-pastor"
  | "branchaccount-pastor"
  | "branch-admin";

/** Shown to an authenticated user whose role maps to no workspace. */
export const NO_WORKSPACE_PATH = "/no-access";

const DASHBOARD_PATH_BY_WORKSPACE: Record<Workspace, string> = {
  "director-screen": "/director-screen/dashboard",
  "finance-controller": "/finance-controller/dashboard",
  "branchlead-pastor": "/branchlead-pastor/dashboard",
  "branchaccount-pastor": "/branchaccount-pastor/dashboard",
  "branch-admin": "/branch-admin/dashboard",
};

/**
 * Roles that grant each workspace. Declared here so route guards and the
 * post-login redirect cannot drift apart — `ProtectedRoute` authorises a screen
 * by asking `getWorkspaceForUser`, the same function that chose the landing page.
 */
const ROLES_BY_WORKSPACE: Record<Workspace, readonly string[]> = {
  "director-screen": [
    "super_admin",
    "director",
    "regional_director",
    "executive_director",
    "global_director",
  ],
  "finance-controller": ["finance_controller", "financial_controller", "finance_control"],
  "branchlead-pastor": ["pastor", "regional_pastor", "branch_pastor", "lead_pastor"],
  "branchaccount-pastor": ["accountant", "branch_accountant"],
  "branch-admin": ["branch_admin", "admin", "hr", "employee"],
};

function normalize(value: string | null | undefined): string {
  return String(value ?? "").trim().toLowerCase();
}

/**
 * The backend role enum has no `finance_controller` value yet, so a Finance
 * Controller account is also recognised by its email convention
 * (finance.controller@, finance_controller@, finance-controller@). Drop the
 * email half of this check once the backend issues the real role.
 */
const FINANCE_CONTROLLER_EMAIL = /(^|[+._-])finance[._-]?controller/;

function isFinanceController(role: string, email: string): boolean {
  return (
    ROLES_BY_WORKSPACE["finance-controller"].includes(role) ||
    FINANCE_CONTROLLER_EMAIL.test(email)
  );
}

/**
 * Resolve the one workspace a user may enter, or `null` when their role matches
 * none of them.
 *
 * There is deliberately no fall-through default: an unrecognised role (a new
 * backend role, a rename, a typo) previously landed on the Director dashboard,
 * the highest-privilege screen group. Unknown now means no workspace.
 */
export function getWorkspaceForUser(input: DashboardTargetInput): Workspace | null {
  const role = normalize(input.role);
  const email = normalize(input.email);

  if (isFinanceController(role, email)) return "finance-controller";

  for (const workspace of Object.keys(ROLES_BY_WORKSPACE) as Workspace[]) {
    if (ROLES_BY_WORKSPACE[workspace].includes(role)) return workspace;
  }

  return null;
}

export function getDashboardPathForUser(input: DashboardTargetInput): string {
  const workspace = getWorkspaceForUser(input);
  return workspace ? DASHBOARD_PATH_BY_WORKSPACE[workspace] : NO_WORKSPACE_PATH;
}
