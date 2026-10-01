import type { StatusIndicador } from '../types/rv'

interface StatusConfig {
  label: string
  textClass: string
  bgClass: string
  dotClass: string
  chartColor: string
}

const STATUS_MAP: Record<StatusIndicador, StatusConfig> = {
  meta_atingida: {
    label: 'Meta atingida',
    textClass: 'text-status-success',
    bgClass: 'bg-status-success-bg',
    dotClass: 'bg-status-success',
    chartColor: 'var(--color-status-success)',
  },
  proximo_da_meta: {
    label: 'Próximo da meta',
    textClass: 'text-status-warning',
    bgClass: 'bg-status-warning-bg',
    dotClass: 'bg-status-warning',
    chartColor: 'var(--color-status-warning)',
  },
  abaixo_da_meta: {
    label: 'Abaixo da meta',
    textClass: 'text-status-danger',
    bgClass: 'bg-status-danger-bg',
    dotClass: 'bg-status-danger',
    chartColor: 'var(--color-status-danger)',
  },
  pendente: {
    label: 'Aguardando fonte de dados',
    textClass: 'text-brand-charcoal/60',
    bgClass: 'bg-brand-graylight',
    dotClass: 'bg-brand-charcoal/40',
    chartColor: 'var(--color-brand-beige)',
  },
  colisao_nome: {
    label: 'Nome ambíguo — não exibido',
    textClass: 'text-status-warning',
    bgClass: 'bg-status-warning-bg',
    dotClass: 'bg-status-warning',
    chartColor: 'var(--color-status-warning)',
  },
}

export function statusConfig(status: StatusIndicador): StatusConfig {
  return STATUS_MAP[status]
}
