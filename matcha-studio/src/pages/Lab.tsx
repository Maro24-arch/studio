import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PageHeader } from '../components/Layout'
import Photo from '../components/Photo'
import Radar from '../components/Radar'
import { Confirm, Empty, Note, SectionTitle, Toast, useToast } from '../components/ui'
import { AXES, CONCEPTS, FORMATS, INGREDIENTS } from '../data/lab'
import { Experiment, Flavor, now, uid, useStore } from '../lib/store'

const clamp = (n: number) => Math.max(0, Math.min(10, n))

export default function Lab() {
  return (
    <>
      <PageHeader n="03" title="The Matcha Lab" jp="試す" plate={<Photo slot="ch-lab" plate="powder" tone="sage" seed={8} alt="Illustrated matcha powder swirl" className="h-full w-full" />}>
        <p>A playground. Choose a direction, shape a flavour, imagine a form and see what it looks like. Nothing here is a decision — it is a way of noticing what you are drawn to.</p>
      </PageHeader>
      <Stage />
      <JournalSection />
    </>
  )
}

function FormatIcon({ id }: { id: string }) {
  const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinejoin: 'round' as const }
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14" aria-hidden>
      {id === 'loose' && <><path d="M18 12h28l4 8v34a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3V20z" {...s} /><path d="M14 20h36M22 28h20" {...s} /></>}
      {id === 'sachet' && <><path d="M26 6h12v6l-2 3v39l-4 4-4-4V15l-2-3z" {...s} /><path d="M26 12h12" {...s} /></>}
      {id === 'tin' && <><rect x="14" y="20" width="36" height="34" rx="2" {...s} /><rect x="12" y="14" width="40" height="8" rx="2" {...s} /></>}
      {id === 'bottle' && <><path d="M28 6h8v8l5 8v32a3 3 0 0 1-3 3H26a3 3 0 0 1-3-3V22l5-8z" {...s} /><path d="M23 32h18" {...s} /></>}
      {id === 'kit' && <><path d="M10 30h28a0 0 0 0 1 0 0c0 10-6 18-14 18S10 40 10 30z" {...s} /><path d="M44 54L54 14" {...s} /><path d="M40 28l12-6M41 34l12-6M42 40l12-6" {...s} /></>}
    </svg>
  )
}

function MiniRadar({ f, color = '#556A49' }: { f: Flavor; color?: string }) {
  const v = AXES.map((a) => f[a.key]); const c = 50, R = 40
  const p = (i: number, val: number) => `${(c + Math.cos(-Math.PI / 2 + (i / 5) * 6.283) * R * (val / 10)).toFixed(1)},${(c + Math.sin(-Math.PI / 2 + (i / 5) * 6.283) * R * (val / 10)).toFixed(1)}`
  return (
    <svg viewBox="0 0 100 100" className="h-24 w-24" aria-hidden>
      <polygon points={v.map((_, i) => p(i, 10)).join(' ')} fill="none" stroke="#23271F" strokeOpacity=".2" />
      <polygon points={v.map((x, i) => p(i, x)).join(' ')} fill={color} fillOpacity=".3" stroke={color} strokeWidth="1.4" />
    </svg>
  )
}

