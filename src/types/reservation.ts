export type ReservationStatus = 'active' | 'cancelled'

export interface Reservation {
  id: string
  tome_id: number
  guest_name: string
  guest_token: string
  status: ReservationStatus
  created_at: string
}
