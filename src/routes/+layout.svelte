<script lang="ts">
  import '../app.css'; 
  import { page } from '$app/state';
  import { resolve } from '$app/paths';
  import { format } from 'date-fns';
  import { id } from 'date-fns/locale'; 
  import { 
    Bell, 
    Settings, 
    LayoutDashboard, 
  } from '@lucide/svelte';
  import { Toaster } from 'svelte-french-toast';
  import { cn } from '$lib/utils';
  import { bellStore } from '$lib/stores/bell.svelte';
  import { scheduleStore } from '$lib/stores/schedule.svelte';
  import { fade } from 'svelte/transition'; 
  import { untrack } from 'svelte';

  let { children, data } = $props();

  const currentTime = $derived(bellStore.currentTime);
  const isBellUpcoming = $derived(bellStore.isBellUpcoming);
  const isGenerating = $derived(bellStore.isGenerating);
  const activeRoute = $derived(page.url.pathname);



  $effect(() => {
    const interval = setInterval(() => {
      bellStore.updateTime();
    }, 1000);
    return () => clearInterval(interval);
  });

  // Sync server data to client store
  $effect.pre(() => {
    if (data.schedules) {
      untrack(() => {
        scheduleStore.items = data.schedules;
      });
    }
  });
</script>

<Toaster position="top-right" />

<div class="min-h-screen flex flex-col">
  <!-- Header -->
  <header class="bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center sticky top-0 z-50 shadow-sm">
    <div class="flex items-center gap-4">
      <div 
        class={cn(
          "p-3 rounded-2xl text-white transition-all duration-500",
          isBellUpcoming || isGenerating ? "bg-orange-500 shadow-lg shadow-orange-200 scale-110 animate-pulse" : "bg-gray-800"
        )}
      >
        <Bell size={28} />
      </div>
      <div>
        <h1 class="text-2xl font-bold tracking-tight font-display">Bell Sekolah AI</h1>
        <p class="text-xs text-gray-400 font-mono uppercase tracking-widest">Intelligent Schedule Manager</p>
      </div>
    </div>

    <div class="flex items-center gap-6">
      <div class="text-right hidden sm:block">
        <p class="text-2xl font-mono font-medium leading-none">
          {format(currentTime, 'HH.mm.ss')}
        </p>
        <p class="text-xs text-gray-500 font-medium mt-1">
          {format(currentTime, 'dd/MM/yyyy', { locale: id })}
        </p>
      </div>
      
      <div class="h-10 w-px bg-gray-100"></div>

      <nav class="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl">
        <a 
          href={resolve('/')}
          class={cn(
            "px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all focus:outline-none",
            activeRoute === '/' ? "bg-white shadow-sm text-orange-500" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <LayoutDashboard size={18} /> Dashboard
          </a>
        <a  
          href={resolve('/settings')}
          class={cn(
            "px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all focus:outline-none",
            activeRoute === '/settings' ? "bg-white shadow-sm text-orange-500" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Settings size={18} /> Settings
          </a>
      </nav>
    </div>
  </header>

  <main class="flex-1 max-w-7xl mx-auto w-full p-8" in:fade={{ duration: 300 }}>
    {@render children()}
  </main>
</div>

<style>
  :global(.animate-pulse) {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .7; }
  }
</style>
