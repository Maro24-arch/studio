import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { geoMercator } from 'd3-geo'
import { PageHeader } from '../components/Layout'
import Photo from '../components/Photo'
import { BookmarkIcon, Confirm, Empty, Note, Reveal, SectionTitle, Tabs, Toast, useToast } from '../components/ui'
import { JAPAN_MAP } from '../data/japanMap'
import { REGIONS, SEASON, STARTER_QUESTIONS, Region } from '../data/regions'
import { uid, useStore, Place } from '../lib/store'

const LABEL: Record<string, [number, number, 'start' | 'middle' | 'end']> = {
  uji: [-22, 38, 'end'], mie: [6, 48, 'start'], nishio: [-6, -30, 'middle'], shizuoka: [24, 6, 'start'], yame: [14, -2, 'start'], kagoshima: [14, 4, 'start'],
}
const proj = geoMercator().scale(JAPAN_MAP.scale).translate(JAPAN_MAP.translate).center(JAPAN_MAP.center)

export default function Japan() {
  const [sel, setSel] = useState<string>('uji')
  const region = REGIONS.find((r) => r.id === sel)!
  return (
    <>
      <PageHeader n="02" title="Explore Japan" jp="旅" plate={<Photo slot="ch-japan" plate="terrace" tone="sage" seed={5} alt="Illustrated terraced tea hills" className="h-full w-full" />}>
        <p>Matcha is shaped by place — by climate, soil, history and the people who grow it. Explore six regions, save the ones that draw you in, and start shaping the questions and itinerary for a research trip.</p>
      </PageHeader>

      <section className="wrap mt-24" aria-label="Map of tea regions">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_1.1fr] lg:gap-16">
          <JapanMap sel={sel} setSel={setSel} />
          <RegionPanel region={region} />
        </div>
      </section>

      <Seasons />
      <Planner onPick={setSel} />
    </>
  )
}

function JapanMap({ sel, setSel }: { sel: string; setSel: (s: string) => void }) {
  const saved = useStore((s) => s.savedRegions)
  const pts = useMemo(() => REGIONS.map((r) => ({ r, xy: proj([r.lon, r.lat]) as [number, number] })), [])
  const { width: W, height: H } = JAPAN_MAP
  return (
    <div className="lg:sticky lg:top-24 lg:self-start">
      <p className="eyebrow mb-3">Select a region</p>
      <div className="relative mx-auto max-w-[520px] bg-paper/60 p-2">
        <svg viewBox="30 465 440 285" className="h-auto w-full" role="group" aria-label="Interactive map of Japan with six tea regions">
          <defs>
            <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="6" stroke="#6F8260" strokeOpacity=".12" /></pattern>
          </defs>
          {[0.2, 0.4, 0.6, 0.8].map((f) => <line key={f} x1={0} x2={W} y1={H * f} y2={H * f} stroke="#23271F" strokeOpacity=".05" />)}
          {[0.2, 0.4, 0.6, 0.8].map((f) => <line key={f} y1={0} y2={H} x1={W * f} x2={W * f} stroke="#23271F" strokeOpacity=".05" />)}
          <path d={JAPAN_MAP.path} fill="#DDE3CF" stroke="#6F8260" strokeWidth="1" strokeLinejoin="round" />
          <path d={JAPAN_MAP.path} fill="url(#hatch)" />
          <text x={440} y={490} fontFamily="Cormorant Garamond, serif" fontStyle="italic" fontSize="20" fill="#5B6155" textAnchor="middle">N ↑</text>
          <text x={40} y={738} fontFamily="Jost, sans-serif" fontSize="10" letterSpacing="2" fill="#5B6155" opacity=".7">SCHEMATIC · NOT FOR NAVIGATION</text>
          {pts.map(({ r, xy: [x, y] }) => {
            const on = sel === r.id
            const [dx, dy, anchor] = LABEL[r.id]
            return (
              <g key={r.id} role="button" tabIndex={0} aria-label={`${r.name}, ${r.pref}${saved.includes(r.id) ? ' (saved)' : ''}`} aria-pressed={on} className="cursor-pointer outline-none"
                onClick={() => setSel(r.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSel(r.id) } }}>
                <line x1={x} y1={y} x2={x + dx} y2={y + dy - 9} stroke="#23271F" strokeOpacity=".35" strokeWidth=".7" />
                <circle cx={x} cy={y} r={16} fill="transparent" />
                {on && <motion.circle cx={x} cy={y} r={5} fill="none" stroke="#A8432C" strokeWidth="1" initial={{ r: 5, opacity: 0.9 }} animate={{ r: 16, opacity: 0 }} transition={{ repeat: Infinity, duration: 2.2 }} />}
                <circle cx={x} cy={y} r={on ? 5 : 3.6} fill={on ? '#A8432C' : '#40533A'} stroke="#F7F3EA" strokeWidth="1.6" style={{ transition: 'all .3s' }} />
                {saved.includes(r.id) && <circle cx={x} cy={y} r={8} fill="none" stroke="#40533A" strokeWidth="1" />}
                <text x={x + dx} y={y + dy} textAnchor={anchor} fontFamily="Cormorant Garamond, serif" fontSize={on ? 17 : 15} fontWeight={on ? 500 : 400} fill="#23271F">{r.name}</text>
                <text x={x + dx} y={y + dy + 11} textAnchor={anchor} fontFamily="Jost, sans-serif" fontSize="8" letterSpacing="1.2" fill="#5B6155">{r.jp}</text>
              </g>
            )
          })}
        </svg>
      </div>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Regions">
        {REGIONS.map((r) => <button key={r.id} onClick={() => setSel(r.id)} aria-pressed={sel === r.id} className={`chip ${sel === r.id ? 'chip-on' : 'hover:border-sage-600'}`}>{r.name}</button>)}
      </div>
    </div>
  )
}

