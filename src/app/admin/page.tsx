import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const totalStudents = await prisma.user.count({ where: { role: "LEARNER" } });
  const totalCourses = await prisma.course.count();
  const totalLectures = await prisma.lecture.count();
  const totalEnrollments = await prisma.enrollment.count();

  const courses = await prisma.course.findMany({
    include: {
      _count: { select: { enrollments: true, lectures: true } },
    },
  });

  const recentAnnouncements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-[var(--color-text-primary)] mb-6">
        Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Students" value={totalStudents} icon="👥" />
        <StatCard label="Total Courses" value={totalCourses} icon="📚" />
        <StatCard label="Total Lectures" value={totalLectures} icon="🎬" />
        <StatCard label="Enrollments" value={totalEnrollments} icon="📋" />
      </div>

      {/* Enrollment per Course */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 shadow-sm mb-6">
        <h2 className="text-lg font-heading font-semibold text-[var(--color-text-primary)] mb-4">
          Enrollment by Course
        </h2>
        {courses.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)]">
            No courses yet. Create your first course to see enrollment data.
          </p>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      {course.title}
                    </span>
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      {course._count.enrollments} students · {course._count.lectures} lectures
                    </span>
                  </div>
                  <div className="w-full bg-[var(--color-primary-light)] rounded-full h-2">
                    <div
                      className="bg-[var(--color-primary)] h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          (course._count.enrollments / Math.max(totalStudents, 1)) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Announcements */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 shadow-sm">
        <h2 className="text-lg font-heading font-semibold text-[var(--color-text-primary)] mb-4">
          Recent Announcements
        </h2>
        {recentAnnouncements.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)]">
            No announcements yet.
          </p>
        ) : (
          <div className="space-y-3">
            {recentAnnouncements.map((a) => (
              <div
                key={a.id}
                className="border-l-2 border-[var(--color-accent)] pl-4 py-1"
              >
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {a.title}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {new Date(a.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-2xl font-heading font-bold text-[var(--color-text-primary)]">
        {value}
      </p>
      <p className="text-sm text-[var(--color-text-secondary)] mt-1">{label}</p>
    </div>
  );
}
