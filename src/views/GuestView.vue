<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useCollectionStore } from '@/stores/collectionStore'
import { useReservationStore } from '@/stores/reservationStore'
import { useTomeFilters } from '@/composables/useTomeFilters'
import { useToast } from '@/composables/useToast'
import ProgressHeader from '@/components/ProgressHeader.vue'
import CollectionGrid from '@/components/CollectionGrid.vue'
import ReservationModal from '@/components/ReservationModal.vue'
import FilterBar from '@/components/FilterBar.vue'
import SkeletonGrid from '@/components/SkeletonGrid.vue'
import type { Tome } from '@/types/tome'

const collectionStore = useCollectionStore()
const reservationStore = useReservationStore()
const toast = useToast()

const { searchQuery, statusFilter, filteredTomes, resultCount } = useTomeFilters(
  computed(() => collectionStore.tomes),
  { isReserved: (tomeId) => !!reservationStore.reservationForTome(tomeId) },
)

const selectedTome = ref<Tome | null>(null)

onMounted(async () => {
  await collectionStore.fetchTomes()
  if (collectionStore.error) toast.error(collectionStore.error)
  await reservationStore.fetchReservations()
  if (reservationStore.error) toast.error(reservationStore.error)
  collectionStore.subscribeRealtime()
  reservationStore.subscribeRealtime()
})

onUnmounted(() => {
  collectionStore.unsubscribeRealtime()
  reservationStore.unsubscribeRealtime()
})

function openReservation(tome: Tome) {
  selectedTome.value = tome
}

function closeReservation() {
  selectedTome.value = null
}
</script>

<template>
  <div class="relative min-h-screen">
    <RouterLink
      to="/admin"
      aria-label="Accès administrateur"
      title="Accès administrateur"
      class="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-ink-border bg-ink-surface/80 text-parchment-muted shadow-panel backdrop-blur transition-colors active:scale-[0.97] hover:border-gold hover:text-gold sm:right-8"
    >
      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
      </svg>
    </RouterLink>
    <ProgressHeader />
    <SkeletonGrid v-if="collectionStore.loading" />
    <template v-else>
      <FilterBar
        v-model:search="searchQuery"
        v-model:status="statusFilter"
        :result-count="resultCount"
        :total-count="collectionStore.totalCount"
      />
      <CollectionGrid :tomes="filteredTomes" :editable="false" @open-reservation="openReservation" />
    </template>
    <ReservationModal :tome="selectedTome" @close="closeReservation" />
  </div>
</template>
