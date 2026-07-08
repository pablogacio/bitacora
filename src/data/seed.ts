import { db } from './db'
import type { Trip, Photo } from './types'

const demo = (n: number) => `/demo/p${String(n).padStart(2, '0')}.jpg`

interface SeedTrip {
  title: string
  place: string
  country: string
  startDate: string
  endDate: string
  note: string
  photos: number[]
}

const seedTrips: SeedTrip[] = [
  {
    title: 'Kioto en otoño',
    place: 'Kioto, Japón',
    country: 'JP',
    startDate: '2025-11-02',
    endDate: '2025-11-10',
    note: 'Templos entre arces rojos, té verde por las mañanas y el sonido de la grava bajo los zapatos.',
    photos: [1, 2, 3, 4, 5],
  },
  {
    title: 'Tierra de fuego y hielo',
    place: 'Islandia',
    country: 'IS',
    startDate: '2025-06-14',
    endDate: '2025-06-22',
    note: 'Carreteras vacías, cascadas heladas y un cielo que no se decidía a oscurecer.',
    photos: [6, 7, 8, 9, 10],
  },
  {
    title: 'Costa de la Toscana',
    place: 'Toscana, Italia',
    country: 'IT',
    startDate: '2024-09-05',
    endDate: '2024-09-13',
    note: 'Cipreses, vino tinto y siestas largas después de comer demasiado.',
    photos: [11, 12, 13, 14, 15],
  },
  {
    title: 'Zocos y desierto',
    place: 'Marruecos',
    country: 'MA',
    startDate: '2024-03-20',
    endDate: '2024-03-28',
    note: 'El olor a especias en Marrakech y una noche entera mirando estrellas en las dunas.',
    photos: [16, 17, 18, 19, 20],
  },
]

export async function ensureSeedData(): Promise<void> {
  await db.transaction('rw', db.trips, db.photos, async () => {
    const count = await db.trips.count()
    if (count > 0) return

    const trips: Trip[] = []
    const photos: Photo[] = []

    seedTrips.forEach((seed, tripIndex) => {
      const id = crypto.randomUUID()
      trips.push({
        id,
        title: seed.title,
        place: seed.place,
        country: seed.country,
        startDate: seed.startDate,
        endDate: seed.endDate,
        note: seed.note,
        coverUrl: demo(seed.photos[0]),
        createdAt: Date.now() - tripIndex * 1000,
        isDemo: true,
      })
      seed.photos.forEach((n, i) => {
        photos.push({
          id: crypto.randomUUID(),
          tripId: id,
          url: demo(n),
          thumbUrl: demo(n),
          order: i,
          width: 1200,
          height: 1500,
          takenAt: seed.startDate,
        })
      })
    })

    await db.trips.bulkPut(trips)
    await db.photos.bulkPut(photos)
  })
}
