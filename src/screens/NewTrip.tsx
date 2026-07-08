import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { X, MapPin, ImagePlus } from 'lucide-react'
import { repo } from '../data/repository'

export default function NewTrip() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [place, setPlace] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [note, setNote] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canSave = title.trim().length > 0 && startDate.length > 0 && !saving

  function pickCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    const trip = await repo.createTrip({
      title: title.trim(),
      place: place.trim(),
      startDate,
      endDate: endDate || startDate,
      note: note.trim() || undefined,
      coverFile: coverFile || undefined,
    })
    navigate(`/viaje/${trip.id}`, { replace: true })
  }

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      className="fixed inset-0 z-50 flex flex-col bg-paper"
    >
      <div className="flex items-center justify-between px-5 pb-3 pt-7">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/5 text-ink/60 transition-transform duration-150 active:scale-90"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>
        <span className="font-body text-[11px] font-semibold uppercase tracking-widest2 text-ink/40">
          Nuevo viaje
        </span>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="rounded-full bg-rust px-4 py-2 font-body text-[12px] font-semibold uppercase tracking-widest2 text-cream transition-transform duration-150 active:scale-95 disabled:opacity-30 disabled:active:scale-100"
        >
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-16 pt-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="relative mb-7 flex h-40 w-full items-center justify-center overflow-hidden rounded-xl2 border border-dashed border-ink/20 bg-ink/[0.03] transition-transform duration-150 active:scale-[0.98]"
        >
          {coverPreview ? (
            <img src={coverPreview} alt="Portada" className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-ink/35">
              <ImagePlus size={22} strokeWidth={1.5} />
              <span className="font-body text-xs">Elegir foto de portada</span>
            </div>
          )}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={pickCover} />

        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value.replace('\n', ''))}
          placeholder="¿Cómo se llama este viaje?"
          rows={1}
          className="w-full resize-none border-b border-ink/15 bg-transparent pb-3 font-display text-[26px] leading-tight text-ink placeholder:text-ink/25 focus:border-rust focus:outline-none"
        />

        <div className="mt-5 flex items-center gap-2 border-b border-ink/15 pb-3">
          <MapPin size={15} className="text-ink/35" />
          <input
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="Lugar (ciudad, país)"
            className="w-full bg-transparent font-body text-[15px] text-ink placeholder:text-ink/35 focus:outline-none"
          />
        </div>

        <div className="mt-5 flex gap-4">
          <label className="flex-1">
            <span className="font-body text-[10px] font-semibold uppercase tracking-widest2 text-ink/40">
              Desde
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1.5 w-full border-b border-ink/15 bg-transparent pb-2.5 font-body text-[14px] text-ink focus:border-rust focus:outline-none"
            />
          </label>
          <label className="flex-1">
            <span className="font-body text-[10px] font-semibold uppercase tracking-widest2 text-ink/40">
              Hasta
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1.5 w-full border-b border-ink/15 bg-transparent pb-2.5 font-body text-[14px] text-ink focus:border-rust focus:outline-none"
            />
          </label>
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Escribe una línea para recordar este viaje…"
          rows={3}
          className="mt-6 w-full resize-none rounded-xl2 bg-ink/[0.03] p-4 font-display text-[15px] italic leading-relaxed text-ink/80 placeholder:text-ink/30 focus:outline-none"
        />
      </div>
    </motion.div>
  )
}
