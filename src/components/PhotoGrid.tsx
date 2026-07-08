import { motion } from 'framer-motion'
import type { Photo } from '../data/types'

const rotations = ['-1.4deg', '1.1deg', '0.7deg', '-0.9deg', '1.3deg', '-0.6deg']

export default function PhotoGrid({
  photos,
  visibleCount,
  onOpen,
}: {
  photos: Photo[]
  visibleCount?: number
  onOpen: (index: number) => void
}) {
  const visible = visibleCount === undefined ? photos : photos.slice(0, visibleCount)
  return (
    <div className="grid grid-cols-2 gap-4">
      {visible.map((photo, index) => (
        <motion.button
          key={photo.id}
          layoutId={`photo-${photo.id}`}
          onClick={() => onOpen(index)}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.5, delay: (index % 8) * 0.045, ease: [0.22, 1, 0.36, 1] }}
          className="block rounded-md bg-cream p-1.5 shadow-soft"
          style={{ rotate: rotations[index % rotations.length] }}
        >
          <div className="overflow-hidden rounded-sm" style={{ aspectRatio: `${photo.width} / ${photo.height}` }}>
            <img
              src={photo.thumbUrl || photo.url}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
              style={{ filter: 'saturate(0.92) sepia(0.08) contrast(1.02)' }}
            />
          </div>
        </motion.button>
      ))}
    </div>
  )
}
