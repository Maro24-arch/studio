import { AnchorHTMLAttributes, useEffect, useState } from 'react'

export const CHAPTERS = [
  { path: '/discover', n: '01', title: 'Discover Matcha', short: 'Discover', jp: '知る', blurb: 'How matcha is grown, shaded, steamed, dried and ground — explained from the very beginning.' },
  { path: '/japan', n: '02', title: 'Explore Japan', short: 'Japan', jp: '旅', blurb: 'An atlas of tea regions, and a planner for the research trip you might take.' },
  { path: '/lab', n: '03', title: 'The Matcha Lab', short: 'Lab', jp: '試す', blurb: 'Combine flavours, formats and ideas. Nothing here is a commitment.' },
  { path: '/library', n: '04', title: 'Inspiration Library', short: 'Library', jp: '集める', blurb: 'A quiet board for the things that catch your eye — and why.' },
  { path: '/roadmap', n: '05', title: 'From Idea to Product', short: 'Roadmap', jp: '歩む', blurb: 'Eleven gentle steps from curiosity to a real product, with worksheets.' },
  { path: '/workspace', n: '06', title: 'My Workspace', short: 'Workspace', jp: '綴る', blurb: 'Your private notebook. Everything you save lives here.' },
] as const

export function currentPath() {
  const h = window.location.hash.replace(/^#/, '')
  return h.startsWith('/') ? h.split('?')[0] : '/'
}

export function useRoute() {
  const [p, setP] = useState(currentPath())
  useEffect(() => {
    const f = () => { setP(currentPath()); window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }) }
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])
  return p
}

export function Link({ to, children, ...rest }: { to: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a href={`#${to}`} {...rest}>{children}</a>
}

export function go(to: string) { window.location.hash = to }
