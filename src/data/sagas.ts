export interface Saga {
  name: string
  from: number
  to: number
}

export const sagas: Saga[] = [
  { name: 'East Blue', from: 1, to: 11 },
  { name: 'Alabasta', from: 12, to: 24 },
  { name: 'Skypiea', from: 25, to: 32 },
  { name: 'Water Seven', from: 33, to: 46 },
  { name: 'Thriller Bark', from: 47, to: 50 },
  { name: 'Guerre au sommet', from: 51, to: 61 },
  { name: 'Fish-Man Island', from: 62, to: 66 },
  { name: 'Dressrosa', from: 67, to: 80 },
  { name: 'Whole Cake Island', from: 81, to: 90 },
  { name: 'Wano', from: 91, to: 104 },
  { name: 'Saga finale', from: 105, to: 112 },
]

const UNKNOWN_SAGA: Saga = { name: 'Autres', from: 0, to: 0 }

export function sagaForNumero(numero: number): Saga {
  return sagas.find((saga) => numero >= saga.from && numero <= saga.to) ?? UNKNOWN_SAGA
}
