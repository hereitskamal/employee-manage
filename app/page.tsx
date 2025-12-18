import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;

  if (role === "admin") {
    redirect("/dashboard/admin");
  } else if (role === "manager") {
    redirect("/dashboard/manager");
  } else if (role === "spc") {
    redirect("/dashboard/spc");
  } else if (role === "employee") {
    redirect("/dashboard/employee");
  } else {
    redirect("/login");
  }
}
