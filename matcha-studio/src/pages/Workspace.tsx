import { useRef, useState } from 'react'
import { PageHeader } from '../components/Layout'
import Photo from '../components/Photo'
import { Confirm, Empty, Note, Tabs, Toast, useToast } from '../components/ui'
import { CONCEPTS, FORMATS } from '../data/lab'
import { REGIONS } from '../data/regions'
import { PROMPTS } from '../data/library'
import { Link } from '../lib/router'
import { AppData, download, exportJSON, initial, now, parseBackup, storageUsageKB, uid, useStore } from '../lib/store'

type Tab = 'overview' | 'notes' | 'journal' | 'milestones' | 'saved' | 'making' | 'backup'
const PROMPT_LINES = ['What surprised you this week?', 'What would you try if nobody was watching?', 'Describe the best cup you have had, and where you were.', 'What are you curious about today?', 'What is one small thing you could do next?']

export default function Workspace() {
  const s = useStore()
  const [tab, setTab] = useState<Tab>('overview')
  return (
    <>
      <PageHeader n="06" title="My Workspace" jp="綴る" plate={<Photo slot="ch-workspace" plate="paper" tone="ivory" seed={4} alt="Illustrated paper texture" className="h-full w-full" />}>
        <p>Your notebook. Everything you save across the site gathers here — notes, a journal, small milestones, places, experiments and inspiration. Write as little or as much as you like.</p>
      </PageHeader>
      <section className="wrap mt-20">
        <Tabs<Tab> value={tab} onChange={setTab} tabs={[
          { id: 'overview', label: 'Overview' }, { id: 'notes', label: 'Notes', count: s.notes.length }, { id: 'journal', label: 'Journal', count: s.journal.length },
          { id: 'milestones', label: 'Milestones', count: s.milestones.length }, { id: 'saved', label: 'Japan & Research' }, { id: 'making', label: 'Experiments & Inspiration' }, { id: 'backup', label: 'Backup' }]} />
        <div className="py-12" role="tabpanel">
          {tab === 'overview' && <Overview go={setTab} />}
          {tab === 'notes' && <Notes />}
          {tab === 'journal' && <Journal />}
          {tab === 'milestones' && <Milestones />}
          {tab === 'saved' && <Saved />}
          {tab === 'making' && <Making />}
          {tab === 'backup' && <Backup />}
        </div>
      </section>
    </>
  )
}

function Overview({ go }: { go: (t: Tab) => void }) {
  const s = useStore()
  const prompt = PROMPT_LINES[new Date().getDate() % PROMPT_LINES.length]
  const stats: [string, number, Tab | string][] = [['Notes', s.notes.length, 'notes'], ['Journal entries', s.journal.length, 'journal'], ['Milestones', s.milestones.filter((m) => !m.done).length, 'milestones'], ['Saved regions', s.savedRegions.length, 'saved'], ['Places', s.places.length, 'saved'], ['Experiments', s.experiments.length, 'making'], ['Inspiration', s.inspo.length, 'making'], ['Sample tastings', s.samples.length, 'making']]
  return (
    <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <p className="eyebrow">A question for today</p>
        <p className="mt-4 max-w-[22ch] font-display text-5xl font-light italic leading-tight sm:text-6xl">{prompt}</p>
        <button className="btn mt-8" onClick={() => go('journal')}>Write it down</button>
        <div className="mt-14"><Note>Everything on this site is saved in this browser only — not in the cloud. If you clear browsing data, switch device or browser, it will not follow you. <button className="link" onClick={() => go('backup')}>Back up your work</button> now and then.</Note></div>
      </div>
      <dl className="grid grid-cols-2 gap-px bg-ink/15 self-start">
        {stats.map(([l, n, t]) => <button key={l} onClick={() => go(t as Tab)} className="bg-ivory p-6 text-left transition-colors hover:bg-paper"><dd className="font-display text-5xl">{n}</dd><dt className="label mt-1">{l}</dt></button>)}
      </dl>
    </div>
  )
}

