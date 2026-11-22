import { ReactNode, useEffect, useId, useRef, useState } from 'react'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { uid } from '../lib/store'

export function Reveal({ children, delay = 0, y = 22, className = '' }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div className={className} initial={reduce ? false : { opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }} transition={{ duration: 0.9, delay, ease: [0.2, 0.7, 0.2, 1] }}>
      {children}
    </motion.div>
  )
}

export function SectionTitle({ eyebrow, title, children, className = '' }: { eyebrow?: string; title: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <div className={className}>
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <h2 className="display text-[40px] sm:text-5xl lg:text-[56px]">{title}</h2>
      {children && <div className="prose-quiet mt-5 max-w-[60ch]">{children}</div>}
    </div>
  )
}

export function Note({ children, tone = 'sage' }: { children: ReactNode; tone?: 'sage' | 'stamp' }) {
  return (
    <aside className={`border-l-2 py-1 pl-4 font-sans text-[13.5px] leading-relaxed ${tone === 'stamp' ? 'border-stamp/60 text-stamp' : 'border-sage-400 text-soft'}`}>
      {children}
    </aside>
  )
}

export function Accordion({ items, defaultOpen = -1 }: { items: { title: string; body: ReactNode; meta?: string }[]; defaultOpen?: number }) {
  const [open, setOpen] = useState(defaultOpen)
  const base = useId()
  return (
    <div className="border-t border-ink/15">
      {items.map((it, i) => {
        const isOpen = open === i
        return (
          <div key={i} className="border-b border-ink/15">
            <h3>
              <button aria-expanded={isOpen} aria-controls={`${base}-${i}`} onClick={() => setOpen(isOpen ? -1 : i)}
                className="group flex w-full items-baseline justify-between gap-6 py-5 text-left">
                <span className="flex items-baseline gap-4">
                  <span className="font-sans text-[11px] tracking-[0.2em] text-sage-600">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-display text-2xl sm:text-[28px]">{it.title}</span>
                </span>
                <span className="flex items-center gap-4">
                  {it.meta && <span className="hidden font-sans text-xs text-soft sm:inline">{it.meta}</span>}
                  <span className={`block h-3 w-3 shrink-0 transition-transform duration-500 ${isOpen ? 'rotate-45' : ''}`} aria-hidden>
                    <svg viewBox="0 0 12 12"><path d="M6 0v12M0 6h12" stroke="currentColor" strokeWidth="1" /></svg>
                  </span>
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div id={`${base}-${i}`} role="region" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }} className="overflow-hidden">
                  <div className="prose-quiet max-w-[68ch] pb-7 pl-0 sm:pl-10">{it.body}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

export function Tabs<T extends string>({ tabs, value, onChange, dark = false }: { tabs: { id: T; label: string; count?: number }[]; value: T; onChange: (t: T) => void; dark?: boolean }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const onKey = (e: React.KeyboardEvent, i: number) => {
    let n = i
    if (e.key === 'ArrowRight') n = (i + 1) % tabs.length
    else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length
    else return
    e.preventDefault(); onChange(tabs[n].id); refs.current[n]?.focus()
  }
  return (
    <div role="tablist" className={`no-scrollbar flex gap-6 overflow-x-auto border-b ${dark ? 'border-ivory/20' : 'border-ink/15'}`}>
      {tabs.map((t, i) => (
        <button key={t.id} ref={(el) => (refs.current[i] = el)} role="tab" aria-selected={value === t.id} tabIndex={value === t.id ? 0 : -1} onKeyDown={(e) => onKey(e, i)}
          onClick={() => onChange(t.id)}
          className={`relative shrink-0 whitespace-nowrap pb-3 font-sans text-[12px] uppercase tracking-[0.16em] transition-colors ${value === t.id ? (dark ? 'text-ivory' : 'text-ink') : (dark ? 'text-ivory/50 hover:text-ivory' : 'text-soft hover:text-ink')}`}>
          {t.label}{t.count ? <span className="ml-2 opacity-60">{t.count}</span> : null}
          {value === t.id && <motion.span layoutId={`tab-${tabs[0].id}`} className={`absolute -bottom-px left-0 h-px w-full ${dark ? 'bg-ivory' : 'bg-ink'}`} />}
        </button>
      ))}
    </div>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="border border-dashed border-ink/20 px-5 py-8 text-center font-display text-xl italic text-soft">{children}</p>
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    ref.current?.focus()
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; prev?.focus() }
  }, [open, onClose])
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
          <motion.div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
            initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
            className={`max-h-[92vh] w-full overflow-y-auto bg-ivory p-6 outline-none sm:p-9 ${wide ? 'max-w-4xl' : 'max-w-xl'}`}>
            <div className="mb-6 flex items-start justify-between gap-4">
              <h3 className="font-display text-3xl">{title}</h3>
              <button onClick={onClose} aria-label="Close" className="p-1 text-soft hover:text-ink"><svg width="18" height="18" viewBox="0 0 18 18"><path d="M2 2l14 14M16 2L2 16" stroke="currentColor" /></svg></button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Confirm({ open, message, confirmLabel = 'Remove', onYes, onNo }: { open: boolean; message: string; confirmLabel?: string; onYes: () => void; onNo: () => void }) {
  return (
    <Modal open={open} onClose={onNo} title="Are you sure?">
      <p className="prose-quiet">{message}</p>
      <div className="mt-6 flex gap-3"><button className="btn-solid" onClick={onYes}>{confirmLabel}</button><button className="btn" onClick={onNo}>Keep it</button></div>
    </Modal>
  )
}

export function Stars({ value, onChange, label }: { value: number; onChange?: (n: number) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" disabled={!onChange} onClick={() => onChange?.(n === value ? 0 : n)} aria-label={`${label}: ${n} of 5`} aria-pressed={n <= value}
          className={`h-4 w-4 rounded-full border transition-colors ${n <= value ? 'border-sage-700 bg-sage-600' : 'border-ink/30 hover:border-sage-600'}`} />
      ))}
    </div>
  )
}

export function BookmarkIcon({ on, className = '' }: { on: boolean; className?: string }) {
  return (
    <svg width="16" height="20" viewBox="0 0 16 20" className={className} aria-hidden>
      <path d="M2 1h12v17l-6-4-6 4z" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}

export function Arrow({ className = '' }: { className?: string }) {
  return <svg width="22" height="10" viewBox="0 0 22 10" className={className} aria-hidden><path d="M0 5h20M16 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1" /></svg>
}

export function useId8() { return useRef(uid()).current }

export function Toast({ msg }: { msg: string | null }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-6 left-1/2 z-[110] -translate-x-1/2">
      <AnimatePresence>{msg && <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-ink px-5 py-3 font-sans text-[13px] tracking-wide text-ivory">{msg}</motion.p>}</AnimatePresence>
    </div>
  )
}
export function useToast() {
  const [msg, setMsg] = useState<string | null>(null)
  const t = useRef<number>()
  const show = (m: string) => { setMsg(m); window.clearTimeout(t.current); t.current = window.setTimeout(() => setMsg(null), 2400) }
  return { msg, show }
}
