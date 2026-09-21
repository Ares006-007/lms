"use client";

import { useState } from "react";

interface Lecture {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
}

export default function LectureList({
  lectures,
  progressMap,
  userId,
}: {
  lectures: Lecture[];
  progressMap: Record<string, boolean>;
  userId: string;
}) {
  const [completed, setCompleted] = useState<Record<string, boolean>>(progressMap);

  const toggleComplete = async (lectureId: string) => {
    const newVal = !completed[lectureId];
    setCompleted((prev) => ({ ...prev, [lectureId]: newVal }));

    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, lectureId, completed: newVal }),
    });
  };

  const fileTypeIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return "📄";
      case "VIDEO":
        return "🎬";
      case "SLIDES":
        return "📊";
      default:
        return "📎";
    }
  };

  return (
    <ul className="divide-y divide-[var(--color-border)]">
      {lectures.map((lecture, idx) => (
        <li
          key={lecture.id}
          className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
        >
          {/* Completion Checkbox */}
          <button
            onClick={() => toggleComplete(lecture.id)}
            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors shrink-0 ${
              completed[lecture.id]
                ? "bg-[var(--color-success)] border-[var(--color-success)] text-white"
                : "border-gray-300 hover:border-[var(--color-primary)]"
            }`}
            title={completed[lecture.id] ? "Mark incomplete" : "Mark complete"}
          >
            {completed[lecture.id] && (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>

          {/* Lecture Number */}
          <span className="text-sm font-mono text-[var(--color-text-secondary)] w-6 text-center shrink-0">
            {idx + 1}
          </span>

          {/* Lecture Info */}
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium ${
                completed[lecture.id]
                  ? "text-[var(--color-text-secondary)] line-through"
                  : "text-[var(--color-text-primary)]"
              }`}
            >
              {lecture.title}
            </p>
            {lecture.description && (
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 truncate">
                {lecture.description}
              </p>
            )}
          </div>

          {/* File Type Badge */}
          <span className="text-base" title={lecture.fileType}>
            {fileTypeIcon(lecture.fileType)}
          </span>

          {/* Download Link */}
          <a
            href={lecture.fileUrl}
            target="_blank"
            className="text-sm text-[var(--color-primary)] hover:underline shrink-0"
          >
            {lecture.fileType === "VIDEO" ? "Watch" : "Download"}
          </a>
        </li>
      ))}
    </ul>
  );
}
