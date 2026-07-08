import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../lib/image', () => ({
  processImage: vi.fn(async () => ({
    thumbBlob: new Blob(['thumb'], { type: 'image/webp' }),
    fullBlob: new Blob(['full'], { type: 'image/webp' }),
    width: 800,
    height: 600,
  })),
}))

import { repo } from './repository'
import { db } from './db'

function makeFile(name = 'photo.jpg') {
  return new File([new Blob(['fake'])], name, { type: 'image/jpeg' })
}

beforeEach(async () => {
  await db.trips.clear()
  await db.photos.clear()
  await db.blobs.clear()
})

describe('repo trips', () => {
  it('creates a trip without a cover', async () => {
    const trip = await repo.createTrip({
      title: 'Roma',
      place: 'Roma, Italia',
      startDate: '2026-01-01',
      endDate: '2026-01-05',
    })
    expect(trip.coverUrl).toBe('')
    expect(trip.coverBlobId).toBeUndefined()
    const trips = await repo.listTrips()
    expect(trips).toHaveLength(1)
    expect(trips[0].title).toBe('Roma')
  })

  it('creates a trip with a cover and stores its blob', async () => {
    const trip = await repo.createTrip({
      title: 'Kioto',
      place: 'Kioto',
      startDate: '2026-02-01',
      endDate: '2026-02-05',
      coverFile: makeFile(),
    })
    expect(trip.coverBlobId).toBeTruthy()
    const stored = await db.blobs.get(trip.coverBlobId!)
    expect(stored).toBeTruthy()
  })

  it('lists trips sorted by start date descending', async () => {
    await repo.createTrip({ title: 'Early', place: 'A', startDate: '2020-01-01', endDate: '2020-01-02' })
    await repo.createTrip({ title: 'Late', place: 'B', startDate: '2026-01-01', endDate: '2026-01-02' })
    const trips = await repo.listTrips()
    expect(trips[0].title).toBe('Late')
    expect(trips[1].title).toBe('Early')
  })
})

describe('repo photos', () => {
  it('adds photos with incrementing order', async () => {
    const trip = await repo.createTrip({ title: 'Trip', place: 'X', startDate: '2026-01-01', endDate: '2026-01-02' })
    const photos = await repo.addPhotos(trip.id, [makeFile('a.jpg'), makeFile('b.jpg')])
    expect(photos.map((p) => p.order)).toEqual([0, 1])
    const more = await repo.addPhotos(trip.id, [makeFile('c.jpg')])
    expect(more[0].order).toBe(2)
    const all = await repo.listPhotos(trip.id)
    expect(all).toHaveLength(3)
  })

  it('removes a photo and its blobs on delete', async () => {
    const trip = await repo.createTrip({ title: 'Trip', place: 'X', startDate: '2026-01-01', endDate: '2026-01-02' })
    const [photo] = await repo.addPhotos(trip.id, [makeFile()])
    await repo.deletePhoto(photo.id)
    const remaining = await repo.listPhotos(trip.id)
    expect(remaining).toHaveLength(0)
    expect(await db.blobs.get(photo.blobId!)).toBeUndefined()
    expect(await db.blobs.get(photo.thumbBlobId!)).toBeUndefined()
  })

  it('cascades trip deletion to its photos and blobs', async () => {
    const trip = await repo.createTrip({
      title: 'Trip',
      place: 'X',
      startDate: '2026-01-01',
      endDate: '2026-01-02',
      coverFile: makeFile(),
    })
    const photos = await repo.addPhotos(trip.id, [makeFile('a.jpg'), makeFile('b.jpg')])
    await repo.deleteTrip(trip.id)

    expect(await repo.getTrip(trip.id)).toBeUndefined()
    expect(await repo.listPhotos(trip.id)).toHaveLength(0)
    for (const p of photos) {
      expect(await db.blobs.get(p.blobId!)).toBeUndefined()
      expect(await db.blobs.get(p.thumbBlobId!)).toBeUndefined()
    }
    expect(await db.blobs.get(trip.coverBlobId!)).toBeUndefined()
  })

  it('does not touch another trip when one trip is deleted', async () => {
    const tripA = await repo.createTrip({ title: 'A', place: 'A', startDate: '2026-01-01', endDate: '2026-01-02' })
    const tripB = await repo.createTrip({ title: 'B', place: 'B', startDate: '2026-01-01', endDate: '2026-01-02' })
    const [photoA] = await repo.addPhotos(tripA.id, [makeFile()])
    const [photoB] = await repo.addPhotos(tripB.id, [makeFile()])

    await repo.deleteTrip(tripA.id)

    expect(await repo.listPhotos(tripB.id)).toHaveLength(1)
    expect(await db.blobs.get(photoB.blobId!)).toBeTruthy()
    expect(await db.blobs.get(photoA.blobId!)).toBeUndefined()
  })
})
