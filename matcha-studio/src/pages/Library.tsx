import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '../components/Layout'
import Photo from '../components/Photo'
import Plate from '../components/Plate'
import { Confirm, Empty, Modal, Note, Toast, useToast } from '../components/ui'
import { CATEGORIES, PROMPTS, Prompt } from '../data/library'
import { InspoItem, fileToDataUrl, now, uid, useStore } from '../lib/store'

function dominantColors(src: string, n = 4): Promise<string[]> {
  return new Promise((res) => {
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = 48; c.height = 48
      const x = c.getContext('2d')!; x.drawImage(img, 0, 0, 48, 48)
      const d = x.getImageData(0, 0, 48, 48).data; const b = new Map<string, number>()
      for (let i = 0; i < d.length; i += 4) { const k = [d[i] >> 5, d[i + 1] >> 5, d[i + 2] >> 5].join(','); b.set(k, (b.get(k) || 0) + 1) }
      const out: string[] = []
      ;[...b.entries()].sort((a, z) => z[1] - a[1]).forEach(([k]) => {
        const [r, g, bl] = k.split(',').map((v) => Math.min(255, +v * 32 + 16))
        if (out.length < n && !out.some((o) => { const p = o.match(/\w\w/g)!.map((h) => parseInt(h, 16)); return Math.abs(p[0] - r) + Math.abs(p[1] - g) + Math.abs(p[2] - bl) < 70 })) out.push('#' + [r, g, bl].map((v) => v.toString(16).padStart(2, '0')).join(''))
      })
      res(out)
    }
    img.onerror = () => res([]); img.src = src
  })
}

export default function Library() {
  const { inspo, collections, update } = useStore()
  const { msg, show } = useToast()
  const [cat, setCat] = useState<string>('All')
  const [col, setCol] = useState<string>('all')
  const [q, setQ] = useState('')
  const [add, setAdd] = useState<null | 'image' | 'note' | 'color' | 'link'>(null)
  const [open, setOpen] = useState<string | null>(null)
  const [colModal, setColModal] = useState(false)

  const savedPromptIds = new Set(inspo.map((i) => i.promptId).filter(Boolean))
  const cards = useMemo(() => {
    const own = inspo.map((i) => ({ type: 'own' as const, item: i }))
    const pr = col === 'all' ? PROMPTS.filter((p) => !savedPromptIds.has(p.id)).map((p) => ({ type: 'prompt' as const, p })) : []
    return [...own, ...pr].filter((c) => {
      const category = c.type === 'own' ? c.item.category : c.p.category
      if (cat !== 'All' && category !== cat) return false
      if (col !== 'all' && c.type === 'own' && !c.item.collections.includes(col)) return false
      if (q) { const hay = (c.type === 'own' ? [c.item.title, c.item.note, c.item.tags.join(' ')] : [c.p.title, c.p.look, c.p.ask]).join(' ').toLowerCase(); if (!hay.includes(q.toLowerCase())) return false }
      return true
    })
  }, [inspo, cat, col, q])

  const savePrompt = (p: Prompt) => {
    update('inspo', (a) => [{ id: uid(), kind: 'prompt', category: p.category, title: p.title, note: '', tags: [], collections: [], promptId: p.id, createdAt: now() }, ...a])
    show('Kept in your library — open it to add notes')
  }
  const openItem = inspo.find((i) => i.id === open)

  return (
    <>
      <PageHeader n="04" title="Inspiration Library" jp="集める" plate={<Photo slot="ch-library" plate="ceramic" tone="clay" seed={2} alt="Illustrated glaze texture" className="h-full w-full" />}>
        <p>A place to collect whatever stops you — a texture, a typeface, a café, a colour — and to write down why. There’s no brand here and no right direction. Over time, patterns in what you save become a quiet portrait of your own taste.</p>
      </PageHeader>

      <section className="wrap mt-20" aria-label="Library">
        <div className="sticky top-16 z-30 -mx-5 bg-ivory/90 px-5 py-4 backdrop-blur-md sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Categories">
            {['All', ...CATEGORIES].map((c) => <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c} className={`chip shrink-0 ${cat === c ? 'chip-on' : 'hover:border-sage-600'}`}>{c}</button>)}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
            <input aria-label="Search the library" className="field max-w-[220px]" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
            <label className="flex items-center gap-2 font-sans text-[12px] uppercase tracking-[0.14em] text-soft">Collection
              <select className="field !w-auto" value={col} onChange={(e) => setCol(e.target.value)}><option value="all">Everything</option>{collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
            <button className="btn-quiet" onClick={() => setColModal(true)}>Manage collections</button>
            <div className="ml-auto flex flex-wrap gap-2">
              <button className="btn-solid" onClick={() => setAdd('image')}>Upload image</button>
              <button className="btn" onClick={() => setAdd('note')}>Note</button>
              <button className="btn" onClick={() => setAdd('color')}>Colours</button>
              <button className="btn" onClick={() => setAdd('link')}>Link</button>
            </div>
          </div>
        </div>

        <div className="mt-8"><Note>Cards with a dotted edge are prompts — things to go and look at, with search terms, not images of other people’s work. Keep the ones that interest you, then add your own images and notes. Uploaded images stay in this browser only.</Note></div>

        {!cards.length ? <div className="mt-10"><Empty>Nothing matches. Try another category or add something of your own.</Empty></div> : (
          <div className="mt-10 columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
            {cards.map((c, i) => c.type === 'prompt' ? <PromptCard key={c.p.id} p={c.p} i={i} onKeep={() => savePrompt(c.p)} /> : <OwnCard key={c.item.id} item={c.item} onOpen={() => setOpen(c.item.id)} />)}
          </div>
        )}
      </section>

      <AddModal kind={add} onClose={() => setAdd(null)} done={(m) => { setAdd(null); show(m) }} />
      {openItem && <ItemModal item={openItem} onClose={() => setOpen(null)} />}
      <Collections open={colModal} onClose={() => setColModal(false)} />
      <Toast msg={msg} />
    </>
  )
}

