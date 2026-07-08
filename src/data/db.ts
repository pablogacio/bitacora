import Dexie, { type Table } from 'dexie'
import type { Trip, Photo } from './types'

interface BlobRecord {
  id: string
  blob: Blob
}

export class BitacoraDB extends Dexie {
  trips!: Table<Trip, string>
  photos!: Table<Photo, string>
  blobs!: Table<BlobRecord, string>

  constructor() {
    super('bitacora-db')
    this.version(1).stores({
      trips: 'id, createdAt, startDate',
      photos: 'id, tripId, order',
      blobs: 'id',
    })
  }
}

export const db = new BitacoraDB()
