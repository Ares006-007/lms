"use client";

import { useState, useEffect } from "react";

interface Course {
  id: string;
  title: string;
}

interface Exam {
  id: string;
  subject: string;
  examDate: string;
  examTime: string;
  duration: number;
  venue: string;
  course: { title: string };
}

// Color palette for courses
const COURSE_COLORS = [
  { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", dot: "bg-blue-500" },
  { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
  { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", dot: "bg-purple-500" },
  { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", dot: "bg-amber-500" },
  { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", dot: "bg-rose-500" },
  { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", dot: "bg-cyan-500" },
  { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", dot: "bg-indigo-500" },
  { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", dot: "bg-orange-500" },
];

function getCourseColor(courseTitle: string, allTitles: string[]) {
  const idx = allTitles.indexOf(courseTitle);
  return COURSE_COLORS[idx % COURSE_COLORS.length];
}

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [courseId, setCourseId] = useState("");
  const [subject, setSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [examTime, setExamTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [venue, setVenue] = useState("Main Hall");

  const fetchExams = async () => {
    const res = await fetch("/api/exams");
    setExams(await res.json());
  };

  const fetchCourses = async () => {
    const res = await fetch("/api/courses");
    setCourses(await res.json());
  };

  useEffect(() => {
    fetchExams();
    fetchCourses();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, subject, examDate, examTime, duration, venue }),
    });
    setCourseId("");
    setSubject("");
    setExamDate("");
    setExamTime("");
    setDuration("60");
    setVenue("Main Hall");
    setShowForm(false);
    setLoading(false);
    fetchExams();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this exam entry?")) return;
    await fetch(`/api/exams?id=${id}`, { method: "DELETE" });
    fetchExams();
  };

  // Build grid data
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-[var(--color-text-primary)]">
          Exam Timetable
        </h1>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-[var(--color-text-primary)] shadow-sm"
                  : "text-[var(--color-text-secondary)]"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-white text-[var(--color-text-primary)] shadow-sm"
                  : "text-[var(--color-text-secondary)]"
              }`}
            >
              List
            </button>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            {showForm ? "Cancel" : "+ Add Exam"}
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 shadow-sm mb-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Course</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-white"
                  required
                >
                  <option value="">Select course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  placeholder="e.g. Midterm Exam"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Time</label>
                <input
                  type="text"
                  value={examTime}
                  onChange={(e) => setExamTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  placeholder="e.g. 10:00 AM"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Duration (min)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  min={10}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Venue</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  placeholder="e.g. Main Hall"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Exam"}
            </button>
          </form>
        </div>
      )}

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

      {viewMode === "grid" ? (
        /* ===== GRID VIEW ===== */
        exams.length === 0 ? (
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-12 text-center shadow-sm">
            <p className="text-[var(--color-text-secondary)]">No exams scheduled yet. Add your first exam above.</p>
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
                      <div>{new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" })}</div>
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
                                return (
                                  <div
                                    key={exam.id}
                                    className={`${color.bg} ${color.border} border rounded-lg p-2.5 group relative`}
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
                                    <button
                                      onClick={() => handleDelete(exam.id)}
                                      className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-red-100 text-red-500 text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                                      title="Delete"
                                    >
                                      ✕
                                    </button>
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
        )
      ) : (
        /* ===== LIST VIEW ===== */
        <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-gray-50">
                <th className="text-left px-6 py-3 font-medium text-[var(--color-text-secondary)]">Subject</th>
                <th className="text-left px-6 py-3 font-medium text-[var(--color-text-secondary)]">Course</th>
                <th className="text-left px-6 py-3 font-medium text-[var(--color-text-secondary)]">Date</th>
                <th className="text-left px-6 py-3 font-medium text-[var(--color-text-secondary)]">Time</th>
                <th className="text-center px-6 py-3 font-medium text-[var(--color-text-secondary)]">Duration</th>
                <th className="text-left px-6 py-3 font-medium text-[var(--color-text-secondary)]">Venue</th>
                <th className="text-right px-6 py-3 font-medium text-[var(--color-text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">
                    No exams scheduled yet.
                  </td>
                </tr>
              ) : (
                exams.map((exam) => {
                  const color = getCourseColor(exam.course.title, courseTitles);
                  return (
                    <tr key={exam.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-[var(--color-text-primary)]">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${color.dot}`}></div>
                          {exam.subject}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text-secondary)]">{exam.course.title}</td>
                      <td className="px-6 py-4 text-[var(--color-text-secondary)]">
                        {new Date(exam.examDate + "T00:00:00").toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text-secondary)]">{exam.examTime}</td>
                      <td className="px-6 py-4 text-center">{exam.duration} min</td>
                      <td className="px-6 py-4 text-[var(--color-text-secondary)]">{exam.venue}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(exam.id)}
                          className="text-[var(--color-danger)] hover:underline text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
