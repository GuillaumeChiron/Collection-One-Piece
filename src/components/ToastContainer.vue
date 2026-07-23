<script setup lang="ts">
import { useToastStore } from '@/stores/toastStore'
import type { ToastType } from '@/stores/toastStore'

const toastStore = useToastStore()

const styles: Record<ToastType, string> = {
  success: 'border-gold/40 text-gold',
  error: 'border-crimson/50 text-crimson-light',
  info: 'border-ink-border text-parchment',
}
</script>

<template>
  <div class="fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="flex w-full max-w-sm items-center justify-between gap-3 rounded-lg border bg-ink-surface px-4 py-3 text-sm shadow-modal"
        :class="styles[toast.type]"
      >
        <span>{{ toast.message }}</span>
        <button
          type="button"
          @click="toastStore.dismiss(toast.id)"
          class="text-parchment-muted transition-colors hover:text-parchment"
          aria-label="Fermer"
        >
          ×
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
