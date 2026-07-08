import { useMemo } from 'react'
import { geoNaturalEarth1, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import worldTopologyJson from 'world-atlas/countries-110m.json'
import { ALPHA2_TO_NUMERIC } from '../lib/worldMapIds'

// The JSON import's `type` fields widen to `string`, but topojson-client's
// types want the literal "Topology"/"GeometryCollection" — cast at the edge.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const worldTopology = worldTopologyJson as any

const WIDTH = 700
const HEIGHT = 380

// Small/dense countries (e.g. Andorra, Singapore) can render as just a few
// pixels on a world map — impossible to tap reliably. Every visited country
// gets a fixed-size pin at its centroid instead, so the tap target size
// never depends on the country's actual geographic footprint. Sized in SVG
// user units against the 700-wide viewBox; at the ~375–430px rendered width
// this app is shown at, ~26 units works out to a comfortable ~14px on-screen
// tap radius (28px diameter) — small maps can't hit the full 44px a11y
// guideline without pins overlapping, but this is a large step up from the
// couple of screen pixels a tiny country's own shape would otherwise offer.
const PIN_HIT_RADIUS = 26
const PIN_DOT_RADIUS = 5.5

const NUMERIC_TO_ALPHA2 = new Map(
  Object.entries(ALPHA2_TO_NUMERIC).map(([alpha2, numeric]) => [numeric, alpha2]),
)

export default function WorldMap({
  visited,
  onSelectCountry,
}: {
  visited: Set<string>
  onSelectCountry: (code: string) => void
}) {
  const { countryPaths, pins } = useMemo(() => {
    const geo = feature(worldTopology, worldTopology.objects.countries) as unknown as {
      features: Array<{ id?: string | number; geometry: unknown }>
    }
    const projection = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], geo as never)
    const pathGenerator = geoPath(projection)

    const countryPaths = geo.features.map((f) => {
      const numericId = String(f.id ?? '')
      const alpha2 = NUMERIC_TO_ALPHA2.get(numericId)
      return {
        key: numericId || Math.random().toString(36),
        alpha2,
        d: pathGenerator(f as never) || '',
      }
    })

    const pins = countryPaths
      .filter((c) => c.alpha2 && visited.has(c.alpha2))
      .map((c) => {
        const match = geo.features.find((f) => String(f.id ?? '') === c.key)
        const centroid = match ? pathGenerator.centroid(match as never) : [0, 0]
        return { alpha2: c.alpha2 as string, x: centroid[0], y: centroid[1] }
      })
      .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y))

    return { countryPaths, pins }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visited])

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Mapa de países visitados">
      <g>
        {countryPaths.map((c) => {
          const isVisited = c.alpha2 ? visited.has(c.alpha2) : false
          return (
            <path
              key={c.key}
              d={c.d}
              fill={isVisited ? '#B5502F' : '#E4DAC4'}
              stroke="#F4EFE4"
              strokeWidth={0.6}
            />
          )
        })}
      </g>
      <g>
        {pins.map((p) => (
          <g key={p.alpha2}>
            <circle
              cx={p.x}
              cy={p.y}
              r={PIN_HIT_RADIUS}
              fill="transparent"
              style={{ pointerEvents: 'all' }}
              onClick={() => onSelectCountry(p.alpha2)}
              className="cursor-pointer"
            />
            <circle
              cx={p.x}
              cy={p.y}
              r={PIN_DOT_RADIUS}
              fill="#B5502F"
              stroke="#F4EFE4"
              strokeWidth={1.2}
              pointerEvents="none"
            />
          </g>
        ))}
      </g>
    </svg>
  )
}
