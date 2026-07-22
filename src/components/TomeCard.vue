<script setup lang="ts">
import { computed } from 'vue'
import { useCollectionStore } from '@/stores/collectionStore'
import { useReservationStore } from '@/stores/reservationStore'
import type { Tome } from '@/types/tome'

const props = defineProps<{
  tome: Tome
  editable: boolean
}>()

const emit = defineEmits<{
  'open-reservation': [tome: Tome]
}>()

const collectionStore = useCollectionStore()
const reservationStore = useReservationStore()

const reservation = computed(() => reservationStore.reservationForTome(props.tome.id))
const isMyReservation = computed(() => (reservation.value ? reservationStore.isMine(reservation.value) : false))

function togglePossede() {
  collectionStore.setPossede(props.tome.id, !props.tome.possede)
}

function requestReservation() {
  emit('open-reservation', props.tome)
}

function cancelReservation() {
  if (reservation.value) {
    reservationStore.cancelReservation(reservation.value.id)
  }
}
</script>

<template>
  <article
    class="flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-colors"
    :class="tome.possede ? 'border-gold/50 bg-ink-surface ring-1 ring-gold/30' : 'border-ink-border bg-ink-surface/60'"
  >
    <h2 class="font-display text-3xl text-parchment">{{ tome.numero }}</h2>
    <p v-if="tome.titre" class="line-clamp-2 text-xs text-parchment-muted">{{ tome.titre }}</p>

    <template v-if="editable">
      <label class="mt-1 flex items-center gap-2 text-sm text-parchment-muted">
        <input type="checkbox" :checked="tome.possede" @change="togglePossede" class="h-4 w-4 accent-gold" />
        Possédé
      </label>
      <p v-if="reservation" class="rounded-full bg-crimson/20 px-2 py-0.5 text-xs text-crimson-light">
        Réservé par {{ reservation.guest_name }}
      </p>
    </template>

    <template v-else>
      <p v-if="tome.possede" class="rounded-full bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">
        Déjà dans la collection
      </p>
      <template v-else-if="reservation">
        <p class="rounded-full bg-crimson/20 px-2 py-0.5 text-xs font-medium text-crimson-light">
          {{ isMyReservation ? 'Réservé par vous' : `Réservé par ${reservation.guest_name}` }}
        </p>
        <button
          v-if="isMyReservation"
          type="button"
          @click="cancelReservation"
          class="mt-1 rounded-full border border-crimson px-3 py-1 text-xs text-crimson-light transition-colors hover:bg-crimson hover:text-parchment"
        >
          Annuler
        </button>
      </template>
      <button
        v-else
        type="button"
        @click="requestReservation"
        class="mt-1 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-ink transition-colors hover:bg-gold-light"
      >
        Réserver
      </button>
    </template>
  </article>
</template>
