<script lang="ts">
  import { 
    X, 
    Clock, 
    BookOpen, 
    Coffee, 
    Home, 
    School, 
    User, 
    Mic2, 
    Info, 
    Repeat, 
    Calendar,
    ChevronDown, 
    Clock3
  } from '@lucide/svelte';
  import { fade, scale } from 'svelte/transition';
  import type { Component } from 'svelte';
  import type { ScheduleItem, ScheduleType } from '$lib/types';
  import { scheduleStore } from '$lib/stores/schedule.svelte';
  import { settingsStore } from '$lib/stores/settings.svelte';
  import { cn } from '$lib/utils';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    item: ScheduleItem | null;
  }

  let { isOpen, onClose, item }: Props = $props();
  
  let editingItem = $state<ScheduleItem | null>(null);

  $effect(() => {
    if (isOpen && item) {
      editingItem = { ...item };
    }
  });

  function handleUpdateItem(e: SubmitEvent) {
    e.preventDefault();
    if (!editingItem) return;
    scheduleStore.updateItem(editingItem.id, editingItem);
    onClose();
  }

  const days = ['Everyday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayLabels: Record<string, string> = {
    'Everyday': 'Setiap Hari',
    'Monday': 'Senin',
    'Tuesday': 'Selasa',
    'Wednesday': 'Rabu',
    'Thursday': 'Kamis',
    'Friday': 'Jumat',
    'Saturday': 'Sabtu',
    'Sunday': 'Minggu'
  };

  const types: { value: ScheduleType; label: string; icon: Component; color: string }[] = [
    { value: 'Lesson', label: 'Pelajaran', icon: BookOpen, color: 'text-blue-500 bg-blue-50' },
    { value: 'StartSchool', label: 'Masuk', icon: School, color: 'text-emerald-500 bg-emerald-50' },
    { value: 'Change', label: 'Ganti Jam', icon: Repeat, color: 'text-orange-500 bg-orange-50' },
    { value: 'Break', label: 'Istirahat', icon: Coffee, color: 'text-amber-500 bg-amber-50' },
    { value: 'Prayer', label: 'Sholat', icon: Info, color: 'text-purple-500 bg-purple-50' },
    { value: 'EndSchool', label: 'Pulang', icon: Home, color: 'text-red-500 bg-red-50' }
  ];

  const announcementPreview = $derived(() => {
    if (!editingItem) return "";
    const settings = settingsStore.value;
    let template = settings.announcementTemplate;

    if (editingItem.type === 'StartSchool') template = settings.startLessonTemplate;
    else if (editingItem.type === 'Change') template = settings.changeLessonTemplate;
    else if (editingItem.type === 'Break') template = settings.breakTimeTemplate;
    else if (editingItem.type === 'Prayer') template = settings.prayerTimeTemplate;
    else if (editingItem.type === 'EndSchool') template = settings.endSchoolTemplate;
    else if (editingItem.type === 'Lesson') template = settings.startLessonTemplate;

    return template
      .replace('[Time]', editingItem.time || '--:--')
      .replace('[SubjectFinished]', editingItem.subjectFinished || '...')
      .replace('[SubjectNext]', editingItem.subjectNext || '...')
      .replace('[TeacherNext]', `${editingItem.teacherPrefix ? editingItem.teacherPrefix + ' ' : ''}${editingItem.teacherNext || '...'}`);
  });
</script>

