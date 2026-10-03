import { redirect } from "next/navigation"

/**
 * Depreciation policies used to live here, which conflicted with the asset
 * configuration under Settings. There is one home for them now, so the asset
 * area opens on live branch tracking.
 */
export default function Page() {
  redirect("/director-screen/assets/branch-assets")
}
