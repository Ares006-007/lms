"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: "📊" },
  { label: "Courses", href: "/admin/courses", icon: "📚" },
  { label: "Lectures", href: "/admin/lectures", icon: "🎬" },
  { label: "Students", href: "/admin/students", icon: "👥" },
  { label: "Exam Timetable", href: "/admin/exams", icon: "📅" },
  { label: "Announcements", href: "/admin/announcements", icon: "📢" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-[var(--color-background)]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[var(--color-border)] flex flex-col fixed h-full">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <div>
              <span className="text-base font-heading font-semibold text-[var(--color-text-primary)]">
                Kodecy
              </span>
              <span className="text-xs text-[var(--color-text-secondary)] block -mt-0.5">
                Admin Panel
              </span>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                    : "text-[var(--color-text-secondary)] hover:bg-gray-50 hover:text-[var(--color-text-primary)]"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-[var(--color-border)]">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:bg-gray-50 hover:text-[var(--color-danger)] transition-colors w-full"
          >
            <span className="text-base">🚪</span>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}
