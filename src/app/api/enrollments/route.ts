import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, courseId } = await req.json();

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: "userId and courseId are required." },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Already enrolled in this course." },
        { status: 409 }
      );
    }

    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId },
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
