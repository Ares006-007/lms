"use client";

import { useState, useEffect } from "react";

interface Student {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  _count: { enrollments: number };
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<string>("");

  const fetchStudents = async () => {
    const res = await fetch("/api/students");
    setStudents(await res.json());
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password: "student123" }),
    });
    setName("");
    setEmail("");
    setShowForm(false);
    setLoading(false);
    fetchStudents();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this student? This will also remove their enrollments and progress.")) return;
    await fetch(`/api/students?id=${id}`, { method: "DELETE" });
    fetchStudents();
  };

  const handleCSVImport = async () => {
    if (!csvFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", csvFile);

    const res = await fetch("/api/students/import", {
      method: "POST",
      body: formData,
    });
    const result = await res.json();
    setImportResult(
      `Created: ${result.created}, Skipped: ${result.skipped}${
        result.errors?.length ? `, Errors: ${result.errors.length}` : ""
      }`
    );
    setCsvFile(null);
    setLoading(false);
    fetchStudents();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-[var(--color-text-primary)]">
          Students
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            {showForm ? "Cancel" : "+ Add Student"}
          </button>
        </div>
      </div>

      {/* CSV Import */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-4 shadow-sm mb-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">Bulk Import:</span>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => {
              setCsvFile(e.target.files?.[0] || null);
              setImportResult("");
            }}
            className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[var(--color-primary-light)] file:text-[var(--color-primary)]"
          />
          <button
            onClick={handleCSVImport}
            disabled={!csvFile || loading}
            className="px-3 py-1.5 bg-[var(--color-primary)] text-white text-sm rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
          >
            Import CSV
          </button>
          {importResult && (
            <span className="text-sm text-[var(--color-success)] font-medium">{importResult}</span>
          )}
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] mt-2">
          CSV format: name, email, password (one student per row). If password is omitted, &quot;student123&quot; is used.
        </p>
      </div>

      {/* Add Student Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 shadow-sm mb-6">
          <form onSubmit={handleCreate} className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
            >
              Add
            </button>
          </form>
        </div>
      )}

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-gray-50">
              <th className="text-left px-6 py-3 font-medium text-[var(--color-text-secondary)]">Name</th>
              <th className="text-left px-6 py-3 font-medium text-[var(--color-text-secondary)]">Email</th>
              <th className="text-center px-6 py-3 font-medium text-[var(--color-text-secondary)]">Enrolled Courses</th>
              <th className="text-left px-6 py-3 font-medium text-[var(--color-text-secondary)]">Joined</th>
              <th className="text-right px-6 py-3 font-medium text-[var(--color-text-secondary)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">
                  No students registered yet.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-[var(--color-text-primary)]">{student.name}</td>
                  <td className="px-6 py-4 text-[var(--color-text-secondary)]">{student.email}</td>
                  <td className="px-6 py-4 text-center">{student._count.enrollments}</td>
                  <td className="px-6 py-4 text-[var(--color-text-secondary)]">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="text-[var(--color-danger)] hover:underline text-sm"
                    >
                      Remove
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
