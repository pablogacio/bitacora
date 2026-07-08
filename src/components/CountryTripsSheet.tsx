import { AnimatePresence, motion } from 'framer-motion'
import { X, MapPin, Globe2 } from 'lucide-react'
import type { Trip } from '../data/types'
import { formatRange } from '../lib/format'
import CoverImage from './CoverImage'

export default function CountryTripsSheet({
  open,
  countryLabel,
  trips,
  photoCounts,
  onClose,
  onSelectTrip,
}: {
  open: boolean
  countryLabel: string
  trips: Trip[]
  photoCounts: Record<string, number>
  onClose: () => void
  onSelectTrip: (tripId: string) => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/70"
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="flex max-h-[75vh] w-full max-w-md flex-col rounded-t-[28px] bg-paper px-6 pb-8 pt-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-ink">
                <Globe2 size={16} strokeWidth={1.75} className="text-rust" />
                <h3 className="font-display text-xl">{countryLabel}</h3>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/5 text-ink/60 transition-transform duration-150 active:scale-90"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
              {trips.map((trip) => (
                <button
                  key={trip.id}
                  onClick={() => onSelectTrip(trip.id)}
                  className="flex w-full items-center gap-3 rounded-xl2 p-2 text-left transition-transform duration-150 active:scale-[0.98]"
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
                  <div className="shrink-0 text-right font-body text-[11px] text-ink/40">
                    <p>{formatRange(trip.startDate, trip.endDate)}</p>
                    <p>{photoCounts[trip.id] || 0} fotos</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
