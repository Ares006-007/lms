"use client";

import { useState, useEffect } from "react";

interface Course {
  id: string;
  title: string;
  description: string;
  _count: { enrollments: number; lectures: number };
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchCourses = async () => {
    const res = await fetch("/api/courses");
    const data = await res.json();
    setCourses(data);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    setTitle("");
    setDescription("");
    setShowForm(false);
    setLoading(false);
    fetchCourses();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course? All lectures and enrollments will be removed.")) return;
    await fetch(`/api/courses?id=${id}`, { method: "DELETE" });
    fetchCourses();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-[var(--color-text-primary)]">
          Courses
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          {showForm ? "Cancel" : "+ New Course"}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 shadow-sm mb-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                Course Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                placeholder="e.g. Python Fundamentals"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
                placeholder="Brief description of this course"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Course"}
            </button>
          </form>
        </div>
      )}

      {/* Courses Table */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-gray-50">
              <th className="text-left px-6 py-3 font-medium text-[var(--color-text-secondary)]">Title</th>
              <th className="text-left px-6 py-3 font-medium text-[var(--color-text-secondary)]">Description</th>
              <th className="text-center px-6 py-3 font-medium text-[var(--color-text-secondary)]">Students</th>
              <th className="text-center px-6 py-3 font-medium text-[var(--color-text-secondary)]">Lectures</th>
              <th className="text-right px-6 py-3 font-medium text-[var(--color-text-secondary)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">
                  No courses yet. Create your first course above.
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-[var(--color-text-primary)]">{course.title}</td>
                  <td className="px-6 py-4 text-[var(--color-text-secondary)] max-w-xs truncate">{course.description}</td>
                  <td className="px-6 py-4 text-center">{course._count.enrollments}</td>
                  <td className="px-6 py-4 text-center">{course._count.lectures}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="text-[var(--color-danger)] hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
