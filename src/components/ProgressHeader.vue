<script setup lang="ts">
import { useCollectionStore } from '@/stores/collectionStore'

const collectionStore = useCollectionStore()
</script>

<template>
  <header class="border-b border-ink-border bg-ink-surface/60 px-4 py-8 text-center sm:px-8">
    <h1 class="font-display text-4xl tracking-wide text-gold sm:text-5xl">Ma collection One Piece</h1>
    <p class="mt-3 text-sm text-parchment-muted sm:text-base">
      {{ collectionStore.possedeCount }} / {{ collectionStore.totalCount }} tomes
      <span class="font-semibold text-gold">({{ collectionStore.progress }}%)</span>
    </p>
    <div class="mx-auto mt-4 h-3 w-full max-w-xl overflow-hidden rounded-full bg-ink-border">
      <div
        class="h-full rounded-full bg-linear-to-r from-crimson to-gold transition-all duration-500"
        :style="{ width: `${collectionStore.progress}%` }"
      ></div>
    </div>
  </header>
</template>
