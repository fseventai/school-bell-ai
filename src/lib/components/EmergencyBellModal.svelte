<script lang="ts">
  import { 
    AlertCircle, 
    X, 
    Send, 
    MessageSquare,
    AlertTriangle,
    Sparkles
  } from '@lucide/svelte';
  import { fade, fly } from 'svelte/transition';
  import { cn } from '$lib/utils';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    onTrigger: (message: string) => void;
    isGenerating: boolean;
  }

  let { isOpen, onClose, onTrigger, isGenerating }: Props = $props();
  let message = $state('');
  let textareaRef = $state<HTMLTextAreaElement | null>(null);

  $effect(() => {
    if (isOpen && textareaRef) {
      textareaRef.focus();
    }
  });

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    onTrigger(message);
    message = '';
  }
</script>

{#if isOpen}
  <div 
    class="fixed inset-0 bg-black/40 backdrop-blur-md z-100 flex items-center justify-center p-4"
    transition:fade={{ duration: 200 }}
    onclick={(e) => e.target === e.currentTarget && onClose()}
    role="presentation"
    onkeydown={e => e.key === 'Escape' && onClose()}
  >
    <div 
      class="bg-white rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden relative"
      transition:fly={{ y: 20, duration: 400 }}
      role="dialog"
      aria-modal="true"
    >
      <div class="bg-red-500 p-12 text-white relative overflow-hidden">
        <div class="absolute top-0 right-0 p-12 opacity-10 scale-150">
          <AlertTriangle size={180} strokeWidth={1} />
        </div>
        
        <button 
          onclick={onClose}
          class="absolute top-8 right-8 p-2 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <div class="relative z-10 flex flex-col items-center text-center">
          <div class="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-md">
            <AlertCircle size={40} />
          </div>
          <h2 class="text-4xl font-bold tracking-tight mb-2 font-display">Emergency Bell</h2>
          <p class="text-white/80 max-w-xs">
            Trigger an immediate announcement outside the regular schedule.
          </p>
        </div>
      </div>

      <form onsubmit={handleSubmit} class="p-12 space-y-8">
        <div class="space-y-4">
          <label class="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2" for="emergency-message">
            <MessageSquare size={14} /> Announcement Message
          </label>
          <textarea 
            bind:this={textareaRef}
            id="emergency-message"
            bind:value={message}
            placeholder="Type the message to be announced..."
            class="w-full bg-gray-50 border border-gray-200 rounded-3xl p-6 text-lg focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all min-h-[150px] resize-none"
          ></textarea>
        </div>

        <div class="flex gap-4">
          <button 
            type="button"
            onclick={onClose}
            class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-5 rounded-3xl font-bold transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={isGenerating || !message.trim()}
            class={cn(
              "flex-2 bg-red-500 hover:bg-red-600 text-white py-5 rounded-3xl font-bold transition-all shadow-xl shadow-red-200 flex items-center justify-center gap-3",
              (isGenerating || !message.trim()) && "opacity-50 cursor-not-allowed"
            )}
          >
            {#if isGenerating}
              <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Generating...
            {:else}
              <Send size={20} /> Trigger Announcement
            {/if}
          </button>
        </div>

        <div class="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          <Sparkles size={12} /> Powered by AI Voice Generation
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>
