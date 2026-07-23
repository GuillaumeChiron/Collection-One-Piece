<script setup lang="ts">
import type { TomeStatusFilter } from '@/composables/useTomeFilters'

const search = defineModel<string>('search', { required: true })
const status = defineModel<TomeStatusFilter>('status', { required: true })

defineProps<{
  resultCount: number
  totalCount: number
}>()

const statusOptions: { value: TomeStatusFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'owned', label: 'Possédés' },
  { value: 'missing', label: 'Manquants' },
  { value: 'reserved', label: 'Réservés' },
]
</script>

<template>
  <div class="sticky top-0 z-10 border-b border-ink-border bg-ink-surface/80 px-4 py-3 shadow-panel backdrop-blur sm:px-8">
    <div class="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="relative w-full sm:max-w-xs">
        <svg
          class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-parchment-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="search"
          type="search"
          placeholder="Rechercher un tome..."
          class="w-full rounded-full border border-ink-border bg-ink px-3 py-2 pl-9 text-sm text-parchment outline-none transition-colors focus:border-gold"
        />
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="option in statusOptions"
          :key="option.value"
          type="button"
          @click="status = option.value"
          :class="[
            'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
            status === option.value
              ? 'bg-gold text-ink'
              : 'border border-ink-border text-parchment-muted hover:border-gold-light/50 hover:text-parchment',
          ]"
        >
          {{ option.label }}
        </button>
      </div>

      <p class="text-xs text-parchment-muted sm:text-right">{{ resultCount }} / {{ totalCount }} tomes</p>
    </div>
  </div>
</template>
