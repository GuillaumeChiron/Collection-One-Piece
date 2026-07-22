import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase'
import type { Tome } from '@/types/tome'

export const useCollectionStore = defineStore('collection', () => {
  const tomes = ref<Tome[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  let channel: RealtimeChannel | null = null

  const possedeCount = computed(() => tomes.value.filter((t) => t.possede).length)
  const totalCount = computed(() => tomes.value.length)
  const progress = computed(() =>
    totalCount.value === 0 ? 0 : Math.round((possedeCount.value / totalCount.value) * 100),
  )

  async function fetchTomes() {
    loading.value = true
    error.value = null

    const { data, error: fetchError } = await supabase.from('tomes').select('*').order('numero', { ascending: true })

    if (fetchError) {
      error.value = fetchError.message
    } else {
      tomes.value = data ?? []
    }
    loading.value = false
  }

  async function setPossede(tomeId: number, possede: boolean) {
    error.value = null
    const { error: updateError } = await supabase.from('tomes').update({ possede }).eq('id', tomeId)

    if (updateError) {
      error.value = updateError.message
    }
  }

  function subscribeRealtime() {
    if (channel) return

    channel = supabase
      .channel('tomes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tomes' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          tomes.value.push(payload.new as Tome)
          tomes.value.sort((a, b) => a.numero - b.numero)
        } else if (payload.eventType === 'UPDATE') {
          const index = tomes.value.findIndex((t) => t.id === (payload.new as Tome).id)
          if (index !== -1) tomes.value[index] = payload.new as Tome
        } else if (payload.eventType === 'DELETE') {
          const deletedId = (payload.old as Partial<Tome>).id
          tomes.value = tomes.value.filter((t) => t.id !== deletedId)
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
    tomes,
    loading,
    error,
    possedeCount,
    totalCount,
    progress,
    fetchTomes,
    setPossede,
    subscribeRealtime,
    unsubscribeRealtime,
  }
})
