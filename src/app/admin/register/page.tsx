import { redirect } from "next/navigation";

// Google Sign-In handles both login and registration in one step.
// Redirect to admin login page.
export default function AdminRegisterPage() {
  redirect("/admin/login");
}
