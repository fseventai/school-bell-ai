import { browser } from '$app/environment';
import type { ScheduleItem } from '$lib/types';

const DEFAULT_SCHEDULE: ScheduleItem[] = [
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

function createScheduleStore() {
  let items = $state<ScheduleItem[]>([]);

  if (browser) {
    const saved = localStorage.getItem('bell-schedule');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        items = parsed.length > 0 ? parsed : DEFAULT_SCHEDULE;
      } catch (e: unknown) {
        console.error("Failed to parse schedule:", e);
        items = DEFAULT_SCHEDULE;
      }
    } else {
      items = DEFAULT_SCHEDULE;
    }
  }

  return {
    get items() { return items; },
    set items(newItems: ScheduleItem[]) {
      items = newItems;
      if (browser) localStorage.setItem('bell-schedule', JSON.stringify(items));
    },
    addItem(item: ScheduleItem) {
      items = [...items, item];
      if (browser) localStorage.setItem('bell-schedule', JSON.stringify(items));
    },
    updateItem(id: string, updated: Partial<ScheduleItem>) {
      items = items.map(i => i.id === id ? { ...i, ...updated } : i);
      if (browser) localStorage.setItem('bell-schedule', JSON.stringify(items));
    },
    removeItem(id: string) {
      items = items.filter(i => i.id !== id);
      if (browser) localStorage.setItem('bell-schedule', JSON.stringify(items));
    },
    clearAll() {
      items = [];
      if (browser) localStorage.setItem('bell-schedule', JSON.stringify(items));
    },
    sortByTime() {
      items = [...items].sort((a, b) => a.time.localeCompare(b.time));
      if (browser) localStorage.setItem('bell-schedule', JSON.stringify(items));
    },
    addItems(newItems: ScheduleItem[]) {
      items = [...items, ...newItems];
      if (browser) localStorage.setItem('bell-schedule', JSON.stringify(items));
    },
    loadDummy() {
      items = DEFAULT_SCHEDULE;
      if (browser) localStorage.setItem('bell-schedule', JSON.stringify(items));
    },
    generateRandom() {
      const subjects = ['Matematika', 'Bahasa Inggris', 'Fisika', 'Biologi', 'Sejarah', 'Geografi', 'Seni Budaya', 'Olahraga', 'Agama', 'TIK'];
      const teachers = ['Budi', 'Siti', 'Agus', 'Ani', 'Rendi', 'Eko', 'Maya', 'Dodi', 'Lani', 'Joko'];
      const prefixes = ['Bapak', 'Ibu', 'Ustadz', 'Ustadzah'];

      const newItems: ScheduleItem[] = [];
      let currentHour = 7;
      let currentMin = 0;

      for (let i = 0; i < 15; i++) {
        const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
        newItems.push({
          id: Math.random().toString(36).substr(2, 9),
          time: timeStr,
          day: 'Everyday',
          subjectFinished: i === 0 ? "Persiapan" : subjects[(i - 1) % subjects.length],
          subjectNext: subjects[i % subjects.length],
          teacherPrefix: prefixes[Math.floor(Math.random() * prefixes.length)],
          teacherNext: teachers[Math.floor(Math.random() * teachers.length)],
          type: 'Lesson'
        });

        currentMin += 45;
        if (currentMin >= 60) {
          currentHour += Math.floor(currentMin / 60);
          currentMin %= 60;
        }
      }
      items = newItems;
      if (browser) localStorage.setItem('bell-schedule', JSON.stringify(items));
    }
  };
}

export const scheduleStore = createScheduleStore();
