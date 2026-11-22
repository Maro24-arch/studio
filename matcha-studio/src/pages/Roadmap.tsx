import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '../components/Layout'
import Photo from '../components/Photo'
import { Confirm, Empty, Note, Stars, Toast, useToast } from '../components/ui'
import { REGS, STEPS, Step } from '../data/roadmap'
import { Link } from '../lib/router'
import { Costs, defaultEmail, SampleTest, SupplierRow, uid, useStore } from '../lib/store'

export default function Roadmap() {
  const checks = useStore((s) => s.checks)
  const total = STEPS.reduce((n, s) => n + s.checks.length, 0)
  const done = STEPS.reduce((n, s) => n + s.checks.filter((_, i) => checks[`${s.id}-${i}`]).length, 0)
  const pct = Math.round((done / total) * 100)
  const [cur, setCur] = useState('s1')
  return (
    <>
      <PageHeader n="05" title="From Idea to Product" jp="歩む" plate={<Photo slot="ch-roadmap" plate="fields" tone="ivory" peak="river" seed={11} alt="Illustrated path through tea fields" className="h-full w-full" />}>
        <p>If this ever becomes a real product, these are the steps — in plain language, with worksheets to fill in as you go. Take them in any order. Skip what doesn’t fit. Stop whenever you like.</p>
      </PageHeader>

      <div className="wrap mt-24 grid gap-12 xl:grid-cols-[240px_1fr]">
        <aside className="sticky top-24 hidden h-fit xl:block" aria-label="Roadmap steps">
          <p className="label">Your progress</p>
          <p className="font-display text-5xl">{pct}<span className="text-2xl">%</span></p>
          <div className="mt-2 h-px bg-ink/15"><motion.div className="h-px bg-sage-700" animate={{ width: `${pct}%` }} /></div>
          <ol className="mt-6 space-y-1.5">
            {STEPS.map((s) => {
              const d = s.checks.filter((_, i) => checks[`${s.id}-${i}`]).length
              return <li key={s.id}><button onClick={() => { setCur(s.id); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' }) }} className={`flex w-full items-baseline gap-3 py-1 text-left font-sans text-[13px] transition-colors ${cur === s.id ? 'text-ink' : 'text-soft hover:text-ink'}`}><span className="w-5 text-sage-600">{String(s.n).padStart(2, '0')}</span><span className="flex-1">{s.title}</span>{d === s.checks.length && <span aria-label="complete" className="text-sage-600">✓</span>}</button></li>
            })}
          </ol>
        </aside>
        <div className="space-y-28">
          <Note>This roadmap is a starting orientation, not legal, tax or financial advice. No supplier prices are given here and none of the regulatory topics have been independently verified for your situation — always check with the sources named.</Note>
          {STEPS.map((s) => <StepBlock key={s.id} s={s} onView={() => setCur(s.id)} />)}
        </div>
      </div>
    </>
  )
}

function StepBlock({ s, onView }: { s: Step; onView: () => void }) {
  const { checks, toggleCheck, stepNotes, update } = useStore()
  return (
    <motion.section id={s.id} className="scroll-mt-24" onViewportEnter={onView} viewport={{ margin: '-40% 0px -50% 0px' }}>
      <div className="grid gap-8 border-t border-ink/15 pt-8 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="font-display text-[88px] font-light leading-none text-sage-300">{String(s.n).padStart(2, '0')}</p>
          <h2 className="display mt-2 text-4xl sm:text-5xl">{s.title}</h2>
          <p className="mt-4 font-display text-2xl italic text-soft">{s.lead}</p>
          <p className="prose-quiet mt-4 text-[15px]">{s.why}</p>
          {s.link && <Link to={s.link.to} className="btn-quiet mt-5">{s.link.label} →</Link>}
        </div>
        <div>
          <p className="label">Checklist</p>
          <ul className="mt-2 divide-y divide-ink/10 border-y border-ink/10">
            {s.checks.map((c, i) => {
              const id = `${s.id}-${i}`
              return <li key={id}><label className="flex cursor-pointer items-start gap-3 py-3 font-sans text-[14.5px] leading-relaxed"><input type="checkbox" className="mt-1.5 h-4 w-4 shrink-0 accent-sage-700" checked={!!checks[id]} onChange={() => toggleCheck(id)} /><span className={checks[id] ? 'text-soft line-through decoration-sage-300' : ''}>{c}</span></label></li>
            })}
          </ul>
        </div>
      </div>
      <div className="mt-10">
        {s.id === 's2' && <Suppliers />}
        {s.id === 's3' && <EmailTemplate />}
        {s.id === 's4' && <Samples />}
        {s.id === 's8' && <CostCalc />}
        {s.id === 's9' && <Regs />}
        {s.prompts && <ul className="mb-4 grid gap-px bg-ink/15 sm:grid-cols-2">{s.prompts.map((p) => <li key={p} className="bg-ivory p-5 font-display text-2xl italic">{p}</li>)}</ul>}
        <label className="label" htmlFor={`n-${s.id}`}>Your notes for this step</label>
        <textarea id={`n-${s.id}`} rows={3} className="field-box mt-2" placeholder="Thoughts, findings, names, questions…" value={stepNotes[s.id] || ''} onChange={(e) => update('stepNotes', (n) => ({ ...n, [s.id]: e.target.value }))} />
      </div>
    </motion.section>
  )
}

const COLS: [keyof SupplierRow, string, number][] = [['name', 'Producer / merchant', 190], ['region', 'Region', 120], ['cultivar', 'Cultivar(s)', 130], ['flush', 'Harvest', 100], ['moq', 'Min. order', 100], ['price', 'Quoted price (yours)', 150], ['leadTime', 'Lead time', 100], ['organic', 'Certificates', 130], ['samples', 'Samples?', 100], ['contact', 'Contacted / reply', 150], ['notes', 'Notes', 220]]
function Suppliers() {
  const { suppliers, update } = useStore()
  const [del, setDel] = useState<string | null>(null)
  const add = () => update('suppliers', (a) => [...a, { id: uid(), name: '', region: '', cultivar: '', flush: '', moq: '', price: '', leadTime: '', organic: '', samples: '', contact: '', notes: '' }])
  const patch = (id: string, k: keyof SupplierRow, v: string) => update('suppliers', (a) => a.map((x) => (x.id === id ? { ...x, [k]: v } : x)))
  return (
    <div className="mb-10">
      <div className="flex items-end justify-between"><h3 className="font-display text-3xl">Supplier comparison</h3><button className="btn-solid" onClick={add}>Add a supplier</button></div>
      <p className="mt-1 font-sans text-[13px] text-soft">Left empty on purpose — only fill in prices you have actually been quoted.</p>
      {!suppliers.length ? <div className="mt-4"><Empty>No suppliers yet.</Empty></div> : (
        <div className="mt-4 overflow-x-auto border-y border-ink/15">
          <table className="w-full border-collapse text-left"><caption className="sr-only">Supplier comparison</caption>
            <thead><tr>{COLS.map(([k, l, w]) => <th key={k} scope="col" style={{ minWidth: w }} className="label border-b border-ink/15 px-2 py-3 font-normal">{l}</th>)}<th className="w-10" /></tr></thead>
            <tbody>{suppliers.map((r) => (
              <tr key={r.id} className="border-b border-ink/10 align-top">
                {COLS.map(([k, l]) => <td key={k} className="px-1 py-1">{k === 'notes' ? <textarea aria-label={l} rows={2} className="field-box !p-2 !text-[13px]" value={r[k]} onChange={(e) => patch(r.id, k, e.target.value)} /> : <input aria-label={l} className="field !text-[13.5px]" value={r[k]} onChange={(e) => patch(r.id, k, e.target.value)} />}</td>)}
                <td className="px-1 py-2"><button aria-label="Remove supplier" className="text-stamp" onClick={() => setDel(r.id)}>×</button></td>
              </tr>))}</tbody></table>
        </div>)}
      <Confirm open={!!del} message="Remove this supplier row?" onNo={() => setDel(null)} onYes={() => { update('suppliers', (a) => a.filter((x) => x.id !== del)); setDel(null) }} />
    </div>
  )
}

function EmailTemplate() {
  const { emailTemplate, set } = useStore()
  const { msg, show } = useToast()
  return (
    <div className="mb-10">
      <h3 className="font-display text-3xl">A first message — a starting point</h3>
      <p className="mt-1 font-sans text-[13px] text-soft">Fill in the [brackets] and make it yours. Saved as you type.</p>
      <textarea aria-label="Email template" rows={16} className="field-box mt-3 font-sans" value={emailTemplate} onChange={(e) => set({ emailTemplate: e.target.value })} />
      <div className="mt-3 flex gap-4"><button className="btn" onClick={() => { navigator.clipboard?.writeText(emailTemplate); show('Copied to clipboard') }}>Copy</button><button className="btn-quiet" onClick={() => set({ emailTemplate: defaultEmail })}>Restore original</button></div>
      <Toast msg={msg} />
    </div>
  )
}

const SC: [Exclude<keyof SampleTest, 'id'>, string][] = [['color', 'Colour'], ['aroma', 'Aroma'], ['umami', 'Umami'], ['sweetness', 'Sweet'], ['bitterness', 'Bitter'], ['astringency', 'Astring.'], ['texture', 'Texture']]
function Samples() {
  const { samples, update } = useStore()
  const blank = { supplier: '', lot: '', date: new Date().toISOString().slice(0, 10), color: 0, aroma: 0, umami: 0, sweetness: 0, bitterness: 0, astringency: 0, texture: 0, notes: '' }
  const [f, setF] = useState<Omit<SampleTest, 'id'>>(blank)
  return (
    <div className="mb-10">
      <h3 className="font-display text-3xl">Sample-testing sheet</h3>
      <p className="mt-1 font-sans text-[13px] text-soft">Same grams, same water, same bowl. Score 1–5 (for bitterness & astringency, 5 = strong).</p>
      <form className="mt-4 grid gap-5 bg-paper/70 p-6 lg:grid-cols-2" onSubmit={(e) => { e.preventDefault(); update('samples', (a) => [{ id: uid(), ...f, supplier: f.supplier || 'Untitled sample' }, ...a]); setF(blank) }}>
        <div className="space-y-4">
          <div><label className="label" htmlFor="ss">Sample / supplier</label><input id="ss" className="field" value={f.supplier} onChange={(e) => setF({ ...f, supplier: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="label" htmlFor="sl">Lot / harvest</label><input id="sl" className="field" value={f.lot} onChange={(e) => setF({ ...f, lot: e.target.value })} /></div><div><label className="label" htmlFor="sd">Date</label><input id="sd" type="date" className="field" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div></div>
          <div><label className="label" htmlFor="sn">Notes</label><textarea id="sn" rows={3} className="field-box" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
        </div>
        <div><div className="divide-y divide-ink/10">{SC.map(([k, l]) => <div key={k} className="flex items-center justify-between py-2 font-sans text-[14px]">{l}<Stars label={l} value={f[k] as number} onChange={(n) => setF({ ...f, [k]: n })} /></div>)}</div><button className="btn-solid mt-4">Save sample</button></div>
      </form>
      {samples.length > 0 && (
        <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[720px] text-left font-sans text-[13.5px]"><caption className="sr-only">Saved samples</caption>
          <thead><tr className="border-b border-ink/15"><th className="label py-2 font-normal">Sample</th>{SC.map(([k, l]) => <th key={k} scope="col" className="label py-2 font-normal">{l}</th>)}<th className="w-8" /></tr></thead>
          <tbody>{samples.map((s) => (
            <tr key={s.id} className="border-b border-ink/10 align-top"><th scope="row" className="py-3 pr-3 text-left font-normal"><span className="font-display text-xl">{s.supplier}</span><br /><span className="text-xs text-soft">{s.lot && `${s.lot} · `}{s.date}</span>{s.notes && <span className="mt-1 block max-w-[28ch] text-xs text-soft">{s.notes}</span>}</th>
              {SC.map(([k]) => <td key={k} className="py-3 tabular-nums">{(s[k] as number) || '–'}</td>)}
              <td><button aria-label="Delete sample" className="text-stamp" onClick={() => update('samples', (a) => a.filter((x) => x.id !== s.id))}>×</button></td></tr>))}</tbody></table></div>)}
    </div>
  )
}

const num = (v: string) => (v === '' ? 0 : Math.max(0, +v) || 0)
const EX: Costs = { jpyPerKg: 10000, fx: 160, kg: 5, unitGrams: 30, packaging: 1, labour: 0.5, shipping: 100, dutyPct: 5, vatPct: 10, testing: 200, other: 100, price: 15 }
function CostCalc() {
  const { costs: c, set } = useStore()
  const ch = (k: keyof Costs, v: string) => set({ costs: { ...c, [k]: num(v) } })
  const r = useMemo(() => {
    const goods = c.fx ? (c.jpyPerKg * c.kg) / c.fx : 0
    const duty = (goods + c.shipping) * (c.dutyPct / 100)
    const units = c.unitGrams ? Math.floor((c.kg * 1000) / c.unitGrams) : 0
    const pack = c.packaging * units, lab = c.labour * units, other = c.testing + c.other
    const total = goods + c.shipping + duty + other + pack + lab
    const per = units ? total / units : 0
    return { goods, duty, units, pack, lab, other, total, per, margin: c.price - per, mpct: c.price ? ((c.price - per) / c.price) * 100 : 0, incl: c.price * (1 + c.vatPct / 100) }
  }, [c])
  const eur = (n: number) => `€${n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
  const F = ({ k, l, h, suffix }: { k: keyof Costs; l: string; h?: string; suffix?: string }) => (
    <div><label className="label" htmlFor={`c-${k}`}>{l}</label><div className="flex items-baseline gap-2"><input id={`c-${k}`} type="number" inputMode="decimal" min={0} step="any" className="field" value={c[k] || ''} placeholder="0" onChange={(e) => ch(k, e.target.value)} />{suffix && <span className="font-sans text-xs text-soft">{suffix}</span>}</div>{h && <p className="mt-0.5 font-sans text-[11.5px] text-soft">{h}</p>}</div>
  )
  const parts: [string, number, string][] = [['Leaf', r.goods, '#40533A'], ['Shipping', c.shipping, '#6F8260'], ['Duty', r.duty, '#8E9F78'], ['Testing & other', r.other, '#B0BD9C'], ['Packaging', r.pack, '#B9A688'], ['Labour / filling', r.lab, '#D8CDB4']]
  return (
    <div className="mb-10">
      <div className="flex flex-wrap items-end justify-between gap-3"><h3 className="font-display text-3xl">Cost calculator</h3><div className="flex gap-4"><button className="btn-quiet" onClick={() => set({ costs: EX })}>Fill with an example</button><button className="btn-quiet" onClick={() => set({ costs: { ...EX, jpyPerKg: 0, fx: 0, kg: 0, packaging: 0, labour: 0, shipping: 0, dutyPct: 0, vatPct: 0, testing: 0, other: 0, price: 0, unitGrams: 30 } })}>Clear</button></div></div>
      <p className="mt-1 max-w-[70ch] font-sans text-[13px] text-soft">Everything starts empty. Enter the figures you have been quoted. “Fill with an example” uses round placeholder numbers only — not real prices, tariffs or tax rates.</p>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <F k="jpyPerKg" l="Quoted leaf price per kg" suffix="JPY" /><F k="fx" l="Exchange rate" suffix="JPY per €1" h="Check today’s rate" />
          <F k="kg" l="Batch size" suffix="kg" /><F k="unitGrams" l="Grams per unit sold" suffix="g" />
          <F k="shipping" l="Shipping, total" suffix="€" /><F k="dutyPct" l="Import duty" suffix="%" h="Ask a customs agent" />
          <F k="testing" l="Lab tests, certificates" suffix="€" /><F k="other" l="Other one-off costs" suffix="€" />
          <F k="packaging" l="Packaging per unit" suffix="€" /><F k="labour" l="Labour / filling per unit" suffix="€" />
          <F k="price" l="Selling price per unit (ex. VAT)" suffix="€" /><F k="vatPct" l="VAT rate" suffix="%" h="Confirm with a gestor" />
        </div>
        <div className="self-start bg-sage-800 p-7 text-ivory on-dark" aria-live="polite">
          <p className="eyebrow !text-sage-300">Result</p>
          <p className="mt-3 font-display text-6xl">{r.units ? eur(r.per) : '—'}</p><p className="font-sans text-[13px] text-ivory/60">cost per unit · {r.units} units</p>
          <div className="mt-5 flex h-3 overflow-hidden">{parts.map(([n, v, col]) => <span key={n} title={`${n}: ${eur(v)}`} style={{ width: `${r.total ? (v / r.total) * 100 : 0}%`, background: col }} />)}</div>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 font-sans text-[12px] text-ivory/70">{parts.map(([n, v, col]) => <li key={n} className="flex items-center gap-2"><i className="h-2 w-2" style={{ background: col }} />{n} {eur(v)}</li>)}</ul>
          <dl className="mt-6 space-y-2 border-t border-ivory/20 pt-5 font-sans text-[14px]">
            <div className="flex justify-between"><dt>Total batch cost</dt><dd>{eur(r.total)}</dd></div>
            <div className="flex justify-between"><dt>Margin per unit</dt><dd>{c.price ? `${eur(r.margin)} (${r.mpct.toFixed(0)}%)` : '—'}</dd></div>
            <div className="flex justify-between"><dt>Price shown to customers incl. VAT</dt><dd>{c.price ? eur(r.incl) : '—'}</dd></div>
          </dl>
          <p className="mt-5 font-sans text-[11.5px] leading-relaxed text-ivory/50">Simplified. Excludes import VAT cash-flow (often recoverable if VAT-registered), wastage, marketing, platform fees, insurance and your own time.</p>
        </div>
      </div>
    </div>
  )
}

function Regs() {
  return (
    <div className="mb-10">
      <h3 className="font-display text-3xl">Topics to look into</h3>
      <div className="mt-3"><Note tone="stamp">Not legal advice and not independently verified. These are the subject areas commonly relevant to a small food business importing tea into Spain. Rules change; please check each with the named sources, and consider a gestor or food-law adviser.</Note></div>
      <ul className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
        {REGS.map((g) => (
          <li key={g.topic} className="grid gap-2 py-5 md:grid-cols-[240px_1fr_1fr] md:gap-8">
            <p className="font-display text-2xl">{g.topic}{g.flag && <span className="tag-lead ml-2 align-middle">Often missed</span>}</p>
            <p className="font-sans text-[14px] leading-relaxed text-soft">{g.what}</p>
            <p className="font-sans text-[14px] leading-relaxed"><span className="label mr-2">Verify with</span>{g.verify}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