function Notes() {
  const { notes, update } = useStore()
  const [sel, setSel] = useState<string | null>(null)
  const [del, setDel] = useState(false)
  const cur = notes.find((n) => n.id === sel)
  const add = () => { const n = { id: uid(), title: '', body: '', createdAt: now(), updatedAt: now() }; update('notes', (a) => [n, ...a]); setSel(n.id) }
  const patch = (p: object) => update('notes', (a) => a.map((n) => (n.id === sel ? { ...n, ...p, updatedAt: now() } : n)))
  return (
    <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
      <div>
        <button className="btn-solid w-full justify-center" onClick={add}>New note</button>
        {!notes.length ? <div className="mt-5"><Empty>No notes yet.</Empty></div> : <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">{notes.map((n) => <li key={n.id}><button onClick={() => setSel(n.id)} aria-current={sel === n.id} className={`block w-full px-2 py-3 text-left transition-colors ${sel === n.id ? 'bg-paper' : 'hover:bg-paper/60'}`}><span className="block font-display text-xl">{n.title || 'Untitled'}</span><span className="block truncate font-sans text-xs text-soft">{n.body || 'Empty'}</span><span className="font-sans text-[10px] uppercase tracking-widest text-sage-600">{new Date(n.updatedAt).toLocaleDateString()}</span></button></li>)}</ul>}
      </div>
      {cur ? (
        <div>
          <input aria-label="Note title" className="field font-display !text-4xl" placeholder="Title" value={cur.title} onChange={(e) => patch({ title: e.target.value })} />
          <textarea aria-label="Note body" rows={18} className="field-box mt-4 !bg-paper/40 font-display !text-xl !leading-relaxed" placeholder="Write freely…" value={cur.body} onChange={(e) => patch({ body: e.target.value })} />
          <button className="btn-quiet mt-3 !text-stamp" onClick={() => setDel(true)}>Delete note</button>
          <Confirm open={del} message="Delete this note?" confirmLabel="Delete" onNo={() => setDel(false)} onYes={() => { update('notes', (a) => a.filter((n) => n.id !== sel)); setSel(null); setDel(false) }} />
        </div>
      ) : <p className="self-center text-center font-display text-3xl italic text-soft">Choose a note, or start a new one.</p>}
    </div>
  )
}

function Journal() {
  const { journal, update } = useStore()
  const [t, setT] = useState('')
  const [d, setD] = useState(new Date().toISOString().slice(0, 10))
  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
      <form onSubmit={(e) => { e.preventDefault(); if (t.trim()) { update('journal', (a) => [{ id: uid(), date: d, text: t.trim() }, ...a]); setT('') } }} className="self-start bg-paper/70 p-6">
        <label className="label" htmlFor="jd">Date</label><input id="jd" type="date" className="field" value={d} onChange={(e) => setD(e.target.value)} />
        <label className="label mt-4 block" htmlFor="jt">Today</label><textarea id="jt" rows={8} className="field-box mt-1 font-display !text-xl" placeholder="What did you learn, taste, think or wonder?" value={t} onChange={(e) => setT(e.target.value)} />
        <button className="btn-solid mt-4">Add entry</button>
      </form>
      <div>{!journal.length ? <Empty>Your journal is empty. A single line is plenty.</Empty> : (
        <ol className="space-y-8">{[...journal].sort((a, b) => b.date.localeCompare(a.date)).map((j) => (
          <li key={j.id} className="border-l border-sage-300 pl-6"><p className="label">{new Date(j.date + 'T12:00').toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <textarea aria-label="Journal entry" rows={Math.min(8, Math.max(2, j.text.split('\n').length + 1))} className="mt-2 w-full resize-none border-0 bg-transparent p-0 font-display text-2xl leading-snug focus:outline-none focus:ring-0" value={j.text} onChange={(e) => update('journal', (a) => a.map((x) => (x.id === j.id ? { ...x, text: e.target.value } : x)))} />
            <button className="btn-quiet !text-stamp" onClick={() => update('journal', (a) => a.filter((x) => x.id !== j.id))}>Delete</button></li>))}</ol>)}</div>
    </div>
  )
}

function Milestones() {
  const { milestones, update } = useStore()
  const [t, setT] = useState(''), [w, setW] = useState('')
  const open = milestones.filter((m) => !m.done), done = milestones.filter((m) => m.done)
  const row = (m: (typeof milestones)[number]) => (
    <li key={m.id} className="flex items-start gap-3 py-3"><input aria-label={`Mark "${m.text}" done`} type="checkbox" className="mt-2 h-4 w-4 accent-sage-700" checked={m.done} onChange={() => update('milestones', (a) => a.map((x) => (x.id === m.id ? { ...x, done: !x.done } : x)))} />
      <div className="flex-1"><p className={`font-display text-2xl ${m.done ? 'text-soft line-through' : ''}`}>{m.text}</p>{m.when && <p className="label">{m.when}</p>}</div><button aria-label="Remove milestone" className="text-stamp" onClick={() => update('milestones', (a) => a.filter((x) => x.id !== m.id))}>×</button></li>
  )
  return (
    <div className="max-w-2xl">
      <form className="flex flex-wrap gap-4" onSubmit={(e) => { e.preventDefault(); if (t.trim()) { update('milestones', (a) => [...a, { id: uid(), text: t.trim(), done: false, when: w }]); setT(''); setW('') } }}>
        <input aria-label="Milestone" className="field min-w-[220px] flex-1" placeholder="A small milestone — e.g. taste five matchas" value={t} onChange={(e) => setT(e.target.value)} />
        <input aria-label="When (optional)" className="field !w-40" placeholder="When (optional)" value={w} onChange={(e) => setW(e.target.value)} /><button className="btn-solid">Add</button></form>
      {!milestones.length ? <div className="mt-8"><Empty>No milestones yet — they can be tiny.</Empty></div> : <><ul className="mt-6 divide-y divide-ink/10 border-y border-ink/10">{open.map(row)}</ul>{done.length > 0 && <><p className="label mt-8">Done</p><ul className="mt-2 divide-y divide-ink/10">{done.map(row)}</ul></>}</>}
    </div>
  )
}

function Saved() {
  const s = useStore()
  return (
    <div className="space-y-14">
      <div className="flex justify-between"><p className="prose-quiet max-w-[50ch]">Your Japan research lives in the planner. Here is a summary.</p><Link to="/japan" className="btn">Open the planner</Link></div>
      <div className="grid gap-12 md:grid-cols-2">
        <div><h3 className="font-display text-3xl">Saved regions</h3>{s.savedRegions.length ? <ul className="mt-3 divide-y divide-ink/10 border-y border-ink/10">{s.savedRegions.map((id) => <li key={id} className="py-3 font-display text-2xl">{REGIONS.find((r) => r.id === id)?.name}</li>)}</ul> : <p className="mt-3 text-soft">None yet.</p>}</div>
        <div><h3 className="font-display text-3xl">Places</h3>{s.places.length ? <ul className="mt-3 divide-y divide-ink/10 border-y border-ink/10">{s.places.map((p) => <li key={p.id} className="py-3"><span className="font-display text-2xl">{p.name}</span> <span className="font-sans text-xs text-soft">{p.visited ? 'visited' : p.status === 'custom' ? 'unverified' : p.status === 'lead' ? 'research lead' : 'confirm details'}</span></li>)}</ul> : <p className="mt-3 text-soft">None yet.</p>}</div>
        <div><h3 className="font-display text-3xl">Questions</h3>{s.questions.length ? <ul className="mt-3 divide-y divide-ink/10 border-y border-ink/10">{s.questions.map((q) => <li key={q.id} className="py-3 font-sans text-[14px]">{q.text}<span className="label ml-2">{q.answer ? 'answered' : 'open'}</span></li>)}</ul> : <p className="mt-3 text-soft">None yet.</p>}</div>
        <div><h3 className="font-display text-3xl">Suppliers</h3>{s.suppliers.length ? <ul className="mt-3 divide-y divide-ink/10 border-y border-ink/10">{s.suppliers.map((p) => <li key={p.id} className="py-3 font-display text-2xl">{p.name || 'Unnamed'} <span className="font-sans text-xs text-soft">{p.region}</span></li>)}</ul> : <p className="mt-3 text-soft">None yet. <Link to="/roadmap" className="link">Roadmap, step 2</Link></p>}</div>
      </div>
    </div>
  )
}

function Making() {
  const s = useStore()
  return (
    <div className="space-y-14">
      <div><div className="flex items-end justify-between"><h3 className="font-display text-3xl">Experiments</h3><Link to="/lab" className="btn-quiet">Open the Lab</Link></div>
        {s.experiments.length ? <ul className="mt-3 divide-y divide-ink/10 border-y border-ink/10">{s.experiments.map((e) => <li key={e.id} className="py-3"><span className="font-display text-2xl">{e.favorite && '★ '}{e.name}</span><span className="ml-3 font-sans text-xs text-soft">{CONCEPTS.find((c) => c.id === e.concept)?.name} · {FORMATS.find((c) => c.id === e.format)?.name}</span>{e.notes && <p className="font-sans text-[13px] text-soft">{e.notes}</p>}</li>)}</ul> : <p className="mt-3 text-soft">None yet.</p>}</div>
      <div><div className="flex items-end justify-between"><h3 className="font-display text-3xl">Inspiration</h3><Link to="/library" className="btn-quiet">Open the Library</Link></div>
        {s.inspo.length ? <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{s.inspo.slice(0, 12).map((i) => <li key={i.id} className="bg-paper/60">{i.image ? <img src={i.image} alt={i.title} className="aspect-square w-full object-cover" /> : i.colors ? <div className="flex aspect-square">{i.colors.map((c) => <span key={c} className="flex-1" style={{ background: c }} />)}</div> : null}<p className="p-3 font-display text-xl">{i.title}{i.promptId && PROMPTS.find((p) => p.id === i.promptId) ? '' : ''}</p></li>)}</ul> : <p className="mt-3 text-soft">None yet.</p>}</div>
      <div><h3 className="font-display text-3xl">Tastings & samples</h3>{s.samples.length ? <ul className="mt-3 divide-y divide-ink/10 border-y border-ink/10">{s.samples.map((x) => <li key={x.id} className="py-3 font-display text-2xl">{x.supplier} <span className="font-sans text-xs text-soft">{x.date}</span></li>)}</ul> : <p className="mt-3 text-soft">None yet.</p>}</div>
    </div>
  )
}

function Backup() {
  const s = useStore()
  const { msg, show } = useToast()
  const file = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<Partial<AppData> | null>(null)
  const [err, setErr] = useState('')
  const [reset, setReset] = useState(false)
  const onFile = async (f?: File) => {
    setErr(''); if (!f) return
    try { setPending(parseBackup(await f.text())) } catch (e: any) { setErr(e.message || 'Could not read that file.') }
    if (file.current) file.current.value = ''
  }
  const md = () => {
    const lines = ['# My matcha notebook', '', '## Notes', ...s.notes.flatMap((n) => [`### ${n.title || 'Untitled'}`, n.body, '']), '## Journal', ...s.journal.flatMap((j) => [`### ${j.date}`, j.text, '']), '## Experiments', ...s.experiments.flatMap((e) => [`### ${e.name}`, `${e.concept} · ${e.format}`, e.notes, ''])]
    download(new Blob([lines.join('\n')], { type: 'text/markdown' }), 'matcha-notebook.md')
  }
  const kb = storageUsageKB()
  return (
    <div className="grid max-w-5xl gap-12 md:grid-cols-2">
      <div className="space-y-6 md:col-span-2"><Note tone="stamp"><strong className="font-medium">Your work is stored in this browser only.</strong> It is device-specific, is not a cloud backup, and can disappear if you clear site data, use private browsing, or change device or browser. Export a backup file regularly and keep it somewhere safe (email it to yourself, or save it in cloud storage).</Note></div>
      <div><h3 className="font-display text-3xl">Export</h3><p className="prose-quiet mt-2 text-[15px]">Download everything — notes, saved places, experiments, images — as one file.</p>
        <p className="mt-2 font-sans text-[13px] text-soft">{s.lastExport ? `Last backup: ${new Date(s.lastExport).toLocaleString()}` : 'You have not made a backup yet.'} · Using about {kb} KB of roughly 5,000 KB available.</p>
        <div className="mt-5 flex flex-wrap gap-3"><button className="btn-solid" onClick={() => { exportJSON(); show('Backup downloaded') }}>Download backup (.json)</button><button className="btn" onClick={md}>Notes as Markdown</button></div></div>
      <div><h3 className="font-display text-3xl">Import</h3><p className="prose-quiet mt-2 text-[15px]">Restore from a backup made here. You can merge it with what you have, or replace everything.</p>
        <input ref={file} type="file" accept="application/json,.json" aria-label="Choose backup file" className="mt-5 block font-sans text-sm file:mr-4 file:border file:border-ink/40 file:bg-transparent file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-wider" onChange={(e) => onFile(e.target.files?.[0])} />
        {err && <p role="alert" className="mt-3 font-sans text-sm text-stamp">{err}</p>}
        {pending && <div className="mt-5 bg-paper/70 p-5"><p className="font-sans text-[14px]">Backup ready. How should it be applied?</p><div className="mt-3 flex gap-3"><button className="btn-solid" onClick={() => { s.mergeAll(pending); setPending(null); show('Merged into your workspace') }}>Merge</button><button className="btn" onClick={() => { s.replaceAll(pending); setPending(null); show('Workspace replaced') }}>Replace all</button><button className="btn-quiet" onClick={() => setPending(null)}>Cancel</button></div></div>}</div>
      <div className="md:col-span-2 border-t border-ink/15 pt-8"><h3 className="font-display text-3xl">Start fresh</h3><p className="prose-quiet mt-2 text-[15px]">Erases everything saved in this browser. Export first if unsure.</p><button className="btn mt-4 !border-stamp !text-stamp hover:!bg-stamp hover:!text-ivory" onClick={() => setReset(true)}>Erase everything</button></div>
      <Confirm open={reset} message="This permanently erases all notes, places, experiments, images and settings in this browser." confirmLabel="Erase everything" onNo={() => setReset(false)} onYes={() => { s.reset(); setReset(false); show('Everything erased') }} />
      <Toast msg={msg} />
    </div>
  )
}
