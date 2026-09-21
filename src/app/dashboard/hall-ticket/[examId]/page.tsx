import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PrintButton } from "@/components/ui/PrintButton";

export default async function HallTicketPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { examId } = await params;

  const exam = await prisma.examTimetable.findUnique({
    where: { id: examId },
    include: { course: true },
  });

  if (!exam) redirect("/dashboard/exams");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) redirect("/login");

  // Generate a deterministic hall ticket number
  const ticketNumber = `KI-${exam.examDate.replace(/-/g, "")}-${user.id.slice(-4).toUpperCase()}-${exam.id.slice(-4).toUpperCase()}`;

  return (
    <div>
      {/* Print Button */}
      <div className="no-print mb-6 flex items-center justify-between">
        <Link
          href="/dashboard/exams"
          className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1"
        >
          ← Back to Timetable
        </Link>
        <PrintButton label="Print Hall Ticket" />
      </div>

      {/* Hall Ticket */}
      <div className="max-w-2xl mx-auto print-area">
        <div className="bg-white rounded-xl border-2 border-[var(--color-primary)] shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] px-8 py-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white font-bold text-xl">K</span>
                </div>
                <div>
                  <h1 className="text-lg font-heading font-bold">Kodecy Institute</h1>
                  <p className="text-xs text-blue-100">Examination Hall Ticket</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-100">Ticket No.</p>
                <p className="text-sm font-mono font-bold">{ticketNumber}</p>
              </div>
            </div>
          </div>

          {/* Student Info */}
          <div className="px-8 py-5 border-b border-[var(--color-border)] bg-gray-50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] font-semibold mb-0.5">
                  Student Name
                </p>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {user.name}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] font-semibold mb-0.5">
                  Email / Student ID
                </p>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Exam Details */}
          <div className="px-8 py-6">
            <h2 className="text-xs uppercase tracking-wider text-[var(--color-text-secondary)] font-semibold mb-4">
              Examination Details
            </h2>
            <div className="grid grid-cols-2 gap-y-5 gap-x-8">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] font-semibold mb-0.5">
                  Course
                </p>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {exam.course.title}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] font-semibold mb-0.5">
                  Subject / Exam
                </p>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {exam.subject}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] font-semibold mb-0.5">
                  Date
                </p>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {new Date(exam.examDate + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] font-semibold mb-0.5">
                  Time
                </p>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {exam.examTime}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] font-semibold mb-0.5">
                  Duration
                </p>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {exam.duration} minutes
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] font-semibold mb-0.5">
                  Venue / Hall
                </p>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {exam.venue}
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="px-8 py-4 bg-amber-50 border-t border-amber-200">
            <h3 className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2">
              Important Instructions
            </h3>
            <ul className="text-[11px] text-amber-700 space-y-1">
              <li>• Carry this hall ticket to the examination hall.</li>
              <li>• Arrive at least 15 minutes before the scheduled time.</li>
              <li>• No electronic devices are allowed inside the examination hall.</li>
              <li>• Carry a valid photo ID along with this hall ticket.</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 border-t border-[var(--color-border)] flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[var(--color-text-secondary)]">
                Issued by Kodecy Institute
              </p>
              <p className="text-[10px] text-[var(--color-text-secondary)]">
                Generated on {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className="w-24 border-t border-[var(--color-text-secondary)] pt-1">
                <p className="text-[10px] text-[var(--color-text-secondary)]">
                  Authorized Signature
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
