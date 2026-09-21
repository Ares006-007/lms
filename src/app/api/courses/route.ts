import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const courses = await prisma.course.findMany({
    include: {
      _count: { select: { enrollments: true, lectures: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(courses);
}

export async function POST(req: Request) {
  try {
    const { title, description, imageUrl } = await req.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required." },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: { title, description, imageUrl },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Course creation error:", error);
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
      return NextResponse.json({ error: "Course ID required." }, { status: 400 });
    }

    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ message: "Course deleted." });
  } catch (error) {
    console.error("Course deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