function PromptCard({ p, i, onKeep }: { p: Prompt; i: number; onKeep: () => void }) {
  return (
    <motion.article initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-5%' }} transition={{ duration: 0.7, delay: (i % 3) * 0.08 }} className="break-inside-avoid border border-dashed border-ink/25 bg-ivory">
      <div className={`${p.ratio} img-zoom overflow-hidden`}><Plate kind={p.plate} tone={p.tone} seed={p.seed} label={p.title} /></div>
      <div className="p-5">
        <p className="eyebrow !text-[10px]">{p.category}</p>
        <h3 className="mt-1 font-display text-2xl leading-tight">{p.title}</h3>
        <p className="mt-3 font-sans text-[13.5px] leading-relaxed text-soft"><span className="label mr-1">Look at</span>{p.look}</p>
        <p className="mt-2 font-display text-lg italic leading-snug text-ink">{p.ask}</p>
        <p className="mt-3 flex flex-wrap gap-1.5">{p.search.map((s) => <span key={s} className="chip !py-0.5 !text-[11px]">{s}</span>)}</p>
        <button onClick={onKeep} className="btn-quiet mt-4">+ Keep this</button>
      </div>
    </motion.article>
  )
}

function OwnCard({ item, onOpen }: { item: InspoItem; onOpen: () => void }) {
  const prompt = item.promptId ? PROMPTS.find((p) => p.id === item.promptId) : null
  return (
    <article className="group break-inside-avoid bg-paper/60">
      <button onClick={onOpen} className="block w-full text-left" aria-label={`Open ${item.title}`}>
        {item.kind === 'image' && item.image && <div className="img-zoom overflow-hidden"><img src={item.image} alt={item.title} className="w-full" /></div>}
        {item.kind === 'color' && <div className="flex h-44">{(item.colors || []).map((c) => <span key={c} className="flex-1" style={{ background: c }} />)}</div>}
        {item.kind === 'prompt' && prompt && <div className={`${prompt.ratio} overflow-hidden`}><Plate kind={prompt.plate} tone={prompt.tone} seed={prompt.seed} /></div>}
        {item.kind === 'note' && <div className="px-5 pt-5 font-display text-2xl italic leading-snug">“{item.note.slice(0, 140)}{item.note.length > 140 ? '…' : ''}”</div>}
        {item.kind === 'link' && <div className="px-5 pt-5 font-sans text-[12px] uppercase tracking-[0.16em] text-sage-700">Reference ↗</div>}
        <div className="p-5">
          <p className="eyebrow !text-[10px]">{item.category}</p>
          <h3 className="mt-1 font-display text-2xl leading-tight">{item.title}</h3>
          {item.kind !== 'note' && item.note && <p className="mt-2 line-clamp-3 font-sans text-[13.5px] leading-relaxed text-soft">{item.note}</p>}
          {item.kind === 'image' && item.colors && <p className="mt-3 flex gap-1">{item.colors.map((c) => <i key={c} className="h-3 w-3 rounded-full border border-ink/10" style={{ background: c }} />)}</p>}
          {item.tags.length > 0 && <p className="mt-3 flex flex-wrap gap-1.5">{item.tags.map((t) => <span key={t} className="font-sans text-[11px] text-sage-700">#{t}</span>)}</p>}
        </div>
      </button>
    </article>
  )
}

function AddModal({ kind, onClose, done }: { kind: null | 'image' | 'note' | 'color' | 'link'; onClose: () => void; done: (m: string) => void }) {
  const update = useStore((s) => s.update)
  const [f, setF] = useState({ title: '', note: '', category: CATEGORIES[0] as string, tags: '', source: '' })
  const [cols, setCols] = useState(['#6F8260', '#CFD7C0', '#F7F3EA', '#B9A688'])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const file = useRef<HTMLInputElement>(null)
  const reset = () => { setF({ title: '', note: '', category: CATEGORIES[0], tags: '', source: '' }); setErr('') }
  const base = () => ({ category: f.category, note: f.note, tags: f.tags.split(/[,#\s]+/).filter(Boolean), collections: [] as string[], createdAt: now() })
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr('')
    try {
      if (kind === 'image') {
        const files = Array.from(file.current?.files || []); if (!files.length) { setErr('Choose at least one image.'); return }
        setBusy(true)
        const items: InspoItem[] = []
        for (const fl of files) { const image = await fileToDataUrl(fl); items.push({ id: uid(), kind: 'image', title: f.title || fl.name.replace(/\.[^.]+$/, ''), image, colors: await dominantColors(image), ...base() }) }
        update('inspo', (a) => [...items, ...a]); done(`${items.length} image${items.length > 1 ? 's' : ''} added`)
      } else if (kind === 'note') { update('inspo', (a) => [{ id: uid(), kind: 'note', title: f.title || 'A thought', ...base() }, ...a]); done('Note added') }
      else if (kind === 'color') { update('inspo', (a) => [{ id: uid(), kind: 'color', title: f.title || 'Palette', colors: cols, ...base() }, ...a]); done('Palette added') }
      else if (kind === 'link') { update('inspo', (a) => [{ id: uid(), kind: 'link', title: f.title || f.source, source: f.source, ...base() }, ...a]); done('Reference added') }
      reset()
    } catch (x: any) { setErr(x.message || 'Something went wrong') } finally { setBusy(false) }
  }
  const T = { image: 'Upload images', note: 'Write a note', color: 'Save a palette', link: 'Add a reference' }
  return (
    <Modal open={!!kind} onClose={onClose} title={kind ? T[kind] : ''}>
      <form onSubmit={submit} className="space-y-4">
        {kind === 'image' && <div><label className="label" htmlFor="fi">Images</label><input ref={file} id="fi" type="file" accept="image/*" multiple className="mt-1 block w-full font-sans text-sm file:mr-4 file:border file:border-ink/40 file:bg-transparent file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-wider" /><p className="mt-1 font-sans text-xs text-soft">Please only upload images you have the right to keep. They are reduced in size and stay in this browser.</p></div>}
        {kind === 'link' && <div><label className="label" htmlFor="fs">Link or source</label><input id="fs" className="field" value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })} placeholder="A website, a book, a café name…" required /></div>}
        {kind === 'color' && <div><p className="label">Colours</p><div className="mt-2 flex flex-wrap items-center gap-3">{cols.map((c, i) => <label key={i} className="relative"><span className="sr-only">Colour {i + 1}</span><input type="color" value={c} onChange={(e) => setCols(cols.map((x, j) => (j === i ? e.target.value : x)))} className="h-12 w-12 cursor-pointer border border-ink/20 bg-transparent p-0" /></label>)}{cols.length < 6 && <button type="button" className="btn-quiet" onClick={() => setCols([...cols, '#CFD7C0'])}>+ add</button>}{cols.length > 2 && <button type="button" className="btn-quiet" onClick={() => setCols(cols.slice(0, -1))}>− remove</button>}</div></div>}
        <div><label className="label" htmlFor="ft">Title</label><input id="ft" className="field" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} required={kind === 'note'} /></div>
        <div><label className="label" htmlFor="fn">{kind === 'note' ? 'Your thought' : 'Why does this catch your eye?'}</label><textarea id="fn" rows={4} className="field-box mt-1" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} required={kind === 'note'} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="fc">Category</label><select id="fc" className="field" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div><label className="label" htmlFor="fg">Tags</label><input id="fg" className="field" placeholder="calm, green, paper" value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} /></div>
        </div>
        {err && <p role="alert" className="font-sans text-sm text-stamp">{err}</p>}
        <button className="btn-solid" disabled={busy}>{busy ? 'Adding…' : 'Add to library'}</button>
      </form>
    </Modal>
  )
}

