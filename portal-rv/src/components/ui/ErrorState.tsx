interface ErrorStateProps {
  mensagem: string
  onTentarNovamente: () => void
}

export function ErrorState({ mensagem, onTentarNovamente }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl bg-white px-6 py-10 text-center shadow-card-hover sm:px-10">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-status-danger-bg text-2xl">
        🔍
      </div>
      <div>
        <h2 className="text-lg font-bold text-brand-dark">Matrícula não encontrada</h2>
        <p className="mt-2 max-w-sm text-sm text-brand-charcoal/60">{mensagem}</p>
      </div>
      <button
        type="button"
        onClick={onTentarNovamente}
        className="rounded-xl bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-card transition hover:brightness-110"
      >
        Tentar novamente
      </button>
    </div>
  )
}
