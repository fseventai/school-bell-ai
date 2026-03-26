import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { schedule } from './schema.ts';
import type { ScheduleType } from '$lib/types';

const DEFAULT_SCHEDULE: Array<{
  id: string;
  time: string;
  day: string;
  subjectFinished: string;
  subjectNext: string;
  teacherPrefix: string;
  teacherNext: string;
  type: ScheduleType;
}> = [
  { id: "1", time: "07:00", day: "Everyday", subjectFinished: "Persiapan", subjectNext: "Upacara Bendera", teacherPrefix: "Bapak", teacherNext: "Kepala Sekolah", type: 'StartSchool' },
  { id: "2", time: "07:45", day: "Everyday", subjectFinished: "Upacara Bendera", subjectNext: "Matematika", teacherPrefix: "Bapak", teacherNext: "Drs. Budi Santoso", type: 'Lesson' },
  { id: "3", time: "09:15", day: "Everyday", subjectFinished: "Matematika", subjectNext: "Bahasa Inggris", teacherPrefix: "Ibu", teacherNext: "Siti Aminah, M.Pd", type: 'Change' },
  { id: "4", time: "10:15", day: "Everyday", subjectFinished: "Bahasa Inggris", subjectNext: "Istirahat I", teacherPrefix: "", teacherNext: "-", type: 'Break' },
  { id: "5", time: "10:30", day: "Everyday", subjectFinished: "Istirahat I", subjectNext: "Fisika", teacherPrefix: "Bapak", teacherNext: "Ir. Agus Wijaya", type: 'Lesson' },
  { id: "6", time: "12:00", day: "Everyday", subjectFinished: "Fisika", subjectNext: "Istirahat II / Dzuhur", teacherPrefix: "", teacherNext: "-", type: 'Prayer' },
  { id: "7", time: "13:00", day: "Everyday", subjectFinished: "Istirahat II / Dzuhur", subjectNext: "Bahasa Indonesia", teacherPrefix: "Ibu", teacherNext: "Dra. Ani Lestari", type: 'Lesson' },
  { id: "8", time: "14:30", day: "Everyday", subjectFinished: "Bahasa Indonesia", subjectNext: "Seni Budaya", teacherPrefix: "Bapak", teacherNext: "Rendi Pratama, S.Sn", type: 'Change' },
  { id: "9", time: "15:30", day: "Everyday", subjectFinished: "Seni Budaya", subjectNext: "Pulang", teacherPrefix: "", teacherNext: "-", type: 'EndSchool' }
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
      subjectFinished: item.subjectFinished,
      subjectNext: item.subjectNext,
      teacherPrefix: item.teacherPrefix,
      teacherNext: item.teacherNext,
      type: item.type
    }).onConflictDoUpdate({
      target: schedule.id,
      set: {
        time: item.time,
        day: item.day,
        subjectFinished: item.subjectFinished,
        subjectNext: item.subjectNext,
        teacherPrefix: item.teacherPrefix,
        teacherNext: item.teacherNext,
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
