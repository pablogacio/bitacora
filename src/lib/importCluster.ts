export interface DatedFile {
  file: File
  takenAt: number
}

export interface TripCluster {
  files: File[]
  startDate: string
  endDate: string
  suggestedTitle: string
}

const monthFmt = new Intl.DateTimeFormat('es-ES', { month: 'long' })

function toLocalISO(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function suggestedTitle(start: Date, end: Date): string {
  const m1 = monthFmt.format(start)
  const m2 = monthFmt.format(end)
  if (start.getFullYear() !== end.getFullYear()) {
    return `Viaje de ${m1} ${start.getFullYear()} – ${m2} ${end.getFullYear()}`
  }
  if (m1 !== m2) return `Viaje de ${m1}–${m2} ${end.getFullYear()}`
  return `Viaje de ${m1} de ${end.getFullYear()}`
}

/**
 * Groups photos into trip candidates: photos taken within `gapDays` of each
 * other belong to the same trip; a longer silence starts a new one. Uses the
 * file's lastModified timestamp (closest proxy for "taken at" without EXIF).
 */
export function clusterByDate(files: File[], gapDays = 4): TripCluster[] {
  if (files.length === 0) return []
  const gapMs = gapDays * 24 * 60 * 60 * 1000
  const sorted = [...files].sort((a, b) => a.lastModified - b.lastModified)

  const groups: File[][] = []
  let current: File[] = []
  let prev: number | null = null
  for (const f of sorted) {
    if (prev !== null && f.lastModified - prev > gapMs) {
      groups.push(current)
      current = []
    }
    current.push(f)
    prev = f.lastModified
  }
  if (current.length) groups.push(current)

  return groups.map((group) => {
    const start = new Date(group[0].lastModified)
    const end = new Date(group[group.length - 1].lastModified)
    return {
      files: group,
      startDate: toLocalISO(start),
      endDate: toLocalISO(end),
      suggestedTitle: suggestedTitle(start, end),
    }
  })
}