function ItemModal({ item, onClose }: { item: InspoItem; onClose: () => void }) {
  const { collections, update } = useStore()
  const [del, setDel] = useState(false)
  const patch = (p: Partial<InspoItem>) => update('inspo', (a) => a.map((x) => (x.id === item.id ? { ...x, ...p } : x)))
  const prompt = item.promptId ? PROMPTS.find((p) => p.id === item.promptId) : null
  return (
    <Modal open onClose={onClose} title="" wide>
      <div className={`grid gap-8 ${item.image || prompt || item.colors ? 'md:grid-cols-2' : ''}`}>
        {item.image && <img src={item.image} alt={item.title} className="w-full" />}
        {prompt && !item.image && <div className="aspect-[4/5]"><Plate kind={prompt.plate} tone={prompt.tone} seed={prompt.seed} /></div>}
        {item.kind === 'color' && <div className="flex h-72">{(item.colors || []).map((c) => <span key={c} className="flex flex-1 items-end p-2 font-sans text-[11px] uppercase text-ink/70" style={{ background: c }}>{c}</span>)}</div>}
        <div className="space-y-4">
          <div><label className="label" htmlFor="it">Title</label><input id="it" className="field font-display !text-3xl" value={item.title} onChange={(e) => patch({ title: e.target.value })} /></div>
          {prompt && <div className="border-l-2 border-sage-400 pl-4 font-sans text-[13.5px] leading-relaxed text-soft"><p>{prompt.look}</p><p className="mt-2 font-display text-lg italic text-ink">{prompt.ask}</p><p className="mt-2">Search: {prompt.search.join(' · ')}</p></div>}
          {item.source && <p className="font-sans text-sm text-soft">Source: {item.source}</p>}
          <div><label className="label" htmlFor="in">Notes</label><textarea id="in" rows={5} className="field-box mt-1" value={item.note} onChange={(e) => patch({ note: e.target.value })} placeholder="What do you love about it? What would you take from it — and leave behind?" /></div>
          <div><label className="label" htmlFor="ig">Tags</label><input id="ig" className="field" value={item.tags.join(', ')} onChange={(e) => patch({ tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} /></div>
          <div><label className="label" htmlFor="ic">Category</label><select id="ic" className="field" value={item.category} onChange={(e) => patch({ category: e.target.value })}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
          <fieldset><legend className="label">Collections</legend><div className="mt-2 flex flex-wrap gap-2">{collections.map((c) => { const on = item.collections.includes(c.id); return <button key={c.id} type="button" aria-pressed={on} className={`chip ${on ? 'chip-on' : 'hover:border-sage-600'}`} onClick={() => patch({ collections: on ? item.collections.filter((x) => x !== c.id) : [...item.collections, c.id] })}>{c.name}</button> })}</div></fieldset>
          <button className="btn-quiet !text-stamp" onClick={() => setDel(true)}>Remove from library</button>
        </div>
      </div>
      <Confirm open={del} message="Remove this from your library?" onNo={() => setDel(false)} onYes={() => { update('inspo', (a) => a.filter((x) => x.id !== item.id)); onClose() }} />
    </Modal>
  )
}

function Collections({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { collections, inspo, update } = useStore()
  const [name, setName] = useState('')
  const [del, setDel] = useState<string | null>(null)
  return (
    <Modal open={open} onClose={onClose} title="Collections">
      <p className="prose-quiet mb-5 text-[14px]">Gather things under any heading — a mood, a question, a possible direction.</p>
      <ul className="divide-y divide-ink/10 border-y border-ink/10">
        {collections.map((c) => (
          <li key={c.id} className="py-3">
            <div className="flex items-center gap-3"><input aria-label="Collection name" className="field !border-0 font-display !text-2xl" value={c.name} onChange={(e) => update('collections', (a) => a.map((x) => (x.id === c.id ? { ...x, name: e.target.value } : x)))} /><span className="font-sans text-xs text-soft">{inspo.filter((i) => i.collections.includes(c.id)).length}</span><button className="btn-quiet !text-stamp" onClick={() => setDel(c.id)}>Delete</button></div>
            <input aria-label="Collection note" className="field text-sm text-soft" placeholder="A line about this collection…" value={c.note} onChange={(e) => update('collections', (a) => a.map((x) => (x.id === c.id ? { ...x, note: e.target.value } : x)))} />
          </li>
        ))}
      </ul>
      <form className="mt-5 flex gap-3" onSubmit={(e) => { e.preventDefault(); if (name.trim()) { update('collections', (a) => [...a, { id: uid(), name: name.trim(), note: '' }]); setName('') } }}>
        <input aria-label="New collection name" className="field" placeholder="New collection…" value={name} onChange={(e) => setName(e.target.value)} /><button className="btn-solid">Create</button>
      </form>
      <Confirm open={!!del} message="Delete this collection? The items inside stay in your library." confirmLabel="Delete" onNo={() => setDel(null)} onYes={() => { update('collections', (a) => a.filter((x) => x.id !== del)); update('inspo', (a) => a.map((i) => ({ ...i, collections: i.collections.filter((c) => c !== del) }))); setDel(null) }} />
    </Modal>
  )
}
