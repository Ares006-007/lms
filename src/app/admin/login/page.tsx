"use client";

import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const googleProvider = new GoogleAuthProvider();

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      // Step 1: Authenticate with Google via Firebase
      const userCredential = await signInWithPopup(firebaseAuth, googleProvider);
      const user = userCredential.user;

      // Step 2: Sync admin user to Prisma DB
      const syncRes = await fetch("/api/admin/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: user.uid,
          email: user.email,
          name: user.displayName || user.email?.split("@")[0] || "Admin",
        }),
      });

      if (!syncRes.ok) {
        const data = await syncRes.json();
        setError(data.error || "Failed to sync admin account.");
        setLoading(false);
        return;
      }

      // Step 3: Create NextAuth session using the synced credentials
      const syncPassword =
        process.env.NEXT_PUBLIC_ADMIN_SYNC_PASSWORD ||
        "kodecy-admin-sync-secret-2026";

      const result = await signIn("credentials", {
        email: user.email,
        password: syncPassword,
        redirect: false,
      });

      if (result?.error) {
        setError("Google auth succeeded but session creation failed.");
        setLoading(false);
        return;
      }

      router.push("/admin");
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      switch (firebaseError.code) {
        case "auth/popup-closed-by-user":
          // User closed the popup, not an error
          break;
        case "auth/cancelled-popup-request":
          break;
        case "auth/popup-blocked":
          setError("Popup was blocked. Please allow popups for this site.");
          break;
        case "auth/account-exists-with-different-credential":
          setError("An account already exists with this email using a different sign-in method.");
          break;
        default:
          setError("Sign in failed. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">K</span>
            </div>
          </div>
          <h1 className="text-2xl font-heading font-bold text-[var(--color-text-primary)]">
            Admin Dashboard
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Sign in with your Google account to access the admin panel
          </p>
        </div>

        {/* Admin badge */}
        <div className="flex items-center justify-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
            Admin Access · Google Sign-In
          </span>
        </div>

        {/* Sign in card */}
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-8 shadow-sm">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200 mb-5">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-[var(--color-border)] rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {/* Google Logo SVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              {loading ? "Signing in..." : "Continue with Google"}
            </span>
          </button>

          <div className="mt-5 pt-5 border-t border-[var(--color-border)]">
            <p className="text-xs text-center text-[var(--color-text-secondary)] leading-relaxed">
              Your Google account will be registered as an admin automatically.
              No separate sign-up needed.
            </p>
          </div>
        </div>

        {/* Student link */}
        <p className="text-center text-sm text-[var(--color-text-secondary)] mt-6">
          Student?{" "}
          <Link
            href="/login"
            className="text-[var(--color-primary)] font-medium hover:underline"
          >
            Sign in as student
          </Link>
        </p>
      </div>
    </div>
  );
}
