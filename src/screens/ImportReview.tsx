import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { X, Sparkles, ImageIcon } from 'lucide-react'
import { clusterByDate } from '../lib/importCluster'
import { useImportStore } from '../data/importStore'
import { repo } from '../data/repository'
import { formatRange } from '../lib/format'

interface DraftTrip {
  title: string
  included: boolean
}

export default function ImportReview() {
  const navigate = useNavigate()
  const files = useImportStore((s) => s.files)
  const clear = useImportStore((s) => s.clear)
  const [saving, setSaving] = useState(false)
  const [progress, setProgress] = useState('')

  const clusters = useMemo(() => clusterByDate(files), [files])
  const [drafts, setDrafts] = useState<DraftTrip[]>(() =>
    clusters.map((c) => ({ title: c.suggestedTitle, included: true })),
  )

  const previews = useMemo(
    () => clusters.map((c) => c.files.slice(0, 3).map((f) => URL.createObjectURL(f))),
    [clusters],
  )
  useEffect(() => () => previews.flat().forEach((u) => URL.revokeObjectURL(u)), [previews])

  useEffect(() => {
    if (files.length === 0) navigate('/', { replace: true })
  }, [files.length, navigate])

  const includedCount = drafts.filter((d) => d.included).length

  function updateDraft(i: number, patch: Partial<DraftTrip>) {
    setDrafts((ds) => ds.map((d, j) => (j === i ? { ...d, ...patch } : d)))
  }

  async function handleCreate() {
    if (saving || includedCount === 0) return
    setSaving(true)
    try {
      let done = 0
      for (let i = 0; i < clusters.length; i++) {
        if (!drafts[i].included) continue
        done++
        setProgress(`Creando viaje ${done} de ${includedCount}…`)
        const trip = await repo.createTrip({
          title: drafts[i].title.trim() || clusters[i].suggestedTitle,
          place: '',
          startDate: clusters[i].startDate,
          endDate: clusters[i].endDate,
          coverFile: clusters[i].files[0],
        })
        await repo.addPhotos(trip.id, clusters[i].files)
      }
      clear()
      navigate('/', { replace: true })
    } finally {
      setSaving(false)
    }
  }

  function handleClose() {
    clear()
    navigate(-1)
  }

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      className="absolute inset-0 z-50 flex flex-col bg-paper"
    >
      <div className="flex items-center justify-between px-5 pb-3 pt-7">
        <button
          onClick={handleClose}
          disabled={saving}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/5 text-ink/60 transition-transform duration-150 active:scale-90"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>
        <span className="font-body text-[11px] font-semibold uppercase tracking-widest2 text-ink/40">
          Viajes detectados
        </span>
        <button
          onClick={handleCreate}
          disabled={saving || includedCount === 0}
          className="rounded-full bg-rust px-4 py-2 font-body text-[12px] font-semibold uppercase tracking-widest2 text-cream transition-transform duration-150 active:scale-95 disabled:opacity-30"
        >
          {saving ? 'Creando…' : `Crear ${includedCount}`}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-16 pt-1">
        <div className="mb-6 flex items-start gap-2.5 rounded-xl2 bg-olive/10 px-4 py-3.5">
          <Sparkles size={15} className="mt-0.5 shrink-0 text-olive" />
          <p className="font-body text-[13px] leading-relaxed text-ink/70">
            Hemos agrupado tus {files.length} fotos en {clusters.length}{' '}
            {clusters.length === 1 ? 'viaje' : 'viajes'} según sus fechas. Ajusta los nombres y
            confirma.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {clusters.map((cluster, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className={`rounded-xl2 bg-cream p-4 shadow-soft transition-opacity ${drafts[i].included ? '' : 'opacity-45'}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex shrink-0 -space-x-3">
                  {previews[i].map((url, j) => (
                    <img
                      key={j}
                      src={url}
                      alt=""
                      className="h-12 w-12 rounded-md border-2 border-cream object-cover shadow-soft"
                      style={{ rotate: `${(j - 1) * 4}deg`, filter: 'saturate(0.9) sepia(0.08)' }}
                    />
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <input
                    value={drafts[i].title}
                    disabled={saving}
                    onChange={(e) => updateDraft(i, { title: e.target.value })}
                    className="w-full border-b border-transparent bg-transparent font-display text-[17px] text-ink focus:border-rust focus:outline-none"
                    aria-label="Nombre del viaje"
                  />
                  <p className="mt-0.5 flex items-center gap-1.5 font-body text-[11px] text-ink/50">
                    <ImageIcon size={11} />
                    {cluster.files.length} fotos · {formatRange(cluster.startDate, cluster.endDate)}
                  </p>
                </div>
                <button
                  onClick={() => updateDraft(i, { included: !drafts[i].included })}
                  disabled={saving}
                  role="switch"
                  aria-checked={drafts[i].included}
                  aria-label={`Incluir ${drafts[i].title}`}
                  className={`relative h-6 w-10 shrink-0 rounded-full transition-colors duration-200 ${drafts[i].included ? 'bg-rust' : 'bg-ink/15'}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-cream shadow-soft transition-all duration-200 ${drafts[i].included ? 'left-[18px]' : 'left-0.5'}`}
                  />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {saving && (
          <p className="mt-6 text-center font-display text-sm italic text-ink/55">{progress}</p>
        )}
      </div>
    </motion.div>
  )
}
