<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useCollectionStore } from '@/stores/collectionStore'
import { useReservationStore } from '@/stores/reservationStore'
import ProgressHeader from '@/components/ProgressHeader.vue'
import CollectionGrid from '@/components/CollectionGrid.vue'
import ReservationModal from '@/components/ReservationModal.vue'
import type { Tome } from '@/types/tome'

const collectionStore = useCollectionStore()
const reservationStore = useReservationStore()

const selectedTome = ref<Tome | null>(null)

onMounted(() => {
  collectionStore.fetchTomes()
  reservationStore.fetchReservations()
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
    <CollectionGrid :tomes="collectionStore.tomes" :editable="false" @open-reservation="openReservation" />
    <ReservationModal :tome="selectedTome" @close="closeReservation" />
  </div>
</template>
