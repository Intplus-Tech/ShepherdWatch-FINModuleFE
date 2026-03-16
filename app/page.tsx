import { redirect } from "next/navigation"

export default function Home() {
  redirect("/signin") // automatically goes to SignIn page
}