{#if isOpen && editingItem}
  <div 
    class="fixed inset-0 bg-black/40 backdrop-blur-md z-200 flex items-center justify-center p-4 sm:p-6"
    transition:fade={{ duration: 300 }}
    onclick={(e) => e.target === e.currentTarget && onClose()}
    role="presentation"
    onkeydown={e => e.key === 'Escape' && onClose()}
  >
    <div 
      class="bg-white rounded-[40px] w-full max-w-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]"
      transition:scale={{ duration: 400, start: 0.9, opacity: 0 }}
      role="dialog"
      aria-modal="true"
    >
      <!-- Header -->
      <div class="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-inner">
            <Clock3 size={24} />
          </div>
          <div>
            <h3 class="text-xl font-black tracking-tight text-gray-900 font-display">Edit Jadwal</h3>
            <p class="text-xs text-gray-400 font-medium uppercase tracking-wider">Atur waktu dan detail pengumuman</p>
          </div>
        </div>
        <button 
          onclick={onClose} 
          class="text-gray-400 hover:text-gray-900 p-2 hover:bg-white rounded-xl transition-all shadow-sm"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      <!-- Form Content -->
      <div class="overflow-y-auto no-scrollbar">
        <form onsubmit={handleUpdateItem} id="edit-schedule-form">
          <div class="p-8 space-y-10">
            
            <!-- Section 1: Waktu & Hari -->
            <div class="space-y-4">
              <div class="flex items-center gap-2 mb-2">
                <Calendar size={16} class="text-orange-400" />
                <span class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Waktu & Hari</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="group">
                  <label class="block text-xs font-bold text-gray-500 mb-2 ml-1" for="edit-time">Jam Pelaksanaan</label>
                  <div class="relative">
                    <Clock size={16} class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    <input 
                      id="edit-time"
                      type="time" 
                      required
                      bind:value={editingItem.time}
                      class="w-full bg-gray-50 border border-gray-200 group-hover:border-gray-300 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-mono"
                    />
                  </div>
                </div>
                <div class="group">
                  <label class="block text-xs font-bold text-gray-500 mb-2 ml-1" for="edit-day">Hari Aktif</label>
                  <div class="relative">
                    <Calendar size={16} class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors pointer-events-none" />
                    <select 
                      id="edit-day"
                      bind:value={editingItem.day}
                      class="w-full bg-gray-50 border border-gray-200 group-hover:border-gray-300 rounded-2xl pl-12 pr-10 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all appearance-none cursor-pointer"
                    >
                      {#each days as day (day)}
                        <option value={day}>{dayLabels[day]}</option>
                      {/each}
                    </select>
                    <ChevronDown size={16} class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 2: Tipe Jadwal -->
            <div class="space-y-4">
              <div class="flex items-center gap-2 mb-2">
                <Repeat size={16} class="text-orange-400" />
                <span class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Tipe Jadwal</span>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {#each types as type (type.value)}
                  <button
                    type="button"
                    onclick={() => editingItem!.type = type.value}
                    class={cn(
                      "flex flex-col items-center gap-3 p-4 rounded-[24px] border-2 transition-all group relative",
                      editingItem.type === type.value 
                        ? "bg-white border-orange-500 shadow-lg shadow-orange-100 ring-4 ring-orange-50" 
                        : "bg-gray-50 border-transparent hover:border-gray-200 hover:bg-white"
                    )}
                  >
                    <div class={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                      type.color
                    )}>
                      <type.icon size={20} />
                    </div>
                    <span class={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      editingItem.type === type.value ? "text-orange-600" : "text-gray-400"
                    )}>
                      {type.label}
                    </span>
                    {#if editingItem.type === type.value}
                      <div class="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500"></div>
                    {/if}
                  </button>
                {/each}
              </div>
            </div>

            <!-- Section 3: Detail Pelajaran -->
            <div class="space-y-4">
              <div class="flex items-center gap-2 mb-2">
                <BookOpen size={16} class="text-orange-400" />
                <span class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Detail Pelajaran</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="group">
                  <label class="block text-xs font-bold text-gray-500 mb-2 ml-1" for="edit-finished">Pelajaran Berakhir</label>
                  <input 
                    id="edit-finished"
                    type="text" 
                    required
                    bind:value={editingItem.subjectFinished}
                    placeholder="Contoh: Matematika"
                    class="w-full bg-gray-50 border border-gray-200 group-hover:border-gray-300 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-display"
                  />
                </div>
                <div class="group">
                  <label class="block text-xs font-bold text-gray-500 mb-2 ml-1" for="edit-next">Pelajaran Berikutnya</label>
                  <input 
                    id="edit-next"
                    type="text" 
                    required
                    bind:value={editingItem.subjectNext}
                    placeholder="Contoh: Bahasa Inggris"
                    class="w-full bg-gray-50 border border-gray-200 group-hover:border-gray-300 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-display"
                  />
                </div>
              </div>
              
              <div class="group mt-4">
                <label class="block text-xs font-bold text-gray-500 mb-2 ml-1" for="edit-teacher">Guru Pengampu Berikutnya</label>
                <div class="flex flex-col sm:flex-row gap-3">
                  <div class="relative sm:w-1/3">
                    <select 
                      bind:value={editingItem.teacherPrefix}
                      class="w-full bg-gray-50 border border-gray-200 group-hover:border-gray-300 rounded-2xl pl-5 pr-10 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Tanpa Awalan</option>
                      <option value="Bapak">Bapak</option>
                      <option value="Ibu">Ibu</option>
                      <option value="Ustadz">Ustadz</option>
                      <option value="Ustadzah">Ustadzah</option>
                    </select>
                    <ChevronDown size={16} class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  <div class="relative flex-1">
                    <User size={16} class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    <input 
                      id="edit-teacher"
                      type="text" 
                      required
                      bind:value={editingItem.teacherNext}
                      class="w-full bg-gray-50 border border-gray-200 group-hover:border-gray-300 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-display"
                      placeholder="Nama Lengkap Guru"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 4: Announcement Preview -->
            <div class="space-y-4 pt-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Mic2 size={16} class="text-orange-400" />
                  <span class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Preview Pengumuman</span>
                </div>
                <div class="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                  <Info size={12} />
                  <span class="text-[9px] font-black uppercase tracking-wider">Berbasis AI</span>
                </div>
              </div>
              <div class="bg-linear-to-br from-gray-900 to-gray-800 rounded-[32px] p-8 shadow-xl relative overflow-hidden group border border-white/10">
                <div class="absolute -top-12 -right-12 text-white/5 group-hover:scale-110 transition-transform duration-700">
                  <Mic2 size={120} />
                </div>
                <p class="text-white/60 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                   Suara akan berbunyi:
                </p>
                <div class="relative z-10 min-h-[60px] flex items-center">
                   <p class="text-white text-lg font-medium leading-relaxed italic">
                    "{announcementPreview()}"
                  </p>
                </div>
                <div class="mt-6 flex justify-end">
                  <div class="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
                    <div class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                    <span class="text-[10px] font-bold text-white/50 uppercase tracking-widest">Sesuai Template Pengaturan</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer Actions -->
      <div class="p-8 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row gap-4 shrink-0">
        <button 
          type="button"
          onclick={onClose}
          class="flex-1 bg-white border border-gray-200 text-gray-500 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm active:scale-95"
        >
          Batal
        </button>
        <button 
          type="submit"
          form="edit-schedule-form"
          class="flex-1 bg-orange-500 text-white py-5 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 active:scale-95 flex items-center justify-center gap-2"
        >
          Simpan Perubahan
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Custom scrollbar for better UX */
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  select {
    background-image: none !important;
  }
</style>
