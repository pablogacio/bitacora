import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import type { Trip } from '../data/types'
import { formatRange, tripYear } from '../lib/format'
import CoverImage from './CoverImage'

export default function TripCard({
  trip,
  photoCount,
  index,
}: {
  trip: Trip
  photoCount: number
  index: number
}) {
  const navigate = useNavigate()

  return (
    <motion.button
      onClick={() => navigate(`/viaje/${trip.id}`)}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group block w-full text-left"
    >
      <div className="relative overflow-hidden rounded-xl2 shadow-card">
        <div className="h-[230px] w-full overflow-hidden">
          <CoverImage
            src={trip.coverUrl}
            alt={trip.title}
            className="h-full w-full scale-[1.02] object-cover transition-transform duration-700 ease-out group-active:scale-[1.08]"
            style={{ filter: 'saturate(0.88) sepia(0.12) contrast(1.02)' }}
          />
        </div>
        <div className="film-grain" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" />

        {tripYear(trip.startDate) && (
          <div
            className="pointer-events-none absolute right-4 top-4 flex h-14 w-14 flex-col items-center justify-center rounded-full border border-cream/40 text-cream/70"
            style={{ rotate: '-9deg' }}
          >
            <span className="font-body text-[7px] uppercase tracking-widest2 text-cream/55">Anno</span>
            <span className="font-display text-[15px] leading-none tabular-nums">{tripYear(trip.startDate)}</span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="font-body text-[10px] font-medium uppercase tracking-widest2 text-cream/65">
            {trip.place}
          </p>
          <h3 className="mt-1.5 font-display text-[26px] leading-tight text-cream">{trip.title}</h3>
          <div className="mt-2.5 flex items-center gap-2.5 font-body text-[11px] tabular-nums text-cream/75">
            <span>{formatRange(trip.startDate, trip.endDate)}</span>
            <span className="h-[3px] w-[3px] rounded-full bg-cream/50" />
            <span>{photoCount} {photoCount === 1 ? 'foto' : 'fotos'}</span>
          </div>
        </div>
      </div>
    </motion.button>
  )
}
