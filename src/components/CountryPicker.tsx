import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Search, Check, Globe2 } from 'lucide-react'
import { COUNTRIES } from '../lib/countries'

export default function CountryPicker({
  open,
  current,
  onClose,
  onSelect,
}: {
  open: boolean
  current?: string
  onClose: () => void
  onSelect: (code: string | undefined) => void
}) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) setQuery('')
  }, [open])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250)
  }, [open])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return COUNTRIES
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q))
  }, [query])

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
            className="flex h-[75vh] w-full max-w-md flex-col rounded-t-[28px] bg-paper"
          >
            <div className="flex items-center justify-between px-6 pb-4 pt-6">
              <div className="flex items-center gap-2 text-ink">
                <Globe2 size={16} strokeWidth={1.75} className="text-rust" />
                <h3 className="font-display text-xl">País</h3>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/5 text-ink/60 transition-transform duration-150 active:scale-90"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mx-6 mb-3 flex items-center gap-2.5 rounded-full bg-ink/[0.05] px-4 py-2.5">
              <Search size={15} className="text-ink/40" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar país…"
                className="w-full bg-transparent font-body text-sm text-ink placeholder:text-ink/40 focus:outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-8">
              {current && (
                <button
                  onClick={() => onSelect(undefined)}
                  className="mb-1 flex w-full items-center justify-between rounded-xl px-3 py-3 text-left font-body text-sm text-ink/45 transition-transform duration-150 active:scale-[0.98]"
                >
                  Sin país
                </button>
              )}
              {results.map((c) => (
                <button
                  key={c.code}
                  onClick={() => onSelect(c.code)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left font-body text-[15px] text-ink transition-transform duration-150 active:scale-[0.98]"
                >
                  {c.name}
                  {current === c.code && <Check size={16} className="text-rust" />}
                </button>
              ))}
              {results.length === 0 && (
                <p className="mt-8 text-center font-body text-sm text-ink/40">
                  No hay resultados para "{query}"
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
