export function Footer() {
  return (
    <footer className="border-t border-brand-beige/60 bg-white/60 py-6">
      <div className="mx-auto max-w-6xl px-4 text-center text-xs text-brand-charcoal/50 sm:px-6 lg:px-8">
        <p>Portal RV Desktop · Dados de Remuneração Variável para uso interno.</p>
        <p className="mt-1">
          Fonte dos indicadores:{' '}
          <span className="font-medium text-brand-charcoal/70">BSC (VIEW_BSC) — piloto Consultor Técnico</span>
        </p>
      </div>
    </footer>
  )
}
