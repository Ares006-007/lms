import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="text-xl font-heading font-semibold text-[var(--color-text-primary)]">
              Kodecy Institute
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-lg transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] rounded-lg transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <h1 className="text-5xl font-heading font-bold text-[var(--color-text-primary)] leading-tight mb-6">
            Learn. Grow. Succeed.
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)] mb-8 leading-relaxed">
            Kodecy Institute provides a structured learning experience with
            curated courses, organized lectures, and clear progress tracking.
            Built for students who take their education seriously.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-6 py-3 text-base font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] rounded-lg transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 text-base font-medium text-[var(--color-text-primary)] bg-white border border-[var(--color-border)] hover:bg-gray-50 rounded-lg transition-colors"
            >
              I have an account
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] py-6">
        <p className="text-center text-sm text-[var(--color-text-secondary)]">
          © 2026 Kodecy Institute. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
