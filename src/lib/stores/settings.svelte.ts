import { browser } from '$app/environment';
import type { BellSettings } from '$lib/types';

const DEFAULT_SETTINGS: BellSettings = {
  volume: 80,
  voiceName: 'Kore',
  useCustomAudio: false,
  announcementTemplate: '[Time] - [SubjectFinished] telah selesai. Selanjutnya adalah [SubjectNext] oleh [TeacherNext].',
  startLessonTemplate: 'Pelajaran [SubjectNext] akan segera dimulai. Kepada Bapak/Ibu [TeacherNext] dipersilakan memasuki kelas.',
  changeLessonTemplate: 'Waktu pelajaran [SubjectFinished] telah berakhir. Saatnya berganti ke pelajaran [SubjectNext].',
  breakTimeTemplate: 'Waktu istirahat telah tiba. Selamat beristirahat.',
  prayerTimeTemplate: 'Waktu sholat telah tiba. Mari sejenak menghentikan aktivitas untuk melaksanakan ibadah.',
  endSchoolTemplate: 'Waktu pulang telah tiba. Terima kasih atas perhatiannya hari ini. Sampai jumpa besok.',
  emergencyTemplate: 'PERHATIAN! [Message]. Mohon tetap tenang dan ikuti prosedur evakuasi.',
};

function createSettingsStore() {
  let settings = $state<BellSettings>(DEFAULT_SETTINGS);

  if (browser) {
    const saved = localStorage.getItem('bell-settings');
    if (saved) {
      try {
        settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse settings from localStorage', e);
      }
    }
  }

  return {
    get value() { return settings; },
    update(newSettings: Partial<BellSettings>) {
      settings = { ...settings, ...newSettings };
      if (browser) {
        localStorage.setItem('bell-settings', JSON.stringify(settings));
      }
    },
    reset() {
      settings = DEFAULT_SETTINGS;
      if (browser) {
        localStorage.removeItem('bell-settings');
      }
    }
  };
}

export const settingsStore = createSettingsStore();
