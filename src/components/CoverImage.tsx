import type { CSSProperties } from 'react'
import { Compass } from 'lucide-react'

export default function CoverImage({
  src,
  alt,
  className,
  style,
}: {
  src?: string
  alt: string
  className?: string
  style?: CSSProperties
}) {
  if (!src) {
    return (
      <div
        className={`flex items-start justify-center bg-gradient-to-br from-olive/70 via-ink/80 to-ink pt-[18%] ${className || ''}`}
      >
        <Compass size={32} strokeWidth={1.25} className="text-cream/30" />
      </div>
    )
  }
  return <img src={src} alt={alt} className={className} style={style} />
}
