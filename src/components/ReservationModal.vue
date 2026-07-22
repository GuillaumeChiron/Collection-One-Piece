<script setup lang="ts">
import { ref, watch } from 'vue'
import { useReservationStore } from '@/stores/reservationStore'
import type { Tome } from '@/types/tome'

const props = defineProps<{
  tome: Tome | null
}>()

const emit = defineEmits<{
  close: []
}>()

const reservationStore = useReservationStore()
const guestName = ref('')
const submitting = ref(false)

watch(
  () => props.tome,
  () => {
    guestName.value = ''
  },
)

async function confirmReservation() {
  if (!props.tome || !guestName.value.trim()) return

  submitting.value = true
  const result = await reservationStore.reserveTome(props.tome.id, guestName.value.trim())
  submitting.value = false

  if (result) {
    emit('close')
  }
}

function cancel() {
  emit('close')
}
</script>

<template>
  <div v-if="tome" role="dialog" aria-modal="true" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 px-4 backdrop-blur-sm">
    <div class="w-full max-w-sm rounded-xl border border-ink-border bg-ink-surface p-6 shadow-xl">
      <h2 class="font-display text-2xl text-gold">Réserver le tome {{ tome.numero }}</h2>
      <form @submit.prevent="confirmReservation" class="mt-4 flex flex-col gap-4">
        <label class="flex flex-col gap-1 text-sm text-parchment-muted">
          Votre prénom
          <input
            v-model="guestName"
            type="text"
            required
            class="rounded-md border border-ink-border bg-ink px-3 py-2 text-parchment outline-none focus:border-gold"
          />
        </label>
        <div class="flex gap-3">
          <button
            type="submit"
            :disabled="submitting"
            class="flex-1 rounded-md bg-gold px-4 py-2 font-semibold text-ink transition-colors hover:bg-gold-light disabled:opacity-50"
          >
            Confirmer
          </button>
          <button
            type="button"
            @click="cancel"
            class="flex-1 rounded-md border border-ink-border px-4 py-2 text-parchment-muted transition-colors hover:border-crimson hover:text-crimson-light"
          >
            Annuler
          </button>
        </div>
      </form>
      <p v-if="reservationStore.error" class="mt-3 text-sm text-crimson-light">{{ reservationStore.error }}</p>
    </div>
  </div>
</template>
