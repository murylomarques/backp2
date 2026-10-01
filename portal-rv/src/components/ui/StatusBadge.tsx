import type { StatusIndicador } from '../../types/rv'
import { statusConfig } from '../../utils/status'

interface StatusBadgeProps {
  status: StatusIndicador
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig(status)
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.bgClass} ${config.textClass} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} aria-hidden />
      {config.label}
    </span>
  )
}
