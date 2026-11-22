import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PageHeader } from '../components/Layout'
import Photo from '../components/Photo'
import Radar from '../components/Radar'
import { Accordion, Note, Reveal, SectionTitle, Stars, useToast, Toast } from '../components/ui'
import { CULTIVARS, GLOSSARY, INFLUENCES, PREPS, STAGES, STYLES, TASTES, TERMS } from '../data/discover'
import { uid, useStore } from '../lib/store'
import { Link } from '../lib/router'

const SECTIONS = [
  ['what', 'What is matcha'], ['process', 'Leaf to powder'], ['shade', 'The shade effect'], ['family', 'Tea family'], ['cultivars', 'Cultivars'],
  ['quality', 'Quality & terms'], ['flavour', 'Flavour'], ['influence', 'What shapes it'], ['spot', 'Recognising quality'], ['prepare', 'Preparation'], ['glossary', 'Glossary'],
]

export default function Discover() {
  return (
    <>
      <PageHeader n="01" title="Discover Matcha" jp="知る"
        plate={<Photo slot="ch-discover" plate="leaf" tone="ivory" seed={3} alt="Illustrated tea leaves" className="h-full w-full" />}>
        <p>Matcha looks simple — a green powder in a bowl. Behind it is a precise sequence of decisions made over a whole year. This chapter walks through them, from the beginning, with nothing assumed.</p>
      </PageHeader>

      <div className="wrap mt-24 grid gap-12 xl:grid-cols-[180px_1fr]">
        <nav aria-label="On this page" className="sticky top-24 hidden h-fit xl:block">
          <ul className="space-y-2 border-l border-ink/15 pl-4 font-sans text-[12px] uppercase tracking-[0.14em] text-soft">
            {SECTIONS.map(([id, l]) => (
              <li key={id}><button onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })} className="text-left transition-colors hover:text-ink">{l}</button></li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-32 lg:space-y-44">
          <What /><Process /><ShadeEffect /><Family /><Cultivars /><Quality /><Flavour />
          <section id="influence" className="scroll-mt-24">
            <SectionTitle eyebrow="What shapes colour, texture & quality" title="Every step leaves a fingerprint.">
              <p>Open each factor to see what it changes in the cup. Together they explain why two green powders can look alike and taste nothing alike.</p>
            </SectionTitle>
            <div className="mt-10"><Accordion items={INFLUENCES} /></div>
          </section>
          <Spot /><Prepare /><Glossary /><Sources />
        </div>
      </div>
    </>
  )
}

function What() {
  return (
    <section id="what" className="scroll-mt-24 grid gap-10 lg:grid-cols-[1fr_1.1fr]">
      <Reveal>
        <SectionTitle eyebrow="The essentials" title={<>A tea you <em className="text-sage-600">drink whole.</em></>} />
        <div className="prose-quiet mt-6 max-w-[54ch]">
          <p>Matcha (抹茶) is a finely ground powder of shade-grown green tea leaves. Unlike most teas, where leaves are steeped and then thrown away, you whisk matcha into water and drink the whole leaf. That is why its colour, sweetness and freshness matter so much — and why what the leaf went through before grinding matters even more.</p>
          <p>It grew out of a tradition of powdered tea brought to Japan from China around the 12th century by Zen monks, and was refined over centuries into the tea ceremony. Today it is both a cultural practice and a global ingredient.</p>
        </div>
      </Reveal>
      <Reveal delay={0.1} className="grid grid-cols-2 gap-px bg-ink/15 self-start">
        {[['1 plant', 'Camellia sinensis — the same species as all true tea'], ['3–4 weeks', 'of shading before harvest, commonly'], ['1 leaf, whole', 'ground and consumed, nothing discarded'], ['~30–40 g / hr', 'often cited output of a single stone mill']].map(([a, b]) => (
          <div key={a} className="bg-ivory p-6 sm:p-8"><p className="font-display text-3xl leading-tight sm:text-4xl">{a}</p><p className="mt-2 font-sans text-[13px] leading-relaxed text-soft">{b}</p></div>
        ))}
      </Reveal>
    </section>
  )
}

