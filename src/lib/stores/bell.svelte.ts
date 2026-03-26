import { format, addMinutes } from 'date-fns';
import { scheduleStore } from './schedule.svelte';
import { settingsStore } from './settings.svelte';
import { geminiService } from '$lib/services/gemini';
import { toast } from 'svelte-french-toast';
import type { ScheduleItem, BellSettings } from '$lib/types';

class BellStore {
  currentTime = $state(new Date());
  lastBellPlayed = $state<string | null>(null);
  lastNotificationShown = $state<string | null>(null);
  isBellUpcoming = $state(false);
  isGenerating = $state(false);
  error = $state<string | null>(null);

  updateTime() {
    this.currentTime = new Date();
    this.checkBell(this.currentTime);
  }

  private async checkBell(now: Date) {
    const currentDay = format(now, 'EEEE');
    const currentTimeStr = format(now, 'HH:mm');

    // Find bell for current time
    const bell = scheduleStore.items.find(item =>
      item.time === currentTimeStr &&
      (item.day === currentDay || item.day === 'Everyday')
    );

    if (bell && this.lastBellPlayed !== `${bell.id}-${currentTimeStr}`) {
      this.lastBellPlayed = `${bell.id}-${currentTimeStr}`;
      await this.triggerBell(bell);
    }

    // Check for upcoming bell (5 min before)
    const fiveMinLater = addMinutes(now, 5);
    const fiveMinLaterStr = format(fiveMinLater, 'HH:mm');

    const upcoming = scheduleStore.items.find(item =>
      item.time === fiveMinLaterStr &&
      (item.day === currentDay || item.day === 'Everyday')
    );

    this.isBellUpcoming = !!upcoming;

    if (upcoming && this.lastNotificationShown !== `${upcoming.id}-${fiveMinLaterStr}`) {
      this.lastNotificationShown = `${upcoming.id}-${fiveMinLaterStr}`;
      toast(`Bell Berikutnya: ${upcoming.subject}\nPelajaran ${upcoming.subject} akan dimulai pukul ${upcoming.time} (5 menit lagi).`, {
        duration: 10000,
      });
    }
  }

  async triggerBell(bell: ScheduleItem) {
    this.isGenerating = true;
    this.error = null;
    const settings = settingsStore.value;

    try {
      if (settings.useCustomAudio && settings.customAudioBase64) {
        await geminiService.playAudioFromBase64(settings.customAudioBase64, settings.volume / 100, settings.customAudioMimeType);
      } else {
        let template = settings.announcementTemplate;

        if (bell.type === 'StartSchool') template = settings.startLessonTemplate;
        else if (bell.type === 'Change') template = settings.changeLessonTemplate;
        else if (bell.type === 'Break') template = settings.breakTimeTemplate;
        else if (bell.type === 'Prayer') template = settings.prayerTimeTemplate;
        else if (bell.type === 'EndSchool') template = settings.endSchoolTemplate;
        else if (bell.type === 'Lesson') template = settings.startLessonTemplate;

        // Calculate subjectFinished based on previous order
        const prevBell = scheduleStore.items.find(item => item.order === bell.order - 1 && (item.day === bell.day || item.day === 'Everyday'));
        const subjectFinishedStr = prevBell ? prevBell.subject : 'Pelajaran sebelumnya';

        const announcementText = template
          .replace('[Time]', bell.time)
          .replace('[SubjectFinished]', subjectFinishedStr)
          .replace('[SubjectNext]', bell.subject)
          .replace('[Subject]', bell.subject)
          .replace('[Class]', bell.class)
          .replace('[TeacherNext]', `${bell.teacherPrefix ? bell.teacherPrefix + ' ' : ''}${bell.teacher}`)
          .replace('[Teacher]', `${bell.teacherPrefix ? bell.teacherPrefix + ' ' : ''}${bell.teacher}`);

        await geminiService.generateAndPlay(announcementText, settings);
      }
    } catch (err: unknown) {
      console.error("Bell trigger error:", err);
      const errorMessage = err instanceof Error ? err.message : "Gagal menghasilkan suara bell.";
      this.error = errorMessage;
      toast.error(errorMessage);
    } finally {
      this.isGenerating = false;
    }
  }

  async testBell(settings: BellSettings) {
    this.isGenerating = true;
    try {
      const text = "Ini adalah percobaan suara bell sekolah kecerdasan buatan. Sistem siap digunakan.";
      await geminiService.generateAndPlay(text, settings);
      toast.success("Percobaan bell berhasil");
    } catch (err: unknown) {
      console.error("Test bell error:", err);
      const errorMessage = err instanceof Error ? err.message : "Percobaan bell gagal";
      toast.error(errorMessage);
    } finally {
      this.isGenerating = false;
    }
  }

  async triggerEmergencyBell(message: string) {
    this.isGenerating = true;
    const settings = settingsStore.value;
    try {
      const text = settings.emergencyTemplate.replace('[Message]', message);
      await geminiService.generateAndPlay(text, settings);
      toast.success("Bell darurat dibunyikan");
    } catch (err: unknown) {
      console.error("Emergency bell error:", err);
      toast.error("Gagal membunyikan bell darurat.");
    } finally {
      this.isGenerating = false;
    }
  }
}

export const bellStore = new BellStore();
