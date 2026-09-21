import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const exams = await prisma.examTimetable.findMany({
    include: { course: { select: { title: true } } },
    orderBy: { examDate: "asc" },
  });
  return NextResponse.json(exams);
}

export async function POST(req: Request) {
  try {
    const { courseId, subject, examDate, examTime, duration, venue } = await req.json();

    if (!courseId || !subject || !examDate || !examTime || !duration) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const exam = await prisma.examTimetable.create({
      data: { courseId, subject, examDate, examTime, duration: parseInt(duration), venue: venue || "Main Hall" },
    });

    return NextResponse.json(exam, { status: 201 });
  } catch (error) {
    console.error("Exam creation error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Exam ID required." }, { status: 400 });
    }

    await prisma.examTimetable.delete({ where: { id } });
    return NextResponse.json({ message: "Exam entry deleted." });
  } catch (error) {
    console.error("Exam deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
