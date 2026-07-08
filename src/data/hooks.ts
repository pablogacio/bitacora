import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import type { Trip, Photo } from './types'

export function useTrips() {
  return useLiveQuery<Trip[], Trip[]>(
    async () => {
      const trips = await db.trips.toArray()
      return trips.sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''))
    },
    [],
    [],
  )
}

export function useTrip(id?: string) {
  return useLiveQuery<Trip | undefined, undefined>(
    () => (id ? db.trips.get(id) : undefined),
    [id],
    undefined,
  )
}

export function usePhotos(tripId?: string) {
  return useLiveQuery<Photo[], Photo[]>(
    async () => {
      if (!tripId) return []
      const photos = await db.photos.where('tripId').equals(tripId).toArray()
      return photos.sort((a, b) => a.order - b.order)
    },
    [tripId],
    [],
  )
}

export function usePhotoCounts() {
  return useLiveQuery<Record<string, number>, Record<string, number>>(
    async () => {
      const photos = await db.photos.toArray()
      const map: Record<string, number> = {}
      for (const p of photos) map[p.tripId] = (map[p.tripId] || 0) + 1
      return map
    },
    [],
    {},
  )
}
