# Kodecy Institute — Learning Management System

A modern, full-stack Learning Management System built with Next.js, Prisma, and SQLite.

## Quick Start

### Prerequisites
- Node.js 18+ installed
- npm

### Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Push database schema (creates SQLite database)
npx prisma db push

# 3. Seed demo data
node prisma/seed.js

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

| Role    | Email                                  | Password    |
|---------|----------------------------------------|-------------|
| Admin   | `admin@kodecy.com`                     | `admin123`  |
| Student | `priya.sharma@students.kodecy.com`     | `student123`|
| Student | `arjun.patel@students.kodecy.com`      | `student123`|
| Student | `fatima.khan@students.kodecy.com`      | `student123`|
| Student | `rohan.gupta@students.kodecy.com`      | `student123`|
| Student | `ananya.reddy@students.kodecy.com`     | `student123`|

## Features

### Admin Panel (`/admin`)
- **Dashboard** — Overview of student count, courses, lectures, enrollment stats
- **Courses** — Create, view, and delete courses
- **Lectures** — Upload lecture files (PDF, Video, Slides) linked to courses
- **Students** — View/add/remove students, bulk CSV import
- **Exam Timetable** — Create and manage exam schedules
- **Announcements** — Post notices visible to all students

### Student Dashboard (`/dashboard`)
- **Dashboard** — View enrolled courses (with progress %), available courses for enrollment, latest announcements
- **Course Detail** — View/download lectures, mark them as completed with checkmarks
- **Exam Timetable** — View upcoming exams in a table
- **My Progress** — Overall and per-course progress tracking

## Tech Stack

| Layer     | Technology          |
|-----------|---------------------|
| Framework | Next.js 16 (App Router) |
| Language  | TypeScript          |
| Database  | SQLite (via Prisma) |
| ORM       | Prisma 5            |
| Auth      | NextAuth.js (Auth.js) |
| Styling   | Tailwind CSS 4      |
| Fonts     | Inter + Outfit + JetBrains Mono |

## Project Structure

```
src/
├── app/
│   ├── admin/          # Admin panel pages
│   ├── dashboard/      # Student dashboard pages
│   ├── login/          # Login page
│   ├── register/       # Student registration
│   └── api/            # REST API routes
├── components/ui/      # Reusable UI components
├── lib/prisma.ts       # Database client
├── auth.ts             # Auth configuration
└── middleware.ts        # Role-based route protection
prisma/
├── schema.prisma       # Database schema
├── seed.js             # Demo data seeder
└── dev.db              # SQLite database
public/uploads/         # Uploaded lecture files
```

## Extending the Project

### Adding a new feature
1. Add models to `prisma/schema.prisma`
2. Run `npx prisma db push` to sync the database
3. Create API routes in `src/app/api/`
4. Create pages in `src/app/admin/` or `src/app/dashboard/`

### Switching to PostgreSQL
1. Update `prisma/schema.prisma` datasource provider to `"postgresql"`
2. Set `DATABASE_URL` in `.env` to your PostgreSQL connection string
3. Run `npx prisma db push`

### Adding OAuth (Google, GitHub)
1. Install the provider package
2. Add the provider to `src/auth.ts`
3. Set the required environment variables in `.env`

## License

MIT
