import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowLeft, MapPin, CalendarDays, ImagePlus, Compass, Trash2, Pencil } from 'lucide-react'
import PageTransition from '../components/PageTransition'
import PhotoGrid from '../components/PhotoGrid'
import PhotoViewer from '../components/PhotoViewer'
import Skeleton from '../components/Skeleton'
import { useTrip, usePhotos } from '../data/hooks'
import { repo } from '../data/repository'
import { formatRange, tripDurationDays } from '../lib/format'
import { useIncrementalReveal } from '../lib/useIncrementalReveal'

export default function TripDetail() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const trip = useTrip(tripId)
  const photos = usePhotos(tripId)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [importing, setImporting] = useState(false)
  const [confirmDeleteTrip, setConfirmDeleteTrip] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const categories = useMemo(() => {
    const set = new Set<string>()
    ;(photos || []).forEach((p) => p.category && set.add(p.category))
    return Array.from(set).sort()
  }, [photos])

  const filteredPhotos = useMemo(() => {
    if (!activeCategory) return photos || []
    return (photos || []).filter((p) => p.category === activeCategory)
  }, [photos, activeCategory])

  useEffect(() => {
    if (deleting) return
    setNotFound(false)
    if (trip) return
    const timer = setTimeout(() => setNotFound(true), 600)
    return () => clearTimeout(timer)
  }, [tripId, trip, deleting])

  const scrollRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll({ container: scrollRef })
  const heroY = useTransform(scrollY, [0, 300], [0, 90])
  const heroScale = useTransform(scrollY, [-100, 0], [1.15, 1])

  const { count: visibleCount, hasMore, sentinelRef } = useIncrementalReveal(
    filteredPhotos.length,
    `${tripId ?? ''}:${activeCategory ?? ''}`,
  )

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!tripId || !e.target.files?.length) return
    setImporting(true)
    try {
      await repo.addPhotos(tripId, Array.from(e.target.files))
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  async function handleDeleteTrip() {
    if (!tripId) return
    if (!confirmDeleteTrip) {
      setConfirmDeleteTrip(true)
      setTimeout(() => setConfirmDeleteTrip(false), 3000)
      return
    }
    setDeleting(true)
    navigate('/', { replace: true })
    await repo.deleteTrip(tripId)
  }

  if (!trip) {
    if (!notFound) return null
    return (
      <PageTransition>
        <div className="flex h-screen flex-col items-center justify-center gap-4 px-8 text-center">
          <Compass size={26} strokeWidth={1.5} className="text-ink/30" />
          <p className="font-display text-xl text-ink">No encontramos este viaje</p>
          <p className="max-w-[240px] font-body text-sm text-ink/55">
            Puede que se haya eliminado o que el enlace ya no sea válido.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-2 rounded-full bg-rust px-6 py-3 font-body text-[12px] font-semibold uppercase tracking-widest2 text-cream shadow-card"
          >
            Volver al diario
          </button>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div ref={scrollRef} className="relative z-10 h-screen overflow-y-auto no-scrollbar pb-32">
        <div className="relative h-[46vh] overflow-hidden">
          {trip.coverUrl ? (
            <motion.img
              src={trip.coverUrl}
              alt={trip.title}
              style={{ y: heroY, scale: heroScale, filter: 'saturate(0.88) sepia(0.12) contrast(1.02)' }}
              className="h-[110%] w-full object-cover"
            />
          ) : (
            <motion.div
              style={{ y: heroY, scale: heroScale }}
              className="flex h-[110%] w-full items-start justify-center bg-gradient-to-br from-olive/70 via-ink/80 to-ink pt-[16%]"
            >
              <Compass size={40} strokeWidth={1.25} className="text-cream/30" />
            </motion.div>
          )}
          <div className="film-grain" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-paper via-ink/10 to-ink/25" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/35 via-transparent to-transparent" />

          <button
            onClick={() => navigate('/')}
            className="absolute left-5 top-6 flex h-9 w-9 items-center justify-center rounded-full bg-cream/15 text-cream backdrop-blur-sm transition-transform duration-150 active:scale-90"
            aria-label="Volver"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            onClick={() => navigate(`/viaje/${tripId}/editar`)}
            className="absolute right-5 top-6 flex h-9 w-9 items-center justify-center rounded-full bg-cream/15 text-cream backdrop-blur-sm transition-transform duration-150 active:scale-90"
            aria-label="Editar viaje"
          >
            <Pencil size={16} />
          </button>
        </div>

        <div className="relative z-10 -mt-6 rounded-t-[28px] bg-paper px-6 pt-7">
          <p className="font-body text-[11px] font-semibold uppercase tracking-widest2 text-rust">
            {trip.place}
          </p>
          <h1 className="mt-1.5 font-display text-[32px] leading-tight text-ink">{trip.title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-body text-[13px] text-ink/55">
            <span className="flex items-center gap-1.5">
              <MapPin size={13} /> {trip.place}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays size={13} /> {formatRange(trip.startDate, trip.endDate)}
            </span>
            <span>{tripDurationDays(trip.startDate, trip.endDate)} días</span>
          </div>

          {trip.note && (
            <p className="mt-5 border-l-2 border-rust/30 pl-4 font-display text-[17px] italic leading-relaxed text-ink/75">
              {trip.note}
            </p>
          )}

          <div className="mb-4 mt-8 flex items-center gap-3">
            <span className="font-body text-[11px] font-semibold uppercase tracking-widest2 text-ink/40">
              Fotos {photos !== undefined ? `· ${photos.length}` : ''}
            </span>
            <div className="h-px flex-1 bg-ink/10" />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="flex items-center gap-1.5 font-body text-[11px] font-semibold uppercase tracking-widest2 text-rust transition-transform duration-150 active:scale-95 disabled:opacity-40"
            >
              <ImagePlus size={14} /> {importing ? 'Procesando…' : 'Añadir'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFiles}
            />
          </div>

          {photos === undefined ? (
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="aspect-[4/5] w-full" />
              <Skeleton className="aspect-[4/5] w-full" />
            </div>
          ) : photos.length > 0 ? (
            <>
              {categories.length > 0 && (
                <div className="mb-4 flex gap-2 overflow-x-auto no-scrollbar">
                  <button
                    onClick={() => setActiveCategory(null)}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 font-body text-[11px] font-semibold uppercase tracking-widest2 transition-transform duration-150 active:scale-95 ${
                      activeCategory === null ? 'bg-ink text-cream' : 'bg-ink/[0.06] text-ink/50'
                    }`}
                  >
                    Todas
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setActiveCategory(c)}
                      className={`shrink-0 rounded-full px-3.5 py-1.5 font-body text-[11px] font-semibold uppercase tracking-widest2 transition-transform duration-150 active:scale-95 ${
                        activeCategory === c ? 'bg-ink text-cream' : 'bg-ink/[0.06] text-ink/50'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
              {filteredPhotos.length > 0 ? (
                <>
                  <PhotoGrid photos={filteredPhotos} visibleCount={visibleCount} onOpen={setViewerIndex} />
                  {hasMore && <div ref={sentinelRef} className="h-8 w-full" />}
                </>
              ) : (
                <p className="py-10 text-center font-body text-sm text-ink/40">
                  No hay fotos en "{activeCategory}"
                </p>
              )}
            </>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-xl2 border border-dashed border-ink/20 py-10 text-ink/40 transition-transform duration-150 active:scale-[0.98]"
            >
              <ImagePlus size={22} strokeWidth={1.5} />
              <span className="font-body text-sm">Añade las primeras fotos de este viaje</span>
            </button>
          )}

          <div className="mt-12 flex justify-center">
            <button
              onClick={handleDeleteTrip}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 font-body text-[11px] font-semibold uppercase tracking-widest2 transition-all duration-200 active:scale-95 ${
                confirmDeleteTrip ? 'bg-rust text-cream' : 'text-ink/35'
              }`}
            >
              <Trash2 size={13} />
              {confirmDeleteTrip ? 'Toca de nuevo para eliminar' : 'Eliminar viaje'}
            </button>
          </div>
        </div>
      </div>

      <PhotoViewer
        photos={filteredPhotos}
        index={viewerIndex}
        onClose={() => setViewerIndex(null)}
        onChangeIndex={setViewerIndex}
        onSetCover={(photo) => tripId && repo.setTripCover(tripId, photo.id)}
        onSetCaption={(photo, caption) => repo.setPhotoCaption(photo.id, caption)}
        onSetCategory={(photo, category) => repo.setPhotoCategory(photo.id, category)}
        onDelete={async (photo) => {
          const pos = filteredPhotos.findIndex((p) => p.id === photo.id)
          await repo.deletePhoto(photo.id)
          const remaining = filteredPhotos.length - 1
          if (remaining <= 0) setViewerIndex(null)
          else setViewerIndex(Math.min(pos, remaining - 1))
        }}
      />
    </PageTransition>
  )
}
