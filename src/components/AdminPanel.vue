<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useCollectionStore } from '@/stores/collectionStore'
import { useReservationStore } from '@/stores/reservationStore'
import { useTomeFilters } from '@/composables/useTomeFilters'
import { useToast } from '@/composables/useToast'
import ProgressHeader from './ProgressHeader.vue'
import CollectionGrid from './CollectionGrid.vue'
import FilterBar from './FilterBar.vue'
import SkeletonGrid from './SkeletonGrid.vue'

const authStore = useAuthStore()
const collectionStore = useCollectionStore()
const reservationStore = useReservationStore()
const toast = useToast()

const email = ref('')
const password = ref('')
const loginError = ref<string | null>(null)
const loggingIn = ref(false)

const { searchQuery, statusFilter, filteredTomes, resultCount } = useTomeFilters(
  computed(() => collectionStore.tomes),
  { isReserved: (tomeId) => !!reservationStore.reservationForTome(tomeId) },
)

let subscribed = false

async function loadCollection() {
  if (subscribed) return
  subscribed = true
  await collectionStore.fetchTomes()
  if (collectionStore.error) toast.error(collectionStore.error)
  collectionStore.subscribeRealtime()
  await reservationStore.fetchReservations()
  if (reservationStore.error) toast.error(reservationStore.error)
  reservationStore.subscribeRealtime()
}

watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) loadCollection()
  },
  { immediate: true },
)

onUnmounted(() => {
  collectionStore.unsubscribeRealtime()
  reservationStore.unsubscribeRealtime()
})

async function handleLogin() {
  loggingIn.value = true
  loginError.value = null
  const error = await authStore.signIn(email.value, password.value)
  loggingIn.value = false
  if (error) {
    loginError.value = error.message
  }
}

function handleLogout() {
  authStore.signOut()
  password.value = ''
}
</script>

<template>
  <div v-if="authStore.loading" class="flex min-h-screen items-center justify-center text-parchment-muted">
    Chargement...
  </div>

  <form
    v-else-if="!authStore.isAuthenticated"
    @submit.prevent="handleLogin"
    class="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 rounded-xl bg-linear-to-b from-ink-surface to-ink px-6 py-8 shadow-panel"
  >
    <RouterLink
      to="/"
      class="flex items-center gap-1 self-start text-sm text-parchment-muted transition-colors hover:text-gold"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
      Retour
    </RouterLink>
    <h1 class="text-center font-display text-4xl text-gold">Connexion collectionneur</h1>
    <label class="flex flex-col gap-1 text-sm text-parchment-muted">
      Email
      <input
        v-model="email"
        type="email"
        required
        class="rounded-md border border-ink-border bg-ink-surface px-3 py-2 text-parchment outline-none focus:border-gold"
      />
    </label>
    <label class="flex flex-col gap-1 text-sm text-parchment-muted">
      Mot de passe
      <input
        v-model="password"
        type="password"
        required
        class="rounded-md border border-ink-border bg-ink-surface px-3 py-2 text-parchment outline-none focus:border-gold"
      />
    </label>
    <button
      type="submit"
      :disabled="loggingIn"
      class="rounded-md bg-gold px-4 py-2 font-semibold text-ink transition-colors active:scale-[0.97] hover:bg-gold-light disabled:opacity-50"
    >
      Se connecter
    </button>
    <p v-if="loginError" class="text-center text-sm text-crimson-light">{{ loginError }}</p>
  </form>

  <div v-else class="min-h-screen">
    <div class="flex justify-end px-4 pt-4 sm:px-8">
      <button
        type="button"
        @click="handleLogout"
        class="rounded-full border border-crimson px-4 py-1.5 text-sm text-crimson-light transition-colors active:scale-[0.97] hover:bg-crimson hover:text-parchment"
      >
        Se déconnecter
      </button>
    </div>
    <ProgressHeader />
    <SkeletonGrid v-if="collectionStore.loading" />
    <template v-else>
      <FilterBar
        v-model:search="searchQuery"
        v-model:status="statusFilter"
        :result-count="resultCount"
        :total-count="collectionStore.totalCount"
      />
      <CollectionGrid :tomes="filteredTomes" :editable="true" />
    </template>
  </div>
</template>
