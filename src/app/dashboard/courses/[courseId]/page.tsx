import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import LectureList from "./LectureList";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { courseId } = await params;
  const userId = session.user.id;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lectures: { orderBy: { uploadedAt: "asc" } },
    },
  });

  if (!course) redirect("/dashboard");

  // Check enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (!enrollment) redirect("/dashboard");

  // Get progress
  const progress = await prisma.progress.findMany({
    where: { userId },
  });
  const progressMap = new Map(
    progress.map((p) => [p.lectureId, p.completed])
  );

  return (
    <div>
      <div className="mb-6">
        <a
          href="/dashboard"
          className="text-sm text-[var(--color-primary)] hover:underline mb-2 inline-block"
        >
          ← Back to Dashboard
        </a>
        <h1 className="text-2xl font-heading font-bold text-[var(--color-text-primary)]">
          {course.title}
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          {course.description}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border)] bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-heading font-semibold text-[var(--color-text-primary)]">
              Lectures ({course.lectures.length})
            </h2>
            <span className="text-sm text-[var(--color-text-secondary)]">
              {progress.filter((p) => p.completed && course.lectures.some((l) => l.id === p.lectureId)).length} / {course.lectures.length} completed
            </span>
          </div>
        </div>

        {course.lectures.length === 0 ? (
          <div className="p-8 text-center text-[var(--color-text-secondary)]">
            No lectures uploaded for this course yet.
          </div>
        ) : (
          <LectureList
            lectures={course.lectures.map((l) => ({
              ...l,
              uploadedAt: l.uploadedAt.toISOString(),
            }))}
            progressMap={Object.fromEntries(progressMap)}
            userId={userId}
          />
        )}
      </div>
    </div>
  );
}