function Stage() {
  const { experiments, update } = useStore()
  const { msg, show } = useToast()
  const [concept, setConcept] = useState(CONCEPTS[0].id)
  const [format, setFormat] = useState(FORMATS[0].id)
  const [flavor, setFlavor] = useState<Flavor>(CONCEPTS[0].preset)
  const [ings, setIngs] = useState<string[]>([])
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [what, setWhat] = useState<string | null>(null)
  const c = CONCEPTS.find((x) => x.id === concept)!
  const f = FORMATS.find((x) => x.id === format)!

  const pick = (id: string) => { setConcept(id); setFlavor(CONCEPTS.find((x) => x.id === id)!.preset) }
  const withIng = useMemo(() => {
    const out = { ...flavor }
    ings.forEach((id) => { const ing = INGREDIENTS.find((i) => i.id === id)!; (Object.entries(ing.adds) as [keyof Flavor, number][]).forEach(([k, d]) => { out[k] = clamp(out[k] + d) }) })
    return out
  }, [flavor, ings])

  const save = () => {
    const e: Experiment = { id: uid(), name: name.trim() || `Experiment ${String(experiments.length + 1).padStart(2, '0')}`, concept, format, flavor: { ...flavor }, ingredients: ings, notes, favorite: false, createdAt: now() }
    update('experiments', (a) => [e, ...a]); show(`“${e.name}” saved to your journal`); setName(''); setNotes('')
  }
  const surprise = () => {
    const co = CONCEPTS[Math.floor(Math.random() * CONCEPTS.length)], fo = FORMATS[Math.floor(Math.random() * FORMATS.length)]
    const pool = [...INGREDIENTS].sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 2))
    setConcept(co.id); setFormat(fo.id); setIngs(pool.map((p) => p.id))
    const j = (v: number) => clamp(Math.round(v + (Math.random() * 4 - 2)))
    setFlavor({ sweetness: j(co.preset.sweetness), bitterness: j(co.preset.bitterness), umami: j(co.preset.umami), creaminess: j(co.preset.creaminess), intensity: j(co.preset.intensity) })
    setWhat(`What if ${co.id === 'innovative' ? 'something new' : co.name.toLowerCase()} came as ${fo.name.toLowerCase()}, with ${pool.map((p) => p.name.toLowerCase()).join(' and ')}?`)
  }
  const reset = () => { pick(CONCEPTS[0].id); setFormat(FORMATS[0].id); setIngs([]); setWhat(null); setName(''); setNotes('') }

  return (
    <section className="on-dark mt-20 bg-sage-900 py-20 text-ivory sm:py-28" aria-label="The lab bench">
      <div className="wrap">
        <div className="mb-14 flex flex-col justify-between gap-6 border-b border-ivory/15 pb-8 md:flex-row md:items-end">
          <h2 className="display text-5xl sm:text-7xl">The bench</h2>
          <p className="max-w-[48ch] font-sans text-[13.5px] leading-relaxed text-ivory/65">These are exploratory concepts to spark ideas — <strong className="font-medium text-ivory">not validated food formulations</strong>. A real product needs recipe development, stability and safety testing, and regulatory review.</p>
        </div>

        <div className="grid gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
          {/* controls */}
          <div className="space-y-16">
            <div>
              <p className="eyebrow !text-sage-300">i · Direction</p>
              <ul className="mt-5">
                {CONCEPTS.map((x) => (
                  <li key={x.id}><button onClick={() => pick(x.id)} aria-pressed={concept === x.id} className="group flex w-full items-baseline gap-4 border-b border-ivory/15 py-3.5 text-left">
                    <span className={`h-px shrink-0 transition-all duration-500 ${concept === x.id ? 'w-10 bg-ivory' : 'w-3 bg-ivory/40 group-hover:w-6'}`} />
                    <span className={`font-display text-3xl transition-all duration-300 sm:text-4xl ${concept === x.id ? 'italic text-ivory' : 'text-ivory/55 group-hover:text-ivory'}`}>{x.name}</span>
                  </button></li>
                ))}
              </ul>
              <AnimatePresence mode="wait"><motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5">
                <p className="font-display text-xl italic text-sage-200">{c.line}</p>
                <ul className="mt-3 space-y-1 font-sans text-[13.5px] text-ivory/65">{c.wonder.map((w) => <li key={w} className="flex gap-3"><span className="mt-2 h-px w-3 shrink-0 bg-sage-300" />{w}</li>)}</ul>
              </motion.div></AnimatePresence>
            </div>

            <div>
              <p className="eyebrow !text-sage-300">ii · Flavour</p>
              <div className="mt-4 space-y-3">
                {AXES.map((a) => (
                  <div key={a.key}>
                    <div className="flex items-baseline justify-between"><label htmlFor={`s-${a.key}`} className="font-display text-2xl">{a.label}</label><span className="font-sans text-[13px] tabular-nums text-ivory/60">{flavor[a.key]}/10</span></div>
                    <input id={`s-${a.key}`} type="range" min={0} max={10} step={1} value={flavor[a.key]} onChange={(e) => setFlavor({ ...flavor, [a.key]: +e.target.value })} className="text-ivory" aria-valuetext={`${flavor[a.key]} of 10, from ${a.low} to ${a.high}`} />
                    <div className="flex justify-between font-sans text-[11px] text-ivory/45"><span>{a.low}</span><span>{a.high}</span></div>
                  </div>
                ))}
              </div>
              <button onClick={() => setFlavor(c.preset)} className="mt-4 font-sans text-[12px] uppercase tracking-[0.16em] text-sage-200 underline underline-offset-4">Reset to a starting point for this direction</button>
            </div>

            <div>
              <p className="eyebrow !text-sage-300">iii · Form</p>
              <div className="mt-5 grid grid-cols-5 gap-2" role="radiogroup" aria-label="Product format">
                {FORMATS.map((x) => (
                  <button key={x.id} role="radio" aria-checked={format === x.id} onClick={() => setFormat(x.id)} className={`flex flex-col items-center gap-2 border px-1 py-4 text-center transition-colors ${format === x.id ? 'border-ivory bg-ivory text-sage-900' : 'border-ivory/20 hover:border-ivory/60'}`}>
                    <FormatIcon id={x.id} /><span className="font-sans text-[10.5px] uppercase leading-tight tracking-[0.1em]">{x.name}</span>
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait"><motion.ul key={f.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-5 space-y-1.5 font-sans text-[13.5px] text-ivory/65">
                {f.think.map((t) => <li key={t} className="flex gap-3"><span className="mt-2 h-px w-3 shrink-0 bg-sage-300" />{t}</li>)}
              </motion.ul></AnimatePresence>
            </div>

            <div>
              <p className="eyebrow !text-sage-300">iv · Pairings <span className="ml-2 normal-case tracking-normal opacity-60">(choose any)</span></p>
              <div className="mt-5 flex flex-wrap gap-2">
                {INGREDIENTS.map((i) => {
                  const on = ings.includes(i.id)
                  return <button key={i.id} aria-pressed={on} title={i.note} onClick={() => setIngs(on ? ings.filter((x) => x !== i.id) : [...ings, i.id])} className={`border px-3.5 py-1.5 font-sans text-[13px] transition-colors ${on ? 'border-ivory bg-ivory text-sage-900' : 'border-ivory/25 text-ivory/80 hover:border-ivory/70'}`}>{i.name}</button>
                })}
              </div>
              {ings.length > 0 && <ul className="mt-5 space-y-1 font-sans text-[13px] text-ivory/65">{ings.map((id) => { const i = INGREDIENTS.find((x) => x.id === id)!; return <li key={id}><span className="text-ivory">{i.name}</span> — {i.note}</li> })}</ul>}
            </div>
          </div>

          {/* diagram */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="border border-ivory/15 p-5 sm:p-8">
              <div className="flex items-baseline justify-between"><p className="eyebrow !text-sage-300">Flavour diagram</p><p className="font-sans text-[11px] text-ivory/50">{c.name} · {f.name}</p></div>
              <div className="mx-auto mt-2 max-w-[460px]">
                <Radar dark size={460} axes={AXES.map((a) => a.label)} labelSize={13}
                  series={[{ values: AXES.map((a) => flavor[a.key]), color: '#CFD7C0', label: 'Your intention', fill: 0.22 }, ...(ings.length ? [{ values: AXES.map((a) => withIng[a.key]), color: '#E3A58F', label: 'With pairings', dashed: true, fill: 0.08 }] : [])]} />
              </div>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 font-sans text-[12px] text-ivory/70"><span className="flex items-center gap-2"><i className="h-px w-5 bg-sage-200" />Your intention</span>{ings.length > 0 && <span className="flex items-center gap-2"><i className="h-px w-5 border-t border-dashed border-[#E3A58F]" />With pairings (rough nudge)</span>}</div>
              {what && <motion.p key={what} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 border-t border-ivory/15 pt-5 font-display text-2xl italic leading-snug">{what}</motion.p>}
            </div>
            <div className="mt-6 space-y-4">
              <div><label className="label !text-ivory/60" htmlFor="xn">Give it a name (optional)</label><input id="xn" className="field !border-ivory/30 !text-ivory placeholder:!text-ivory/30 focus:!border-ivory" placeholder="A working name, nothing final" value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div><label className="label !text-ivory/60" htmlFor="xo">Notes</label><textarea id="xo" rows={3} className="field-box !border-ivory/25 !bg-transparent !text-ivory placeholder:!text-ivory/30" placeholder="Who is it for? What does it taste like in your imagination?" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
              <div className="flex flex-wrap gap-3">
                <button onClick={save} className="inline-flex items-center border border-ivory bg-ivory px-5 py-2.5 font-sans text-[12px] uppercase tracking-[0.16em] text-sage-900 transition-colors hover:bg-transparent hover:text-ivory">Save to journal</button>
                <button onClick={surprise} className="inline-flex items-center border border-ivory/40 px-5 py-2.5 font-sans text-[12px] uppercase tracking-[0.16em] transition-colors hover:border-ivory">Surprise me</button>
                <button onClick={reset} className="px-3 font-sans text-[12px] uppercase tracking-[0.16em] text-ivory/60 underline underline-offset-4 hover:text-ivory">Clear</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toast msg={msg} />
      <LoadBridge set={{ setConcept, setFormat, setFlavor, setIngs, setName, setNotes }} />
    </section>
  )
}

// lets the journal "reopen" an experiment on the bench
const bridge: { current: any } = { current: null }
function LoadBridge({ set }: { set: any }) { bridge.current = set; return null }

function JournalSection() {
  const { experiments, update } = useStore()
  const [cmp, setCmp] = useState<string[]>([])
  const [del, setDel] = useState<string | null>(null)
  const patch = (id: string, p: Partial<Experiment>) => update('experiments', (a) => a.map((x) => (x.id === id ? { ...x, ...p } : x)))
  const toggle = (id: string) => setCmp((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? c : [...c, id]))
  const reopen = (e: Experiment) => {
    const b = bridge.current; if (!b) return
    b.setConcept(e.concept); b.setFormat(e.format); b.setFlavor(e.flavor); b.setIngs(e.ingredients); b.setName(e.name); b.setNotes(e.notes)
    window.scrollTo({ top: document.querySelector('[aria-label="The lab bench"]')!.getBoundingClientRect().top + window.scrollY - 40, behavior: 'smooth' })
  }
  const chosen = experiments.filter((e) => cmp.includes(e.id))
  const colors = ['#556A49', '#A8432C', '#8B7A5A']
  return (
    <section className="wrap mt-28" aria-label="Experiment journal">
      <SectionTitle eyebrow="Experiment journal" title="What you’ve tried.">
        <p>Saved experiments live here, and in your workspace. Reopen one on the bench to continue, or tick up to three to lay them over one another.</p>
      </SectionTitle>
      {chosen.length >= 2 && (
        <div className="mt-10 grid items-center gap-10 border-y border-ink/15 py-10 lg:grid-cols-[360px_1fr]">
          <Radar size={360} axes={AXES.map((a) => a.label)} series={chosen.map((e, i) => ({ values: AXES.map((a) => e.flavor[a.key]), color: colors[i], label: e.name, dashed: i === 2 }))} />
          <div>
            <table className="w-full text-left font-sans text-[14px]">
              <caption className="sr-only">Comparison of saved experiments</caption>
              <thead><tr className="border-b border-ink/15"><th className="py-2 font-normal" />{chosen.map((e, i) => <th key={e.id} className="py-2 pr-3 font-display text-xl font-normal" style={{ color: colors[i] }}>{e.name}</th>)}</tr></thead>
              <tbody>
                <tr className="border-b border-ink/10"><th className="label py-2 font-normal">Direction</th>{chosen.map((e) => <td key={e.id} className="py-2 pr-3">{CONCEPTS.find((c) => c.id === e.concept)?.name}</td>)}</tr>
                <tr className="border-b border-ink/10"><th className="label py-2 font-normal">Form</th>{chosen.map((e) => <td key={e.id} className="py-2 pr-3">{FORMATS.find((c) => c.id === e.format)?.name}</td>)}</tr>
                {AXES.map((a) => <tr key={a.key} className="border-b border-ink/10"><th className="label py-2 font-normal">{a.label}</th>{chosen.map((e) => <td key={e.id} className="py-2 pr-3 tabular-nums">{e.flavor[a.key]}</td>)}</tr>)}
                <tr><th className="label py-2 align-top font-normal">Pairings</th>{chosen.map((e) => <td key={e.id} className="py-2 pr-3 align-top">{e.ingredients.map((i) => INGREDIENTS.find((x) => x.id === i)?.name).join(', ') || '—'}</td>)}</tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="mt-10">
        {!experiments.length ? <Empty>Nothing saved yet. Shape something on the bench and choose “Save to journal”.</Empty> : (
          <ul className="grid gap-px bg-ink/15 md:grid-cols-2">
            {[...experiments].sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.createdAt.localeCompare(a.createdAt)).map((e) => (
              <li key={e.id} className="bg-ivory p-6">
                <div className="flex gap-5">
                  <MiniRadar f={e.flavor} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <input aria-label="Experiment name" className="field !border-0 font-display !text-2xl" value={e.name} onChange={(ev) => patch(e.id, { name: ev.target.value })} />
                      <button aria-pressed={e.favorite} aria-label={e.favorite ? 'Unfavourite' : 'Favourite'} onClick={() => patch(e.id, { favorite: !e.favorite })} className={`text-2xl leading-none ${e.favorite ? 'text-stamp' : 'text-ink/30 hover:text-stamp'}`}>{e.favorite ? '★' : '☆'}</button>
                    </div>
                    <p className="font-sans text-[12px] text-soft">{CONCEPTS.find((c) => c.id === e.concept)?.name} · {FORMATS.find((c) => c.id === e.format)?.name}</p>
                    <p className="mt-1 font-sans text-[12px] text-soft">{e.ingredients.map((i) => INGREDIENTS.find((x) => x.id === i)?.name).join(', ') || 'No pairings'}</p>
                  </div>
                </div>
                <textarea aria-label={`Notes for ${e.name}`} rows={2} className="field-box mt-4" placeholder="Notes, tasting thoughts, next ideas…" value={e.notes} onChange={(ev) => patch(e.id, { notes: ev.target.value })} />
                <div className="mt-3 flex flex-wrap items-center gap-5">
                  <label className="flex items-center gap-2 font-sans text-[12px] uppercase tracking-[0.14em] text-soft"><input type="checkbox" className="accent-sage-700" checked={cmp.includes(e.id)} onChange={() => toggle(e.id)} disabled={!cmp.includes(e.id) && cmp.length >= 3} />Compare</label>
                  <button className="btn-quiet" onClick={() => reopen(e)}>Reopen on bench</button>
                  <button className="btn-quiet !text-stamp ml-auto" onClick={() => setDel(e.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-8"><Note>Concepts are creative sketches. If any idea starts to feel real, the roadmap explains the steps — recipe development, testing and regulation — that come next.</Note></div>
      <Confirm open={!!del} message="Delete this experiment from your journal?" confirmLabel="Delete" onNo={() => setDel(null)} onYes={() => { update('experiments', (a) => a.filter((x) => x.id !== del)); setCmp((c) => c.filter((x) => x !== del)); setDel(null) }} />
    </section>
  )
}
