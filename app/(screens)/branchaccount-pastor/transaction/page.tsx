import { redirect } from "next/navigation"

/** The accountant's transactions moved to the General Ledger. */
export default function Page() {
  redirect("/branchaccount-pastor/general-ledger")
}
