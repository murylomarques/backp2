import type { ReactNode } from 'react'

interface EmptyStateProps {
  titulo: string
  descricao?: string
  icone?: ReactNode
}

export function EmptyState({ titulo, descricao, icone }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-brand-beige bg-white/60 px-6 py-10 text-center">
      <div className="text-2xl">{icone ?? '📄'}</div>
      <p className="text-sm font-semibold text-brand-dark">{titulo}</p>
      {descricao && <p className="max-w-sm text-xs text-brand-charcoal/60">{descricao}</p>}
    </div>
  )
}
