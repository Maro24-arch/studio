import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import Photo from '../components/Photo'
import { Reveal, Arrow } from '../components/ui'
import { CHAPTERS, Link } from '../lib/router'
import type { PlateKind, Tone, Peak } from '../components/Plate'

const INSIDE: Record<string, string[]> = {
  '/discover': ['Shade-to-bowl timeline', 'Cultivars & flavour wheel', 'Compare styles of matcha'],
  '/japan': ['Interactive tea map', 'Seven regions in depth', 'Research-trip planner'],
  '/lab': ['Live flavour diagram', 'Concepts, formats, pairings', 'Experiment journal'],
  '/library': ['Collections & uploads', 'Prompts, not prescriptions', 'Notes on what you love'],
  '/roadmap': ['Eleven steps, in plain words', 'Worksheets & cost calculator', 'EU / Spain topics to verify'],
  '/workspace': ['Notes, journal, milestones', 'Everything in one place', 'Export & import backups'],
}
const ART: Record<string, { plate: PlateKind; tone: Tone; peak?: Peak; seed: number; ratio: string }> = {
  '/discover': { plate: 'leaf', tone: 'ivory', seed: 3, ratio: 'aspect-[4/5]' },
  '/japan': { plate: 'terrace', tone: 'sage', seed: 5, ratio: 'aspect-[5/4]' },
  '/lab': { plate: 'powder', tone: 'sage', seed: 8, ratio: 'aspect-[4/5]' },
  '/library': { plate: 'ceramic', tone: 'clay', seed: 2, ratio: 'aspect-square' },
  '/roadmap': { plate: 'fields', tone: 'ivory', peak: 'river', seed: 11, ratio: 'aspect-[5/4]' },
  '/workspace': { plate: 'paper', tone: 'ivory', seed: 4, ratio: 'aspect-[4/5]' },
}
const SLOT: Record<string, string> = { '/discover': 'ch-discover', '/japan': 'ch-japan', '/lab': 'ch-lab', '/library': 'ch-library', '/roadmap': 'ch-roadmap', '/workspace': 'ch-workspace' }

