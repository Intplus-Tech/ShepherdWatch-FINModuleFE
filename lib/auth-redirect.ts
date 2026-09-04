type DashboardTargetInput = {
  role?: string | null;
  email?: string | null;
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
    role === "finance_controller" ||
    role === "financial_controller" ||
    role === "finance_control" ||
    FINANCE_CONTROLLER_EMAIL.test(email)
  );
}

export function getDashboardPathForUser(input: DashboardTargetInput): string {
  const role = normalize(input.role);
  const email = normalize(input.email);

  if (isFinanceController(role, email)) {
    return "/finance-controller/dashboard";
  }

  if (
    role === "super_admin" ||
    role === "director" ||
    role === "regional_director" ||
    role === "executive_director" ||
    role === "global_director"
  ) {
    return "/director-screen/dashboard";
  }

  if (
    role === "pastor" ||
    role === "regional_pastor" ||
    role === "branch_pastor" ||
    role === "lead_pastor"
  ) {
    return "/branchlead-pastor/dashboard";
  }

  if (role === "accountant" || role === "branch_accountant") {
    return "/branchaccount-pastor/dashboard";
  }

  if (
    role === "branch_admin" ||
    role === "admin" ||
    role === "hr" ||
    role === "employee"
  ) {
    return "/branch-admin/dashboard";
  }

  if (email.includes("director")) {
    return "/director-screen/dashboard";
  }

  return "/director-screen/dashboard";
}
