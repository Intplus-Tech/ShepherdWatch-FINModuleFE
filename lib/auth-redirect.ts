type DashboardTargetInput = {
  role?: string | null;
  email?: string | null;
};

function normalize(value: string | null | undefined): string {
  return String(value ?? "").trim().toLowerCase();
}

export function getDashboardPathForUser(input: DashboardTargetInput): string {
  const role = normalize(input.role);
  const email = normalize(input.email);

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
