const shortFmt = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' })
const longFmt = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })

export function formatRange(startIso: string, endIso: string): string {
  if (!startIso) return ''
  const start = new Date(startIso)
  const end = endIso ? new Date(endIso) : start
  const sameYear = start.getFullYear() === end.getFullYear()
  const sameMonth = sameYear && start.getMonth() === end.getMonth()

  if (sameMonth && start.getDate() === end.getDate()) {
    return `${shortFmt.format(start)} ${start.getFullYear()}`
  }
  if (sameMonth) {
    return `${start.getDate()}–${end.getDate()} ${shortFmt.format(end).split(' ')[1]} ${end.getFullYear()}`
  }
  if (sameYear) {
    return `${shortFmt.format(start)} – ${shortFmt.format(end)} ${end.getFullYear()}`
  }
  return `${shortFmt.format(start)} ${start.getFullYear()} – ${shortFmt.format(end)} ${end.getFullYear()}`
}

export function formatLong(iso: string): string {
  if (!iso) return ''
  return longFmt.format(new Date(iso))
}

export function tripDurationDays(startIso: string, endIso: string): number {
  const start = new Date(startIso)
  const end = new Date(endIso || startIso)
  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(1, diff + 1)
}

export function tripYear(iso: string): string {
  return iso ? String(new Date(iso).getFullYear()) : ''
}
