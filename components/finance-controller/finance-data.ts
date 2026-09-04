// Finance Controller (Admin's View) fixtures.
//
// These screens are ahead of the backend — there are no consolidated-reporting
// or request-history endpoints yet — so the module ships with typed mock data.
// Swap each constant for a fetch once the endpoints land; the views only read
// these shapes.

export type TrendPoint = {
  month: string
  income: number
  expenses: number
  /** Months still to come — rendered faded on the chart. */
  projected?: boolean
}

export type GlobalTransaction = {
  id: string
  date: string
  txnId: string
  branch: string
  description: string
  category: string
  debit: number
  credit: number
}

export type MyTransaction = {
  id: string
  date: string
  txnId: string
  description: string
  account: string
  category: string
  amount: number
  direction: "debit" | "credit"
  status: "Posted" | "Pending" | "Draft"
}

export type RequestStatus =
  | "PENDING (FINANCE DIR.)"
  | "PENDING (PASTORATE DIR.)"
  | "FULLY APPROVED"
  | "DECLINED (FINANCE DIR.)"

export type SpecialRequest = {
  id: string
  date: string
  requestId: string
  type: string
  amount: number
  status: RequestStatus
  submittedBy: string
  submittedAt: string
  justification: string
  branch: string
}

export type ActivityItem = {
  id: string
  branch: string
  timeLabel: string
  description: string
  amount: number
  tag: string
  tagClass: string
}

export const INCOME_EXPENSE_TREND: TrendPoint[] = [
  { month: "JAN", income: 24_000_000, expenses: 17_500_000 },
  { month: "FEB", income: 21_000_000, expenses: 19_000_000 },
  { month: "MAR", income: 30_000_000, expenses: 26_000_000 },
  { month: "APR", income: 27_500_000, expenses: 22_000_000 },
  { month: "MAY", income: 35_500_000, expenses: 28_500_000 },
  { month: "JUN", income: 30_500_000, expenses: 26_500_000 },
  { month: "JUL", income: 37_500_000, expenses: 33_000_000 },
  { month: "AUG", income: 31_000_000, expenses: 24_500_000 },
  { month: "SEP", income: 40_500_000, expenses: 36_500_000 },
  { month: "OCT", income: 15_000_000, expenses: 13_500_000, projected: true },
  { month: "NOV", income: 20_500_000, expenses: 17_000_000, projected: true },
  { month: "DEC", income: 24_500_000, expenses: 22_500_000, projected: true },
]

export const RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: "act-1",
    branch: "Maryland, Lagos",
    timeLabel: "11 JUL 8:10 PM",
    description: "Approved expense of",
    amount: 250_000,
    tag: "CAPITAL",
    tagClass: "bg-[#EEF2FF] text-[#3B5BDB]",
  },
  {
    id: "act-2",
    branch: "Ibadan HQ",
    timeLabel: "11 JUL 7:44 PM",
    description: "Recorded income of",
    amount: 1_200_000,
    tag: "TITHES",
    tagClass: "bg-amber-100 text-amber-700",
  },
  {
    id: "act-3",
    branch: "Ado Ekiti",
    timeLabel: "11 JUL 1:21 AM",
    description: "Approved expense of",
    amount: 45_000,
    tag: "OPERATIONAL",
    tagClass: "bg-slate-100 text-slate-600",
  },
  {
    id: "act-4",
    branch: "Agodi, Ibadan",
    timeLabel: "10 JUL 6:02 PM",
    description: "Recorded income of",
    amount: 380_000,
    tag: "DESIGNATED",
    tagClass: "bg-emerald-100 text-emerald-700",
  },
]

export const GLOBAL_TRANSACTIONS: GlobalTransaction[] = [
  {
    id: "gt-1",
    date: "11 Oct 24",
    txnId: "#TXN-89021",
    branch: "Maryland LAG",
    description: "Sunday Tithe",
    category: "Tithes",
    debit: 0,
    credit: 450_000,
  },
  {
    id: "gt-2",
    date: "10 Oct 24",
    txnId: "#TXN-89022",
    branch: "Ibadan HQ",
    description: "Staff Salaries",
    category: "Salaries",
    debit: 2_800_000,
    credit: 0,
  },
  {
    id: "gt-3",
    date: "09 Oct 24",
    txnId: "#TXN-89023",
    branch: "Ado Ekiti",
    description: "Capital Project",
    category: "Capital",
    debit: 250_000,
    credit: 0,
  },
  {
    id: "gt-4",
    date: "08 Oct 24",
    txnId: "#TXN-89024",
    branch: "Maryland US",
    description: "Bank Charges",
    category: "Expenses",
    debit: 5_000,
    credit: 0,
  },
  {
    id: "gt-5",
    date: "07 Oct 24",
    txnId: "#TXN-89025",
    branch: "Agodi, Ibadan",
    description: "Building Fund Donation",
    category: "Designated",
    debit: 0,
    credit: 1_200_000,
  },
  {
    id: "gt-6",
    date: "06 Oct 24",
    txnId: "#TXN-89026",
    branch: "Ilorin",
    description: "Generator Maintenance",
    category: "Expenses",
    debit: 145_000,
    credit: 0,
  },
  {
    id: "gt-7",
    date: "05 Oct 24",
    txnId: "#TXN-89027",
    branch: "Kano",
    description: "Midweek Offering",
    category: "Offerings",
    debit: 0,
    credit: 320_000,
  },
  {
    id: "gt-8",
    date: "04 Oct 24",
    txnId: "#TXN-89028",
    branch: "Ibadan HQ",
    description: "Missions Remittance",
    category: "Designated",
    debit: 900_000,
    credit: 0,
  },
]

export const TRANSACTION_CATEGORIES = [
  "All Categories",
  ...Array.from(new Set(GLOBAL_TRANSACTIONS.map((row) => row.category))),
]

