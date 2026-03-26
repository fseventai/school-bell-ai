<script lang="ts">
  import { 
    Calendar, 
    Volume2, 
    MessageSquare, 
    ChevronRight,
    ChevronLeft,
    Settings,
  } from '@lucide/svelte';
  import { cn } from '$lib/utils';

  interface Props {
    activeSection: string;
    onSectionChange: (section: string) => void;
  }

  let { activeSection, onSectionChange }: Props = $props();

  let isCollapsed = $state(false);

  const menuItems = [
    { 
      id: 'schedule', 
      label: 'Jadwal', 
      icon: Calendar, 
      description: 'Kelola jadwal bel sekolah',
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    { 
      id: 'audio', 
      label: 'Suara & AI', 
      icon: Volume2, 
      description: 'Pengaturan volume & suara AI',
      color: 'text-orange-500',
      bg: 'bg-orange-50'
    },
    { 
      id: 'templates', 
      label: 'Templat', 
      icon: MessageSquare, 
      description: 'Kustomisasi pesan pengumuman',
      color: 'text-purple-500',
      bg: 'bg-purple-50'
    }
  ];

  function handleSectionClick(id: string) {
    onSectionChange(id);
  }
</script>

<aside class={cn("w-full transition-all duration-300 ease-in-out shrink-0", isCollapsed ? "lg:w-24" : "lg:w-80", "space-y-6")}>
  <div class={cn("bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden transition-all duration-300", isCollapsed ? "p-4" : "p-6")}>
    <div class="flex items-center justify-between lg:px-2 mb-8 h-10 relative">
      <div class={cn("flex items-center gap-3 transition-opacity duration-300", isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-full")}>
        <div class="w-10 h-10 shrink-0 bg-gray-900 rounded-xl flex items-center justify-center text-white">
          <Settings size={20} />
        </div>
        <div class="whitespace-nowrap">
          <h2 class="font-bold text-gray-900 font-display">Pengaturan</h2>
          <p class="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Control Panel</p>
        </div>
      </div>

      <button
        onclick={() => {
          isCollapsed = !isCollapsed;
        }}
        class={cn(
          "hidden lg:flex shrink-0 items-center justify-center w-10 h-10 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all",
          isCollapsed ? "absolute left-1/2 -translate-x-1/2 bg-gray-50 text-gray-600 border border-gray-100" : "bg-transparent"
        )}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        <ChevronLeft size={20} class={cn("transition-transform duration-300", isCollapsed && "rotate-180")} />
      </button>
    </div>

    <nav class="space-y-2">
      {#each menuItems as item (item.id)}
        <button
          onclick={() => handleSectionClick(item.id)}
          class={cn(
            "w-full flex items-center rounded-2xl transition-all group relative overflow-hidden",
            activeSection === item.id 
              ? "bg-gray-50" 
              : "hover:bg-gray-50/50",
            isCollapsed ? "gap-0 p-3 justify-center" : "gap-4 p-4"
          )}
          title={isCollapsed ? item.label : undefined}
        >
          {#if activeSection === item.id}
            <div class={cn("absolute left-0 top-0 bottom-0 w-1", item.color.replace('text-', 'bg-'))}></div>
          {/if}
          
          <div class={cn(
            "w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-all",
            activeSection === item.id ? item.bg : "bg-gray-50 text-gray-400 group-hover:bg-white"
          )}>
            <item.icon size={20} class={activeSection === item.id ? item.color : "group-hover:text-gray-600"} />
          </div>

          <div class={cn("text-left transition-all duration-300 whitespace-nowrap overflow-hidden flex-1", isCollapsed ? "opacity-0 w-0" : "opacity-100")}>
            <h3 class={cn(
              "text-sm font-bold transition-colors",
              activeSection === item.id ? "text-gray-900" : "text-gray-500 group-hover:text-gray-700"
            )}>
              {item.label}
            </h3>
            <p class="text-[10px] text-gray-400 line-clamp-1">{item.description}</p>
          </div>

          {#if !isCollapsed}
            <ChevronRight 
              size={16} 
              class={cn(
                "transition-all shrink-0",
                activeSection === item.id ? "text-gray-400 translate-x-1" : "text-gray-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
              )} 
            />
          {/if}
        </button>
      {/each}
    </nav>
  </div> 
</aside>
