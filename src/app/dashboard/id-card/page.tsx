import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PrintButton } from "@/components/ui/PrintButton";

export default async function StudentIdCardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: { select: { enrollments: true } },
    },
  });

  if (!user) redirect("/login");

  const studentId = `KI-${user.createdAt.getFullYear()}-${user.id.slice(-6).toUpperCase()}`;
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div>
      {/* Print Button */}
      <div className="no-print mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold text-[var(--color-text-primary)]">
          My ID Card
        </h1>
        <PrintButton label="Print ID Card" />
      </div>

      {/* ID Card - Front */}
      <div className="flex flex-col items-center gap-8">
        {/* Front Side */}
        <div className="print-area">
          <p className="text-xs text-[var(--color-text-secondary)] mb-2 no-print text-center font-medium uppercase tracking-wider">
            Front Side
          </p>
          <div className="w-[380px] bg-white rounded-2xl border-2 border-[var(--color-primary)] shadow-xl overflow-hidden">
            {/* Top gradient banner */}
            <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white font-bold text-lg">K</span>
                </div>
                <div>
                  <h2 className="text-white font-heading font-bold text-base">
                    Kodecy Institute
                  </h2>
                  <p className="text-blue-100 text-[10px] tracking-wider uppercase">
                    Student Identity Card
                  </p>
                </div>
              </div>
            </div>

            {/* Photo + Info */}
            <div className="px-6 py-5 flex gap-5">
              {/* Photo placeholder */}
              <div className="flex-shrink-0">
                <div className="w-20 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-2 border-[var(--color-border)] flex items-center justify-center">
                  <span className="text-2xl font-heading font-bold text-[var(--color-text-secondary)]">
                    {initials}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 space-y-2.5">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-[var(--color-text-secondary)] font-semibold">
                    Name
                  </p>
                  <p className="text-sm font-bold text-[var(--color-text-primary)] leading-tight">
                    {user.name}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-[var(--color-text-secondary)] font-semibold">
                    Student ID
                  </p>
                  <p className="text-xs font-mono font-bold text-[var(--color-primary)]">
                    {studentId}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-[var(--color-text-secondary)] font-semibold">
                    Email
                  </p>
                  <p className="text-xs text-[var(--color-text-primary)]">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom info bar */}
            <div className="bg-gray-50 border-t border-[var(--color-border)] px-6 py-3 flex items-center justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-[var(--color-text-secondary)] font-semibold">
                  Enrolled Courses
                </p>
                <p className="text-sm font-bold text-[var(--color-text-primary)]">
                  {user._count.enrollments}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-widest text-[var(--color-text-secondary)] font-semibold">
                  Since
                </p>
                <p className="text-xs font-medium text-[var(--color-text-primary)]">
                  {user.createdAt.toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div className="print-area">
          <p className="text-xs text-[var(--color-text-secondary)] mb-2 no-print text-center font-medium uppercase tracking-wider">
            Back Side
          </p>
          <div className="w-[380px] bg-white rounded-2xl border-2 border-[var(--color-border)] shadow-xl overflow-hidden">
            {/* Terms */}
            <div className="px-6 py-5">
              <h3 className="text-xs font-heading font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-3">
                Terms & Conditions
              </h3>
              <ul className="text-[10px] text-[var(--color-text-secondary)] space-y-1.5 leading-relaxed">
                <li>1. This card is the property of Kodecy Institute.</li>
                <li>2. It must be carried at all times within the institute premises.</li>
                <li>3. Loss of this card must be reported immediately.</li>
                <li>4. This card is non-transferable.</li>
                <li>5. If found, please return to the institute administration.</li>
              </ul>
            </div>

            {/* Contact */}
            <div className="px-6 py-4 bg-gray-50 border-t border-[var(--color-border)]">
              <p className="text-[10px] text-[var(--color-text-secondary)] text-center">
                📧 contact@kodecy.com · 🌐 www.kodecy.com
              </p>
            </div>

            {/* Signature area */}
            <div className="px-6 py-4 border-t border-[var(--color-border)] flex items-end justify-between">
              <div>
                <p className="text-[10px] text-[var(--color-text-secondary)]">
                  Issued: {user.createdAt.toLocaleDateString()}
                </p>
              </div>
              <div className="text-center">
                <div className="w-28 border-t border-[var(--color-text-secondary)] pt-1">
                  <p className="text-[9px] text-[var(--color-text-secondary)]">
                    Authorized Signature
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
