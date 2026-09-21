import { prisma } from "@/lib/prisma";
import Link from "next/link";

// Color palette for courses
const COURSE_COLORS = [
  { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", dot: "bg-blue-500" },
  { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
  { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", dot: "bg-purple-500" },
  { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", dot: "bg-amber-500" },
  { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", dot: "bg-rose-500" },
  { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", dot: "bg-cyan-500" },
];

function getCourseColor(courseTitle: string, allTitles: string[]) {
  const idx = allTitles.indexOf(courseTitle);
  return COURSE_COLORS[idx % COURSE_COLORS.length];
}

export default async function StudentExamsPage() {
  const exams = await prisma.examTimetable.findMany({
    include: { course: { select: { title: true } } },
    orderBy: { examDate: "asc" },
  });

  const uniqueDates = [...new Set(exams.map((e) => e.examDate))].sort();
  const uniqueTimes = [...new Set(exams.map((e) => e.examTime))].sort((a, b) => {
    const toMin = (t: string) => {
      const match = t.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (!match) return 0;
      let h = parseInt(match[1]);
      const m = parseInt(match[2]);
      const ampm = match[3]?.toUpperCase();
      if (ampm === "PM" && h !== 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      return h * 60 + m;
    };
    return toMin(a) - toMin(b);
  });
  const courseTitles = [...new Set(exams.map((e) => e.course.title))];

  const getExamsAt = (date: string, time: string) =>
    exams.filter((e) => e.examDate === date && e.examTime === time);

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-[var(--color-text-primary)] mb-6">
        Exam Timetable
      </h1>

      {/* Course Legend */}
      {courseTitles.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {courseTitles.map((title) => {
            const color = getCourseColor(title, courseTitles);
            return (
              <div key={title} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${color.dot}`}></div>
                <span className="text-xs font-medium text-[var(--color-text-secondary)]">{title}</span>
              </div>
            );
          })}
        </div>
      )}

      {exams.length === 0 ? (
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-12 text-center shadow-sm">
          <p className="text-[var(--color-text-secondary)]">No exams scheduled yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-auto">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-gray-50 border-b border-r border-[var(--color-border)] px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider w-28">
                  Time ↓ / Date →
                </th>
                {uniqueDates.map((date) => (
                  <th
                    key={date}
                    className="border-b border-r border-[var(--color-border)] bg-gray-50 px-4 py-3 text-center text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider min-w-[160px]"
                  >
                    <div>
                      {new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" })}
                    </div>
                    <div className="text-sm font-bold text-[var(--color-text-primary)] normal-case mt-0.5">
                      {new Date(date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {uniqueTimes.map((time) => (
                <tr key={time}>
                  <td className="sticky left-0 z-10 bg-white border-b border-r border-[var(--color-border)] px-4 py-4 text-sm font-medium text-[var(--color-text-primary)] whitespace-nowrap">
                    {time}
                  </td>
                  {uniqueDates.map((date) => {
                    const cellExams = getExamsAt(date, time);
                    return (
                      <td
                        key={`${date}-${time}`}
                        className="border-b border-r border-[var(--color-border)] px-2 py-2 align-top min-w-[160px]"
                      >
                        {cellExams.length > 0 ? (
                          <div className="space-y-1.5">
                            {cellExams.map((exam) => {
                              const color = getCourseColor(exam.course.title, courseTitles);
                              const isPast = new Date(exam.examDate + "T00:00:00") < new Date();
                              return (
                                <div
                                  key={exam.id}
                                  className={`${color.bg} ${color.border} border rounded-lg p-2.5 ${isPast ? "opacity-50" : ""}`}
                                >
                                  <p className={`text-xs font-semibold ${color.text} leading-tight`}>
                                    {exam.subject}
                                  </p>
                                  <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">
                                    {exam.course.title}
                                  </p>
                                  <p className="text-[10px] text-[var(--color-text-secondary)]">
                                    {exam.duration}min · {exam.venue}
                                  </p>
                                  {!isPast && (
                                    <Link
                                      href={`/dashboard/hall-ticket/${exam.id}`}
                                      className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-medium text-[var(--color-primary)] hover:underline"
                                    >
                                      🎫 Hall Ticket
                                    </Link>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="h-16"></div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
