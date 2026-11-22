import { useEffect, useState } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { CHAPTERS, Link, useRoute } from '../lib/router'
import { useStore } from '../lib/store'

export function Nav() {
  const path = useRoute()
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  const { scrollYProgress } = useScroll()
  const w = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  const home = path === '/'
  useEffect(() => { setOpen(false) }, [path])
  useEffect(() => {
    const f = () => setSolid(window.scrollY > 40)
    f(); window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : '' }, [open])
  const light = home && !solid && !open
  return (
    <>
      <a href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus() }} className="sr-only z-[120] bg-ivory p-3 focus:not-sr-only focus:fixed focus:left-3 focus:top-3">Skip to content</a>
      <header className={`fixed inset-x-0 top-0 z-[80] transition-colors duration-500 ${solid || open ? 'bg-ivory/90 backdrop-blur-md' : ''}`}>
        <div className="wrap flex h-16 items-center justify-between">
          <Link to="/" className={`font-display text-[19px] tracking-wide transition-colors ${light ? 'text-ivory' : 'text-ink'}`} aria-label="Matcha Exploration Studio — home">
            Matcha Exploration Studio
          </Link>
          <nav aria-label="Chapters" className="hidden items-center gap-7 lg:flex">
            {CHAPTERS.map((c) => (
              <Link key={c.path} to={c.path} aria-current={path === c.path ? 'page' : undefined}
                className={`group relative font-sans text-[11.5px] uppercase tracking-[0.18em] transition-colors ${light ? 'text-ivory/80 hover:text-ivory' : 'text-soft hover:text-ink'} ${path === c.path ? (light ? '!text-ivory' : '!text-ink') : ''}`}>
                <span className="mr-1.5 opacity-50">{c.n}</span>{c.short}
                <span className={`absolute -bottom-1.5 left-0 h-px bg-current transition-all duration-500 ${path === c.path ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </Link>
            ))}
          </nav>
          <button className={`lg:hidden ${light ? 'text-ivory' : 'text-ink'}`} aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
            <svg width="26" height="14" viewBox="0 0 26 14"><path d={open ? 'M3 1l20 12M23 1L3 13' : 'M0 1h26M8 13h18'} stroke="currentColor" /></svg>
          </button>
        </div>
        <motion.div style={{ scaleX: w }} className="h-px origin-left bg-sage-600" aria-hidden />
      </header>
      {open && (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-ivory pt-24">
          <nav aria-label="Chapters (mobile)" className="wrap pb-12">
            {CHAPTERS.map((c) => (
              <Link key={c.path} to={c.path} className="flex items-baseline gap-5 border-b border-ink/10 py-4">
                <span className="font-sans text-xs tracking-widest text-sage-600">{c.n}</span>
                <span className="font-display text-4xl">{c.title}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}

export function Footer() {
  const lastExport = useStore((s) => s.lastExport)
  return (
    <footer className="mt-32 border-t border-ink/15 bg-paper/60">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-3xl">Matcha Exploration Studio</p>
          <p className="prose-quiet mt-3 max-w-[44ch] text-[14px]">A working title, nothing more. A private space to be curious in — there is no rush, and nothing to decide today.</p>
        </div>
        <ul className="space-y-2 font-sans text-[13px]">
          {CHAPTERS.map((c) => <li key={c.path}><Link to={c.path} className="link"><span className="mr-2 text-sage-600">{c.n}</span>{c.title}</Link></li>)}
        </ul>
        <div className="font-sans text-[13px] leading-relaxed text-soft">
          <p>Everything you write is saved in this browser only — not in the cloud. {lastExport ? `Last backup: ${new Date(lastExport).toLocaleDateString()}.` : 'You have not exported a backup yet.'}</p>
          <p className="mt-3"><Link to="/workspace" className="link">Back up your work</Link></p>
          <p className="mt-6 text-[12px]">Educational content is a beginner’s guide, not legal, food-safety or financial advice. Please verify details with the sources named.</p>
        </div>
      </div>
    </footer>
  )
}

export function PageHeader({ n, title, jp, children, plate }: { n: string; title: string; jp: string; children: React.ReactNode; plate: React.ReactNode }) {
  return (
    <header className="relative pt-28 sm:pt-32">
      <div className="wrap grid items-end gap-10 lg:grid-cols-[1.15fr_1fr]">
        <div className="pb-4 lg:pb-10">
          <p className="eyebrow mb-6">Chapter {n}</p>
          <h1 className="display text-[56px] sm:text-7xl lg:text-[96px]">{title}</h1>
          <p className="mt-2 font-display text-3xl italic text-sage-500" lang="ja">{jp}</p>
          <div className="prose-quiet mt-8 max-w-[52ch]">{children}</div>
        </div>
        <div className="relative aspect-[4/3] w-full lg:aspect-[4/4.4]">{plate}</div>
      </div>
    </header>
  )
}
