import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Trash2, ImageUp, Check, Pencil, Tag } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Photo } from '../data/types'
import { formatLong } from '../lib/format'
import CategoryPicker from './CategoryPicker'

export default function PhotoViewer({
  photos,
  index,
  onClose,
  onChangeIndex,
  onDelete,
  onSetCover,
  onSetCaption,
  onSetCategory,
}: {
  photos: Photo[]
  index: number | null
  onClose: () => void
  onChangeIndex: (i: number) => void
  onDelete?: (photo: Photo) => void
  onSetCover?: (photo: Photo) => void
  onSetCaption?: (photo: Photo, caption: string) => void
  onSetCategory?: (photo: Photo, category: string | undefined) => void
}) {
  const open = index !== null
  const photo = open ? photos[index as number] : null
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [coverSet, setCoverSet] = useState(false)
  const [editingCaption, setEditingCaption] = useState(false)
  const [captionDraft, setCaptionDraft] = useState('')
  const captionInputRef = useRef<HTMLInputElement>(null)
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false)

  useEffect(() => {
    setConfirmDelete(false)
    setCoverSet(false)
    setEditingCaption(false)
    setCategoryPickerOpen(false)
  }, [index])

  function startEditingCaption() {
    if (!onSetCaption) return
    setCaptionDraft(photo?.caption || '')
    setEditingCaption(true)
  }

  function saveCaption() {
    if (photo && onSetCaption) onSetCaption(photo, captionDraft)
    setEditingCaption(false)
  }

  useEffect(() => {
    if (editingCaption) captionInputRef.current?.focus()
  }, [editingCaption])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (editingCaption || categoryPickerOpen) {
        if (e.key === 'Escape') {
          setEditingCaption(false)
          setCategoryPickerOpen(false)
        }
        return
      }
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onChangeIndex(Math.min(photos.length - 1, (index ?? 0) + 1))
      if (e.key === 'ArrowLeft') onChangeIndex(Math.max(0, (index ?? 0) - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, index, photos.length, onClose, onChangeIndex, editingCaption, categoryPickerOpen])

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (index === null) return
    if (info.offset.x < -80 && index < photos.length - 1) onChangeIndex(index + 1)
    else if (info.offset.x > 80 && index > 0) onChangeIndex(index - 1)
  }

  function handleDelete() {
    if (!photo || !onDelete) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    onDelete(photo)
    setConfirmDelete(false)
  }

  function handleSetCover() {
    if (!photo || !onSetCover || coverSet) return
    onSetCover(photo)
    setCoverSet(true)
  }

  return (
    <AnimatePresence>
      {open && photo && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/[0.97]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="film-grain" style={{ opacity: 0.08 }} />

          <button
            onClick={onClose}
            className="absolute right-5 top-6 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-cream/10 text-cream transition-transform duration-150 active:scale-90"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>

          <div className="absolute left-6 top-7 z-10 flex flex-col items-start gap-2">
            <p className="font-body text-xs uppercase tracking-widest2 text-cream/45">
              {(index as number) + 1} / {photos.length}
            </p>

            {onSetCategory && (
              <button
                onClick={() => setCategoryPickerOpen(true)}
                className="flex items-center gap-1.5 rounded-full bg-cream/10 px-2.5 py-1 font-body text-[10px] uppercase tracking-widest2 text-cream/70 transition-transform duration-150 active:scale-95"
              >
                <Tag size={10} />
                {photo.category || 'Categoría'}
              </button>
            )}
          </div>

          {(index as number) > 0 && (
            <button
              onClick={() => onChangeIndex((index as number) - 1)}
              className="absolute left-2 z-10 hidden h-11 w-11 items-center justify-center rounded-full text-cream/60 transition-transform duration-150 hover:text-cream active:scale-90 sm:flex"
              aria-label="Anterior"
            >
              <ChevronLeft />
            </button>
          )}
          {(index as number) < photos.length - 1 && (
            <button
              onClick={() => onChangeIndex((index as number) + 1)}
              className="absolute right-2 z-10 hidden h-11 w-11 items-center justify-center rounded-full text-cream/60 transition-transform duration-150 hover:text-cream active:scale-90 sm:flex"
              aria-label="Siguiente"
            >
              <ChevronRight />
            </button>
          )}

          <motion.div
            key={photo.id}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={handleDragEnd}
            className="flex max-h-[72vh] max-w-[92vw] items-center justify-center"
          >
            <motion.img
              layoutId={`photo-${photo.id}`}
              src={photo.url}
              alt=""
              className="max-h-[72vh] max-w-[92vw] rounded-sm object-contain"
              style={{ filter: 'saturate(0.92) sepia(0.08) contrast(1.02)' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.div>

          <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-3 px-8 text-center">
            {editingCaption ? (
              <div className="flex w-full max-w-xs items-center gap-2">
                <input
                  ref={captionInputRef}
                  value={captionDraft}
                  onChange={(e) => setCaptionDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveCaption()}
                  placeholder="Escribe un pie de foto…"
                  className="w-full border-b border-cream/30 bg-transparent pb-1 text-center font-display text-lg italic text-cream placeholder:text-cream/40 focus:border-cream/70 focus:outline-none"
                />
                <button
                  onClick={saveCaption}
                  aria-label="Guardar pie de foto"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream/15 text-cream transition-transform duration-150 active:scale-90"
                >
                  <Check size={13} />
                </button>
              </div>
            ) : onSetCaption ? (
              <button
                onClick={startEditingCaption}
                className="flex items-center gap-1.5 transition-transform duration-150 active:scale-95"
              >
                {photo.caption ? (
                  <p className="font-display text-lg italic text-cream/90">{photo.caption}</p>
                ) : (
                  <p className="flex items-center gap-1.5 font-body text-[12px] uppercase tracking-widest2 text-cream/35">
                    <Pencil size={11} /> Añadir pie de foto
                  </p>
                )}
              </button>
            ) : (
              photo.caption && <p className="font-display text-lg italic text-cream/90">{photo.caption}</p>
            )}
            {photo.takenAt && (
              <p className="font-body text-[11px] uppercase tracking-widest2 text-cream/40">
                {formatLong(photo.takenAt)}
              </p>
            )}

            {(onSetCover || onDelete) && (
              <div className="mt-1 flex items-center gap-3">
                {onSetCover && (
                  <button
                    onClick={handleSetCover}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 font-body text-[11px] font-semibold uppercase tracking-widest2 transition-all duration-200 active:scale-95 ${
                      coverSet ? 'bg-olive/30 text-cream' : 'bg-cream/10 text-cream/80'
                    }`}
                  >
                    {coverSet ? <Check size={13} /> : <ImageUp size={13} />}
                    {coverSet ? 'Portada' : 'Usar de portada'}
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={handleDelete}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 font-body text-[11px] font-semibold uppercase tracking-widest2 transition-all duration-200 active:scale-95 ${
                      confirmDelete ? 'bg-rust text-cream' : 'bg-cream/10 text-cream/80'
                    }`}
                  >
                    <Trash2 size={13} />
                    {confirmDelete ? '¿Eliminar?' : 'Eliminar'}
                  </button>
                )}
              </div>
            )}
          </div>

          {onSetCategory && (
            <CategoryPicker
              open={categoryPickerOpen}
              current={photo.category}
              onClose={() => setCategoryPickerOpen(false)}
              onSelect={(category) => {
                onSetCategory(photo, category)
                setCategoryPickerOpen(false)
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
