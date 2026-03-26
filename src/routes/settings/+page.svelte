<script lang="ts">
  import { 
    Volume2, 
    Bell, 
    Music, 
    FileAudio, 
    Upload, 
    Trash2, 
    ArrowDownAz, 
    CheckCircle2, 
    PlayCircle, 
    Play,
    MessageSquare,
    Calendar,
    Sparkles,
    Timer,
    Square,
    CheckSquare,
    Plus
  } from '@lucide/svelte';
  import { dndzone, type DndEvent } from 'svelte-dnd-action';
  import { flip } from 'svelte/animate';
  import { fade, scale } from 'svelte/transition';
  import { cn } from '$lib/utils';
  import { toast } from 'svelte-french-toast';
  
  import Papa from 'papaparse';
  
  import { scheduleStore } from '$lib/stores/schedule.svelte';
  import { settingsStore } from '$lib/stores/settings.svelte';
  import { bellStore } from '$lib/stores/bell.svelte';
  import { geminiService } from '$lib/services/gemini';
  
  import ConfirmModal from '$lib/components/ConfirmModal.svelte';
  import EditScheduleModal from '$lib/components/EditScheduleModal.svelte';
  import SortableSettingsRow from '$lib/components/SortableSettingsRow.svelte';
  import SettingsSidebar from '$lib/components/SettingsSidebar.svelte';
  import type { ScheduleItem, VoiceName, ScheduleType } from '$lib/types';

  // Local state
  let activeSection = $state('schedule');
  let filterDay = $state('All');
  let selectedIds = $state<string[]>([]);
  let isBulkDeleteModalOpen = $state(false);
  let isEditModalOpen = $state(false);
  let editingItem = $state<ScheduleItem | null>(null);
  let isPreviewing = $state<string | null>(null);

  let fileInput = $state<HTMLInputElement>();
  let importOverwriteInput = $state<HTMLInputElement>();
  let audioInput = $state<HTMLInputElement>();

  const filterDays = [
    { id: 'All', label: 'Semua' },
    { id: 'Everyday', label: 'Setiap Hari' },
    { id: 'Monday', label: 'Senin' },
    { id: 'Tuesday', label: 'Selasa' },
    { id: 'Wednesday', label: 'Rabu' },
    { id: 'Thursday', label: 'Kamis' },
    { id: 'Friday', label: 'Jumat' },
    { id: 'Saturday', label: 'Sabtu' },
    { id: 'Sunday', label: 'Minggu' },
  ];

  const filteredItems = $derived(
    filterDay === 'All' 
      ? scheduleStore.items 
      : scheduleStore.items.filter(item => item.day === filterDay)
  );

  // DnD Handlers
  const flipDurationMs = 300;
  function handleDndConsider(e: CustomEvent<DndEvent<ScheduleItem>>) {
    // We only allow DnD when filter is 'All' to avoid logic complexity
    if (filterDay !== 'All') return;
    scheduleStore.items = e.detail.items;
  }

  function handleDndFinalize(e: CustomEvent<DndEvent<ScheduleItem>>) {
    if (filterDay !== 'All') return;
    scheduleStore.items = e.detail.items;
  }

  // Actions
  function toggleSelect(id: string) {
    if (selectedIds.includes(id)) {
      selectedIds = selectedIds.filter(i => i !== id);
    } else {
      selectedIds = [...selectedIds, id];
    }
  }

  function toggleSelectAll() {
    if (selectedIds.length === filteredItems.length) {
      selectedIds = [];
    } else {
      selectedIds = filteredItems.map(i => i.id);
    }
  }

  function handleBulkDelete() {
    scheduleStore.items = scheduleStore.items.filter(item => !selectedIds.includes(item.id));
    selectedIds = [];
    toast.success('Jadwal terpilih berhasil dihapus');
  }

  async function handlePreviewVoice(voice: string) {
    isPreviewing = voice;
    try {
      await geminiService.generateAndPlay("Halo, ini adalah contoh suara saya untuk pengumuman sekolah.", settingsStore.value);
    } catch {
      toast.error('Gagal memutar preview suara');
    } finally {
      isPreviewing = null;
    }
  }

  function handleCustomAudioUpload(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result?.toString();
      if (result) {
        const [header, base64] = result.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] || 'audio/mp3';
        
        settingsStore.update({
          customAudioBase64: base64,
          customAudioName: file.name,
          customAudioMimeType: mimeType,
          useCustomAudio: true
        });
        toast.success(`Audio kustom "${file.name}" berhasil diunggah`);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleFileUpload(e: Event, append: boolean) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const newItems: ScheduleItem[] = (results.data as Record<string, string>[]).map((row) => ({
          id: Math.random().toString(36).substr(2, 9),
          time: row.Waktu || row.time || '07:00',
          subjectFinished: row.Selesai || row.subjectFinished || '-',
          subjectNext: row.Lanjut || row.subjectNext || '-',
          teacherNext: row.Guru || row.teacherNext || '-',
          teacherPrefix: row.Prefix || row.teacherPrefix || '',
          day: row.Hari || row.day || 'Everyday',
          type: (row.Tipe || row.type || 'Lesson') as ScheduleType
        }));

        if (append) {
          scheduleStore.addItems(newItems);
          toast.success(`${newItems.length} jadwal berhasil ditambahkan`);
        } else {
          scheduleStore.items = newItems;
          toast.success(`${newItems.length} jadwal berhasil dimuat (menimpa yang lama)`);
        }
      },
      error: (err) => {
        toast.error('Gagal membaca file CSV: ' + err.message);
      }
    });
  }

  function handleExportSchedule() {
    const csv = Papa.unparse(scheduleStore.items.map(item => ({
      Waktu: item.time,
      Selesai: item.subjectFinished,
      Lanjut: item.subjectNext,
      Guru: item.teacherNext,
      Prefix: item.teacherPrefix,
      Hari: item.day,
      Tipe: item.type
    })));

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `jadwal-sekolah-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Jadwal berhasil diekspor');
  }

  function handleEditItem(item: ScheduleItem) {
    editingItem = item;
    isEditModalOpen = true;
  }

  function handleRemoveItem(id: string) {
    scheduleStore.removeItem(id);
    toast.success('Jadwal berhasil dihapus');
  }
</script>

<div class="flex flex-col lg:flex-row gap-8 pb-20">
  <SettingsSidebar {activeSection} onSectionChange={(s) => activeSection = s} />

  <div class="flex-1 space-y-8">
    {#if activeSection === 'schedule'}
      <!-- Schedule Management -->
      <section class="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-8" in:fade>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold flex items-center gap-2 font-display">
            <Calendar size={20} class="text-blue-500" /> Schedule Management
          </h2>
          <div class="flex gap-2">
            {#if scheduleStore.items.length > 0}
              <button 
                onclick={() => scheduleStore.sortByTime()}
                class="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"
                title="Urutkan Waktu"
              >
                <ArrowDownAz size={20} />
              </button>
              <button 
                onclick={() => scheduleStore.loadDummy()}
                class="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                title="Dummy Data"
              >
                <Sparkles size={20} />
              </button>
              <button 
                onclick={() => scheduleStore.generateRandom()}
                class="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-xl transition-all"
                title="Random Data"
              >
                <Timer size={20} />
              </button>
              <button 
                onclick={() => scheduleStore.clearAll()}
                class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Hapus Semua"
              >
                <Trash2 size={20} />
              </button>
            {/if}
          </div>
        </div>

        <div class="flex flex-wrap gap-3">
          <button 
            onclick={() => fileInput?.click()}
            class="flex-1 min-w-[140px] bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <Plus size={18} /> Tambah Jadwal
          </button>
          <button 
            onclick={() => importOverwriteInput?.click()}
            class="flex-1 min-w-[140px] bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <Upload size={18} /> Timpa Jadwal
          </button>
          <button 
            onclick={handleExportSchedule}
            class="flex-1 min-w-[140px] bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-100 active:scale-95"
          >
            <FileAudio size={18} /> Ekspor CSV
          </button>
        </div>

        <input bind:this={fileInput} type="file" accept=".csv" onchange={e => handleFileUpload(e, true)} class="hidden" />
        <input bind:this={importOverwriteInput} type="file" accept=".csv" onchange={e => handleFileUpload(e, false)} class="hidden" />

        <!-- Day Filter -->
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex-1 flex flex-wrap gap-2 p-1 bg-gray-50 rounded-2xl  overflow-x-auto no-scrollbar">
            {#each filterDays as day (day.id)}
              <button
                onclick={() => filterDay = day.id}
                class={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap focus:outline-none",
                  filterDay === day.id 
                    ? "bg-white text-orange-500 shadow-sm " 
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                {day.label}
              </button>
            {/each}
          </div>
          
          {#if selectedIds.length > 0}
            <button
              onclick={() => isBulkDeleteModalOpen = true}
              class="px-4 py-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-red-100"
              transition:scale
            >
              <Trash2 size={14} />
              Hapus Terpilih ({selectedIds.length})
            </button>
          {/if}
        </div>

        <!-- Schedule List -->
        {#if filteredItems.length > 0}
          <div class="bg-white border border-gray-50 rounded-2xl overflow-hidden">
            <div class="hidden md:flex bg-gray-50/50 text-[10px] font-bold uppercase tracking-wider text-gray-400 px-6 py-4">
              <div class="w-8">
                <button onclick={toggleSelectAll} class="hover:text-orange-500 transition-colors">
                  {#if selectedIds.length === filteredItems.length && filteredItems.length > 0}
                    <CheckSquare size={18} class="text-orange-500" />
                  {:else}
                    <Square size={18} />
                  {/if}
                </button>
              </div>
              <div class="w-8 ml-4"></div>
              <div class="w-24 ml-4">Time</div>
              <div class="w-32 ml-4">Type</div>
              <div class="w-24 ml-4">Day</div>
              <div class="flex-1 ml-4">Subject</div>
              <div class="w-24 text-right">Actions</div>
            </div>

            <div 
              use:dndzone={{ items: filteredItems, flipDurationMs, dragDisabled: filterDay !== 'All' }}
              onconsider={handleDndConsider}
              onfinalize={handleDndFinalize}
              class="min-h-[100px]"
            >
              {#each filteredItems as item (item.id)}
                <div animate:flip={{ duration: flipDurationMs }}>
                  <SortableSettingsRow 
                    {item}
                    isSelected={selectedIds.includes(item.id)}
                    onToggleSelect={() => toggleSelect(item.id)}
                    onEdit={handleEditItem}
                    onRemove={handleRemoveItem}
                  />
                </div>
              {/each}
            </div>
          </div>
        {:else}
          <div class="py-20 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200" transition:fade>
            <Calendar size={48} class="mx-auto mb-4 opacity-20" />
            <p class="font-bold text-lg mb-2">Jadwal Kosong</p>
            <p class="text-sm mb-6">
              {filterDay === 'All' 
                ? "Silakan tambahkan jadwal baru atau muat data simulasi." 
                : `Tidak ada jadwal untuk hari ${filterDays.find(d => d.id === filterDay)?.label}.`}
            </p>
          </div>
        {/if}
      </section>
    {:else if activeSection === 'audio'}
      <div class="space-y-8" in:fade>
        <!-- Audio & AI Settings -->
        <section class="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-8">
          <h2 class="text-xl font-bold flex items-center gap-2 font-display">
            <Volume2 size={20} class="text-orange-500" /> Audio & AI Voice
          </h2>

          <div class="space-y-6">
            <div class="flex p-1 bg-gray-100 rounded-2xl">
              <button
                onclick={() => settingsStore.update({ useCustomAudio: false })}
                class={cn(
                  "flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                  !settingsStore.value.useCustomAudio ? "bg-white shadow-sm text-orange-500" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Bell size={14} /> AI Voice
              </button>
              <button
                onclick={() => settingsStore.update({ useCustomAudio: true })}
                class={cn(
                  "flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                  settingsStore.value.useCustomAudio ? "bg-white shadow-sm text-orange-500" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Music size={14} /> Custom Audio
              </button>
            </div>

            <div class="space-y-4">
              <label class="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2" for="volume-slider">
                Volume Level
              </label>
              <input 
                id="volume-slider"
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                bind:value={settingsStore.value.volume}
                class="w-full accent-orange-500"
              />
              <div class="flex justify-between text-[10px] font-mono text-gray-400">
                <span>MIN</span>
                <span>{Math.round(settingsStore.value.volume * 100)}%</span>
                <span>MAX</span>
              </div>
            </div>



            {#if !settingsStore.value.useCustomAudio}
              <div class="space-y-4">
                <span class="text-xs font-bold uppercase tracking-wider text-gray-400 block">Select AI Voice</span>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {#each ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'] as voice (voice)}
                    <div class="flex gap-2">
                      <button
                        onclick={() => settingsStore.update({ voiceName: voice as VoiceName })}
                        class={cn(
                          "flex-1 px-4 py-3 rounded-xl text-sm font-medium border transition-all text-left flex justify-between items-center",
                          settingsStore.value.voiceName === voice 
                            ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200" 
                            : "bg-white border-gray-200 text-gray-600 hover:border-orange-200"
                        )}
                      >
                        {voice}
                        {#if settingsStore.value.voiceName === voice}
                          <CheckCircle2 size={16} />
                        {/if}
                      </button>
                      <button
                        onclick={() => handlePreviewVoice(voice)}
                        disabled={isPreviewing !== null}
                        class={cn(
                          "p-3 rounded-xl border border-gray-200 hover:bg-orange-50 hover:text-orange-500 transition-colors disabled:opacity-50",
                          isPreviewing === voice && "animate-pulse text-orange-500 bg-orange-50 border-orange-500"
                        )}
                        title="Preview Voice"
                      >
                        <PlayCircle size={20} />
                      </button>
                    </div>
                  {/each}
                </div>
              </div>
            {:else}
              <div class="space-y-4">
                <label class="text-xs font-bold uppercase tracking-wider text-gray-400" for="custom-audio-upload">Upload Custom Audio</label>
                <div 
                  onclick={() => audioInput?.click()}
                  onkeydown={e => e.key === 'Enter' && audioInput?.click()}
                  role="button"
                  tabindex="0"
                  class="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-all group"
                >
                  <div class="bg-gray-50 p-4 rounded-full mb-3 group-hover:bg-orange-100 transition-colors">
                    <FileAudio size={32} class="text-gray-400 group-hover:text-orange-500" />
                  </div>
                  {#if settingsStore.value.customAudioName}
                    <div class="text-center">
                      <p class="text-sm font-bold text-orange-500">{settingsStore.value.customAudioName}</p>
                      <p class="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Click to change file</p>
                    </div>
                  {:else}
                    <p class="text-sm font-medium text-gray-400">Click to upload MP3/WAV</p>
                  {/if}
                  <input 
                    id="custom-audio-upload"
                    bind:this={audioInput}
                    type="file" 
                    accept="audio/*" 
                    onchange={handleCustomAudioUpload}
                    class="hidden" 
                  />
                </div>
              </div>
            {/if}
          </div>
        </section>

        <section class="bg-orange-50 rounded-[32px] p-8 border border-orange-100 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500">
              <Bell size={24} />
            </div>
            <div>
              <h3 class="font-bold text-orange-900">Test Bell Sound</h3>
              <p class="text-orange-700 text-sm opacity-80">Play a sample bell to check volume and voice.</p>
            </div>
          </div>
          <button 
            onclick={() => {
              bellStore.testBell(settingsStore.value);
            }}
            class="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-orange-200 transition-all flex items-center gap-2"
          >
            <Play size={18} /> Run Test
          </button>
        </section>
      </div>
    {:else if activeSection === 'templates'}
      <section class="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-6" in:fade>
        <h2 class="text-xl font-bold flex items-center gap-2 font-display">
          <MessageSquare size={20} class="text-orange-500" /> Templates
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2" for="announcement-tpl">
              Default Announcement
            </label>
            <textarea 
              id="announcement-tpl"
              bind:value={settingsStore.value.announcementTemplate}
              class="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all min-h-[100px]"
              placeholder={"Use {subjectFinished}, {subjectNext}, {teacherNext}"}
            ></textarea>
            <p class="text-[10px] text-gray-400 italic">Available: {"{subjectFinished}, {subjectNext}, {teacherNext}"}</p>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold uppercase tracking-wider text-gray-400" for="start-school-tpl">Awal Masuk Sekolah</label>
            <textarea id="start-school-tpl" bind:value={settingsStore.value.startLessonTemplate} class="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all min-h-[100px]"></textarea>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold uppercase tracking-wider text-gray-400" for="break-tpl">Istirahat</label>
            <textarea id="break-tpl" bind:value={settingsStore.value.breakTimeTemplate} class="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all min-h-[100px]"></textarea>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold uppercase tracking-wider text-gray-400" for="prayer-tpl">Waktu Sholat</label>
            <textarea id="prayer-tpl" bind:value={settingsStore.value.prayerTimeTemplate} class="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all min-h-[100px]"></textarea>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold uppercase tracking-wider text-gray-400" for="end-school-tpl">Pulang Sekolah</label>
            <textarea id="end-school-tpl" bind:value={settingsStore.value.endSchoolTemplate} class="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all min-h-[100px]"></textarea>
          </div>
        </div>
      </section>
    {/if}
  </div>
</div>

<ConfirmModal 
  isOpen={isBulkDeleteModalOpen}
  onClose={() => isBulkDeleteModalOpen = false}
  onConfirm={handleBulkDelete}
  title="Hapus Jadwal Terpilih?"
  message={`Apakah Anda yakin ingin menghapus ${selectedIds.length} jadwal yang dipilih? Tindakan ini tidak dapat dibatalkan.`}
  confirmText="Ya, Hapus Semua"
  cancelText="Batal"
  variant="danger"
/>

<EditScheduleModal 
  isOpen={isEditModalOpen}
  onClose={() => isEditModalOpen = false}
  item={editingItem}
/>
