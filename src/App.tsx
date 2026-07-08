import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { ensureSeedData } from './data/seed'
import BottomNav from './components/BottomNav'
import Home from './screens/Home'
import TripDetail from './screens/TripDetail'
import NewTrip from './screens/NewTrip'
import ImportReview from './screens/ImportReview'
import Search from './screens/Search'
import Settings from './screens/Settings'
import Stats from './screens/Stats'
import Onboarding from './screens/Onboarding'

const ONBOARD_KEY = 'bitacora_onboarded'

export default function App() {
  const location = useLocation()
  const [ready, setReady] = useState(false)
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem(ONBOARD_KEY) === '1')

  useEffect(() => {
    ensureSeedData().then(() => setReady(true))
  }, [])

  if (!onboarded) {
    return (
      <Onboarding
        onDone={() => {
          localStorage.setItem(ONBOARD_KEY, '1')
          setOnboarded(true)
        }}
      />
    )
  }

  if (!ready) return <div className="h-screen bg-paper" />

  const isModal = location.pathname === '/nuevo-viaje' || location.pathname === '/importar'

  return (
    <div
      className="paper-grain relative mx-auto min-h-screen max-w-md overflow-hidden bg-paper"
      style={{ contain: 'layout paint' }}
    >
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/buscar" element={<Search />} />
          <Route path="/estadisticas" element={<Stats />} />
          <Route path="/ajustes" element={<Settings />} />
          <Route path="/viaje/:tripId" element={<TripDetail />} />
          <Route path="/nuevo-viaje" element={<NewTrip />} />
          <Route path="/importar" element={<ImportReview />} />
        </Routes>
      </AnimatePresence>
      {!isModal && <BottomNav />}
    </div>
  )
}
