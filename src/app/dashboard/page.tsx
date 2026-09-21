import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function StudentDashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  // Get enrolled courses
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          lectures: true,
          _count: { select: { lectures: true } },
        },
      },
    },
  });

  // Get progress for all lectures
  const progress = await prisma.progress.findMany({
    where: { userId, completed: true },
  });
  const completedLectureIds = new Set(progress.map((p) => p.lectureId));

  // Get all available courses for enrollment
  const allCourses = await prisma.course.findMany({
    include: { _count: { select: { lectures: true, enrollments: true } } },
  });
  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));
  const availableCourses = allCourses.filter((c) => !enrolledCourseIds.has(c.id));

  // Get announcements
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-[var(--color-text-primary)] mb-1">
        Welcome back, {session.user.name}
      </h1>
      <p className="text-[var(--color-text-secondary)] mb-8">
        Here&apos;s an overview of your learning progress.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enrolled Courses */}
          <div>
            <h2 className="text-lg font-heading font-semibold text-[var(--color-text-primary)] mb-4">
              My Courses
            </h2>
            {enrollments.length === 0 ? (
              <div className="bg-white rounded-xl border border-[var(--color-border)] p-8 text-center shadow-sm">
                <p className="text-[var(--color-text-secondary)] mb-4">
                  You haven&apos;t enrolled in any courses yet.
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Browse available courses below to get started.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {enrollments.map((enrollment) => {
                  const course = enrollment.course;
                  const totalLectures = course._count.lectures;
                  const completed = course.lectures.filter((l) =>
                    completedLectureIds.has(l.id)
                  ).length;
                  const pct =
                    totalLectures > 0
                      ? Math.round((completed / totalLectures) * 100)
                      : 0;

                  return (
                    <Link
                      key={enrollment.id}
                      href={`/dashboard/courses/${course.id}`}
                      className="bg-white rounded-xl border border-[var(--color-border)] p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2 py-1 text-xs font-medium rounded-md bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                          {totalLectures} lectures
                        </span>
                        <span className="text-sm font-medium text-[var(--color-text-primary)]">
                          {pct}%
                        </span>
                      </div>
                      <h3 className="font-medium text-[var(--color-text-primary)] mb-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-[var(--color-text-secondary)] mb-3 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-[var(--color-success)] h-1.5 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Available Courses */}
          {availableCourses.length > 0 && (
            <div>
              <h2 className="text-lg font-heading font-semibold text-[var(--color-text-primary)] mb-4">
                Available Courses
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availableCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-xl border border-[var(--color-border)] p-5 shadow-sm"
                  >
                    <h3 className="font-medium text-[var(--color-text-primary)] mb-1">
                      {course.title}
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-3 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        {course._count.lectures} lectures · {course._count.enrollments} enrolled
                      </span>
                      <EnrollButton courseId={course.id} userId={userId} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar (1 col) */}
        <div className="space-y-6">
          {/* Announcements */}
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5 shadow-sm">
            <h2 className="text-base font-heading font-semibold text-[var(--color-text-primary)] mb-4">
              📢 Announcements
            </h2>
            {announcements.length === 0 ? (
              <p className="text-sm text-[var(--color-text-secondary)]">
                No announcements yet.
              </p>
            ) : (
              <div className="space-y-3">
                {announcements.map((a) => (
                  <div
                    key={a.id}
                    className="border-l-2 border-[var(--color-accent)] pl-3 py-1"
                  >
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {a.title}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 line-clamp-2">
                      {a.content}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5 shadow-sm">
            <h2 className="text-base font-heading font-semibold text-[var(--color-text-primary)] mb-4">
              Your Stats
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-secondary)]">Enrolled courses</span>
                <span className="text-sm font-medium">{enrollments.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-secondary)]">Lectures completed</span>
                <span className="text-sm font-medium">{completedLectureIds.size}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EnrollButton({
  courseId,
  userId,
}: {
  courseId: string;
  userId: string;
}) {
  "use client";
  return (
    <form
      action={async () => {
        "use server";
        const { prisma: db } = await import("@/lib/prisma");
        await db.enrollment.create({ data: { userId, courseId } });
        const { redirect: redir } = await import("next/navigation");
        redir("/dashboard");
      }}
    >
      <button
        type="submit"
        className="px-3 py-1.5 bg-[var(--color-primary)] text-white text-xs font-medium rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
      >
        Enroll
      </button>
    </form>
  );
}
