// components/layout/Sidebar.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  Clock,
  ClipboardList,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

// Helper function to get role-specific dashboard path
const getDashboardPath = (role: string | undefined): string => {
  switch (role) {
    case "admin":
      return "/dashboard/admin";
    case "manager":
      return "/dashboard/manager";
    case "employee":
    case "helper":
      return "/dashboard/employee";
    case "spc":
      return "/dashboard/spc";
    default:
      return "/dashboard";
  }
};

const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "manager", "employee", "spc"],
    isDynamic: true,
  },
  {
    label: "Employees",
    path: "/dashboard/employees",
    icon: Users,
    roles: ["admin", "manager"],
  },
  {
    label: "Products",
    path: "/dashboard/products",
    icon: Package,
    roles: ["admin", "manager", "employee", "spc"],
  },
  {
    label: "Sales",
    path: "/dashboard/sales",
    icon: ShoppingCart,
    roles: ["admin", "manager", "employee"],
  },
  {
    label: "Sales Analysis",
    path: "/dashboard/sales/analysis",
    icon: TrendingUp,
    roles: ["admin", "manager"],
  },
  {
    label: "Attendance",
    path: "/dashboard/attendance",
    icon: Clock,
    roles: ["admin", "manager", "employee", "spc"],
  },
  {
    label: "Daily Logs",
    path: "/dashboard/attendance/daily-logs",
    icon: ClipboardList,
    roles: ["admin"],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    if (session?.user?.id) {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);

        const response = await fetch("/api/attendance", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const data = await response.json();
          const todayRecord = data.attendance?.find(
            (record: { date: string; logoutTime: string | null }) => {
              const recordDate = new Date(record.date);
              return (
                recordDate >= today &&
                recordDate <= todayEnd &&
                !record.logoutTime
              );
            }
          );

          if (todayRecord) {
            await fetch(`/api/attendance/${todayRecord._id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                logoutTime: new Date().toISOString(),
              }),
            });
          }
        }
      } catch (error) {
        console.error("Failed to track logout attendance:", error);
      }
    }

    await signOut({ callbackUrl: "/login" });
  };

  const role = session?.user?.role as
    | "admin"
    | "manager"
    | "employee"
    | "spc"
    | undefined;

  let visibleNavItems: typeof navItems = [];

  if (status === "loading") {
    visibleNavItems = [];
  } else if (role) {
    visibleNavItems = navItems.filter((item) => {
      const itemRoles = item.roles || [];
      return itemRoles.includes(role);
    });
  } else {
    visibleNavItems = [];
  }

  const userName = session?.user?.name || "Employee";
  const userEmail = session?.user?.email || "";
  const userInitial = userName.charAt(0).toUpperCase();

  const activePath = visibleNavItems.reduce((best, item) => {
    const itemPath = item.isDynamic ? getDashboardPath(role) : item.path;
    const isMatch = pathname === itemPath || pathname.startsWith(itemPath + "/");
    if (isMatch && itemPath.length > best.length) return itemPath;
    return best;
  }, "");

  return (
    <div
      className={`${
        collapsed ? "w-20" : "w-64"
      } bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out relative`}
    >
      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-8 bg-white border border-gray-200 rounded-full p-1 hover:bg-gray-50 transition-colors z-10 "
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        )}
      </button>

      {/* Header */}
      <div className="mx-auto py-6">
        <div className="flex w-full items-center gap-3">
          <div className="w-10 h-10 bg-primary-main rounded-full flex items-center justify-center shadow-lg">
            <LayoutDashboard className="w-10 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-xl font-normal text-gray-700">Dashboard</h1>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 overflow-y-auto">
        {status === "loading" ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-11 bg-gray-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <nav className="space-y-1">
            {visibleNavItems.map((item) => {
              const itemPath = item.isDynamic
                ? getDashboardPath(role)
                : item.path;
              const selected =
                itemPath === activePath || pathname.startsWith(itemPath + "/");
              const Icon = item.icon;

              return (
                <button
                  key={item.path}
                  onClick={() => router.push(itemPath)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                    selected
                      ? "text-blue-600 "
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <div
                    className={`flex items-center justify-center ${
                      collapsed ? "mx-auto" : ""
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        selected ? "text-blue-600" : "text-gray-500"
                      } group-hover:scale-110 transition-transform`}
                    />
                  </div>
                  {!collapsed && (
                    <span
                      className={`font-medium text-sm ${
                        selected ? "text-blue-600" : "text-gray-700"
                      }`}
                    >
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-200">
        <div
          className={`flex items-center gap-3 ${
            collapsed ? "flex-col" : "flex-row"
          }`}
        >
          {/* Avatar */}
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-semibold shadow-md">
              {userInitial}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          </div>

          {/* User Info */}
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {userName}
              </p>
              <p className="text-xs text-gray-500 truncate">{userEmail}</p>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`p-2 rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all group ${
              collapsed ? "mt-2" : ""
            }`}
            title="Logout"
          >
            <LogOut className="w-4 h-4 text-gray-600 group-hover:text-red-600 transition-colors" />
          </button>
        </div>

        {/* Role Badge */}
        {!collapsed && role && (
          <div className="mt-3 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
            <p className="text-xs font-medium text-blue-700 text-center capitalize">
              {role}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}