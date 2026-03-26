<script lang="ts">
  import { 
    X, 
    Sparkles, 
    Upload, 
    Settings, 
    CheckCircle2,
    ChevronLeft,
    ChevronRight 
  } from '@lucide/svelte';
  import { fade, scale, fly } from 'svelte/transition';
  import { cn } from '$lib/utils';
  import { browser } from '$app/environment';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
  }

  let { isOpen, onClose }: Props = $props();
  let onboardingStep = $state(0);

  function completeOnboarding() {
    if (browser) {
      localStorage.setItem('onboarding-completed', 'true');
    }
    onClose();
  }

  const steps = [
    {
      id: 'welcome',
      icon: Sparkles,
      iconColor: 'bg-orange-100 text-orange-500',
      title: 'Selamat Datang di Bell Sekolah AI!',
      description: 'Sistem manajemen bell sekolah otomatis yang didukung oleh teknologi AI untuk pengumuman yang lebih personal dan profesional.'
    },
    {
      id: 'upload',
      icon: Upload,
      iconColor: 'bg-blue-100 text-blue-500',
      title: 'Upload Jadwal Anda',
      description: 'Siapkan file CSV dengan kolom: Waktu, Selesai, Lanjut, Guru, Hari. Cukup seret dan lepaskan file ke area upload untuk memulai.'
    },
    {
      id: 'customize',
      icon: Settings,
      iconColor: 'bg-purple-100 text-purple-500',
      title: 'Kustomisasi Bell',
      description: 'Pilih berbagai suara AI yang tersedia atau gunakan file audio kustom Anda sendiri melalui menu pengaturan di pojok kanan atas.'
    },
    {
      id: 'ready',
      icon: CheckCircle2,
      iconColor: 'bg-green-100 text-green-500',
      title: 'Siap Digunakan!',
      description: 'Sistem akan memantau waktu secara otomatis. Pastikan tab ini tetap terbuka dan volume perangkat Anda aktif.'
    }
  ];
</script>

{#if isOpen}
  <div 
    class="fixed inset-0 bg-black/40 backdrop-blur-md z-100 flex items-center justify-center p-4"
    transition:fade={{ duration: 200 }}
  >
    <div 
      class="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden relative"
      transition:scale={{ duration: 400, start: 0.9 }}
    >
      <button 
        onclick={completeOnboarding}
        class="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
        aria-label="Skip Onboarding"
      >
        <X size={20} />
      </button>

      <div class="p-8 sm:p-12">
        <div class="relative min-h-[250px]">
          {#each steps as step, i (step.id)}
            {#if onboardingStep === i}
              <div 
                class="space-y-6"
                in:fly={{ x: 20, duration: 400, delay: 100 }}
                out:fly={{ x: -20, duration: 400 }}
              >
                <div class={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8", step.iconColor)}>
                  <step.icon size={32} />
                </div>
                <h2 class="text-3xl font-bold tracking-tight font-display">{step.title}</h2>
                <p class="text-gray-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            {/if}
          {/each}
        </div>

        <div class="mt-12 flex items-center justify-between">
          <div class="flex gap-1.5">
            {#each steps as step, i (step.id)}
              <div 
                class={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  onboardingStep === i ? "w-8 bg-orange-500" : "w-1.5 bg-gray-200"
                )}
              ></div>
            {/each}
          </div>

          <div class="flex gap-3">
            {#if onboardingStep > 0}
              <button 
                onclick={() => onboardingStep--}
                class="p-3 border border-gray-200 hover:bg-gray-50 rounded-2xl transition-colors text-gray-600"
                aria-label="Previous Step"
              >
                <ChevronLeft size={20} />
              </button>
            {/if}
            
            {#if onboardingStep < steps.length - 1}
              <button 
                onclick={() => onboardingStep++}
                class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-200"
              >
                Lanjut <ChevronRight size={18} />
              </button>
            {:else}
              <button 
                onclick={completeOnboarding}
                class="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-orange-200"
              >
                Mulai Sekarang
              </button>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