export default function Home() {
  const hero = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: hero, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 160])
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const begin = () => document.getElementById('welcome')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })

  return (
    <>
      <section ref={hero} className="on-dark relative flex min-h-[100svh] items-end overflow-hidden bg-sage-900 text-ivory" aria-label="Introduction">
        <motion.div style={{ y }} className="absolute inset-[-8%_0_-8%_0]">
          <Photo slot="hero" plate="fields" tone="moss" peak="fuji" seed={21} alt="Rows of tea bushes beneath a distant mountain at dawn" zoom={false} className="h-full w-full" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-sage-900/85 via-sage-900/25 to-sage-900/30" aria-hidden />
        <motion.div style={{ opacity: fade }} className="wrap relative pb-16 pt-40 sm:pb-24">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 1.2 }} className="eyebrow mb-8 !text-sage-200">A private space for matcha curiosity</motion.p>
          <h1 className="display max-w-[14ch] text-[64px] sm:text-[96px] lg:text-[136px]">
            {['Every great idea', 'begins with', 'curiosity.'].map((l, i) => (
              <span key={l} className="block overflow-hidden pb-[0.08em]">
                <motion.span className={`block ${i === 2 ? 'italic text-sage-200' : ''}`} initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ delay: 0.25 + i * 0.16, duration: 1.2, ease: [0.2, 0.7, 0.2, 1] }}>{l}</motion.span>
              </span>
            ))}
          </h1>
          <div className="mt-10 flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
            <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 1 }} className="max-w-[46ch] text-[17px] leading-relaxed text-ivory/85">
              A space to explore matcha, discover its origins, experiment with possibilities, and turn inspiration into something of your own.
            </motion.p>
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 1 }} onClick={begin} className="group flex items-center gap-5 self-start sm:self-auto">
              <span className="font-sans text-[12px] uppercase tracking-[0.24em]">Begin exploring</span>
              <span className="relative grid h-14 w-14 place-items-center rounded-full border border-ivory/60 transition-all duration-500 group-hover:bg-ivory group-hover:text-sage-900">
                <svg width="14" height="20" viewBox="0 0 14 20" className="transition-transform duration-500 group-hover:translate-y-1" aria-hidden><path d="M7 0v18M1 12l6 6 6-6" fill="none" stroke="currentColor" /></svg>
              </span>
            </motion.button>
          </div>
        </motion.div>
      </section>

      <section id="welcome" tabIndex={-1} className="wrap grid gap-10 py-28 lg:grid-cols-[1fr_1.6fr] lg:py-40" aria-label="A welcome note">
        <Reveal><p className="eyebrow">A small note</p><div className="mt-5 h-px w-16 bg-sage-500" /></Reveal>
        <Reveal delay={0.1}>
          <p className="max-w-[38ch] font-display text-[28px] font-light italic leading-[1.35] text-ink sm:text-[34px]">
            This is just a little space for you to explore an idea that could become something amazing. There’s no rush, no expectations, and nothing you need to decide today. Just follow your curiosity and see where it takes you.
          </p>
        </Reveal>
      </section>

      <section aria-label="The six chapters" className="space-y-28 lg:space-y-44">
        {CHAPTERS.map((c, i) => {
          const a = ART[c.path]
          const flip = i % 2 === 1
          return (
            <article key={c.path} className="wrap">
              <div className={`grid items-center gap-10 lg:gap-20 ${flip ? 'lg:grid-cols-[1fr_1.05fr]' : 'lg:grid-cols-[1.05fr_1fr]'}`}>
                <Reveal className={flip ? 'lg:order-2' : ''}>
                  <Link to={c.path} aria-label={`Enter ${c.title}`} className="block">
                    <Photo slot={SLOT[c.path]} plate={a.plate} tone={a.tone} peak={a.peak} seed={a.seed} alt={`${c.title} — illustrated plate`} className={`${a.ratio} w-full`} />
                  </Link>
                </Reveal>
                <Reveal delay={0.12} className={flip ? 'lg:order-1' : ''}>
                  <p className="flex items-baseline gap-4"><span className="font-display text-[88px] font-light leading-none text-sage-300 sm:text-[120px]">{c.n}</span><span className="font-display text-3xl italic text-sage-500" lang="ja">{c.jp}</span></p>
                  <h2 className="display mt-2 text-[44px] sm:text-6xl">{c.title}</h2>
                  <p className="prose-quiet mt-5 max-w-[44ch]">{c.blurb}</p>
                  <ul className="mt-6 space-y-1.5 font-sans text-[13.5px] text-soft">
                    {INSIDE[c.path].map((t) => <li key={t} className="flex items-center gap-3"><span className="h-px w-5 bg-sage-400" />{t}</li>)}
                  </ul>
                  <Link to={c.path} className="btn mt-9 group">Enter chapter <Arrow className="transition-transform duration-500 group-hover:translate-x-1" /></Link>
                </Reveal>
              </div>
            </article>
          )
        })}
      </section>

      <section className="wrap mt-32 lg:mt-48" aria-label="Where to start">
        <div className="grid gap-px border-y border-ink/15 bg-ink/15 md:grid-cols-3">
          {[
            ['Curious about the tea itself?', 'Start with how a leaf becomes a powder.', '/discover'],
            ['Dreaming of Japan?', 'Open the map and drop a few pins.', '/japan'],
            ['Feeling playful?', 'Mix a flavour in the Lab. Nothing is saved unless you say so.', '/lab'],
          ].map(([h, p, to]) => (
            <Link key={to} to={to} className="group bg-ivory p-8 transition-colors hover:bg-paper">
              <h3 className="font-display text-3xl">{h}</h3>
              <p className="prose-quiet mt-3 text-[15px]">{p}</p>
              <span className="mt-6 inline-flex items-center gap-2 font-sans text-[12px] uppercase tracking-[0.16em] text-sage-700">Go <Arrow className="transition-transform group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
