export interface Trip {
  id: string
  title: string
  place: string
  /** ISO 3166-1 alpha-2 code, e.g. "JP". Optional so trips created before this
   * field existed keep working; see lib/countries.ts and Stats.tsx's fallback. */
  country?: string
  startDate: string
  endDate: string
  coverUrl: string
  coverBlobId?: string
  note?: string
  createdAt: number
  isDemo?: boolean
}

export interface Photo {
  id: string
  tripId: string
  url: string
  thumbUrl: string
  blobId?: string
  thumbBlobId?: string
  takenAt?: string
  caption?: string
  category?: string
  order: number
  width: number
  height: number
}

export interface TripInput {
  title: string
  place: string
  country?: string
  startDate: string
  endDate: string
  note?: string
  coverFile?: File
}
