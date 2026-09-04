// Congregational service-attendance data.
//
// The backend has no attendance endpoints yet, so these typed fixtures stand in
// for the eventual API payloads. Keep the shapes stable — the views below read
// them directly, so swapping in a live fetch later only means replacing the
// constants with the parsed response.

export type ServiceType = "1st Service" | "2nd Service" | "Evening" | "Midweek"

export type ServiceAttendanceEntry = {
  id: string
  serviceDate: string
  serviceType: ServiceType
  /** Sermon/service theme for the day — shown as its own column on the log. */
  serviceTheme: string
  male: number
  female: number
  teens: number
  children: number
}

export type BranchAttendanceRow = {
  id: string
  branch: string
  region: string
  services: number
  lastService: string
  male: number
  female: number
  teens: number
  children: number
}

export const SERVICE_TYPE_STYLES: Record<ServiceType, string> = {
  "1st Service": "bg-[#FEF3C7] text-[#92400E]",
  "2nd Service": "bg-[#3F2D16] text-[#FDE68A]",
  Evening: "bg-[#111827] text-white",
  Midweek: "bg-[#E0E7FF] text-[#3730A3]",
}

export function entryTotal(entry: ServiceAttendanceEntry): number {
  return entry.male + entry.female + entry.teens + entry.children
}

export function branchTotal(row: BranchAttendanceRow): number {
  return row.male + row.female + row.teens + row.children
}

/** Branch-scoped log — used by the Admin and Branch Pastor views. */
export const SERVICE_ATTENDANCE_LOG: ServiceAttendanceEntry[] = [
  {
    id: "log-001",
    serviceDate: "27 Oct 2024",
    serviceType: "1st Service",
    serviceTheme: "Faith That Moves Mountains",
    male: 45,
    female: 38,
    teens: 12,
    children: 18,
  },
  {
    id: "log-002",
    serviceDate: "27 Oct 2024",
    serviceType: "2nd Service",
    serviceTheme: "Faith That Moves Mountains",
    male: 32,
    female: 28,
    teens: 8,
    children: 10,
  },
  {
    id: "log-003",
    serviceDate: "27 Oct 2024",
    serviceType: "Evening",
    serviceTheme: "The Power of Consistent Prayer",
    male: 18,
    female: 15,
    teens: 4,
    children: 5,
  },
  {
    id: "log-004",
    serviceDate: "23 Oct 2024",
    serviceType: "Midweek",
    serviceTheme: "Foundations: Walking in Grace",
    male: 26,
    female: 24,
    teens: 7,
    children: 9,
  },
  {
    id: "log-005",
    serviceDate: "20 Oct 2024",
    serviceType: "1st Service",
    serviceTheme: "Stewardship & Kingdom Finance",
    male: 48,
    female: 40,
    teens: 15,
    children: 20,
  },
  {
    id: "log-006",
    serviceDate: "20 Oct 2024",
    serviceType: "2nd Service",
    serviceTheme: "Stewardship & Kingdom Finance",
    male: 35,
    female: 30,
    teens: 10,
    children: 12,
  },
  {
    id: "log-007",
    serviceDate: "20 Oct 2024",
    serviceType: "Evening",
    serviceTheme: "Hearing the Shepherd's Voice",
    male: 20,
    female: 18,
    teens: 5,
    children: 6,
  },
]

/** Consolidated roll-up — used by the Director view. */
export const BRANCH_ATTENDANCE: BranchAttendanceRow[] = [
  {
    id: "ibadan-hq",
    branch: "Ibadan HQ",
    region: "South West",
    services: 2,
    lastService: "27 Oct 2024",
    male: 50,
    female: 45,
    teens: 15,
    children: 22,
  },
  {
    id: "maryland-lagos",
    branch: "Maryland, Lagos",
    region: "South West",
    services: 2,
    lastService: "27 Oct 2024",
    male: 45,
    female: 38,
    teens: 12,
    children: 18,
  },
  {
    id: "ado-ekiti",
    branch: "Ado Ekiti",
    region: "South West",
    services: 1,
    lastService: "27 Oct 2024",
    male: 30,
    female: 25,
    teens: 10,
    children: 12,
  },
  {
    id: "maryland-us",
    branch: "Maryland, US",
    region: "North America",
    services: 1,
    lastService: "26 Oct 2024",
    male: 22,
    female: 20,
    teens: 8,
    children: 10,
  },
  {
    id: "ilorin",
    branch: "Ilorin",
    region: "North Central",
    services: 1,
    lastService: "27 Oct 2024",
    male: 25,
    female: 20,
    teens: 6,
    children: 8,
  },
  {
    id: "agodi-ibadan",
    branch: "Agodi, Ibadan",
    region: "South West",
    services: 2,
    lastService: "26 Oct 2024",
    male: 15,
    female: 13,
    teens: 5,
    children: 8,
  },
  {
    id: "kano",
    branch: "Kano",
    region: "North West",
    services: 1,
    lastService: "25 Oct 2024",
    male: 10,
    female: 8,
    teens: 3,
    children: 2,
  },
]

export const SERVICE_TYPES: ServiceType[] = ["1st Service", "2nd Service", "Evening", "Midweek"]

export const ATTENDANCE_BRANCHES = ["All Branches", ...BRANCH_ATTENDANCE.map((row) => row.branch)]

export const ATTENDANCE_REGIONS = [
  "All Regions",
  ...Array.from(new Set(BRANCH_ATTENDANCE.map((row) => row.region))),
]

/** Total reporting branches in the organisation (only a page of them is listed). */
export const TOTAL_REPORTING_BRANCHES = 43