function Process() {
  const [i, setI] = useState(0)
  const s = STAGES[i]
  return (
    <section id="process" className="scroll-mt-24">
      <SectionTitle eyebrow="Interactive timeline" title="From leaf to powder, in eight steps." />
      <div className="mt-10">
        <div role="tablist" aria-label="Production stages" className="no-scrollbar flex gap-1 overflow-x-auto pb-2">
          {STAGES.map((st, n) => (
            <button key={st.id} role="tab" aria-selected={n === i} onClick={() => setI(n)} className="group min-w-[88px] flex-1 text-left">
              <span className={`block h-[2px] transition-colors duration-500 ${n <= i ? 'bg-sage-600' : 'bg-ink/15'}`} />
              <span className={`mt-3 block font-sans text-[11px] tracking-[0.2em] ${n === i ? 'text-sage-700' : 'text-soft'}`}>{String(n + 1).padStart(2, '0')}</span>
              <span className={`block font-display text-xl transition-colors ${n === i ? 'text-ink' : 'text-soft group-hover:text-ink'}`}>{st.name}</span>
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={s.id} role="tabpanel" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }} className="mt-10 grid items-start gap-10 lg:grid-cols-[1fr_1.1fr]">
            <Photo slot={`stage-${s.id}`} plate={s.plate} tone={s.id === 'shade' || s.id === 'steam' ? 'moss' : 'sage'} seed={i + 2} alt={`${s.name} — illustration`} className="aspect-[4/3] w-full lg:aspect-[4/4.6]" />
            <div>
              <p className="eyebrow">{s.when}</p>
              <h3 className="display mt-3 text-5xl sm:text-6xl">{s.name} <span className="ml-2 font-display text-3xl italic text-sage-500" lang="ja">{s.jp}</span></h3>
              <p className="mt-3 font-display text-2xl italic text-soft">{s.tagline}</p>
              <div className="prose-quiet mt-6">{s.body.map((p) => <p key={p}>{p}</p>)}</div>
              <dl className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
                {s.facts.map(([k, v]) => <div key={k} className="grid grid-cols-[130px_1fr] gap-4 py-3 font-sans text-[14px]"><dt className="label pt-0.5">{k}</dt><dd>{v}</dd></div>)}
              </dl>
              <div className="mt-8 flex gap-3">
                <button className="btn" disabled={i === 0} onClick={() => setI(i - 1)}>Previous</button>
                <button className="btn-solid" disabled={i === STAGES.length - 1} onClick={() => setI(i + 1)}>Next step</button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

function ShadeEffect() {
  const [days, setDays] = useState(21)
  const k = (d: number, tau: number) => 1 - Math.exp(-d / tau)
  const chl = 18 + 74 * k(days, 11), thea = 22 + 70 * k(days, 14), cat = 82 - 52 * k(days, 13)
  const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t)
  const t = k(days, 11)
  const leaf = `rgb(${lerp(170, 46, t)}, ${lerp(176, 92, t)}, ${lerp(88, 48, t)})`
  const bars = [['Chlorophyll', 'Depth of green', chl, '#556A49'], ['Amino acids (L-theanine)', 'Umami & sweetness', thea, '#8E9F78'], ['Catechins', 'Bitterness & astringency', cat, '#A8432C']] as const
  return (
    <section id="shade" className="scroll-mt-24 bg-sage-800 px-6 py-16 text-ivory sm:px-12 lg:-mx-12 lg:px-20 lg:py-24 on-dark">
      <div className="grid gap-14 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="eyebrow !text-sage-300">Try it · the shade effect</p>
          <h2 className="display mt-4 text-5xl sm:text-6xl">What does shade do to a leaf?</h2>
          <p className="mt-6 max-w-[48ch] leading-relaxed text-ivory/75">Drag the slider to change how many days the bushes are covered before harvest. Notice the direction of each change — greener, sweeter, less bitter.</p>
          <div className="mt-10">
            <label htmlFor="days" className="flex items-baseline justify-between"><span className="label !text-ivory/70">Days under shade</span><span className="font-display text-5xl">{days}</span></label>
            <input id="days" type="range" min={0} max={30} value={days} onChange={(e) => setDays(+e.target.value)} className="mt-2 text-ivory" aria-valuetext={`${days} days`} />
            <div className="flex justify-between font-sans text-[11px] text-ivory/50"><span>None (like sencha)</span><span>Commonly ~20–30 (tencha)</span></div>
          </div>
          <p className="mt-10 max-w-[52ch] border-l border-ivory/30 pl-4 font-sans text-[13px] leading-relaxed text-ivory/60">An illustration of the direction of change, not measured data. Real values depend on cultivar, shade density, weather and more. Don’t quote these numbers.</p>
        </div>
        <div>
          <div className="mb-8 flex items-center gap-6">
            <motion.div animate={{ backgroundColor: leaf }} transition={{ duration: 0.4 }} className="h-28 w-28 shrink-0 rounded-[60%_40%_60%_40%/50%_50%_50%_50%] sm:h-36 sm:w-36" aria-label="Leaf colour preview" role="img" />
            <p className="font-display text-2xl italic text-ivory/80">{days < 4 ? 'Bright, yellowish green; more bitter.' : days < 14 ? 'Deepening colour; sweetness building.' : 'Deep green, rich in amino acids.'}</p>
          </div>
          <div className="space-y-7">
            {bars.map(([a, b, v, c]) => (
              <div key={a}>
                <div className="flex justify-between font-sans text-[13px]"><span>{a}</span><span className="text-ivory/50">{b}</span></div>
                <div className="mt-2 h-[3px] bg-ivory/15"><motion.div className="h-full" style={{ background: c === '#A8432C' ? '#D9917F' : '#CFD7C0' }} animate={{ width: `${v}%` }} transition={{ type: 'spring', stiffness: 90, damping: 20 }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const FAMILY = [
  { id: 'sencha', name: 'Sencha', sub: 'Everyday green tea', rows: ['Usually grown in full sun', 'Steamed', 'Rolled into needles', 'Dried needle-shaped leaf', 'Infused; leaves discarded'] },
  { id: 'gyokuro', name: 'Gyokuro', sub: 'Shaded, then steeped', rows: ['Shaded ~3 weeks', 'Steamed', 'Rolled into needles', 'Dried needle-shaped leaf', 'Infused; leaves discarded'] },
  { id: 'tencha', name: 'Tencha', sub: 'The raw material', rows: ['Shaded ~3 weeks', 'Steamed', 'Not rolled — dried flat', 'Dried flakes after sorting', 'Not drunk; it is ground'] },
  { id: 'matcha', name: 'Matcha', sub: 'Tencha, stone-ground', rows: ['Shaded ~3 weeks', 'Steamed', 'Not rolled — dried flat', 'Ground to a fine powder', 'Whisked; whole leaf consumed'] },
]
const ROWS = ['Light', 'Heat', 'Shape', 'Final form', 'In the cup']
function Family() {
  const [sel, setSel] = useState('matcha')
  return (
    <section id="family" className="scroll-mt-24">
      <SectionTitle eyebrow="Compare" title="Tencha, sencha, gyokuro, matcha." >
        <p>These are close relatives. Select a column to highlight it — notice that matcha and gyokuro share their shading, while matcha and tencha share their flat drying.</p>
      </SectionTitle>
      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <caption className="sr-only">Comparison of sencha, gyokuro, tencha and matcha</caption>
          <thead><tr><th className="w-[110px]" />{FAMILY.map((f) => (
            <th key={f.id} scope="col" className={`px-4 pb-4 align-bottom transition-colors ${sel === f.id ? 'bg-sage-100' : ''}`}>
              <button onClick={() => setSel(f.id)} aria-pressed={sel === f.id} className="text-left"><span className="block font-display text-3xl">{f.name}</span><span className="font-sans text-[12px] font-normal text-soft">{f.sub}</span></button>
            </th>))}</tr></thead>
          <tbody>{ROWS.map((r, ri) => (
            <tr key={r} className="border-t border-ink/10">
              <th scope="row" className="label py-4 pr-4 font-normal">{r}</th>
              {FAMILY.map((f) => <td key={f.id} className={`px-4 py-4 font-sans text-[14px] transition-colors ${sel === f.id ? 'bg-sage-100' : ''}`}>{f.rows[ri]}</td>)}
            </tr>))}</tbody>
        </table>
      </div>
    </section>
  )
}

function Cultivars() {
  const [id, setId] = useState('samidori')
  const [cmp, setCmp] = useState<string | null>(null)
  const c = CULTIVARS.find((x) => x.id === id)!
  const o = CULTIVARS.find((x) => x.id === cmp)
  const vals = (x: typeof c) => [x.sweet * 2, x.umami * 2, x.bitter * 2, x.astr * 2]
  return (
    <section id="cultivars" className="scroll-mt-24">
      <SectionTitle eyebrow="Tea cultivars" title="Varieties with personalities.">
        <p>A cultivar is a named variety — like a grape variety in wine. Choose one to see its reputation, and optionally compare it with another.</p>
      </SectionTitle>
      <div className="mt-10 grid gap-10 lg:grid-cols-[260px_1fr_320px]">
        <ul className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-0" role="list">
          {CULTIVARS.map((x) => (
            <li key={x.id} className="shrink-0">
              <button onClick={() => setId(x.id)} aria-pressed={id === x.id} className={`flex w-full items-baseline gap-3 border-b border-ink/10 px-1 py-3 text-left transition-colors lg:px-0 ${id === x.id ? 'text-ink' : 'text-soft hover:text-ink'}`}>
                <span className={`h-px transition-all duration-500 ${id === x.id ? 'w-6 bg-sage-600' : 'w-2 bg-ink/30'}`} />
                <span className="font-display text-2xl">{x.name}</span><span className="font-sans text-xs opacity-60" lang="ja">{x.jp}</span>
              </button>
            </li>
          ))}
        </ul>
        <div>
          <AnimatePresence mode="wait">
            <motion.div key={id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <p className="eyebrow">Mainly grown · {c.where}</p>
              <h3 className="display mt-2 text-6xl">{c.name}</h3>
              <p className="prose-quiet mt-5">{c.note}</p>
            </motion.div>
          </AnimatePresence>
          <div className="mt-8">
            <label className="label" htmlFor="cmp">Compare with</label>
            <select id="cmp" className="field mt-1 max-w-xs" value={cmp ?? ''} onChange={(e) => setCmp(e.target.value || null)}>
              <option value="">— none —</option>{CULTIVARS.filter((x) => x.id !== id).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <Radar axes={['Sweetness', 'Umami', 'Bitterness', 'Astringency']} size={320} series={[{ values: vals(c), color: '#556A49', label: c.name }, ...(o ? [{ values: vals(o), color: '#A8432C', label: o.name, dashed: true }] : [])]} />
          <p className="mt-2 flex justify-center gap-5 font-sans text-[12px]"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-sage-600" />{c.name}</span>{o && <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-stamp" />{o.name}</span>}</p>
        </div>
      </div>
      <div className="mt-8"><Note>These are broad impressions drawn from how cultivars are commonly described in the trade — not measurements. Shading, harvest, processing and the producer change the taste at least as much as the cultivar does. Always taste before you believe.</Note></div>
    </section>
  )
}

function Quality() {
  const [a, setA] = useState('a'), [b, setB] = useState('c')
  const A = STYLES.find((s) => s.id === a)!, B = STYLES.find((s) => s.id === b)!
  const v = (s: typeof A) => [s.vivid, s.sweet, s.umami, s.bitter, s.astr]
  return (
    <section id="quality" className="scroll-mt-24">
      <SectionTitle eyebrow="Quality levels" title="There is no official grade.">
        <p>In Japan, matcha has no legally defined quality grades. Words such as “ceremonial” are a convention of the export and café trade — helpful as hints, but not a standard you can rely on. A more useful way to think is in <em>styles</em>, shaped by how and what the product was made for. Compare any two of these typical styles below.</p>
      </SectionTitle>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-6 sm:grid-cols-2">
          {[[A, a, setA, '#556A49', 'Style 1'], [B, b, setB, '#A8432C', 'Style 2']].map(([s, val, set, col, lab]: any) => (
            <div key={lab} className="border-t-2 pt-4" style={{ borderColor: col }}>
              <label className="label" htmlFor={lab}>{lab}</label>
              <select id={lab} className="field mt-1 font-display !text-xl" value={val} onChange={(e) => set(e.target.value)}>{STYLES.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
              <dl className="mt-5 space-y-4 font-sans text-[14px] leading-relaxed text-soft">
                <div><dt className="label">Typically made from</dt><dd>{s.made}</dd></div>
                <div><dt className="label">Typical use</dt><dd>{s.use}</dd></div>
                <div><dt className="label">Worth asking</dt><dd>{s.ask}</dd></div>
              </dl>
            </div>
          ))}
        </div>
        <div>
          <Radar axes={['Colour', 'Sweet', 'Umami', 'Bitter', 'Astring.']} size={320} labelSize={11} series={[{ values: v(A), color: '#556A49', label: A.name }, { values: v(B), color: '#A8432C', label: B.name, dashed: true }]} />
          <p className="text-center font-sans text-[12px] text-soft">Typical tendencies, not guarantees.</p>
        </div>
      </div>
      <h3 className="mt-20 font-display text-3xl">Words you will meet — and what they tell you</h3>
      <div className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
        {TERMS.map((t) => (
          <div key={t.term} className="grid gap-3 py-5 md:grid-cols-[220px_1fr_1fr] md:gap-8">
            <p className="font-display text-2xl">{t.term}</p>
            <p className="font-sans text-[14px] leading-relaxed text-soft">{t.says}</p>
            <p className="font-sans text-[14px] leading-relaxed"><span className="label mr-2">Ask</span>{t.ask}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Flavour() {
  const [t, setT] = useState(TASTES[0].id)
  const x = TASTES.find((y) => y.id === t)!
  return (
    <section id="flavour" className="scroll-mt-24">
      <SectionTitle eyebrow="Flavour profile" title="Four things to taste for." />
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div className="grid grid-cols-2 gap-px bg-ink/15 self-start" role="tablist" aria-label="Taste">
          {TASTES.map((y) => (
            <button key={y.id} role="tab" aria-selected={t === y.id} onClick={() => setT(y.id)} className={`aspect-square p-6 text-left transition-colors duration-500 ${t === y.id ? 'bg-sage-700 text-ivory' : 'bg-ivory hover:bg-sage-100'}`}>
              <span className="block font-sans text-xs opacity-70" lang="ja">{y.jp}</span>
              <span className="mt-1 block font-display text-4xl">{y.name}</span>
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={x.id} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} role="tabpanel">
            <p className="font-display text-3xl italic leading-snug sm:text-4xl">{x.gist}</p>
            <dl className="mt-8 space-y-5 font-sans text-[15px] leading-relaxed">
              <div><dt className="label">What causes it</dt><dd className="mt-1 text-soft">{x.cause}</dd></div>
              <div><dt className="label">Try noticing it</dt><dd className="mt-1 text-soft">{x.notice}</dd></div>
            </dl>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

function Spot() {
  const add = useStore((s) => s.update)
  const { msg, show } = useToast()
  const [f, setF] = useState({ name: '', color: 0, aroma: 0, umami: 0, sweetness: 0, bitterness: 0, astringency: 0, texture: 0, notes: '' })
  const set = (k: string, v: any) => setF({ ...f, [k]: v })
  const rows: [string, string, string][] = [['color', 'Colour', 'Vivid, fresh green — not yellow, brown or grey'], ['aroma', 'Aroma', 'Sweet, fresh, marine-like; no hay or staleness'], ['texture', 'Texture & foam', 'Silky powder; fine, creamy foam that lasts'], ['umami', 'Umami', 'Savoury depth'], ['sweetness', 'Sweetness', 'Natural, rounded'], ['bitterness', 'Bitterness (5 = strong)', 'Gentle is typically preferred'], ['astringency', 'Astringency (5 = strong)', 'Drying mouthfeel']]
  const save = () => {
    add('samples', (s) => [{ id: uid(), supplier: f.name || 'Home tasting', lot: '', date: new Date().toISOString().slice(0, 10), color: f.color, aroma: f.aroma, umami: f.umami, sweetness: f.sweetness, bitterness: f.bitterness, astringency: f.astringency, texture: f.texture, notes: f.notes }, ...s])
    show('Saved to your sample tests'); setF({ name: '', color: 0, aroma: 0, umami: 0, sweetness: 0, bitterness: 0, astringency: 0, texture: 0, notes: '' })
  }
  return (
    <section id="spot" className="scroll-mt-24">
      <SectionTitle eyebrow="Recognising good matcha" title="Look, smell, feel, whisk, taste, ask." />
      <div className="mt-10 grid gap-12 lg:grid-cols-2">
        <ol className="space-y-6">
          {[['Look', 'A vivid, fresh green. Dull olive, yellow or brownish tones often suggest age, oxidation, later harvest or poor shading.'], ['Smell', 'Sweet, fresh, a little marine. Stale, hay-like, fishy or flat aromas are warning signs.'], ['Feel', 'Rub a pinch between fingers: it should feel silky, almost like talc, and sift without gritty bits.'], ['Whisk', 'It should disperse easily and make a fine, long-lasting foam.'], ['Taste', 'Sweetness and umami lead; bitterness is a quiet edge; a clean finish.'], ['Ask', 'Harvest year, cultivar, region, producer, milling date, storage. Transparent producers happily answer.']].map(([a, b], i) => (
            <li key={a} className="grid grid-cols-[48px_1fr] gap-2"><span className="font-display text-3xl text-sage-400">{i + 1}</span><div><p className="font-display text-2xl">{a}</p><p className="prose-quiet text-[15px]">{b}</p></div></li>
          ))}
        </ol>
        <form onSubmit={(e) => { e.preventDefault(); save() }} className="bg-paper/70 p-6 sm:p-8">
          <h3 className="font-display text-3xl">Your tasting card</h3>
          <p className="prose-quiet mt-1 text-[14px]">Taste any matcha and score it for yourself. Cards are saved to your sample tests in the roadmap and your workspace.</p>
          <label className="label mt-6 block" htmlFor="tname">What are you tasting?</label>
          <input id="tname" className="field" placeholder="e.g. a café matcha, a sample, a tin from a shop" value={f.name} onChange={(e) => set('name', e.target.value)} />
          <div className="mt-5 divide-y divide-ink/10">
            {rows.map(([k, l, h]) => (
              <div key={k} className="flex items-center justify-between gap-4 py-2.5"><div><p className="font-sans text-[14px]">{l}</p><p className="font-sans text-[12px] text-soft">{h}</p></div><Stars label={l} value={(f as any)[k]} onChange={(n) => set(k, n)} /></div>
            ))}
          </div>
          <label className="label mt-5 block" htmlFor="tnotes">Notes</label>
          <textarea id="tnotes" rows={3} className="field-box mt-1" value={f.notes} onChange={(e) => set('notes', e.target.value)} placeholder="What surprised you?" />
          <button className="btn-solid mt-5" type="submit">Save tasting</button>
        </form>
      </div>
      <Toast msg={msg} />
    </section>
  )
}

function Prepare() {
  const [id, setId] = useState('usucha')
  const [n, setN] = useState(1)
  const p = PREPS.find((x) => x.id === id)!
  return (
    <section id="prepare" className="scroll-mt-24">
      <SectionTitle eyebrow="Preparation" title="Traditional and modern ways to whisk." >
        <p>The bowl-and-whisk method reveals the most about a matcha. Modern methods trade ritual for convenience. Pick one, set the servings, and follow the steps.</p>
      </SectionTitle>
      <div className="mt-10 grid gap-10 lg:grid-cols-[280px_1fr]">
        <div>
          <p className="label mb-2">Traditional</p>
          {PREPS.filter((x) => x.trad).map((x) => <PrepBtn key={x.id} x={x} on={id === x.id} set={setId} />)}
          <p className="label mb-2 mt-6">Modern</p>
          {PREPS.filter((x) => !x.trad).map((x) => <PrepBtn key={x.id} x={x} on={id === x.id} set={setId} />)}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <h3 className="display text-5xl">{p.name} {p.jp && <span className="ml-2 font-display text-2xl italic text-sage-500" lang="ja">{p.jp}</span>}</h3>
            <div className="mt-6 flex flex-wrap items-end gap-x-10 gap-y-5 border-y border-ink/10 py-5">
              <div><p className="label">Servings</p><div className="mt-1 flex items-center gap-3"><button aria-label="Fewer servings" className="h-8 w-8 border border-ink/30" onClick={() => setN(Math.max(1, n - 1))}>−</button><span className="w-6 text-center font-display text-3xl" aria-live="polite">{n}</span><button aria-label="More servings" className="h-8 w-8 border border-ink/30" onClick={() => setN(Math.min(8, n + 1))}>+</button></div></div>
              <div><p className="label">Matcha</p><p className="font-display text-4xl">{p.g * n} g</p></div>
              <div><p className="label">Liquid</p><p className="font-display text-4xl">{p.ml * n} ml</p></div>
              <div><p className="label">Water</p><p className="font-display text-2xl">{p.temp}</p></div>
            </div>
            <ol className="mt-6 space-y-4">{p.steps.map((s, i) => <li key={i} className="grid grid-cols-[32px_1fr] font-sans text-[15px] leading-relaxed"><span className="font-display text-2xl text-sage-400">{i + 1}</span><span>{s}</span></li>)}</ol>
            <p className="mt-6 font-display text-xl italic text-soft">{p.note}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <p className="mt-10 font-sans text-[13px] text-soft"><strong className="font-medium text-ink">Tools:</strong> bowl (chawan) · bamboo whisk (chasen) · bamboo scoop (chashaku) · sieve (furui). Modern alternatives: electric frother, shaker bottle, small kitchen whisk. Measurements are common starting points — adjust to taste.</p>
    </section>
  )
}
function PrepBtn({ x, on, set }: { x: (typeof PREPS)[number]; on: boolean; set: (s: string) => void }) {
  return <button onClick={() => set(x.id)} aria-pressed={on} className={`flex w-full items-center gap-3 border-b border-ink/10 py-3 text-left font-display text-2xl transition-colors ${on ? 'text-ink' : 'text-soft hover:text-ink'}`}><span className={`h-px transition-all ${on ? 'w-6 bg-sage-600' : 'w-2 bg-ink/30'}`} />{x.name}</button>
}

function Glossary() {
  return (
    <section id="glossary" className="scroll-mt-24">
      <SectionTitle eyebrow="Glossary" title="Words worth knowing." />
      <dl className="mt-10 grid gap-x-12 sm:grid-cols-2">
        {GLOSSARY.map(([a, j, d]) => (
          <div key={a} className="border-t border-ink/10 py-4"><dt className="flex items-baseline gap-3"><span className="font-display text-2xl">{a}</span><span className="font-sans text-sm text-sage-600" lang="ja">{j}</span></dt><dd className="mt-1 font-sans text-[14px] leading-relaxed text-soft">{d}</dd></div>
        ))}
      </dl>
    </section>
  )
}

function Sources() {
  return (
    <section className="border-t border-ink/15 pt-10">
      <p className="eyebrow">A note on accuracy</p>
      <div className="prose-quiet mt-4 max-w-[70ch] text-[15px]">
        <p>This guide is a beginner’s overview compiled from widely shared knowledge about Japanese tea. It simplifies, and producers differ. When something matters to a decision, please confirm it with primary sources — for example Japan’s Ministry of Agriculture, Forestry and Fisheries (MAFF), the Japan Tea Central Public Interest Incorporated Association, prefectural tea research stations, and — best of all — the producers themselves.</p>
        <p>Ready to try things out? Head to <Link to="/lab" className="link">the Lab</Link>, or plan the trip in <Link to="/japan" className="link">Explore Japan</Link>.</p>
      </div>
    </section>
  )
}
