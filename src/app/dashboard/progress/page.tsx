import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function StudentProgressPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          lectures: true,
        },
      },
    },
  });

  const progress = await prisma.progress.findMany({
    where: { userId, completed: true },
  });
  const completedIds = new Set(progress.map((p) => p.lectureId));

  // Calculate totals
  const totalLectures = enrollments.reduce(
    (sum, e) => sum + e.course.lectures.length,
    0
  );
  const totalCompleted = enrollments.reduce(
    (sum, e) =>
      sum + e.course.lectures.filter((l) => completedIds.has(l.id)).length,
    0
  );
  const overallPct =
    totalLectures > 0 ? Math.round((totalCompleted / totalLectures) * 100) : 0;

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-[var(--color-text-primary)] mb-6">
        My Progress
      </h1>

      {/* Overall Progress */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-heading font-semibold text-[var(--color-text-primary)]">
            Overall Progress
          </h2>
          <span className="text-2xl font-heading font-bold text-[var(--color-primary)]">
            {overallPct}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
          <div
            className="bg-[var(--color-primary)] h-3 rounded-full transition-all"
            style={{ width: `${overallPct}%` }}
          ></div>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {totalCompleted} of {totalLectures} lectures completed across{" "}
          {enrollments.length} courses
        </p>
      </div>

      {/* Per-Course Breakdown */}
      <h2 className="text-lg font-heading font-semibold text-[var(--color-text-primary)] mb-4">
        Course Breakdown
      </h2>

      {enrollments.length === 0 ? (
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-8 text-center shadow-sm">
          <p className="text-[var(--color-text-secondary)]">
            Enroll in courses to start tracking your progress.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {enrollments.map((enrollment) => {
            const course = enrollment.course;
            const courseLectures = course.lectures.length;
            const courseCompleted = course.lectures.filter((l) =>
              completedIds.has(l.id)
            ).length;
            const coursePct =
              courseLectures > 0
                ? Math.round((courseCompleted / courseLectures) * 100)
                : 0;

            return (
              <div
                key={enrollment.id}
                className="bg-white rounded-xl border border-[var(--color-border)] p-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-[var(--color-text-primary)]">
                    {course.title}
                  </h3>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {coursePct}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      coursePct === 100
                        ? "bg-[var(--color-success)]"
                        : "bg-[var(--color-primary)]"
                    }`}
                    style={{ width: `${coursePct}%` }}
                  ></div>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {courseCompleted} / {courseLectures} lectures completed
                  {coursePct === 100 && (
                    <span className="ml-2 text-[var(--color-success)] font-medium">
                      ✓ Course Complete
                    </span>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
