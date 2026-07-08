import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Compass } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled error in app tree:', error, info.componentStack)
  }

  handleReload = () => {
    this.setState({ error: null })
    window.location.assign('/')
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="paper-grain flex h-screen flex-col items-center justify-center bg-paper px-8 text-center">
        <Compass size={28} strokeWidth={1.5} className="text-ink/30" />
        <p className="mt-5 font-display text-xl text-ink">Algo se ha torcido</p>
        <p className="mt-2 max-w-[260px] font-body text-sm leading-relaxed text-ink/55">
          Ha ocurrido un error inesperado. Tus viajes y fotos están a salvo, guardados en este
          dispositivo.
        </p>
        <button
          onClick={this.handleReload}
          className="mt-7 rounded-full bg-rust px-7 py-3 font-body text-[12px] font-semibold uppercase tracking-widest2 text-cream shadow-card"
        >
          Volver al diario
        </button>
      </div>
    )
  }
}
