<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
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
  <div class="min-h-screen">
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
