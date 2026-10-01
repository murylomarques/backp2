import type { StatusIndicador } from '../../types/rv'
import { statusConfig } from '../../utils/status'

interface ProgressBarProps {
  atingimento: number
  status: StatusIndicador
  size?: 'sm' | 'md'
}

export function ProgressBar({ atingimento, status, size = 'md' }: ProgressBarProps) {
  const config = statusConfig(status)
  const largura = Math.min(Math.max(atingimento, 0), 100)
  const height = size === 'sm' ? 'h-1.5' : 'h-2.5'

  return (
    <div className={`relative w-full overflow-hidden rounded-full bg-brand-graylight ${height}`}>
      <div
        className={`h-full rounded-full ${config.dotClass} transition-[width] duration-700 ease-out`}
        style={{ width: `${largura}%` }}
      />
      {atingimento > 100 && (
        <div className="absolute right-0 top-0 h-full w-1 rounded-full bg-white/70" aria-hidden />
      )}
    </div>
  )
}
