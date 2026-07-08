import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Globe2 } from 'lucide-react'
import PageTransition from '../components/PageTransition'
import Skeleton from '../components/Skeleton'
import { useTrips, usePhotoCounts } from '../data/hooks'
import { tripDurationDays } from '../lib/format'

function parseCountry(place: string): string {
  const parts = place
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
  return parts[parts.length - 1] || place
}

const stampRotations = ['-2deg', '1.6deg', '-1deg', '2deg', '-1.4deg', '0.8deg']

export default function Stats() {
  const trips = useTrips()
  const photoCounts = usePhotoCounts()

  const stats = useMemo(() => {
    const list = trips || []
    const totalPhotos = Object.values(photoCounts || {}).reduce((a, b) => a + b, 0)
    const totalDays = list.reduce((sum, t) => sum + tripDurationDays(t.startDate, t.endDate), 0)
    const countryMap = new Map<string, number>()
    list.forEach((t) => {
      const country = parseCountry(t.place)
      countryMap.set(country, (countryMap.get(country) || 0) + 1)
    })
    const countries = Array.from(countryMap.entries()).sort((a, b) => b[1] - a[1])
    return { totalTrips: list.length, totalPhotos, totalDays, countries }
  }, [trips, photoCounts])

  return (
    <PageTransition className="relative z-10 h-screen overflow-y-auto no-scrollbar pb-32">
      <div className="px-6 pt-9">
        <div className="flex items-center gap-2 text-rust">
          <Globe2 size={16} strokeWidth={1.75} />
          <span className="font-body text-[10px] font-semibold uppercase tracking-widest2">Tu recorrido</span>
        </div>
        <h1 className="mt-2 font-display text-[32px] leading-tight text-ink">Estadísticas</h1>

        {trips === undefined ? (
          <div className="mt-7 grid grid-cols-2 gap-4">
            <Skeleton className="h-[104px] w-full" />
            <Skeleton className="h-[104px] w-full" />
            <Skeleton className="h-[104px] w-full" />
            <Skeleton className="h-[104px] w-full" />
          </div>
        ) : stats.totalTrips === 0 ? (
          <p className="mt-16 text-center font-body text-sm text-ink/45">
            Cuando crees tu primer viaje, aquí verás tu recorrido.
          </p>
        ) : (
          <>
            <div className="mt-7 grid grid-cols-2 gap-4">
              <StatTile value={stats.totalTrips} label={stats.totalTrips === 1 ? 'Viaje' : 'Viajes'} index={0} />
              <StatTile
                value={stats.countries.length}
                label={stats.countries.length === 1 ? 'País' : 'Países'}
                index={1}
              />
              <StatTile value={stats.totalDays} label="Días viajados" index={2} />
              <StatTile
                value={stats.totalPhotos}
                label={stats.totalPhotos === 1 ? 'Foto guardada' : 'Fotos guardadas'}
                index={3}
              />
            </div>

            <div className="mt-9">
              <div className="mb-3 flex items-center gap-3">
                <span className="font-body text-[11px] font-semibold uppercase tracking-widest2 text-ink/40">
                  Países visitados
                </span>
                <div className="h-px flex-1 bg-ink/10" />
              </div>
              <div className="flex flex-wrap gap-3">
                {stats.countries.map(([country, count], i) => (
                  <CountryStamp key={country} country={country} count={count} index={i} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </PageTransition>
  )
}

function StatTile({ value, label, index }: { value: number; label: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl2 bg-cream px-5 py-5 shadow-soft"
    >
      <p className="font-display text-[34px] leading-none text-rust tabular-nums">{value}</p>
      <p className="mt-1.5 font-body text-[11px] uppercase tracking-widest2 text-ink/45">{label}</p>
    </motion.div>
  )
}

function CountryStamp({ country, count, index }: { country: string; count: number; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay: 0.2 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-md border border-ink/15 bg-cream px-4 py-2.5 shadow-soft"
      style={{ rotate: stampRotations[index % stampRotations.length] }}
    >
      <p className="font-display text-sm text-ink">{country}</p>
      {count > 1 && <p className="font-body text-[10px] uppercase tracking-widest2 text-ink/40">{count} viajes</p>}
    </motion.div>
  )
}
