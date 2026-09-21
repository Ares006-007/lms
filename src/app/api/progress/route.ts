import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, lectureId, completed } = await req.json();

    if (!userId || !lectureId) {
      return NextResponse.json(
        { error: "userId and lectureId are required." },
        { status: 400 }
      );
    }

    const progress = await prisma.progress.upsert({
      where: {
        userId_lectureId: { userId, lectureId },
      },
      update: {
        completed: completed ?? true,
        completedAt: completed ? new Date() : null,
      },
      create: {
        userId,
        lectureId,
        completed: completed ?? true,
        completedAt: completed ? new Date() : null,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Progress update error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
