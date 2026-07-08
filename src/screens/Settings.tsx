import { Cloud, Download, Info, Moon, Compass } from 'lucide-react'
import PageTransition from '../components/PageTransition'

function Row({
  icon: Icon,
  label,
  hint,
  disabled,
}: {
  icon: typeof Cloud
  label: string
  hint?: string
  disabled?: boolean
}) {
  return (
    <div className={`flex items-center gap-3.5 py-3.5 ${disabled ? 'opacity-45' : ''}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/[0.05] text-ink/60">
        <Icon size={16} strokeWidth={1.75} />
      </div>
      <div className="flex-1">
        <p className="font-body text-[14px] text-ink">{label}</p>
        {hint && <p className="font-body text-[12px] text-ink/45">{hint}</p>}
      </div>
    </div>
  )
}

export default function Settings() {
  return (
    <PageTransition className="relative z-10 h-screen overflow-y-auto no-scrollbar pb-32">
      <div className="px-6 pt-9">
        <h1 className="font-display text-[28px] text-ink">Ajustes</h1>

        <div className="mt-7">
          <p className="mb-1 font-body text-[11px] font-semibold uppercase tracking-widest2 text-ink/40">
            Datos
          </p>
          <div className="divide-y divide-ink/8 rounded-xl2 bg-cream px-4 shadow-soft">
            <Row icon={Cloud} label="Copia de seguridad en la nube" hint="Próximamente" disabled />
            <Row icon={Download} label="Exportar álbumes" hint="Próximamente" disabled />
          </div>
          <p className="mt-2 px-1 font-body text-[12px] leading-relaxed text-ink/45">
            Por ahora tus viajes y fotos se guardan solo en este dispositivo.
          </p>
        </div>

        <div className="mt-7">
          <p className="mb-1 font-body text-[11px] font-semibold uppercase tracking-widest2 text-ink/40">
            Apariencia
          </p>
          <div className="divide-y divide-ink/8 rounded-xl2 bg-cream px-4 shadow-soft">
            <Row icon={Moon} label="Modo oscuro" hint="Próximamente" disabled />
          </div>
        </div>

        <div className="mt-7">
          <p className="mb-1 font-body text-[11px] font-semibold uppercase tracking-widest2 text-ink/40">
            Acerca de
          </p>
          <div className="divide-y divide-ink/8 rounded-xl2 bg-cream px-4 shadow-soft">
            <Row icon={Info} label="Bitácora" hint="Versión 0.1.0" />
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 pb-4 text-center text-ink/30">
          <Compass size={18} strokeWidth={1.5} />
          <p className="font-display text-sm italic">Un lugar para guardar cada viaje</p>
        </div>
      </div>
    </PageTransition>
  )
}
