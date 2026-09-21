import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "CSV file required." }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split("\n").filter((l) => l.trim());

    // Skip header row if present
    const startIdx = lines[0]?.toLowerCase().includes("name") ? 1 : 0;
    const results = { created: 0, skipped: 0, errors: [] as string[] };

    for (let i = startIdx; i < lines.length; i++) {
      const parts = lines[i].split(",").map((p) => p.trim().replace(/"/g, ""));
      const [name, email, password] = parts;

      if (!name || !email) {
        results.errors.push(`Row ${i + 1}: Missing name or email`);
        results.skipped++;
        continue;
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        results.skipped++;
        continue;
      }

      const hashedPassword = await bcrypt.hash(password || "student123", 10);

      await prisma.user.create({
        data: { name, email, password: hashedPassword, role: "LEARNER" },
      });
      results.created++;
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("CSV import error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
