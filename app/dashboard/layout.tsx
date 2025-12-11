// app/(protected)/dashboard/layout.tsx
import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import DashboardShell from "./DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as {
    mustSetPassword: boolean;
    isProfileComplete: boolean;
  };

  if (user.mustSetPassword || !user.isProfileComplete) {
    redirect("/complete-profile");
  }

  
  return <DashboardShell>{children}</DashboardShell>;
}
