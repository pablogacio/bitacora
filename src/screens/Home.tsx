import { useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Compass, Sparkles } from 'lucide-react'
import PageTransition from '../components/PageTransition'
import TripCard from '../components/TripCard'
import Skeleton from '../components/Skeleton'
import { useImportStore } from '../data/importStore'
import { useTrips, usePhotoCounts } from '../data/hooks'
import { tripYear } from '../lib/format'

export default function Home() {
  const trips = useTrips()
  const photoCounts = usePhotoCounts()
  const navigate = useNavigate()
  const setImportFiles = useImportStore((s) => s.setFiles)
  const importInputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll({ container: scrollRef })
  const headerShadow = useTransform(
    scrollY,
    (v) => `0 1px 0 rgba(43,38,32,${Math.min(v / 200, 0.1)})`,
  )

  const totalPhotos = useMemo(
    () => Object.values(photoCounts || {}).reduce((a, b) => a + b, 0),
    [photoCounts],
  )

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return
    setImportFiles(Array.from(e.target.files))
    e.target.value = ''
    navigate('/importar')
  }

  const groups = useMemo(() => {
    const list = trips || []
    const map = new Map<string, typeof list>()
    for (const trip of list) {
      const year = tripYear(trip.startDate) || 'Sin fecha'
      if (!map.has(year)) map.set(year, [])
      map.get(year)!.push(trip)
    }
    return Array.from(map.entries())
  }, [trips])

  return (
    <PageTransition>
      <div ref={scrollRef} className="relative z-10 h-screen overflow-y-auto no-scrollbar pb-40">
        <motion.header
          style={{ boxShadow: headerShadow }}
          className="sticky top-0 z-20 bg-paper px-6 pb-5 pt-9"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-rust">
                <Compass size={16} strokeWidth={1.75} />
                <span className="font-body text-[10px] font-semibold uppercase tracking-widest2">Bitácora</span>
              </div>
              <h1 className="mt-2 font-display text-[34px] leading-none text-ink">Tu diario de viajes</h1>
              {trips && trips.length > 0 && (
                <p className="mt-2 font-body text-[13px] text-ink/55">
                  {trips.length} {trips.length === 1 ? 'viaje' : 'viajes'} · {totalPhotos} fotos guardadas
                </p>
              )}
            </div>
            {trips && trips.length > 0 && (
              <button
                onClick={() => importInputRef.current?.click()}
                aria-label="Importar fotos"
                className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink/[0.05] text-ink/60 transition-transform duration-150 active:scale-90"
              >
                <Sparkles size={18} strokeWidth={1.75} />
              </button>
            )}
          </div>
        </motion.header>

        <input
          ref={importInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImport}
        />

        <div className="px-6">
          {trips === undefined ? (
            <div className="mt-5 flex flex-col gap-5">
              <Skeleton className="h-[230px] w-full" />
              <Skeleton className="h-[230px] w-full" />
            </div>
          ) : trips.length === 0 ? (
            <EmptyState onImport={() => importInputRef.current?.click()} />
          ) : (
            groups.map(([year, yearTrips]) => (
              <section key={year} className="mb-2">
                <div className="mb-3 mt-5 flex items-center gap-3">
                  <span className="font-display text-lg italic text-ink/40">{year}</span>
                  <div className="h-px flex-1 bg-ink/10" />
                </div>
                <div className="flex flex-col gap-5">
                  {yearTrips.map((trip, i) => (
                    <TripCard key={trip.id} trip={trip} photoCount={photoCounts?.[trip.id] || 0} index={i} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </PageTransition>
  )
}

function EmptyState({ onImport }: { onImport: () => void }) {
  return (
    <div className="mt-16 flex flex-col items-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-ink/15">
        <Compass size={26} strokeWidth={1.5} className="text-ink/40" />
      </div>
      <p className="mt-5 font-display text-xl text-ink">Todavía no hay viajes</p>
      <p className="mt-2 max-w-[250px] font-body text-sm text-ink/55">
        Importa tus fotos y las agruparemos en viajes automáticamente, o crea uno a mano con el
        botón +.
      </p>
      <button
        onClick={onImport}
        className="mt-6 flex items-center gap-2 rounded-full bg-rust px-6 py-3 font-body text-[12px] font-semibold uppercase tracking-widest2 text-cream shadow-card transition-transform duration-150 active:scale-95"
      >
        <Sparkles size={15} /> Importar fotos
      </button>
    </div>
  )
}
