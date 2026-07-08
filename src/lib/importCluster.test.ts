import { describe, it, expect } from 'vitest'
import { clusterByDate } from './importCluster'

const DAY = 24 * 60 * 60 * 1000
const base = new Date('2026-05-10T12:00:00').getTime()

function fileAt(offsetDays: number, name = `p${offsetDays}.jpg`): File {
  return new File([new Blob(['x'])], name, { type: 'image/jpeg', lastModified: base + offsetDays * DAY })
}

describe('clusterByDate', () => {
  it('returns empty for no files', () => {
    expect(clusterByDate([])).toEqual([])
  })

  it('groups photos within the gap into one trip', () => {
    const clusters = clusterByDate([fileAt(0), fileAt(1), fileAt(3)])
    expect(clusters).toHaveLength(1)
    expect(clusters[0].files).toHaveLength(3)
    expect(clusters[0].startDate).toBe('2026-05-10')
    expect(clusters[0].endDate).toBe('2026-05-13')
  })

  it('splits into separate trips across a long gap', () => {
    const clusters = clusterByDate([fileAt(0), fileAt(1), fileAt(30), fileAt(31)])
    expect(clusters).toHaveLength(2)
    expect(clusters[0].files).toHaveLength(2)
    expect(clusters[1].files).toHaveLength(2)
    expect(clusters[1].startDate).toBe('2026-06-09')
  })

  it('sorts unordered input before clustering', () => {
    const clusters = clusterByDate([fileAt(31), fileAt(0), fileAt(30), fileAt(1)])
    expect(clusters).toHaveLength(2)
    expect(clusters[0].startDate).toBe('2026-05-10')
  })

  it('suggests a month-based title', () => {
    const [c] = clusterByDate([fileAt(0)])
    expect(c.suggestedTitle.toLowerCase()).toContain('mayo')
    expect(c.suggestedTitle).toContain('2026')
  })
})
