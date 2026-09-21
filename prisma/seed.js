const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // Clear existing data
  await prisma.progress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lecture.deleteMany();
  await prisma.examTimetable.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  // Create uploads directory
  const uploadsDir = path.join(__dirname, "..", "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // ── ADMIN ──
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      name: "Dr. Kavitha Ramanathan",
      email: "admin@kodecy.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin created: ${admin.email} (password: admin123)`);

  // ── STUDENTS ──
  const studentPassword = await bcrypt.hash("student123", 10);
  const studentData = [
    { name: "Priya Sharma", email: "priya.sharma@students.kodecy.com" },
    { name: "Arjun Patel", email: "arjun.patel@students.kodecy.com" },
    { name: "Fatima Khan", email: "fatima.khan@students.kodecy.com" },
    { name: "Rohan Gupta", email: "rohan.gupta@students.kodecy.com" },
    { name: "Ananya Reddy", email: "ananya.reddy@students.kodecy.com" },
  ];

  const students = [];
  for (const s of studentData) {
    const student = await prisma.user.create({
      data: { ...s, password: studentPassword, role: "LEARNER" },
    });
    students.push(student);
    console.log(`✅ Student created: ${student.email} (password: student123)`);
  }

  // ── COURSES ──
  const coursesData = [
    {
      title: "Python Fundamentals",
      description:
        "A comprehensive introduction to Python programming covering syntax, data types, control flow, functions, and object-oriented programming. Ideal for beginners with no prior coding experience.",
    },
    {
      title: "Web Development with React",
      description:
        "Build modern, interactive web applications using React.js. Covers components, state management, hooks, routing, and API integration. Prerequisites: basic HTML, CSS, and JavaScript.",
    },
    {
      title: "Data Structures & Algorithms",
      description:
        "Master the fundamental data structures (arrays, linked lists, trees, graphs, hash tables) and algorithms (sorting, searching, dynamic programming) essential for technical interviews and efficient software design.",
    },
  ];

  const courses = [];
  for (const c of coursesData) {
    const course = await prisma.course.create({ data: c });
    courses.push(course);
    console.log(`✅ Course created: ${course.title}`);
  }

  // ── LECTURES ──
  // Create sample placeholder files
  const lecturesData = [
    // Python Fundamentals
    {
      courseIdx: 0,
      title: "Introduction to Python & Setup",
      description: "Installing Python, setting up your IDE, and writing your first Hello World program.",
      fileType: "PDF",
    },
    {
      courseIdx: 0,
      title: "Variables, Data Types & Operators",
      description: "Understanding integers, floats, strings, booleans, and basic arithmetic operators.",
      fileType: "PDF",
    },
    {
      courseIdx: 0,
      title: "Control Flow: Conditionals & Loops",
      description: "If-else statements, for loops, while loops, and break/continue keywords.",
      fileType: "SLIDES",
    },
    // React
    {
      courseIdx: 1,
      title: "React Basics: Components & JSX",
      description: "Understanding the component model, JSX syntax, and rendering elements.",
      fileType: "VIDEO",
    },
    {
      courseIdx: 1,
      title: "State & Props",
      description: "Managing component state with useState, passing data with props, and lifting state up.",
      fileType: "PDF",
    },
    // DSA
    {
      courseIdx: 2,
      title: "Arrays & Linked Lists",
      description: "Linear data structures, time complexity analysis, and implementation patterns.",
      fileType: "PDF",
    },
    {
      courseIdx: 2,
      title: "Sorting Algorithms: Bubble, Merge, Quick",
      description: "Comparing sorting algorithms by time and space complexity with visual walkthroughs.",
      fileType: "SLIDES",
    },
    {
      courseIdx: 2,
      title: "Binary Trees & Traversals",
      description: "Tree terminology, binary search trees, BFS, DFS, in-order, pre-order, post-order traversals.",
      fileType: "VIDEO",
    },
  ];

  const lectures = [];
  for (const l of lecturesData) {
    // Create a simple placeholder file
    const ext = l.fileType === "VIDEO" ? "txt" : l.fileType === "PDF" ? "txt" : "txt";
    const fileName = `${l.title.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}.${ext}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(
      filePath,
      `[Placeholder for: ${l.title}]\n\nThis is a sample ${l.fileType} file for the lecture "${l.title}".\n\nDescription: ${l.description}\n\nIn a production environment, this would be an actual ${l.fileType.toLowerCase()} file.`
    );

    const lecture = await prisma.lecture.create({
      data: {
        courseId: courses[l.courseIdx].id,
        title: l.title,
        description: l.description,
        fileUrl: `/uploads/${fileName}`,
        fileType: l.fileType,
      },
    });
    lectures.push(lecture);
    console.log(`  📄 Lecture: ${lecture.title} (${l.fileType})`);
  }

  // ── ENROLLMENTS ──
  // Varied enrollment: not everyone in every course
  const enrollmentPlan = [
    { studentIdx: 0, courseIndices: [0, 1] },     // Priya: Python + React
    { studentIdx: 1, courseIndices: [0, 2] },     // Arjun: Python + DSA
    { studentIdx: 2, courseIndices: [1, 2] },     // Fatima: React + DSA
    { studentIdx: 3, courseIndices: [0, 1, 2] },  // Rohan: all three
    { studentIdx: 4, courseIndices: [2] },         // Ananya: only DSA
  ];

  for (const plan of enrollmentPlan) {
    for (const ci of plan.courseIndices) {
      await prisma.enrollment.create({
        data: {
          userId: students[plan.studentIdx].id,
          courseId: courses[ci].id,
        },
      });
    }
    console.log(
      `✅ ${students[plan.studentIdx].name} enrolled in ${plan.courseIndices.length} course(s)`
    );
  }

  // ── PROGRESS ──
  // Some lectures marked as completed for realism
  const progressPlan = [
    { studentIdx: 0, lectureIndices: [0, 1] },      // Priya completed first 2 Python lectures
    { studentIdx: 1, lectureIndices: [0] },           // Arjun completed intro to Python
    { studentIdx: 2, lectureIndices: [3, 4] },        // Fatima completed both React lectures
    { studentIdx: 3, lectureIndices: [0, 1, 2, 3] }, // Rohan completed Python + first React
    { studentIdx: 4, lectureIndices: [5] },           // Ananya completed first DSA lecture
  ];

  for (const plan of progressPlan) {
    for (const li of plan.lectureIndices) {
      await prisma.progress.create({
        data: {
          userId: students[plan.studentIdx].id,
          lectureId: lectures[li].id,
          completed: true,
          completedAt: new Date(),
        },
      });
    }
  }
  console.log(`✅ Progress records created`);

  // ── EXAM TIMETABLE ──
  const today = new Date();
  const nextWeek = (days) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  };

  const examsData = [
    {
      courseIdx: 0,
      subject: "Python Fundamentals — Midterm",
      examDate: nextWeek(5),
      examTime: "10:00 AM",
      duration: 90,
    },
    {
      courseIdx: 1,
      subject: "React Components & State — Quiz 1",
      examDate: nextWeek(7),
      examTime: "2:00 PM",
      duration: 45,
    },
    {
      courseIdx: 2,
      subject: "DSA — Sorting & Trees Assessment",
      examDate: nextWeek(10),
      examTime: "11:00 AM",
      duration: 120,
    },
  ];

  for (const e of examsData) {
    await prisma.examTimetable.create({
      data: {
        courseId: courses[e.courseIdx].id,
        subject: e.subject,
        examDate: e.examDate,
        examTime: e.examTime,
        duration: e.duration,
      },
    });
    console.log(`📅 Exam: ${e.subject} on ${e.examDate}`);
  }

  // ── ANNOUNCEMENTS ──
  const announcementsData = [
    {
      title: "Welcome to the Fall 2026 Semester",
      content:
        "We are excited to welcome all students to Kodecy Institute for the Fall 2026 semester. Please review your enrolled courses and begin reviewing the lecture materials. Office hours are available Monday through Thursday, 3:00 PM to 5:00 PM.",
    },
    {
      title: "Library Hours Extended During Exam Week",
      content:
        "The institute library will remain open until 10:00 PM during the upcoming exam week (September 26 – October 3). Additional study rooms have been made available on the second floor. Please reserve your slot through the student portal.",
    },
  ];

  for (const a of announcementsData) {
    await prisma.announcement.create({ data: a });
    console.log(`📢 Announcement: ${a.title}`);
  }

  console.log("\n✅ Seed complete!\n");
  console.log("─────────────────────────────────────────");
  console.log("  Admin Login:   admin@kodecy.com / admin123");
  console.log("  Student Login: priya.sharma@students.kodecy.com / student123");
  console.log("                 arjun.patel@students.kodecy.com / student123");
  console.log("─────────────────────────────────────────\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
