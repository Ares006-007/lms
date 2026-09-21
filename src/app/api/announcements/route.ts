import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(announcements);
}

export async function POST(req: Request) {
  try {
    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required." },
        { status: 400 }
      );
    }

    const announcement = await prisma.announcement.create({
      data: { title, content },
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error("Announcement creation error:", error);
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
      return NextResponse.json({ error: "Announcement ID required." }, { status: 400 });
    }

    await prisma.announcement.delete({ where: { id } });
    return NextResponse.json({ message: "Announcement deleted." });
  } catch (error) {
    console.error("Announcement deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
