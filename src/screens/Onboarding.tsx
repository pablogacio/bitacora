import { useEffect, useState } from 'react'
import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { BookOpen, Sparkles, Globe2 } from 'lucide-react'

interface Slide {
  icon: typeof BookOpen
  title: string
  body: string
}

const slides: Slide[] = [
  {
    icon: BookOpen,
    title: 'Un diario para cada viaje',
    body: 'Cada viaje es un capítulo: fotos, notas y fechas, todo en un mismo sitio.',
  },
  {
    icon: Sparkles,
    title: 'Fotos que se organizan solas',
    body: 'Importa tus fotos y las agrupamos en viajes automáticamente según sus fechas.',
  },
  {
    icon: Globe2,
    title: 'Revive tu recorrido',
    body: 'Descubre cuántos países has visitado, cuántos días de viaje y cuántas fotos guardas.',
  },
]

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'splash' | 'carousel'>('splash')
  const [[slide, direction], setSlide] = useState<[number, number]>([0, 0])

  useEffect(() => {
    if (phase !== 'splash') return
    const timer = setTimeout(() => setPhase('carousel'), 2600)
    return () => clearTimeout(timer)
  }, [phase])

  function go(next: number) {
    if (next < 0 || next > slides.length - 1) return
    setSlide([next, next > slide ? 1 : -1])
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -60) go(slide + 1)
    else if (info.offset.x > 60) go(slide - 1)
  }

  const isLast = slide === slides.length - 1
  const Icon = slides[slide].icon

  return (
    <div className="paper-grain relative flex h-screen flex-col items-center justify-center overflow-hidden bg-paper px-8">
      <AnimatePresence mode="wait">
        {phase === 'splash' ? (
          <motion.div
            key="splash"
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center"
            onClick={() => setPhase('carousel')}
          >
            <motion.svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
              className="text-ink"
              initial="hidden"
              animate="visible"
            >
              <motion.circle
                cx="60"
                cy="60"
                r="46"
                stroke="currentColor"
                strokeWidth="1.4"
                variants={{ hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 1, opacity: 1 } }}
                transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1] }}
              />
              <motion.circle
                cx="60"
                cy="60"
                r="3"
                fill="currentColor"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.4 }}
              />
              {[0, 90, 180, 270].map((deg, i) => (
                <motion.line
                  key={deg}
                  x1="60"
                  y1="6"
                  x2="60"
                  y2="16"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  transform={`rotate(${deg} 60 60)`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 + i * 0.08, duration: 0.3 }}
                />
              ))}
              <motion.path
                d="M60 30 L69 60 L60 90 L51 60 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                variants={{ hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 1, opacity: 1 } }}
                transition={{ duration: 1.1, delay: 0.5, ease: [0.65, 0, 0.35, 1] }}
                initial="hidden"
                animate="visible"
              />
            </motion.svg>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 font-display text-[40px] text-ink"
            >
              Bitácora
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.95, duration: 0.7 }}
              className="mt-2 max-w-[260px] text-center font-body text-sm leading-relaxed text-ink/55"
            >
              Un diario para guardar y ordenar las fotos de cada viaje, tal y como los recuerdas.
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="carousel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex w-full flex-col items-center"
          >
            <button
              onClick={onDone}
              className="absolute right-6 top-8 font-body text-[11px] font-semibold uppercase tracking-widest2 text-ink/35 transition-transform duration-150 active:scale-95"
            >
              Saltar
            </button>

            <div className="relative h-[280px] w-full overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={slide}
                  custom={direction}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.7}
                  onDragEnd={handleDragEnd}
                  initial={{ opacity: 0, x: direction * 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -60 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 flex flex-col items-center px-2 text-center"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-ink/15">
                    <Icon size={30} strokeWidth={1.25} className="text-rust" />
                  </div>
                  <h2 className="mt-7 font-display text-[26px] leading-tight text-ink">
                    {slides[slide].title}
                  </h2>
                  <p className="mt-3 max-w-[270px] font-body text-sm leading-relaxed text-ink/55">
                    {slides[slide].body}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-4 flex items-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide([i, i > slide ? 1 : -1])}
                  aria-label={`Ir a la tarjeta ${i + 1}`}
                  className="p-1.5"
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all duration-300 ${
                      i === slide ? 'w-5 bg-rust' : 'w-1.5 bg-ink/20'
                    }`}
                  />
                </button>
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => (isLast ? onDone() : go(slide + 1))}
              className="mt-8 rounded-full bg-rust px-8 py-3.5 font-body text-[12px] font-semibold uppercase tracking-widest2 text-cream shadow-card"
            >
              {isLast ? 'Comenzar' : 'Siguiente'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
