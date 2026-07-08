import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Search, Globe2, Settings as SettingsIcon, Plus } from 'lucide-react'

const leftTabs = [
  { to: '/', icon: BookOpen, label: 'Diario' },
  { to: '/buscar', icon: Search, label: 'Buscar' },
]

const rightTabs = [
  { to: '/estadisticas', icon: Globe2, label: 'Estadísticas' },
  { to: '/ajustes', icon: SettingsIcon, label: 'Ajustes' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center"
      style={{ paddingBottom: 'max(1.1rem, env(safe-area-inset-bottom))' }}
    >
      <div className="relative flex items-center">
        <div className="flex items-center gap-7 rounded-full bg-ink px-6 py-3.5 shadow-card">
          {leftTabs.map((tab) => (
            <NavButton key={tab.to} tab={tab} active={location.pathname === tab.to} onClick={() => navigate(tab.to)} />
          ))}
          <div className="w-11" />
          {rightTabs.map((tab) => (
            <NavButton key={tab.to} tab={tab} active={location.pathname === tab.to} onClick={() => navigate(tab.to)} />
          ))}
        </div>

        <motion.button
          onClick={() => navigate('/nuevo-viaje')}
          className="absolute left-1/2 top-0 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-rust text-cream shadow-card ring-[5px] ring-paper"
          style={{ x: '-50%', y: '-50%' }}
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          aria-label="Nuevo viaje"
        >
          <Plus size={23} strokeWidth={2.25} />
        </motion.button>
      </div>
    </div>
  )
}

function NavButton({
  tab,
  active,
  onClick,
}: {
  tab: { to: string; icon: typeof BookOpen; label: string }
  active: boolean
  onClick: () => void
}) {
  const Icon = tab.icon
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center gap-1 py-1 transition-transform duration-150 active:scale-90"
      aria-label={tab.label}
    >
      <Icon size={20} strokeWidth={2} className={active ? 'text-cream' : 'text-cream/40'} />
      {active && (
        <motion.span
          layoutId="nav-dot"
          className="absolute -bottom-1.5 h-1 w-1 rounded-full bg-rust-light"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </button>
  )
}
