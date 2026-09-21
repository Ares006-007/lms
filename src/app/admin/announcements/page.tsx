"use client";

import { useState, useEffect } from "react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchAnnouncements = async () => {
    const res = await fetch("/api/announcements");
    setAnnouncements(await res.json());
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    setTitle("");
    setContent("");
    setShowForm(false);
    setLoading(false);
    fetchAnnouncements();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    await fetch(`/api/announcements?id=${id}`, { method: "DELETE" });
    fetchAnnouncements();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-[var(--color-text-primary)]">
          Announcements
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          {showForm ? "Cancel" : "+ New Announcement"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 shadow-sm mb-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                placeholder="Announcement title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
                placeholder="Write the announcement content..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
            >
              {loading ? "Posting..." : "Post Announcement"}
            </button>
          </form>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-8 text-center shadow-sm">
            <p className="text-[var(--color-text-secondary)]">No announcements yet.</p>
          </div>
        ) : (
          announcements.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-xl border border-[var(--color-border)] p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-[var(--color-text-primary)] mb-1">
                    {a.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                    {new Date(a.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
                    {a.content}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="text-[var(--color-danger)] hover:underline text-sm ml-4 shrink-0"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
