export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl2 bg-ink/[0.06] ${className || ''}`}
      aria-hidden="true"
    />
  )
}
