import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase'
import type { Reservation } from '@/types/reservation'

const GUEST_TOKEN_KEY = 'op-collection-guest-token'

function getOrCreateGuestToken(): string {
  let token = localStorage.getItem(GUEST_TOKEN_KEY)
  if (!token) {
    token = crypto.randomUUID()
    localStorage.setItem(GUEST_TOKEN_KEY, token)
  }
  return token
}

export const useReservationStore = defineStore('reservation', () => {
  const reservations = ref<Reservation[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const guestToken = getOrCreateGuestToken()

  let channel: RealtimeChannel | null = null

  function reservationForTome(tomeId: number) {
    return reservations.value.find((r) => r.tome_id === tomeId && r.status === 'active')
  }

  function isMine(reservation: Reservation) {
    return reservation.guest_token === guestToken
  }

  async function fetchReservations() {
    loading.value = true
    error.value = null

    const { data, error: fetchError } = await supabase.from('reservations').select('*').eq('status', 'active')

    if (fetchError) {
      error.value = fetchError.message
    } else {
      reservations.value = data ?? []
    }
    loading.value = false
  }

  async function reserveTome(tomeId: number, guestName: string) {
    error.value = null

    const { data, error: insertError } = await supabase
      .from('reservations')
      .insert({ tome_id: tomeId, guest_name: guestName, guest_token: guestToken })
      .select()
      .single()

    if (insertError) {
      error.value = insertError.message
      return null
    }
    reservations.value.push(data as Reservation)
    return data as Reservation
  }

  async function cancelReservation(reservationId: string) {
    error.value = null

    const { error: updateError } = await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', reservationId)
      .eq('guest_token', guestToken)

    if (updateError) {
      error.value = updateError.message
    }
  }

  function subscribeRealtime() {
    if (channel) return

    channel = supabase
      .channel('reservations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const row = payload.new as Reservation
          const alreadyPresent = reservations.value.some((r) => r.id === row.id)
          if (row.status === 'active' && !alreadyPresent) reservations.value.push(row)
        } else if (payload.eventType === 'UPDATE') {
          const row = payload.new as Reservation
          const index = reservations.value.findIndex((r) => r.id === row.id)
          if (row.status === 'active') {
            if (index !== -1) reservations.value[index] = row
            else reservations.value.push(row)
          } else if (index !== -1) {
            reservations.value.splice(index, 1)
          }
        } else if (payload.eventType === 'DELETE') {
          const deletedId = (payload.old as Partial<Reservation>).id
          reservations.value = reservations.value.filter((r) => r.id !== deletedId)
        }
      })
      .subscribe()
  }

  function unsubscribeRealtime() {
    if (channel) {
      supabase.removeChannel(channel)
      channel = null
    }
  }

  return {
    reservations,
    loading,
    error,
    guestToken,
    reservationForTome,
    isMine,
    fetchReservations,
    reserveTome,
    cancelReservation,
    subscribeRealtime,
    unsubscribeRealtime,
  }
})
