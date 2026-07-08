import { motion } from 'framer-motion'

export default function Onboarding({ onDone }: { onDone: () => void }) {
  return (
    <div className="paper-grain relative flex h-screen flex-col items-center justify-center bg-paper px-8">
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

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.25, duration: 0.6 }}
        whileTap={{ scale: 0.96 }}
        onClick={onDone}
        className="mt-10 rounded-full bg-rust px-8 py-3.5 font-body text-[12px] font-semibold uppercase tracking-widest2 text-cream shadow-card"
      >
        Comenzar
      </motion.button>
    </div>
  )
}
