import { computed, ref, type ComputedRef, type Ref } from 'vue'
import type { Tome } from '@/types/tome'
import { sagaForNumero } from '@/data/sagas'

export type TomeStatusFilter = 'all' | 'owned' | 'missing' | 'reserved'

export function useTomeFilters(
  tomes: Ref<Tome[]> | ComputedRef<Tome[]>,
  options: { isReserved?: (tomeId: number) => boolean } = {},
) {
  const searchQuery = ref('')
  const statusFilter = ref<TomeStatusFilter>('all')

  const filteredTomes = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()

    return tomes.value.filter((tome) => {
      const matchesSearch =
        query === '' ||
        String(tome.numero).includes(query) ||
        (tome.titre?.toLowerCase().includes(query) ?? false) ||
        sagaForNumero(tome.numero).name.toLowerCase().includes(query)

      if (!matchesSearch) return false

      switch (statusFilter.value) {
        case 'owned':
          return tome.possede
        case 'missing':
          return !tome.possede
        case 'reserved':
          return !tome.possede && (options.isReserved?.(tome.id) ?? false)
        default:
          return true
      }
    })
  })

  const resultCount = computed(() => filteredTomes.value.length)

  return {
    searchQuery,
    statusFilter,
    filteredTomes,
    resultCount,
  }
}
