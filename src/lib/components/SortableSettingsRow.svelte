<script lang="ts">
  import {   Settings, Trash2, Square, CheckSquare, GripVertical } from '@lucide/svelte';
  import { cn } from '$lib/utils';
  import type { ScheduleItem } from '$lib/types';

  interface Props {
    item: ScheduleItem;
    isSelected: boolean;
    onToggleSelect: () => void;
    onEdit: (item: ScheduleItem) => void;
    onRemove: (id: string) => void;
  }

  let { item, isSelected, onToggleSelect, onEdit, onRemove }: Props = $props();

  const dayMap: Record<string, string> = {
    'Monday': 'Senin',
    'Tuesday': 'Selasa',
    'Wednesday': 'Rabu',
    'Thursday': 'Kamis',
    'Friday': 'Jumat',
    'Saturday': 'Sabtu',
    'Sunday': 'Minggu',
    'Everyday': 'Setiap Hari'
  };
</script>

<div
  class={cn(
    "flex items-center gap-4 px-6 py-4 transition-all group border-b border-gray-50",
    isSelected ? "bg-orange-50/50" : "hover:bg-gray-50/50 bg-white"
  )}
>
  <!-- Selection -->
  <div class="w-8 shrink-0">
    <button 
      onclick={onToggleSelect}
      class="text-gray-300 hover:text-orange-500 transition-colors"
      aria-label={isSelected ? "Unselect" : "Select"}
    >
      {#if isSelected}
        <CheckSquare size={18} class="text-orange-500" />
      {:else}
        <Square size={18} />
      {/if}
    </button>
  </div>

  <!-- Drag Handle -->
  <div class="w-8 shrink-0 text-gray-300 group-hover:text-gray-400 cursor-grab active:cursor-grabbing">
    <GripVertical size={18} />
  </div>

  <!-- Time -->
  <div class="w-24 shrink-0">
    <span class="font-mono font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-lg text-sm">
      {item.time}
    </span>
  </div>

  <!-- Type -->
  <div class="w-32 shrink-0 hidden md:block">
    <span class="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded uppercase tracking-widest whitespace-nowrap">
      {item.type || 'Lesson'}
    </span>
  </div>

  <!-- Day -->
  <div class="w-24 shrink-0 hidden sm:block">
    <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">
      {dayMap[item.day] || item.day}
    </span>
  </div>

  <!-- Subject & Teacher -->
  <div class="flex-1 min-w-0">
    <p class="text-sm font-bold text-gray-700 truncate">{item.subjectNext}</p>
    <p class="text-[10px] text-gray-400 truncate">
      {item.teacherPrefix ? `${item.teacherPrefix} ` : ''}{item.teacherNext}
    </p>
  </div>

  <!-- Actions -->
  <div class="w-24 shrink-0 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
    <button 
      onclick={() => onEdit(item)}
      class="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
      aria-label="Edit"
    >
      <Settings size={16} />
    </button>
    <button 
      onclick={() => onRemove(item.id)}
      class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
      aria-label="Delete"
    >
      <Trash2 size={16} />
    </button>
  </div>
</div>
