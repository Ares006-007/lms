import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const students = await prisma.user.findMany({
    where: { role: "LEARNER" },
    include: {
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(students);
}

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password || "student123", 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: "LEARNER" },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Student creation error:", error);
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
      return NextResponse.json({ error: "Student ID required." }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "Student removed." });
  } catch (error) {
    console.error("Student deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
