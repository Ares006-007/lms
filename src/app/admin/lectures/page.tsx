"use client";

import { useState, useEffect } from "react";

interface Course {
  id: string;
  title: string;
}

interface Lecture {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
  course: { title: string };
}

export default function AdminLecturesPage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  const [fileType, setFileType] = useState("PDF");
  const [file, setFile] = useState<File | null>(null);

  const fetchLectures = async () => {
    const res = await fetch("/api/lectures");
    setLectures(await res.json());
  };

  const fetchCourses = async () => {
    const res = await fetch("/api/courses");
    setCourses(await res.json());
  };

  useEffect(() => {
    fetchLectures();
    fetchCourses();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("courseId", courseId);
    formData.append("fileType", fileType);
    formData.append("file", file);

    await fetch("/api/lectures", { method: "POST", body: formData });

    setTitle("");
    setDescription("");
    setCourseId("");
    setFile(null);
    setShowForm(false);
    setLoading(false);
    fetchLectures();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lecture?")) return;
    await fetch(`/api/lectures?id=${id}`, { method: "DELETE" });
    fetchLectures();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-[var(--color-text-primary)]">
          Lectures
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          {showForm ? "Cancel" : "+ Upload Lecture"}
        </button>
      </div>

      {/* Upload Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 shadow-sm mb-6">
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                  Lecture Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                  Course
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-white"
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                  File Type
                </label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-white"
                >
                  <option value="PDF">PDF</option>
                  <option value="VIDEO">Video</option>
                  <option value="SLIDES">Slides</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                  File
                </label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[var(--color-primary-light)] file:text-[var(--color-primary)]"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Upload Lecture"}
            </button>
          </form>
        </div>
      )}

      {/* Lectures Table */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-gray-50">
              <th className="text-left px-6 py-3 font-medium text-[var(--color-text-secondary)]">Title</th>
              <th className="text-left px-6 py-3 font-medium text-[var(--color-text-secondary)]">Course</th>
              <th className="text-center px-6 py-3 font-medium text-[var(--color-text-secondary)]">Type</th>
              <th className="text-left px-6 py-3 font-medium text-[var(--color-text-secondary)]">Uploaded</th>
              <th className="text-right px-6 py-3 font-medium text-[var(--color-text-secondary)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lectures.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">
                  No lectures uploaded yet.
                </td>
              </tr>
            ) : (
              lectures.map((lecture) => (
                <tr key={lecture.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-[var(--color-text-primary)]">{lecture.title}</td>
                  <td className="px-6 py-4 text-[var(--color-text-secondary)]">{lecture.course.title}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 text-xs font-medium rounded-md bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                      {lecture.fileType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[var(--color-text-secondary)]">
                    {new Date(lecture.uploadedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <a
                      href={lecture.fileUrl}
                      target="_blank"
                      className="text-[var(--color-primary)] hover:underline text-sm"
                    >
                      Download
                    </a>
                    <button
                      onClick={() => handleDelete(lecture.id)}
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
