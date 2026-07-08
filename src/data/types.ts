export interface Trip {
  id: string
  title: string
  place: string
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
  order: number
  width: number
  height: number
}

export interface TripInput {
  title: string
  place: string
  startDate: string
  endDate: string
  note?: string
  coverFile?: File
}
