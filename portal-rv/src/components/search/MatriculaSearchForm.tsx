import { useState, type FormEvent } from 'react'

interface MatriculaSearchFormProps {
  onSubmit: (matricula: string) => void
}

export function MatriculaSearchForm({ onSubmit }: MatriculaSearchFormProps) {
  const [matricula, setMatricula] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!matricula.trim()) return
    onSubmit(matricula.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <label htmlFor="matricula" className="mb-2 block text-sm font-semibold text-brand-charcoal">
        Matrícula
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="matricula"
          name="matricula"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Ex: 10234"
          value={matricula}
          onChange={(event) => setMatricula(event.target.value)}
          className="w-full rounded-xl border border-brand-beige bg-white px-4 py-3 text-base text-brand-dark placeholder:text-brand-charcoal/40 shadow-sm outline-none transition focus:border-brand-red focus:ring-4 focus:ring-brand-red/10"
        />
        <button
          type="submit"
          disabled={!matricula.trim()}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-gradient px-6 py-3 text-base font-semibold text-white shadow-card transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Consultar RV
        </button>
      </div>

      <p className="mt-4 text-xs text-brand-charcoal/50">
        Ambiente de demonstração — experimente as matrículas{' '}
        <button
          type="button"
          onClick={() => setMatricula('10234')}
          className="font-semibold text-brand-red underline-offset-2 hover:underline"
        >
          10234
        </button>
        ,{' '}
        <button
          type="button"
          onClick={() => setMatricula('20567')}
          className="font-semibold text-brand-red underline-offset-2 hover:underline"
        >
          20567
        </button>{' '}
        ou{' '}
        <button
          type="button"
          onClick={() => setMatricula('30891')}
          className="font-semibold text-brand-red underline-offset-2 hover:underline"
        >
          30891
        </button>
        .
      </p>
    </form>
  )
}
