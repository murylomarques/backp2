interface HeaderProps {
  onNovaConsulta?: () => void
  mostrarNovaConsulta?: boolean
}

export function Header({ onNovaConsulta, mostrarNovaConsulta }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-brand-beige/60 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-sm font-bold text-white shadow-card">
            D
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight text-brand-dark sm:text-base">
              Portal RV <span className="text-brand-red">Desktop</span>
            </p>
            <p className="hidden text-xs text-brand-charcoal/60 sm:block">
              Acompanhamento de Remuneração Variável
            </p>
          </div>
        </div>

        {mostrarNovaConsulta && (
          <button
            type="button"
            onClick={onNovaConsulta}
            className="rounded-lg border border-brand-beige bg-white px-3 py-2 text-xs font-semibold text-brand-charcoal shadow-sm transition hover:border-brand-red hover:text-brand-red sm:px-4 sm:text-sm"
          >
            Nova consulta
          </button>
        )}
      </div>
    </header>
  )
}
