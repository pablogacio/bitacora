import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search as SearchIcon, MapPin, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import CoverImage from '../components/CoverImage'
import Skeleton from '../components/Skeleton'
import { useTrips, usePhotoCounts } from '../data/hooks'
import { formatRange } from '../lib/format'

export default function Search() {
  const [query, setQuery] = useState('')
  const trips = useTrips()
  const photoCounts = usePhotoCounts()
  const navigate = useNavigate()

  const results = useMemo(() => {
    const list = trips || []
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (t) => t.title.toLowerCase().includes(q) || t.place.toLowerCase().includes(q),
    )
  }, [trips, query])

  return (
    <PageTransition className="relative z-10 h-screen overflow-y-auto no-scrollbar pb-32">
      <div className="px-6 pt-9">
        <h1 className="font-display text-[28px] text-ink">Buscar</h1>
        <div className="mt-4 flex items-center gap-2.5 rounded-full bg-ink/[0.05] px-4 py-3">
          <SearchIcon size={16} className="text-ink/40" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Viaje o destino…"
            className="w-full bg-transparent font-body text-sm text-ink placeholder:text-ink/40 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Borrar búsqueda"
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink/10 text-ink/50 transition-transform duration-150 active:scale-90"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          {trips === undefined ? (
            <>
              <Skeleton className="h-[68px] w-full" />
              <Skeleton className="h-[68px] w-full" />
            </>
          ) : trips.length === 0 ? (
            <p className="mt-10 text-center font-body text-sm text-ink/40">
              Aún no tienes viajes guardados.
            </p>
          ) : results.length === 0 ? (
            <p className="mt-10 text-center font-body text-sm text-ink/40">
              No hay viajes que coincidan con “{query}”
            </p>
          ) : null}
          {trips !== undefined && results.map((trip, i) => (
            <motion.button
              key={trip.id}
              onClick={() => navigate(`/viaje/${trip.id}`)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className="flex items-center gap-3 rounded-xl2 p-2 text-left hover:bg-ink/[0.03]"
            >
              <CoverImage
                src={trip.coverUrl}
                alt=""
                className="h-14 w-14 rounded-lg object-cover"
                style={{ filter: 'saturate(0.9) sepia(0.1)' }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-[16px] text-ink">{trip.title}</p>
                <p className="flex items-center gap-1 font-body text-xs text-ink/50">
                  <MapPin size={11} /> {trip.place}
                </p>
              </div>
              <div className="text-right font-body text-[11px] text-ink/40">
                <p>{formatRange(trip.startDate, trip.endDate)}</p>
                <p>{photoCounts?.[trip.id] || 0} fotos</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
