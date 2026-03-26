<script lang="ts">
  import { X, AlertTriangle } from '@lucide/svelte';
  import { fade, scale } from 'svelte/transition';
  import { cn } from '$lib/utils';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
  }

  let { 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = 'Confirm', 
    cancelText = 'Cancel', 
    variant = 'danger' 
  }: Props = $props();

  const variantColors = {
    danger: 'bg-red-500 hover:bg-red-600 shadow-red-100',
    warning: 'bg-orange-500 hover:bg-orange-600 shadow-orange-100',
    info: 'bg-blue-500 hover:bg-blue-600 shadow-blue-100'
  };

  const iconColors = {
    danger: 'text-red-500 bg-red-50',
    warning: 'text-orange-500 bg-orange-50',
    info: 'text-blue-500 bg-blue-50'
  };
</script>

{#if isOpen}
  <div 
    class="fixed inset-0 bg-black/40 backdrop-blur-sm z-110 flex items-center justify-center p-4"
    transition:fade={{ duration: 200 }}
    onclick={(e) => e.target === e.currentTarget && onClose()}
    role="presentation"
    onkeydown={e => e.key === 'Escape' && onClose()}
  >
    <div 
      class="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden p-8 relative"
      transition:scale={{ duration: 300, start: 0.95 }}
      role="dialog"
      aria-modal="true"
    >
      <button
        onclick={onClose}
        class="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
        aria-label="Close"
      >
        <X size={20} />
      </button>

      <div class="flex flex-col items-center text-center space-y-6">
        <div class={cn("w-16 h-16 rounded-2xl flex items-center justify-center", iconColors[variant])}>
          <AlertTriangle size={32} />
        </div>

        <div class="space-y-2">
          <h2 class="text-2xl font-bold text-gray-900">{title}</h2>
          <p class="text-gray-500">{message}</p>
        </div>

        <div class="flex gap-3 w-full pt-4">
          <button
            onclick={onClose}
            class="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-all"
          >
            {cancelText}
          </button>
          <button
            onclick={() => {
              onConfirm();
              onClose();
            }}
            class={cn("flex-2 px-6 py-4 text-white rounded-2xl font-bold transition-all shadow-lg", variantColors[variant])}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
