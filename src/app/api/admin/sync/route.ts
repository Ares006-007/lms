import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * POST /api/admin/sync
 *
 * Called after Firebase authentication succeeds. Upserts the admin user
 * into the Prisma database so the existing NextAuth session and admin
 * dashboard server-side queries continue to work.
 *
 * Body: { firebaseUid, email, name }
 */
export async function POST(req: Request) {
  try {
    const { firebaseUid, email, name } = await req.json();

    if (!firebaseUid || !email) {
      return NextResponse.json(
        { error: "Firebase UID and email are required." },
        { status: 400 }
      );
    }

    // Use a shared internal password so NextAuth credentials can sign this user in
    const syncPassword = process.env.ADMIN_SYNC_PASSWORD || "kodecy-admin-sync-secret-2026";
    const hashedPassword = await bcrypt.hash(syncPassword, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: name || "Admin",
        role: "ADMIN",
        password: hashedPassword,
      },
      create: {
        email,
        name: name || "Admin",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    return NextResponse.json(
      { message: "Admin synced successfully.", userId: user.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin sync error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
