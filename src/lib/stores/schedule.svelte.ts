import { browser } from '$app/environment';
import type { ScheduleItem } from '$lib/types';

const DEFAULT_SCHEDULE: ScheduleItem[] = [
  { id: "1", time: "07:00", day: "Everyday", subject: "Upacara Bendera", class: "Semua class", teacherPrefix: "Bapak", teacher: "Kepala Sekolah", type: 'StartSchool', period: 1, order: 1 },
  { id: "2", time: "07:45", day: "Everyday", subject: "Matematika", class: "Semua class", teacherPrefix: "Bapak", teacher: "Drs. Budi Santoso", type: 'Lesson', period: 2, order: 2 },
  { id: "3", time: "09:15", day: "Everyday", subject: "Bahasa Inggris", class: "Semua class", teacherPrefix: "Ibu", teacher: "Siti Aminah, M.Pd", type: 'Change', period: 3, order: 3 },
  { id: "4", time: "10:15", day: "Everyday", subject: "Istirahat I", class: "Semua class", teacherPrefix: "", teacher: "-", type: 'Break', period: 3, order: 4 },
  { id: "5", time: "10:30", day: "Everyday", subject: "Fisika", class: "Semua class", teacherPrefix: "Bapak", teacher: "Ir. Agus Wijaya", type: 'Lesson', period: 4, order: 5 },
  { id: "6", time: "12:00", day: "Everyday", subject: "Istirahat II / Dzuhur", class: "Semua class", teacherPrefix: "", teacher: "-", type: 'Prayer', period: 5, order: 6 },
  { id: "7", time: "13:00", day: "Everyday", subject: "Bahasa Indonesia", class: "Semua class", teacherPrefix: "Ibu", teacher: "Dra. Ani Lestari", type: 'Lesson', period: 6, order: 7 },
  { id: "8", time: "14:30", day: "Everyday", subject: "Seni Budaya", class: "Semua class", teacherPrefix: "Bapak", teacher: "Rendi Pratama, S.Sn", type: 'Change', period: 7, order: 8 },
  { id: "9", time: "15:30", day: "Everyday", subject: "Pulang", class: "Semua Kelas", teacherPrefix: "", teacher: "-", type: 'EndSchool', period: 8, order: 9 }
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
          subject: subjects[i % subjects.length],
          class: 'Kelas 10',
          teacherPrefix: prefixes[Math.floor(Math.random() * prefixes.length)],
          teacher: teachers[Math.floor(Math.random() * teachers.length)],
          type: 'Lesson',
          period: i + 1,
          order: i + 1
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
