import { useEffect, useRef, useState } from 'react'
import { buscarSugestoesTecnico } from '../../services/bsc/bscApiClient'
import type { SugestaoTecnico } from '../../types/consultorRv'

interface NomeTecnicoAutocompleteProps {
  onSelecionar: (sugestao: SugestaoTecnico) => void
}

export function NomeTecnicoAutocomplete({ onSelecionar }: NomeTecnicoAutocompleteProps) {
  const [termo, setTermo] = useState('')
  const [sugestoes, setSugestoes] = useState<SugestaoTecnico[]>([])
  const [buscando, setBuscando] = useState(false)
  const [aberto, setAberto] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (termo.trim().length < 3) {
      setSugestoes([])
      setBuscando(false)
      return
    }

    setBuscando(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const resultado = await buscarSugestoesTecnico(termo)
        setSugestoes(resultado)
        setAberto(true)
      } catch {
        setSugestoes([])
      } finally {
        setBuscando(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [termo])

  function selecionar(sugestao: SugestaoTecnico) {
    setTermo(sugestao.nome)
    setAberto(false)
    onSelecionar(sugestao)
  }

  return (
    <div className="relative">
      <label htmlFor="nome-tecnico" className="mb-2 block text-sm font-semibold text-brand-charcoal">
        Nome do técnico
      </label>
      <input
        id="nome-tecnico"
        type="text"
        autoComplete="off"
        placeholder="Digite ao menos 3 letras do nome"
        value={termo}
        onChange={(event) => setTermo(event.target.value)}
        onFocus={() => sugestoes.length > 0 && setAberto(true)}
        onBlur={() => setTimeout(() => setAberto(false), 150)}
        className="w-full rounded-xl border border-brand-beige bg-white px-4 py-3 text-base text-brand-dark placeholder:text-brand-charcoal/40 shadow-sm outline-none transition focus:border-brand-red focus:ring-4 focus:ring-brand-red/10"
      />

      {buscando && (
        <p className="mt-2 text-xs text-brand-charcoal/50">Buscando…</p>
      )}

      {aberto && sugestoes.length > 0 && (
        <ul className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-brand-beige bg-white shadow-card-hover">
          {sugestoes.map((sugestao) => (
            <li key={sugestao.nome}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selecionar(sugestao)}
                className="flex w-full flex-col items-start px-4 py-2.5 text-left text-sm hover:bg-brand-cream/40"
              >
                <span className="font-semibold text-brand-dark">{sugestao.nome}</span>
                <span className="text-xs text-brand-charcoal/55">
                  {sugestao.cidade ?? '—'} · {sugestao.regional ?? '—'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {aberto && !buscando && termo.trim().length >= 3 && sugestoes.length === 0 && (
        <div className="absolute z-30 mt-2 w-full rounded-xl border border-brand-beige bg-white px-4 py-3 text-sm text-brand-charcoal/60 shadow-card-hover">
          Nenhum técnico encontrado com esse nome.
        </div>
      )}
    </div>
  )
}
