<script setup lang="ts">
import { computed } from 'vue'
import { useTransition, TransitionPresets } from '@vueuse/core'
import { useCollectionStore } from '@/stores/collectionStore'
import { useReservationStore } from '@/stores/reservationStore'

const collectionStore = useCollectionStore()
const reservationStore = useReservationStore()

const animatedPossede = useTransition(
  computed(() => collectionStore.possedeCount),
  {
    duration: 700,
    transition: TransitionPresets.easeOutCubic,
  },
)

const manquants = computed(() => collectionStore.totalCount - collectionStore.possedeCount)
const reserves = computed(
  () =>
    reservationStore.reservations.filter((r) => {
      const tome = collectionStore.tomes.find((t) => t.id === r.tome_id)
      return tome && !tome.possede
    }).length,
)
</script>

<template>
  <header
    class="header-hairline border-b border-ink-border bg-ink-surface/60 px-4 py-8 text-center shadow-panel sm:px-8"
  >
    <h1 class="font-display text-4xl tracking-wide text-gold sm:text-5xl">One Piece</h1>
    <p class="mt-3 text-sm text-parchment-muted sm:text-base">
      {{ Math.round(animatedPossede) }} / {{ collectionStore.totalCount }} tomes
      <span class="font-semibold text-gold">({{ collectionStore.progress }}%)</span>
    </p>
    <div
      class="mx-auto mt-4 h-3 w-full max-w-xl overflow-hidden rounded-full bg-ink-border shadow-glow-gold"
    >
      <div
        class="progress-bar relative h-full overflow-hidden rounded-full bg-linear-to-r from-crimson to-gold transition-all duration-500"
        :style="{ width: `${collectionStore.progress}%` }"
      >
        <span class="shimmer absolute inset-y-0 w-1/3"></span>
      </div>
    </div>
    <div class="mx-auto mt-4 flex max-w-xl flex-wrap justify-center gap-2">
      <span class="rounded-full border border-ink-border px-3 py-1 text-xs text-parchment-muted">
        {{ manquants }} manquant{{ manquants > 1 ? 's' : '' }}
      </span>
      <span
        v-if="reserves > 0"
        class="rounded-full border border-crimson/40 bg-crimson/10 px-3 py-1 text-xs text-crimson-light"
      >
        {{ reserves }} réservé{{ reserves > 1 ? 's' : '' }}
      </span>
    </div>
  </header>
</template>

<style scoped>
.header-hairline {
  position: relative;
}
.header-hairline::after {
  content: '';
  position: absolute;
  inset: auto 0 -1px 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in oklab, var(--color-gold) 60%, transparent),
    transparent
  );
}

.shimmer {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
  animation: shimmer-sweep 2.2s ease-in-out infinite;
}

@keyframes shimmer-sweep {
  0% {
    transform: translateX(-120%);
  }
  100% {
    transform: translateX(320%);
  }
}
</style>
