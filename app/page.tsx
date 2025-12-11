import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;

  if (role === "admin") {
    redirect("/admin/dashboard");
  } else if (role === "manager") {
    redirect("/manager/dashboard");
  } else if (role === "spc") {
    redirect("/spc/dashboard");
  } else if (role === "employee") {
    redirect("/employee/dashboard");
  } else {
    redirect("/login");
  }
}
