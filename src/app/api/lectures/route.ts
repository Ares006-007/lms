import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
  const lectures = await prisma.lecture.findMany({
    include: { course: { select: { title: true } } },
    orderBy: { uploadedAt: "desc" },
  });
  return NextResponse.json(lectures);
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const courseId = formData.get("courseId") as string;
    const fileType = formData.get("fileType") as string;
    const file = formData.get("file") as File;

    if (!title || !courseId || !file) {
      return NextResponse.json(
        { error: "Title, course, and file are required." },
        { status: 400 }
      );
    }

    // Save file to public/uploads
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const filePath = path.join(uploadsDir, fileName);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const lecture = await prisma.lecture.create({
      data: {
        title,
        description: description || null,
        courseId,
        fileUrl: `/uploads/${fileName}`,
        fileType: fileType || "PDF",
      },
    });

    return NextResponse.json(lecture, { status: 201 });
  } catch (error) {
    console.error("Lecture upload error:", error);
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
      return NextResponse.json({ error: "Lecture ID required." }, { status: 400 });
    }

    await prisma.lecture.delete({ where: { id } });
    return NextResponse.json({ message: "Lecture deleted." });
  } catch (error) {
    console.error("Lecture deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
