export type ScheduleType = 'Lesson' | 'Change' | 'Break' | 'Prayer' | 'EndSchool' | 'StartSchool';

export interface ScheduleItem {
  id: string;
  time: string; // HH:mm
  type?: ScheduleType | null;
  day: string; // Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday, Everyday
  subject: string;
  teacherPrefix?: string | null;
  teacher: string;
  jamKe: number;
  order: number;
}

export type VoiceName = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';

export interface BellSettings {
  volume: number;
  voiceName: VoiceName;
  useCustomAudio: boolean;
  customAudioBase64?: string;
  customAudioName?: string;
  customAudioMimeType?: string;
  announcementTemplate: string;
  emergencyTemplate: string;
  startLessonTemplate: string;
  changeLessonTemplate: string;
  breakTimeTemplate: string;
  prayerTimeTemplate: string;
  endSchoolTemplate: string;
}
