import { useState } from 'react'
import { NomeTecnicoAutocomplete } from './NomeTecnicoAutocomplete'
import type { SugestaoTecnico } from '../../types/consultorRv'

interface ConsultaConsultorFormProps {
  periodoPadrao: string
  onSubmit: (nomeTecnico: string, periodo: string) => void
}

export function ConsultaConsultorForm({ periodoPadrao, onSubmit }: ConsultaConsultorFormProps) {
  const [tecnicoSelecionado, setTecnicoSelecionado] = useState<SugestaoTecnico | null>(null)
  const [periodo, setPeriodo] = useState(periodoPadrao)

  function handleSubmit() {
    if (!tecnicoSelecionado) return
    onSubmit(tecnicoSelecionado.nome, periodo)
  }

  return (
    <div className="w-full">
      <NomeTecnicoAutocomplete onSelecionar={setTecnicoSelecionado} />

      <div className="mt-4">
        <label htmlFor="periodo" className="mb-2 block text-sm font-semibold text-brand-charcoal">
          Período de referência
        </label>
        <input
          id="periodo"
          type="month"
          value={periodo}
          onChange={(event) => setPeriodo(event.target.value)}
          className="w-full rounded-xl border border-brand-beige bg-white px-4 py-3 text-base text-brand-dark shadow-sm outline-none transition focus:border-brand-red focus:ring-4 focus:ring-brand-red/10"
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!tecnicoSelecionado}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-6 py-3 text-base font-semibold text-white shadow-card transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Consultar RV
      </button>

      <p className="mt-4 text-xs text-brand-charcoal/50">
        Dados reais do BSC. Digite ao menos 3 letras do nome e escolha um técnico na lista antes de consultar.
      </p>
    </div>
  )
}