export const TRANSACTION_BRANCHES = [
  "All Branches",
  ...Array.from(new Set(GLOBAL_TRANSACTIONS.map((row) => row.branch))),
]

export const TOTAL_GLOBAL_RECORDS = 1_248
export const TOTAL_DEBITS_YTD = 42_850_000
export const TOTAL_CREDITS_YTD = 38_920_000

export const MY_TRANSACTIONS: MyTransaction[] = [
  {
    id: "mt-1",
    date: "11 Oct 24",
    txnId: "#TXN-89021",
    description: "Sunday Tithe — Maryland LAG",
    account: "Zenith · Main Collection",
    category: "Tithes",
    amount: 450_000,
    direction: "credit",
    status: "Posted",
  },
  {
    id: "mt-2",
    date: "10 Oct 24",
    txnId: "#TXN-89019",
    description: "Youth Conference Logistics",
    account: "GTB · Operations",
    category: "Programs",
    amount: 185_000,
    direction: "debit",
    status: "Posted",
  },
  {
    id: "mt-3",
    date: "09 Oct 24",
    txnId: "#TXN-89014",
    description: "Diesel Supply — October",
    account: "GTB · Operations",
    category: "Utilities",
    amount: 240_000,
    direction: "debit",
    status: "Pending",
  },
  {
    id: "mt-4",
    date: "07 Oct 24",
    txnId: "#TXN-89008",
    description: "Building Fund Transfer",
    account: "Zenith · Projects",
    category: "Designated",
    amount: 1_200_000,
    direction: "credit",
    status: "Posted",
  },
  {
    id: "mt-5",
    date: "05 Oct 24",
    txnId: "#TXN-89002",
    description: "Office Stationery Restock",
    account: "GTB · Operations",
    category: "Admin",
    amount: 62_500,
    direction: "debit",
    status: "Draft",
  },
]

export const REQUEST_STATUS_STYLES: Record<RequestStatus, string> = {
  "PENDING (FINANCE DIR.)": "text-amber-600",
  "PENDING (PASTORATE DIR.)": "text-amber-600",
  "FULLY APPROVED": "text-emerald-600",
  "DECLINED (FINANCE DIR.)": "text-rose-600",
}

export const SPECIAL_REQUESTS: SpecialRequest[] = [
  {
    id: "req-1",
    date: "11 Oct 24",
    requestId: "#REQ-001",
    type: "Budget Reallocation",
    amount: 2_500_000,
    status: "PENDING (FINANCE DIR.)",
    submittedBy: "Control Desk",
    submittedAt: "11 Oct 2024, 10:32 AM",
    branch: "All Branches",
    justification:
      "This reallocation is required to fund the national youth conference. The funds will be moved from the general savings account to the program budget in order to cover venue and logistics deposits before Friday.",
  },
  {
    id: "req-2",
    date: "05 Oct 24",
    requestId: "#REQ-002",
    type: "Emergency Fund",
    amount: 500_000,
    status: "PENDING (PASTORATE DIR.)",
    submittedBy: "Control Desk",
    submittedAt: "05 Oct 2024, 09:15 AM",
    branch: "Ado Ekiti",
    justification:
      "Emergency repair of the branch generator ahead of the midweek service. Vendor requires a deposit before mobilising to site.",
  },
  {
    id: "req-3",
    date: "28 Sep 24",
    requestId: "#REQ-003",
    type: "Inter-Branch Trf",
    amount: 1_200_000,
    status: "FULLY APPROVED",
    submittedBy: "Control Desk",
    submittedAt: "28 Sep 2024, 02:48 PM",
    branch: "Ibadan HQ → Ilorin",
    justification:
      "Transfer of surplus operational funds to support the Ilorin branch monthly shortfall approved in the Q3 review.",
  },
  {
    id: "req-4",
    date: "15 Sep 24",
    requestId: "#REQ-004",
    type: "Capital Injection",
    amount: 5_000_000,
    status: "DECLINED (FINANCE DIR.)",
    submittedBy: "Control Desk",
    submittedAt: "15 Sep 2024, 11:05 AM",
    branch: "Maryland, Lagos",
    justification:
      "Requested capital injection for the auditorium expansion. Declined pending a revised contractor quotation and updated project timeline.",
  },
  {
    id: "req-5",
    date: "01 Sep 24",
    requestId: "#REQ-005",
    type: "Budget Reallocation",
    amount: 800_000,
    status: "PENDING (PASTORATE DIR.)",
    submittedBy: "Control Desk",
    submittedAt: "01 Sep 2024, 04:20 PM",
    branch: "Agodi, Ibadan",
    justification:
      "Reallocation from the media budget to cover the outreach transport costs for the September community programme.",
  },
]

export const REQUEST_TYPES = [
  "Budget Reallocation",
  "Emergency Fund",
  "Inter-Branch Trf",
  "Capital Injection",
]

/** Consolidated financial statement figures for the Reports screen. */
export const CONSOLIDATED_REPORT = {
  organisation: "GLOBAL HARVEST CHURCH",
  periodLabel: "For the Period Ending October 31, 2024",
  income: [
    { label: "Tithes & Regular Offerings", amount: 28_450_000 },
    { label: "Designated Missions", amount: 12_100_000 },
    { label: "Building Fund", amount: 3_500_000 },
    { label: "Other Income", amount: 1_300_000 },
  ],
  expenses: [
    { label: "Operational & Admin", amount: 18_500_000 },
    { label: "Ministry Programs", amount: 11_200_000 },
    { label: "Capital Expenditure", amount: 7_500_000 },
  ],
  surplusChangeLabel: "+14% vs Last Month",
  marginLabel: "Healthy Operating Margin",
}
