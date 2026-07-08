import { db } from './db'
import type { Trip, Photo, TripInput } from './types'
import { processImage } from '../lib/image'

const blobUrlCache = new Map<string, string>()

async function storeBlob(blob: Blob): Promise<string> {
  const id = crypto.randomUUID()
  await db.blobs.put({ id, blob })
  return id
}

function blobUrl(blobId: string, blob: Blob): string {
  const cached = blobUrlCache.get(blobId)
  if (cached) return cached
  const url = URL.createObjectURL(blob)
  blobUrlCache.set(blobId, url)
  return url
}

function revokeBlob(blobId?: string) {
  if (!blobId) return
  const url = blobUrlCache.get(blobId)
  if (url) URL.revokeObjectURL(url)
  blobUrlCache.delete(blobId)
}

async function urlForBlobId(blobId: string): Promise<string> {
  const cached = blobUrlCache.get(blobId)
  if (cached) return cached
  const rec = await db.blobs.get(blobId)
  if (!rec) return ''
  return blobUrl(blobId, rec.blob)
}

async function storeCover(file: File): Promise<{ coverUrl: string; coverBlobId: string }> {
  const { fullBlob } = await processImage(file)
  const coverBlobId = await storeBlob(fullBlob)
  return { coverUrl: blobUrl(coverBlobId, fullBlob), coverBlobId }
}

/**
 * Local-first implementation. Both trip and photo access go through this
 * single repository object so a future cloud-backed implementation can be
 * swapped in behind the same shape without touching screens/components.
 */
export const repo = {
  async listTrips(): Promise<Trip[]> {
    const trips = await db.trips.toArray()
    return trips.sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''))
  },

  async getTrip(id: string): Promise<Trip | undefined> {
    return db.trips.get(id)
  },

  async createTrip(input: TripInput): Promise<Trip> {
    const id = crypto.randomUUID()
    let coverUrl = ''
    let coverBlobId: string | undefined
    if (input.coverFile) {
      const cover = await storeCover(input.coverFile)
      coverUrl = cover.coverUrl
      coverBlobId = cover.coverBlobId
    }
    const trip: Trip = {
      id,
      title: input.title,
      place: input.place,
      startDate: input.startDate,
      endDate: input.endDate,
      note: input.note,
      coverUrl,
      coverBlobId,
      createdAt: Date.now(),
    }
    await db.trips.put(trip)
    return trip
  },

  async updateTrip(id: string, patch: Partial<TripInput>): Promise<void> {
    const existing = await db.trips.get(id)
    if (!existing) return
    let coverUrl = existing.coverUrl
    let coverBlobId = existing.coverBlobId
    if (patch.coverFile) {
      const oldCoverBlobId = coverBlobId
      const cover = await storeCover(patch.coverFile)
      coverUrl = cover.coverUrl
      coverBlobId = cover.coverBlobId
      if (oldCoverBlobId) {
        revokeBlob(oldCoverBlobId)
        await db.blobs.delete(oldCoverBlobId)
      }
    }
    await db.trips.put({
      ...existing,
      title: patch.title ?? existing.title,
      place: patch.place ?? existing.place,
      startDate: patch.startDate ?? existing.startDate,
      endDate: patch.endDate ?? existing.endDate,
      note: patch.note ?? existing.note,
      coverUrl,
      coverBlobId,
    })
  },

  async setTripCover(tripId: string, photoId: string): Promise<void> {
    const [trip, photo] = await Promise.all([db.trips.get(tripId), db.photos.get(photoId)])
    if (!trip || !photo || photo.tripId !== tripId) return
    let coverUrl = photo.url
    let coverBlobId: string | undefined
    if (photo.blobId) {
      const rec = await db.blobs.get(photo.blobId)
      if (rec) {
        // Copy the blob so deleting the photo later can't orphan the cover.
        coverBlobId = await storeBlob(rec.blob)
        coverUrl = blobUrl(coverBlobId, rec.blob)
      }
    }
    const oldCoverBlobId = trip.coverBlobId
    await db.trips.put({ ...trip, coverUrl, coverBlobId })
    if (oldCoverBlobId) {
      revokeBlob(oldCoverBlobId)
      await db.blobs.delete(oldCoverBlobId)
    }
  },

  async deleteTrip(id: string): Promise<void> {
    const [trip, photos] = await Promise.all([
      db.trips.get(id),
      db.photos.where('tripId').equals(id).toArray(),
    ])
    await db.transaction('rw', db.trips, db.photos, db.blobs, async () => {
      await db.trips.delete(id)
      await db.photos.where('tripId').equals(id).delete()
      const blobIds = [
        trip?.coverBlobId,
        ...photos.flatMap((p) => [p.blobId, p.thumbBlobId]),
      ].filter((v): v is string => !!v)
      if (blobIds.length) await db.blobs.bulkDelete(blobIds)
    })
    revokeBlob(trip?.coverBlobId)
    photos.forEach((p) => {
      revokeBlob(p.blobId)
      revokeBlob(p.thumbBlobId)
    })
  },

  async listPhotos(tripId: string): Promise<Photo[]> {
    const photos = await db.photos.where('tripId').equals(tripId).toArray()
    return photos.sort((a, b) => a.order - b.order)
  },

  async addPhotos(tripId: string, files: File[]): Promise<Photo[]> {
    const existing = await db.photos.where('tripId').equals(tripId).count()
    const created: Photo[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const { thumbBlob, fullBlob, width, height } = await processImage(file)
      const [blobId, thumbBlobId] = await Promise.all([storeBlob(fullBlob), storeBlob(thumbBlob)])
      const photo: Photo = {
        id: crypto.randomUUID(),
        tripId,
        url: blobUrl(blobId, fullBlob),
        thumbUrl: blobUrl(thumbBlobId, thumbBlob),
        blobId,
        thumbBlobId,
        order: existing + i,
        width,
        height,
        takenAt: new Date(file.lastModified || Date.now()).toISOString(),
      }
      created.push(photo)
    }
    await db.photos.bulkPut(created)
    return created
  },

  async deletePhoto(id: string): Promise<void> {
    const photo = await db.photos.get(id)
    if (!photo) return
    await db.transaction('rw', db.photos, db.blobs, async () => {
      await db.photos.delete(id)
      const blobIds = [photo.blobId, photo.thumbBlobId].filter((v): v is string => !!v)
      if (blobIds.length) await db.blobs.bulkDelete(blobIds)
    })
    revokeBlob(photo.blobId)
    revokeBlob(photo.thumbBlobId)
  },

  urlForBlobId,
}
