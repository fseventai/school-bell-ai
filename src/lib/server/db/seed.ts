import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { schedule } from './schema.ts';
import type { ScheduleType } from '$lib/types';

const DEFAULT_SCHEDULE: Array<{
  id: string;
  time: string;
  day: string;
  subject: string;
  class: string;
  teacherPrefix: string | null;
  teacher: string;
  period: number;
  order: number;
  type: ScheduleType;
}> = [
  { id: "1", time: "07:00", day: "Everyday", subject: "Upacara Bendera", class: "Semua Kelas", teacherPrefix: "Bapak", teacher: "Kepala Sekolah", period: 1, order: 1, type: 'StartSchool' },
  { id: "2", time: "07:45", day: "Everyday", subject: "Matematika", class: "X MIPA 1", teacherPrefix: "Bapak", teacher: "Drs. Budi Santoso", period: 2, order: 2, type: 'Lesson' },
  { id: "3", time: "09:15", day: "Everyday", subject: "Bahasa Inggris", class: "X MIPA 1", teacherPrefix: "Ibu", teacher: "Siti Aminah, M.Pd", period: 3, order: 3, type: 'Change' },
  { id: "4", time: "10:15", day: "Everyday", subject: "Istirahat I", class: "Semua Kelas", teacherPrefix: null, teacher: "-", period: 4, order: 4, type: 'Break' },
  { id: "5", time: "10:30", day: "Everyday", subject: "Fisika", class: "X MIPA 1", teacherPrefix: "Bapak", teacher: "Ir. Agus Wijaya", period: 5, order: 5, type: 'Lesson' },
  { id: "6", time: "12:00", day: "Everyday", subject: "Istirahat II / Dzuhur", class: "Semua Kelas", teacherPrefix: null, teacher: "-", period: 6, order: 6, type: 'Prayer' },
  { id: "7", time: "13:00", day: "Everyday", subject: "Bahasa Indonesia", class: "X MIPA 1", teacherPrefix: "Ibu", teacher: "Dra. Ani Lestari", period: 7, order: 7, type: 'Lesson' },
  { id: "8", time: "14:30", day: "Everyday", subject: "Seni Budaya", class: "X MIPA 1", teacherPrefix: "Bapak", teacher: "Rendi Pratama, S.Sn", period: 8, order: 8, type: 'Change' },
  { id: "9", time: "15:30", day: "Everyday", subject: "Pulang", class: "Semua Kelas", teacherPrefix: null, teacher: "-", period: 9, order: 9, type: 'EndSchool' }
];

async function seed() {
  console.log('⏳ Starting seeding...');

  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL is not set in .env');
    process.exit(1);
  }

  const client = createClient({ url: process.env.DATABASE_URL });
  const db = drizzle(client);

  for (const item of DEFAULT_SCHEDULE) {
    await db.insert(schedule).values({
      id: item.id,
      time: item.time,
      day: item.day,
      subject: item.subject,
      class: item.class,
      teacherPrefix: item.teacherPrefix,
      teacher: item.teacher,
      period: item.period,
      order: item.order,
      type: item.type
    }).onConflictDoUpdate({
      target: schedule.id,
      set: {
        time: item.time,
        day: item.day,
        subject: item.subject,
        class: item.class,
        teacherPrefix: item.teacherPrefix,
        teacher: item.teacher,
        period: item.period,
        order: item.order,
        type: item.type
      }
    });
  }

  console.log('✅ Default schedule seeded successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Error seeding data:', err);
  process.exit(1);
});
