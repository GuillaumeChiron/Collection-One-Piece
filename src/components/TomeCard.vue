<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCollectionStore } from '@/stores/collectionStore'
import { useReservationStore } from '@/stores/reservationStore'
import { useToast } from '@/composables/useToast'
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
const toast = useToast()

const reservation = computed(() => reservationStore.reservationForTome(props.tome.id))
const isMyReservation = computed(() => (reservation.value ? reservationStore.isMine(reservation.value) : false))

type CardState = 'owned' | 'reserved-mine' | 'reserved-other' | 'reserved' | 'free'

const state = computed<CardState>(() => {
  if (props.tome.possede) return 'owned'
  if (!reservation.value) return 'free'
  if (props.editable) return 'reserved'
  return isMyReservation.value ? 'reserved-mine' : 'reserved-other'
})

const cardStateClasses: Record<CardState, string> = {
  owned: 'border-gold/50 bg-ink-surface ring-1 ring-gold/30',
  'reserved-mine': 'border-crimson/40 bg-ink-surface/80 ring-1 ring-crimson/20',
  'reserved-other': 'border-ink-border bg-ink-surface/60',
  reserved: 'border-crimson/40 bg-ink-surface/80 ring-1 ring-crimson/20',
  free: 'border-ink-border bg-ink-surface/60',
}

const imageFailed = ref(false)
watch(
  () => props.tome.image_url,
  () => {
    imageFailed.value = false
  },
)

async function togglePossede() {
  await collectionStore.setPossede(props.tome.id, !props.tome.possede)
  if (collectionStore.error) toast.error(collectionStore.error)
}

function requestReservation() {
  emit('open-reservation', props.tome)
}

async function cancelReservation() {
  if (!reservation.value) return

  await reservationStore.cancelReservation(reservation.value.id)
  if (reservationStore.error) {
    toast.error(reservationStore.error)
  } else {
    toast.success('Réservation annulée')
  }
}

async function cancelReservationAsAdmin() {
  if (!reservation.value) return

  await reservationStore.cancelReservationAsAdmin(reservation.value.id)
  if (reservationStore.error) {
    toast.error(reservationStore.error)
  } else {
    toast.success('Réservation annulée')
  }
}
</script>

<template>
  <article
    :data-state="state"
    class="tome-card relative flex flex-col items-center gap-2 overflow-hidden rounded-lg border p-3 pl-4 text-center shadow-card transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-card-hover active:scale-[0.98]"
    :class="cardStateClasses[state]"
  >
    <p class="font-display text-sm tracking-wide text-gold">Tome {{ tome.numero }}</p>
    <div class="relative aspect-2/3 w-full overflow-hidden rounded-md bg-ink-border/40">
      <img
        v-if="tome.image_url && !imageFailed"
        :src="tome.image_url"
        :alt="`Couverture du tome ${tome.numero}`"
        loading="lazy"
        class="h-full w-full object-cover"
        @error="imageFailed = true"
      />
      <div v-else class="flex h-full items-center justify-center">
        <svg class="h-8 w-8 text-parchment-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
          />
        </svg>
      </div>
    </div>
    <p v-if="tome.titre" class="line-clamp-2 text-xs text-parchment-muted">{{ tome.titre }}</p>

    <template v-if="editable">
      <label class="mt-1 flex cursor-pointer items-center gap-2 text-sm text-parchment-muted">
        <span class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full bg-ink-border transition-colors has-checked:bg-gold">
          <input type="checkbox" :checked="tome.possede" @change="togglePossede" class="peer sr-only" />
          <span
            class="inline-block h-4 w-4 translate-x-0.5 rounded-full bg-parchment shadow transition-transform peer-checked:translate-x-4"
          ></span>
        </span>
        Possédé
      </label>
      <Transition name="fade-slide">
        <div v-if="reservation && !tome.possede" class="flex flex-col items-center gap-1">
          <p class="flex items-center gap-1 rounded-full bg-crimson/20 px-2 py-0.5 text-xs text-crimson-light">
            <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Réservé par {{ reservation.guest_name }}
          </p>
          <button
            type="button"
            @click="cancelReservationAsAdmin"
            class="rounded-full border border-crimson px-3 py-1 text-xs text-crimson-light transition-colors active:scale-[0.97] hover:bg-crimson hover:text-parchment"
          >
            Annuler la réservation
          </button>
        </div>
      </Transition>
    </template>

    <template v-else>
      <p v-if="tome.possede" class="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
        <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Possédé
      </p>
      <template v-else-if="reservation">
        <p class="flex items-center gap-1 rounded-full bg-crimson/20 px-2 py-0.5 text-xs font-medium text-crimson-light">
          <svg v-if="isMyReservation" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <svg v-else class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          {{ isMyReservation ? 'Réservé par vous' : `Réservé par ${reservation.guest_name}` }}
        </p>
        <button
          v-if="isMyReservation"
          type="button"
          @click="cancelReservation"
          class="mt-1 rounded-full border border-crimson px-3 py-1 text-xs text-crimson-light transition-colors active:scale-[0.97] hover:bg-crimson hover:text-parchment"
        >
          Annuler
        </button>
      </template>
      <button
        v-else
        type="button"
        @click="requestReservation"
        class="mt-1 flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-ink transition-colors active:scale-[0.97] hover:bg-gold-light"
      >
        <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Réserver
      </button>
    </template>
  </article>
</template>

<style scoped>
.tome-card::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 5px;
  background: var(--color-ink-border);
}
.tome-card[data-state='owned']::before {
  background: linear-gradient(180deg, var(--color-gold-light), var(--color-gold));
}
.tome-card[data-state='reserved']::before,
.tome-card[data-state='reserved-other']::before {
  background: var(--color-crimson);
}
.tome-card[data-state='reserved-mine']::before {
  background: linear-gradient(180deg, var(--color-gold), var(--color-crimson));
  animation: pulse-spine 2s ease-in-out infinite;
}

.tome-card::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at 30% 20%, color-mix(in oklab, var(--color-gold) 8%, transparent), transparent 65%);
}
.tome-card[data-state='owned']::after {
  background: radial-gradient(circle at 30% 20%, color-mix(in oklab, var(--color-gold) 16%, transparent), transparent 65%);
}

@keyframes pulse-spine {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
