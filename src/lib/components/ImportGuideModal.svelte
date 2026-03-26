<script lang="ts">
  import { X, Download, Info } from '@lucide/svelte';
  import { fade, scale } from 'svelte/transition';
  import { resolve } from '$app/paths';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
  }

  let { 
    isOpen, 
    onClose, 
  }: Props = $props();
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
      class="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden p-8 relative"
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

      <div class="flex flex-col space-y-6">
        <div class="flex items-center gap-4 border-b border-gray-100 pb-4">
          <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
            <Info size={24} />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900 font-display">Panduan Import Jadwal</h2>
            <p class="text-sm text-gray-500">Instruksi format file Excel & CSV</p>
          </div>
        </div>

        <div class="space-y-4 text-gray-600 text-sm leading-relaxed">
          <p>
            Silakan download template <strong>Excel (.xlsx)</strong> berikut. Setelah data Excel diisi dan disesuaikan, <strong>Anda wajib menyimpannya menggunakan menu (Save As) ke format CSV (Comma delimited)</strong> sebelum melakukan proses import ke sistem.
          </p>
          <div class="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
            <p class="text-blue-800 text-xs font-semibold">
              💡 Sistem hanya menerima file berekstensi <span class="bg-white px-1.5 py-0.5 rounded border border-blue-200">.csv</span> dengan header kolom yang sesuai dengan template.
            </p>
          </div>
        </div>

        <div class="pt-4 flex flex-col sm:flex-row gap-3">
          <button
            onclick={onClose}
            class="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-all order-2 sm:order-1"
          >
            Tutup
          </button>
          <a  
            href={resolve('/template-jadwal.xlsx')}
            download
            onclick={onClose}
            class="flex-2 flex items-center justify-center gap-2 px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-100 order-1 sm:order-2 active:scale-95"
          >
            <Download size={18} /> Download Template
          </a>
        </div>
      </div>
    </div>
  </div>
{/if}
