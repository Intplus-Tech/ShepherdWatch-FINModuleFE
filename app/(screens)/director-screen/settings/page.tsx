import { redirect } from "next/navigation"

/**
 * Global budget configuration has been removed. Budget streams and heads are
 * defined on each branch's own budget, so a second global copy only drifted
 * from it. Settings opens on the asset configuration instead.
 */
export default function Page() {
  redirect("/director-screen/settings-asset")
}
