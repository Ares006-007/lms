"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Exam Timetable", href: "/dashboard/exams" },
  { label: "ID Card", href: "/dashboard/id-card" },
  { label: "My Progress", href: "/dashboard/progress" },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      {/* Top Nav */}
      <header className="bg-white border-b border-[var(--color-border)] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-base font-heading font-semibold text-[var(--color-text-primary)]">
                Kodecy Institute
              </span>
            </Link>

            <nav className="flex items-center gap-1 ml-4">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                        : "text-[var(--color-text-secondary)] hover:bg-gray-50 hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        {children}
      </main>
    </div>
  );
}
