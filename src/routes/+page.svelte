<script lang="ts">
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { 
    Clock, 
    Bell, 
    User, 
    ChevronRight, 
    Calendar,
    AlertCircle
  } from '@lucide/svelte';
  import { format } from 'date-fns';
  import { id } from 'date-fns/locale';
  import { cn } from '$lib/utils';
  
  import { bellStore } from '$lib/stores/bell.svelte';
  import { scheduleStore } from '$lib/stores/schedule.svelte';
  import { settingsStore } from '$lib/stores/settings.svelte';
  import { geminiService } from '$lib/services/gemini';
  
  import EmergencyBellModal from '$lib/components/EmergencyBellModal.svelte';
  import Onboarding from '$lib/components/Onboarding.svelte';

  // Local state for UI
  let selectedDay = $state('Today');
  let isEmergencyModalOpen = $state(false);
  let isOnboardingOpen = $state(false);
  let isGeneratingEmergency = $state(false);

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  const daysEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const todayId = $derived(format(bellStore.currentTime, 'EEEE', { locale: id }));
  const todayEn = $derived(format(bellStore.currentTime, 'EEEE'));
  
  const displayDayEn = $derived(selectedDay === 'Today' ? todayEn : daysEn[days.indexOf(selectedDay)]);
  
  const filteredSchedule = $derived(
    scheduleStore.items
      .filter(item => item.day === 'Everyday' || item.day === displayDayEn)
      .sort((a, b) => a.time!.localeCompare(b.time!))
  );

  const activeLesson = $derived(
    filteredSchedule.find((item, idx) => 
      isActive(item.time!, filteredSchedule[idx + 1]?.time || null)
    )
  );
  
  const nextLesson = $derived(
    filteredSchedule.find(item => {
      const isCurrentDay = selectedDay === 'Today' || selectedDay === todayId;
      return isCurrentDay && item.time! > nowStr;
    })
  );

  const nowStr = $derived(format(bellStore.currentTime, 'HH:mm'));

  function isFinished(time: string) {
    const isCurrentDay = selectedDay === 'Today' || selectedDay === todayId;
    if (!isCurrentDay) return false;
    return time < nowStr;
  }

  function isActive(itemTime: string, nextTime: string | null) {
    const isCurrentDay = selectedDay === 'Today' || selectedDay === todayId;
    if (!isCurrentDay) return false;
    return itemTime <= nowStr && (!nextTime || nextTime > nowStr);
  }

  async function handleTriggerEmergency(message: string) {
    isGeneratingEmergency = true;
    try {
      const template = settingsStore.value.emergencyTemplate || "Perhatian, {message}";
      const announcement = template.replace('{message}', message);
      await geminiService.generateAndPlay(announcement, settingsStore.value);
      isEmergencyModalOpen = false;
    } catch (error) {
      console.error('Emergency trigger failed:', error);
    } finally {
      isGeneratingEmergency = false;
    }
  }

  onMount(() => {
    const onboardingCompleted = localStorage.getItem('onboarding-completed');
    if (!onboardingCompleted) {
      isOnboardingOpen = true;
    }
  });
</script>

