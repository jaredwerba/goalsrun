// /admin no longer exists as a UI page — admins land on /book and see
// the dashboard there. This route is kept only as a permanent redirect
// so old bookmarks and email-link "Go to dashboard" buttons keep working.

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function AdminRedirect() {
  redirect("/book");
}