function RegionPanel({ region: r }: { region: Region }) {
  const { savedRegions, places, update } = useStore()
  const { msg, show } = useToast()
  const isSaved = savedRegions.includes(r.id)
  const toggle = () => { update('savedRegions', (s) => (s.includes(r.id) ? s.filter((x) => x !== r.id) : [...s, r.id])); show(isSaved ? 'Removed from saved regions' : `${r.name} saved`) }
  const addPlace = (v: Region['visits'][number]) => {
    if (places.some((p) => p.refId === v.id)) return
    update('places', (p) => [...p, { id: uid(), name: v.name, kind: v.kind, regionId: r.id, status: v.status, note: '', visited: false, refId: v.id }])
    show(`${v.name} added to your places`)
  }
  return (
    <AnimatePresence mode="wait">
      <motion.article key={r.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
        <Photo slot={`region-${r.id === 'uji' ? 'uji' : r.id}`} plate={r.peak === 'rolling' ? 'terrace' : 'fields'} tone={r.tone} peak={r.peak} seed={r.seed} alt={`${r.name} — illustrated landscape`} className="aspect-[16/9] w-full" />
        <div className="mt-8 flex items-start justify-between gap-6">
          <div>
            <p className="eyebrow">{r.pref} Prefecture</p>
            <h2 className="display mt-2 text-5xl sm:text-6xl">{r.name}</h2>
            <p className="mt-1 font-display text-2xl italic text-sage-500" lang="ja">{r.jp}</p>
          </div>
          <button onClick={toggle} aria-pressed={isSaved} className={`mt-1 flex items-center gap-2 border px-4 py-2 font-sans text-[11px] uppercase tracking-[0.16em] transition-colors ${isSaved ? 'border-sage-700 bg-sage-700 text-ivory' : 'border-ink/30 hover:border-sage-700'}`}>
            <BookmarkIcon on={isSaved} /> {isSaved ? 'Saved' : 'Save region'}
          </button>
        </div>
        <p className="mt-6 font-display text-3xl italic leading-snug">{r.tagline}</p>
        <div className="prose-quiet mt-5">{r.summary.map((p) => <p key={p}>{p}</p>)}</div>
        <dl className="mt-8 grid gap-6 border-y border-ink/10 py-6 font-sans text-[14px] sm:grid-cols-2">
          <div><dt className="label">Typical character</dt><dd className="mt-1 leading-relaxed text-soft">{r.character}</dd></div>
          <div><dt className="label">Typical season</dt><dd className="mt-1 leading-relaxed text-soft">{r.season}</dd></div>
          <div className="sm:col-span-2"><dt className="label">Tradition</dt><dd className="mt-1 leading-relaxed text-soft">{r.tradition}</dd></div>
          <div className="sm:col-span-2"><dt className="label">Known for</dt><dd className="mt-2 flex flex-wrap gap-2">{r.known.map((k) => <span key={k} className="chip">{k}</span>)}</dd></div>
        </dl>

        <h3 className="mt-10 font-display text-3xl">Places & experiences to research</h3>
        <div className="mt-3"><Note>None of these listings have been confirmed for opening hours, prices, availability or contact details — and none are endorsements. <span className="tag-est">Established</span> names are long-known businesses or sites that still need you to confirm current details; <span className="tag-lead">Research lead</span> items are ideas that need real investigation.</Note></div>
        <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
          {r.visits.map((v) => {
            const added = places.some((p) => p.refId === v.id)
            return (
              <li key={v.id} className="grid gap-3 py-5 sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1"><span className="font-display text-2xl">{v.name}</span>{v.jp && <span className="font-sans text-xs text-soft" lang="ja">{v.jp}</span>}<span className={v.status === 'established' ? 'tag-est' : 'tag-lead'}>{v.status === 'established' ? 'Established · confirm details' : 'Research lead'}</span></p>
                  <p className="label mt-1">{v.kind}</p>
                  <p className="mt-2 font-sans text-[14px] leading-relaxed text-soft">{v.desc}</p>
                </div>
                <button onClick={() => addPlace(v)} disabled={added} className="btn-quiet self-start whitespace-nowrap disabled:opacity-60">{added ? '✓ On my list' : '+ Add to my list'}</button>
              </li>
            )
          })}
        </ul>
      </motion.article>
      <Toast msg={msg} />
    </AnimatePresence>
  )
}

function Seasons() {
  const [i, setI] = useState(4)
  return (
    <section className="mt-32 bg-sage-800 py-20 text-ivory on-dark" aria-label="When to go">
      <div className="wrap">
        <p className="eyebrow !text-sage-300">When to go</p>
        <h2 className="display mt-3 text-5xl sm:text-6xl">The tea year.</h2>
        <div className="mt-12 grid grid-cols-12 gap-1" role="group" aria-label="Months">
          {SEASON.map((s, n) => (
            <button key={n} onClick={() => setI(n)} aria-pressed={i === n} aria-label={`Month ${n + 1}: ${s.t}`} className="group text-center">
              <span className={`mx-auto block w-full origin-bottom transition-all duration-500 ${i === n ? 'bg-ivory' : 'bg-ivory/20 group-hover:bg-ivory/50'}`} style={{ height: n >= 3 && n <= 4 ? 120 : n === 5 || n === 6 || n === 2 ? 74 : n >= 8 && n <= 10 ? 48 : 26 }} />
              <span className={`mt-3 block font-sans text-xs tracking-widest ${i === n ? 'text-ivory' : 'text-ivory/50'}`}>{s.m}</span>
            </button>
          ))}
        </div>
        <p className="mt-8 font-display text-3xl italic" aria-live="polite">{SEASON[i].t}</p>
        <p className="mt-4 max-w-[70ch] font-sans text-[13.5px] leading-relaxed text-ivory/60">Approximate and simplified — real timing varies by region, cultivar and weather each year (the south begins earlier). Bar height suggests how active the tea year is, not a measurement. Harvest is the busiest time on any farm, so visit requests may be declined — write well in advance, and consider visiting just after harvest, when producers have more time and new tea is being sorted and tasted.</p>
      </div>
    </section>
  )
}

type Tab = 'regions' | 'places' | 'questions' | 'itinerary' | 'notes'
function Planner({ onPick }: { onPick: (id: string) => void }) {
  const s = useStore()
  const [tab, setTab] = useState<Tab>('regions')
  return (
    <section id="planner" className="wrap mt-32" aria-label="Research trip planner">
      <SectionTitle eyebrow="Research-trip planner" title="Shape the trip, slowly.">
        <p>Everything here is private to your browser. Add to it whenever something sparks — a region, a name, a question for a supplier, a rough day plan.</p>
      </SectionTitle>
      <div className="mt-10">
        <Tabs<Tab> value={tab} onChange={setTab} tabs={[
          { id: 'regions', label: 'Regions', count: s.savedRegions.length }, { id: 'places', label: 'Places', count: s.places.length },
          { id: 'questions', label: 'Questions', count: s.questions.length }, { id: 'itinerary', label: 'Itinerary', count: s.itinerary.length }, { id: 'notes', label: 'Notes' }]} />
        <div className="py-10" role="tabpanel">
          {tab === 'regions' && <SavedRegions onPick={onPick} />}
          {tab === 'places' && <Places />}
          {tab === 'questions' && <Questions />}
          {tab === 'itinerary' && <Itinerary />}
          {tab === 'notes' && <TripNotes />}
        </div>
      </div>
    </section>
  )
}

function SavedRegions({ onPick }: { onPick: (id: string) => void }) {
  const { savedRegions, update } = useStore()
  if (!savedRegions.length) return <Empty>No saved regions yet. Select a region on the map and choose “Save region”.</Empty>
  return (
    <ul className="grid gap-px bg-ink/15 sm:grid-cols-2 lg:grid-cols-3">
      {savedRegions.map((id) => {
        const r = REGIONS.find((x) => x.id === id)!
        return (
          <li key={id} className="bg-ivory p-6">
            <p className="font-display text-3xl">{r.name}</p><p className="label mt-1">{r.pref}</p>
            <p className="mt-3 font-sans text-[14px] text-soft">{r.tagline}</p>
            <div className="mt-5 flex gap-5"><button className="btn-quiet" onClick={() => { onPick(id); window.scrollTo({ top: 500, behavior: 'smooth' }) }}>View</button><button className="btn-quiet !text-stamp" onClick={() => update('savedRegions', (s) => s.filter((x) => x !== id))}>Remove</button></div>
          </li>
        )
      })}
    </ul>
  )
}

function Places() {
  const { places, update } = useStore()
  const [f, setF] = useState({ name: '', kind: 'Tea farm', note: '' })
  const [del, setDel] = useState<string | null>(null)
  const patch = (id: string, p: Partial<Place>) => update('places', (a) => a.map((x) => (x.id === id ? { ...x, ...p } : x)))
  const add = (e: React.FormEvent) => {
    e.preventDefault(); if (!f.name.trim()) return
    update('places', (a) => [...a, { id: uid(), name: f.name.trim(), kind: f.kind, status: 'custom', note: f.note, visited: false }]); setF({ name: '', kind: 'Tea farm', note: '' })
  }
  return (
    <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
      <div>
        {!places.length ? <Empty>Your list is empty. Add places from region profiles, or add your own.</Empty> : (
          <ul className="divide-y divide-ink/10 border-y border-ink/10">
            {places.map((p) => (
              <li key={p.id} className="py-5">
                <div className="flex items-start justify-between gap-4">
                  <label className="flex items-start gap-3"><input type="checkbox" className="mt-2 h-4 w-4 accent-sage-700" checked={p.visited} onChange={(e) => patch(p.id, { visited: e.target.checked })} aria-label={`Visited ${p.name}`} />
                    <span><span className={`font-display text-2xl ${p.visited ? 'text-soft line-through' : ''}`}>{p.name}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-2 font-sans text-xs text-soft">{p.kind}{p.regionId && ` · ${REGIONS.find((r) => r.id === p.regionId)?.name}`}
                        {p.status === 'established' && <span className="tag-est">Established · confirm</span>}{p.status === 'lead' && <span className="tag-lead">Research lead</span>}{p.status === 'custom' && <span className="chip !py-0 !text-[10px]">Mine · unverified</span>}</span></span></label>
                  <button className="btn-quiet !text-stamp" onClick={() => setDel(p.id)} aria-label={`Remove ${p.name}`}>Remove</button>
                </div>
                <textarea aria-label={`Notes for ${p.name}`} rows={2} className="field-box mt-3" placeholder="Your notes — how to contact, what to ask, what you found…" value={p.note} onChange={(e) => patch(p.id, { note: e.target.value })} />
              </li>
            ))}
          </ul>
        )}
      </div>
      <form onSubmit={add} className="self-start bg-paper/70 p-6">
        <h3 className="font-display text-3xl">Add your own</h3>
        <p className="mt-1 font-sans text-[13px] text-soft">For farms, producers or shops you discover yourself. Please verify details independently.</p>
        <label className="label mt-5 block" htmlFor="pn">Name</label><input id="pn" className="field" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />
        <label className="label mt-4 block" htmlFor="pk">Type</label>
        <select id="pk" className="field" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>{['Tea farm', 'Producer / factory', 'Merchant', 'Café / tea room', 'Museum / site', 'Experience', 'Other'].map((k) => <option key={k}>{k}</option>)}</select>
        <label className="label mt-4 block" htmlFor="pnote">Note</label><textarea id="pnote" className="field-box" rows={3} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
        <button className="btn-solid mt-5" type="submit">Add to my list</button>
      </form>
      <Confirm open={!!del} message="Remove this place from your list?" onNo={() => setDel(null)} onYes={() => { update('places', (a) => a.filter((x) => x.id !== del)); setDel(null) }} />
    </div>
  )
}

function Questions() {
  const { questions, update } = useStore()
  const [text, setText] = useState(''), [to, setTo] = useState('Producer')
  const add = (t: string, w: string) => update('questions', (q) => (q.some((x) => x.text === t) ? q : [...q, { id: uid(), text: t, to: w, answer: '' }]))
  const patch = (id: string, p: any) => update('questions', (a) => a.map((x) => (x.id === id ? { ...x, ...p } : x)))
  return (
    <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
      <div>
        {!questions.length ? <Empty>No questions yet. Add your own or pick from the starters.</Empty> : (
          <ul className="divide-y divide-ink/10 border-y border-ink/10">
            {questions.map((q) => (
              <li key={q.id} className="py-5">
                <div className="flex items-start justify-between gap-4"><p className="font-display text-2xl leading-snug">{q.text}</p><button className="btn-quiet !text-stamp shrink-0" aria-label="Remove question" onClick={() => update('questions', (a) => a.filter((x) => x.id !== q.id))}>Remove</button></div>
                <p className="label mt-1">Ask: {q.to}</p>
                <textarea aria-label="Answer or notes" rows={2} className="field-box mt-3" placeholder="What you learned…" value={q.answer} onChange={(e) => patch(q.id, { answer: e.target.value })} />
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="self-start space-y-8">
        <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) { add(text.trim(), to); setText('') } }} className="bg-paper/70 p-6">
          <h3 className="font-display text-3xl">Your question</h3>
          <textarea aria-label="Your question" className="field-box mt-3" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="What do you want to know?" />
          <label className="label mt-3 block" htmlFor="qto">Who to ask</label>
          <select id="qto" className="field" value={to} onChange={(e) => setTo(e.target.value)}>{['Producer', 'Supplier', 'Tourism office', 'Guide', 'Myself'].map((k) => <option key={k}>{k}</option>)}</select>
          <button className="btn-solid mt-4" type="submit">Add question</button>
        </form>
        <div>
          <p className="label">Starter questions</p>
          <ul className="mt-2 divide-y divide-ink/10 border-y border-ink/10">
            {STARTER_QUESTIONS.map(([t, w]) => {
              const have = questions.some((q) => q.text === t)
              return <li key={t} className="flex items-start justify-between gap-3 py-3 font-sans text-[13.5px]"><span className="text-soft">{t}</span><button className="btn-quiet shrink-0" disabled={have} onClick={() => add(t, w)}>{have ? '✓' : '+ Add'}</button></li>
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}

function Itinerary() {
  const { itinerary, places, update } = useStore()
  const [copied, setCopied] = useState(false)
  const addDay = () => update('itinerary', (d) => [...d, { id: uid(), title: `Day ${d.length + 1}`, items: [] }])
  const patchDay = (id: string, p: any) => update('itinerary', (d) => d.map((x) => (x.id === id ? { ...x, ...p } : x)))
  const move = (i: number, dir: -1 | 1) => update('itinerary', (d) => { const a = [...d]; const j = i + dir; if (j < 0 || j >= a.length) return a;[a[i], a[j]] = [a[j], a[i]]; return a })
  const text = itinerary.map((d) => `${d.title}\n${d.items.map((i) => `  – ${i.text}`).join('\n')}`).join('\n\n')
  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <button className="btn-solid" onClick={addDay}>Add a day</button>
        {itinerary.length > 0 && <button className="btn" onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800) }}>{copied ? 'Copied' : 'Copy as text'}</button>}
        <p className="font-sans text-[13px] text-soft">A rough sketch is plenty. Confirm times, travel and bookings separately.</p>
      </div>
      {!itinerary.length ? <Empty>No days yet. Start with “Add a day”.</Empty> : (
        <ol className="grid gap-px bg-ink/15 md:grid-cols-2 xl:grid-cols-3">
          {itinerary.map((d, i) => <DayCard key={d.id} d={d} i={i} n={itinerary.length} places={places.map((p) => p.name)} patchDay={patchDay} move={move} del={() => update('itinerary', (a) => a.filter((x) => x.id !== d.id))} />)}
        </ol>
      )}
    </div>
  )
}
function DayCard({ d, i, n, places, patchDay, move, del }: any) {
  const [t, setT] = useState('')
  const add = (txt: string) => { if (txt.trim()) patchDay(d.id, { items: [...d.items, { id: uid(), text: txt.trim() }] }) }
  const mv = (k: number, dir: number) => { const a = [...d.items]; const j = k + dir; if (j < 0 || j >= a.length) return;[a[k], a[j]] = [a[j], a[k]]; patchDay(d.id, { items: a }) }
  return (
    <li className="bg-ivory p-6">
      <div className="flex items-center justify-between gap-2">
        <input aria-label="Day title" className="field !border-0 font-display !text-3xl" value={d.title} onChange={(e) => patchDay(d.id, { title: e.target.value })} />
        <div className="flex shrink-0"><button aria-label="Move day earlier" disabled={i === 0} onClick={() => move(i, -1)} className="px-2 disabled:opacity-30">↑</button><button aria-label="Move day later" disabled={i === n - 1} onClick={() => move(i, 1)} className="px-2 disabled:opacity-30">↓</button></div>
      </div>
      <ul className="mt-3 divide-y divide-ink/10">
        {d.items.map((it: any, k: number) => (
          <li key={it.id} className="flex items-start gap-2 py-2 font-sans text-[14px]">
            <span className="flex-1">{it.text}</span>
            <button aria-label="Move up" onClick={() => mv(k, -1)} className="text-soft hover:text-ink">↑</button><button aria-label="Move down" onClick={() => mv(k, 1)} className="text-soft hover:text-ink">↓</button>
            <button aria-label="Remove item" onClick={() => patchDay(d.id, { items: d.items.filter((x: any) => x.id !== it.id) })} className="text-stamp">×</button>
          </li>
        ))}
      </ul>
      <form onSubmit={(e) => { e.preventDefault(); add(t); setT('') }} className="mt-3 flex gap-2"><input aria-label="Add an item" className="field" placeholder="Add an item…" value={t} onChange={(e) => setT(e.target.value)} /><button className="btn-quiet" type="submit">Add</button></form>
      {places.length > 0 && <select aria-label="Add one of my places" className="field mt-2 text-sm text-soft" value="" onChange={(e) => { if (e.target.value) add(`Visit ${e.target.value}`) }}><option value="">+ from my places…</option>{places.map((p: string) => <option key={p}>{p}</option>)}</select>}
      <button className="btn-quiet mt-4 !text-stamp" onClick={del}>Remove day</button>
    </li>
  )
}

function TripNotes() {
  const { tripNotes, set } = useStore()
  return (
    <div className="max-w-3xl">
      <label className="label" htmlFor="tn">Trip notes</label>
      <textarea id="tn" rows={14} className="field-box mt-2 font-display !text-xl" placeholder="Visas and travel logistics, who to write to, ideas for the route, anything…" value={tripNotes} onChange={(e) => set({ tripNotes: e.target.value })} />
      <p className="mt-2 font-sans text-xs text-soft">Saved automatically in this browser.</p>
    </div>
  )
}