<div class="space-y-8 pb-12">
  <!-- Hero Section -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Left: Current Time -->
    <div 
      class="md:col-span-1 bg-[#1A1A1A] text-white rounded-[32px] p-8 flex flex-col justify-between min-h-[360px] shadow-2xl relative overflow-hidden group"
      in:fly={{ y: 20, duration: 600 }}
    >
      <div class="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
        <Clock size={140} strokeWidth={1} />
      </div>
      
      <div class="relative z-2">
        <div class="flex items-center gap-2 text-orange-400 mb-2">
          <div class="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
          <span class="text-xs font-bold uppercase tracking-widest">Current Time</span>
        </div>
        <h2 class="text-6xl font-mono font-bold tracking-tighter">
          {format(bellStore.currentTime, 'HH:mm')}
        </h2>
        <p class="text-orange-400 font-mono text-xl mt-1">
          {format(bellStore.currentTime, 'dd/MM/yyyy', { locale: id })}
        </p>
      </div>

      <div class="relative z-2">
        <p class="text-gray-400 text-sm mb-1">Sekolah Menengah Atas</p>
        <p class="text-2xl font-bold font-display">School Bell AI Dashboard</p>
      </div>
    </div>

    <!-- Right: Lesson Details -->
    <div 
      class="md:col-span-1 bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden min-h-[360px]"
      in:fly={{ y: 20, duration: 600, delay: 100 }}
    >
      {#if activeLesson || nextLesson}
        {@const displayItem = activeLesson || nextLesson}
        <div>
          <div class="flex justify-between items-start">
            <div class="space-y-4">
              <span class={cn(
                "text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full inline-block",
                activeLesson ? "bg-orange-500 text-white animate-pulse" : "bg-orange-100 text-orange-600"
              )}>
                {activeLesson ? "Sedang Berlangsung" : "Jadwal Berikutnya"}
              </span>
              <h3 class="text-4xl font-black tracking-tighter text-gray-900 leading-none font-display">
                {displayItem?.subjectNext}
              </h3>
              <div class="flex flex-wrap items-center gap-4 text-gray-500">
                <div class="flex items-center gap-2">
                  <div class="p-2 bg-gray-50 rounded-xl">
                    <Clock size={18} class="text-orange-500" />
                  </div>
                  <span class="font-mono font-bold text-xl">{displayItem?.time}</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="p-2 bg-gray-50 rounded-xl">
                    <User size={18} class="text-orange-500" />
                  </div>
                  <span class="font-bold text-lg text-gray-700">
                    {displayItem?.teacherPrefix ? `${displayItem.teacherPrefix} ` : ''}
                    {displayItem?.teacherNext}
                  </span>
                </div>
              </div>
            </div>
            <div class="bg-orange-50 p-4 rounded-[20px] shadow-inner hidden sm:block">
              <Bell size={40} class="text-orange-500" />
            </div>
          </div>

          <div class="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 shadow-sm">
                <ChevronRight size={24} />
              </div>
              <div>
                <p class="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Pelajaran Sebelumnya</p>
                <p class="font-bold text-lg text-gray-800">{displayItem?.subjectFinished || '-'}</p>
              </div>
            </div>
            <button 
              onclick={() => {
                isEmergencyModalOpen = true;
              }}
              class="bg-red-50 hover:bg-red-100 text-red-500 px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm hover:shadow-md active:scale-95 border border-red-100"
            >
              <AlertCircle size={18} /> Bel Darurat
            </button>
          </div>
        </div>
      {:else}
        <div class="h-full flex flex-col items-center justify-center text-gray-400 text-center space-y-4">
          <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
            <Calendar size={32} strokeWidth={1} class="opacity-20" />
          </div>
          <div>
            <p class="text-lg font-bold text-gray-600">Tidak ada jadwal lagi hari ini</p>
            <p class="text-sm">Semua jadwal pelajaran telah selesai dilaksanakan.</p>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Day Filter -->
  <div class="flex flex-wrap gap-2">
    {#each ['Today', ...days] as day (day)}
      <button
        onclick={() => {
          selectedDay = day;
        }}
        class={cn(
          "px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm",
          selectedDay === day 
            ? "bg-orange-500 text-white shadow-orange-200 shadow-lg scale-105" 
            : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
        )}
      >
        {day === 'Today' ? `Hari Ini (${todayId})` : day}
      </button>
    {/each}
  </div>

  <!-- Table View -->
  <div 
    class="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden"
    in:fly={{ y: 20, duration: 600, delay: 200 }}
  >
    <div class="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-2xl font-bold tracking-tight font-display">
          {selectedDay === 'Today' ? "Jadwal Hari Ini" : `Jadwal ${selectedDay}`}
        </h2>
        <p class="text-gray-400 text-sm">
          {selectedDay === 'Today' ? `${todayId}, ${format(bellStore.currentTime, 'dd MMMM yyyy', { locale: id })}` : `Melihat jadwal untuk hari ${selectedDay}`}
        </p>
      </div>
      <div class="bg-gray-50 px-4 py-2 rounded-xl text-xs font-bold text-gray-500 uppercase tracking-widest">
        {filteredSchedule.length} Total Pelajaran
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50/50 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
            <th class="px-8 py-4">Time</th>
            <th class="px-8 py-4">Type</th>
            <th class="px-8 py-4">Subject</th>
            <th class="px-8 py-4">Teacher</th>
            <th class="px-8 py-4">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          {#each filteredSchedule as item, idx (item.id)}
            {@const finished = isFinished(item.time)}
            {@const active = isActive(item.time, filteredSchedule[idx + 1]?.time || null)}
            <tr 
              class={cn(
                "transition-colors relative",
                finished ? "bg-gray-50/50 opacity-50" : "hover:bg-orange-50/30",
                active && "bg-orange-50/50 border-l-4 border-orange-500"
              )}
            >
              <td class="px-8 py-6">
                <span class={cn(
                  "font-mono font-bold text-lg px-3 py-1 rounded-lg",
                  finished ? "bg-gray-200 text-gray-500" : (active ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-500")
                )}>
                  {item.time}
                </span>
              </td>
              <td class="px-8 py-6">
                <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-1 rounded">
                  {item.type || 'Lesson'}
                </span>
              </td>
              <td class="px-8 py-6">
                <div>
                  <p class={cn("font-bold", active ? "text-orange-600" : "text-gray-800")}>{item.subjectNext}</p>
                  <p class="text-xs text-gray-400">After: {item.subjectFinished}</p>
                </div>
              </td>
              <td class="px-8 py-6 text-gray-600">
                <div class="flex items-center gap-2">
                  <User size={14} />
                  <span class="font-medium">
                    {item.teacherPrefix ? `${item.teacherPrefix} ` : ''}{item.teacherNext}
                  </span>
                </div>
              </td>
              <td class="px-8 py-6">
                {#if finished}
                  <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-1 rounded">Finished</span>
                {:else if active}
                  <span class="text-[10px] font-bold uppercase tracking-widest text-white bg-orange-500 px-2 py-1 rounded flex items-center gap-1 w-fit">
                    <div class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                    Now Active
                  </span>
                {:else}
                  <span class="text-[10px] font-bold uppercase tracking-widest text-green-500 bg-green-50 px-2 py-1 rounded">Upcoming</span>
                {/if}
              </td>
            </tr>
          {/each}
          {#if filteredSchedule.length === 0}
            <tr>
              <td colspan="5" class="px-8 py-20 text-center text-gray-400">
                <p class="font-bold text-lg mb-2">Tidak ada jadwal untuk hari ini.</p>
                <p class="text-sm">Silakan tambahkan jadwal baru di halaman Pengaturan.</p>
              </td>
            </tr>
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</div>

<EmergencyBellModal 
  isOpen={isEmergencyModalOpen}
  onClose={() => isEmergencyModalOpen = false}
  onTrigger={handleTriggerEmergency}
  isGenerating={isGeneratingEmergency}
/>

<Onboarding 
  isOpen={isOnboardingOpen}
  onClose={() => isOnboardingOpen = false}
/>
