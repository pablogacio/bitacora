import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Check, Tag } from 'lucide-react'
import { DEFAULT_CATEGORIES } from '../lib/categories'

export default function CategoryPicker({
  open,
  current,
  onClose,
  onSelect,
}: {
  open: boolean
  current?: string
  onClose: () => void
  onSelect: (category: string | undefined) => void
}) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) setDraft('')
  }, [open])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250)
  }, [open])

  function saveDraft() {
    const trimmed = draft.trim()
    if (!trimmed) return
    onSelect(trimmed)
  }

  const options =
    current && !DEFAULT_CATEGORIES.includes(current) ? [current, ...DEFAULT_CATEGORIES] : DEFAULT_CATEGORIES

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
            className="w-full max-w-md rounded-t-[28px] bg-paper px-6 pb-10 pt-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-ink">
                <Tag size={16} strokeWidth={1.75} className="text-rust" />
                <h3 className="font-display text-xl">Categoría</h3>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/5 text-ink/60 transition-transform duration-150 active:scale-90"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2 border-b border-ink/15 pb-3">
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveDraft()}
                placeholder="Escribe tu propia etiqueta…"
                className="w-full bg-transparent font-body text-[15px] text-ink placeholder:text-ink/35 focus:outline-none"
              />
              <button
                onClick={saveDraft}
                disabled={!draft.trim()}
                aria-label="Guardar etiqueta"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rust text-cream transition-transform duration-150 active:scale-90 disabled:opacity-30 disabled:active:scale-100"
              >
                <Check size={14} />
              </button>
            </div>

            <p className="mb-3 mt-6 font-body text-[11px] font-semibold uppercase tracking-widest2 text-ink/40">
              O elige una
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onSelect(undefined)}
                className={`rounded-full border px-3.5 py-2 font-body text-[13px] transition-transform duration-150 active:scale-95 ${
                  !current ? 'border-ink/30 bg-ink/[0.06] text-ink/60' : 'border-ink/15 text-ink/50'
                }`}
              >
                Sin categoría
              </button>
              {options.map((c) => (
                <button
                  key={c}
                  onClick={() => onSelect(c)}
                  className={`rounded-full px-3.5 py-2 font-body text-[13px] font-medium transition-transform duration-150 active:scale-95 ${
                    current === c ? 'bg-rust text-cream' : 'bg-ink/[0.06] text-ink/70'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
