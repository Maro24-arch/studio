import type React from 'react'
import { Suspense, lazy, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Footer, Nav } from './components/Layout'
import { useRoute } from './lib/router'
import Home from './pages/Home'
const Discover = lazy(() => import('./pages/Discover'))
const Japan = lazy(() => import('./pages/Japan'))
const Lab = lazy(() => import('./pages/Lab'))
const Library = lazy(() => import('./pages/Library'))
const Roadmap = lazy(() => import('./pages/Roadmap'))
const Workspace = lazy(() => import('./pages/Workspace'))

const PAGES: Record<string, React.ComponentType> = {
  '/': Home, '/discover': Discover, '/japan': Japan, '/lab': Lab, '/library': Library, '/roadmap': Roadmap, '/workspace': Workspace,
}

export default function App() {
  const path = useRoute()
  const Page = PAGES[path] ?? Home
  const [full, setFull] = useState(false)
  useEffect(() => { const f = () => setFull(true); window.addEventListener('matcha-storage-error', f); return () => window.removeEventListener('matcha-storage-error', f) }, [])
  return (
    <>
      <Nav />
      {full && <div role="alert" className="fixed inset-x-0 top-16 z-[85] bg-stamp px-5 py-3 text-center font-sans text-sm text-ivory">This browser could not save your latest changes (storage may be full or blocked). Please export a backup from My Workspace, and remove large images.</div>}
      <AnimatePresence mode="wait">
        <motion.main key={path} id="main" tabIndex={-1} className="min-h-screen outline-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
          <Suspense fallback={<div className="grid min-h-screen place-items-center font-display text-2xl italic text-soft">Steeping…</div>}>
            <Page />
          </Suspense>
        </motion.main>
      </AnimatePresence>
      <Footer />
    </>
  )
}
