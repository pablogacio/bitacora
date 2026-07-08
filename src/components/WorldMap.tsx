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
  const countryPaths = useMemo(() => {
    const geo = feature(worldTopology, worldTopology.objects.countries) as unknown as {
      features: Array<{ id?: string | number; geometry: unknown }>
    }
    const projection = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], geo as never)
    const pathGenerator = geoPath(projection)
    return geo.features.map((f) => {
      const numericId = String(f.id ?? '')
      const alpha2 = NUMERIC_TO_ALPHA2.get(numericId)
      return {
        key: numericId || Math.random().toString(36),
        alpha2,
        d: pathGenerator(f as never) || '',
      }
    })
  }, [])

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Mapa de países visitados">
      {countryPaths.map((c) => {
        const isVisited = c.alpha2 ? visited.has(c.alpha2) : false
        return (
          <path
            key={c.key}
            d={c.d}
            onClick={() => isVisited && c.alpha2 && onSelectCountry(c.alpha2)}
            fill={isVisited ? '#B5502F' : '#E4DAC4'}
            stroke="#F4EFE4"
            strokeWidth={0.6}
            className={isVisited ? 'cursor-pointer transition-opacity duration-150 hover:opacity-80' : ''}
          />
        )
      })}
    </svg>
  )
}
