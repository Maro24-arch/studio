import { useId, useMemo } from 'react'

export type PlateKind =
  | 'fields' | 'terrace' | 'shade' | 'mill' | 'powder' | 'bowl' | 'leaf' | 'steam' | 'flakes' | 'paper' | 'ceramic' | 'wood' | 'grid' | 'tin' | 'type'
export type Tone = 'sage' | 'moss' | 'ivory' | 'clay' | 'ink'
export type Peak = 'none' | 'fuji' | 'sakurajima' | 'rolling' | 'river'

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const TONES: Record<Tone, { bg: string; bg2: string; fg: string; accent: string; line: string }> = {
  sage: { bg: '#E9EDDD', bg2: '#CFD7C0', fg: '#556A49', accent: '#8E9F78', line: '#40533A' },
  moss: { bg: '#2F3E2C', bg2: '#222D20', fg: '#8E9F78', accent: '#B0BD9C', line: '#E6EADD' },
  ivory: { bg: '#F4EFE3', bg2: '#E4DCC8', fg: '#8E9F78', accent: '#B9A688', line: '#40533A' },
  clay: { bg: '#E8DFCB', bg2: '#CDBE9E', fg: '#8B7A5A', accent: '#6F8260', line: '#40533A' },
  ink: { bg: '#2A2F26', bg2: '#1C201A', fg: '#6F8260', accent: '#B9A688', line: '#F7F3EA' },
}

interface Props {
  kind: PlateKind
  seed?: number
  tone?: Tone
  peak?: Peak
  className?: string
  label?: string
}

/** Illustrated "plates" — original generative artwork used wherever a photograph has not been added. */
export default function Plate({ kind, seed = 1, tone = 'sage', peak = 'rolling', className = '', label }: Props) {
  const id = useId().replace(/:/g, '')
  const t = TONES[tone]
  const W = 400, H = 500
  const content = useMemo(() => {
    const r = rng(seed * 7919 + kind.length * 31)
    const els: JSX.Element[] = []
    let k = 0
    const key = () => k++
    switch (kind) {
      case 'fields':
      case 'terrace': {
        const dark = tone === 'moss' || tone === 'ink'
        els.push(<circle key={key()} cx={70 + r() * 260} cy={95 + r() * 40} r={30 + r() * 14} fill={dark ? '#E6EADD' : '#F7F3EA'} opacity={dark ? 0.18 : 0.85} />)
        // distant ridges
        for (let i = 0; i < 3; i++) {
          const y = 190 - i * 14 + r() * 8
          let d = `M-10 ${y + 60}`
          for (let x = -10; x <= 410; x += 40) d += ` L${x} ${y - r() * 34 + (i % 2) * 6}`
          d += ` L410 ${H} L-10 ${H}Z`
          els.push(<path key={key()} d={d} fill={t.bg2} opacity={0.35 + i * 0.18} />)
        }
        if (peak === 'fuji') els.push(<path key={key()} d="M70 270 L172 118 Q200 96 228 118 L330 270Z" fill={t.fg} opacity={0.38} />, <path key={key()} d="M150 150 L172 118 Q200 96 228 118 L250 150 L232 140 L216 158 L200 142 L184 158 L168 140Z" fill="#F7F3EA" opacity={0.8} />)
        if (peak === 'sakurajima') els.push(<path key={key()} d="M40 270 L150 168 Q200 140 250 168 L360 270Z" fill={t.fg} opacity={0.42} />, <path key={key()} d="M196 150 Q184 100 214 70 Q190 60 220 32" stroke={t.line} strokeWidth="6" strokeLinecap="round" fill="none" opacity={0.22} />)
        if (peak === 'river') els.push(<path key={key()} d="M-10 300 C 110 270 150 340 250 316 S 380 270 420 284 L420 318 C 380 304 290 350 250 352 C 150 376 110 312 -10 336Z" fill="#F7F3EA" opacity={0.7} />)
        const rows = kind === 'terrace' ? 26 : 22
        for (let i = 0; i < rows; i++) {
          const p = i / rows
          const y = 250 + Math.pow(p, 1.35) * 260
          const sw = 5 + p * 30
          const bend = 30 + (kind === 'terrace' ? 70 : 24) * (1 - p) + r() * 16
          const dir = kind === 'terrace' ? (i % 2 ? 1 : -1) : -1
          const col = [t.fg, t.accent, t.line][(i + Math.floor(r() * 2)) % 3]
          els.push(
            <path key={key()} d={`M-30 ${y} Q ${W / 2} ${y + dir * bend} ${W + 30} ${y - dir * 8 * (1 - p)}`} stroke={col}
              strokeWidth={sw} strokeLinecap="round" strokeDasharray={`${sw * 1.6} ${3 + p * 3}`} fill="none" opacity={0.5 + p * 0.45} />,
          )
        }
        break
      }
      case 'shade': {
        for (let i = -4; i < 24; i++) els.push(<line key={key()} x1={i * 28} y1={0} x2={i * 28 + 200} y2={H} stroke={t.line} strokeOpacity={0.14} strokeWidth="0.8" />)
        for (let i = -4; i < 24; i++) els.push(<line key={key()} x1={i * 28 + 200} y1={0} x2={i * 28} y2={H} stroke={t.line} strokeOpacity={0.1} strokeWidth="0.8" />)
        for (let i = 0; i < 4; i++) els.push(<polygon key={key()} points={`${60 + i * 80},0 ${100 + i * 80},0 ${40 + i * 110},${H} ${-10 + i * 110},${H}`} fill="#F7F3EA" opacity={0.045} />)
        for (let i = 0; i < 12; i++) {
          const y = 360 + i * 14
          els.push(<path key={key()} d={`M-20 ${y} Q 200 ${y - 20} 420 ${y + 4}`} stroke={t.accent} strokeWidth={9 + i * 1.4} strokeDasharray="22 5" strokeLinecap="round" fill="none" opacity={0.35 + i * 0.05} />)
        }
        break
      }
      case 'mill': {
        const cx = 200, cy = 250
        els.push(<circle key={key()} cx={cx} cy={cy} r={168} fill={t.bg2} opacity={0.9} />)
        els.push(<circle key={key()} cx={cx} cy={cy} r={160} fill={t.bg} stroke={t.line} strokeOpacity=".25" />)
        for (let i = 0; i < 32; i++) {
          const a = (i / 32) * Math.PI * 2
          els.push(<path key={key()} d={`M${cx + Math.cos(a) * 20} ${cy + Math.sin(a) * 20} Q ${cx + Math.cos(a + 0.5) * 90} ${cy + Math.sin(a + 0.5) * 90} ${cx + Math.cos(a + 0.28) * 156} ${cy + Math.sin(a + 0.28) * 156}`} stroke={t.line} strokeOpacity=".22" fill="none" />)
        }
        els.push(<circle key={key()} cx={cx} cy={cy} r={18} fill={t.bg2} stroke={t.line} strokeOpacity=".4" />)
        els.push(<circle key={key()} cx={cx} cy={cy} r={6} fill={t.line} opacity=".5" />)
        for (let i = 0; i < 240; i++) {
          const a = r() * Math.PI * 2, d = 150 + r() * 30
          els.push(<circle key={key()} cx={cx + Math.cos(a) * d} cy={cy + Math.sin(a) * d} r={0.6 + r() * 1.8} fill={t.fg} opacity={0.4 + r() * 0.5} />)
        }
        break
      }
      case 'powder': {
        for (let i = 0; i < 1500; i++) {
          const a = i * 0.22 + r() * 0.9, d = Math.sqrt(i) * 5.4 + r() * 14
          const x = 200 + Math.cos(a) * d * 1.05, y = 250 + Math.sin(a) * d * 1.2
          els.push(<circle key={key()} cx={x} cy={y} r={0.5 + r() * 1.7} fill={[t.fg, t.accent, t.line][i % 3]} opacity={0.18 + r() * 0.6} />)
        }
        break
      }
      case 'flakes': {
        for (let i = 0; i < 160; i++) {
          const x = r() * W, y = r() * H, s = 6 + r() * 20, a = r() * 360
          const pts = Array.from({ length: 5 }, (_, j) => `${(Math.cos((j / 5) * 6.28) * s * (0.5 + r() * 0.6)).toFixed(1)},${(Math.sin((j / 5) * 6.28) * s * (0.4 + r() * 0.5)).toFixed(1)}`).join(' ')
          els.push(<polygon key={key()} points={pts} transform={`translate(${x} ${y}) rotate(${a})`} fill={[t.fg, t.accent, t.line][i % 3]} opacity={0.3 + r() * 0.5} />)
        }
        break
      }
      case 'bowl': {
        els.push(<circle key={key()} cx={200} cy={230} r={150} fill="none" stroke={t.line} strokeOpacity=".25" strokeWidth="1.5" strokeDasharray="900 40" transform="rotate(-30 200 230)" />)
        els.push(<path key={key()} d="M70 230 Q 70 400 200 410 Q 330 400 330 230Z" fill="#3C4A36" />)
        els.push(<path key={key()} d="M70 230 Q 70 330 160 392 Q 110 340 108 230Z" fill="#fff" opacity=".07" />)
        els.push(<ellipse key={key()} cx={200} cy={230} rx={130} ry={30} fill="#2F3E2C" />)
        els.push(<ellipse key={key()} cx={200} cy={232} rx={118} ry={24} fill="#7D9468" />)
        for (let i = 0; i < 160; i++) {
          const a = r() * 6.28, d = Math.sqrt(r()) * 112
          els.push(<circle key={key()} cx={200 + Math.cos(a) * d} cy={232 + Math.sin(a) * d * 0.2} r={0.6 + r() * 2.2} fill="#CFD7C0" opacity={0.25 + r() * 0.5} />)
        }
        els.push(<ellipse key={key()} cx={200} cy={420} rx={90} ry={9} fill={t.line} opacity={0.12} />)
        els.push(<path key={key()} d="M180 220 q-6 -34 4 -62 M205 222 q6 -30 -2 -66" stroke={t.line} strokeOpacity=".25" fill="none" strokeWidth="1.2" />)
        break
      }
      case 'steam': {
        for (let i = 0; i < 9; i++) {
          const x = 80 + i * 30 + r() * 10
          els.push(<path key={key()} d={`M${x} ${H} C ${x - 40 + r() * 80} ${400 - r() * 40}, ${x + 40 - r() * 80} ${280 - r() * 40}, ${x + (r() - 0.5) * 100} ${60 + r() * 100}`} stroke={t.line} strokeOpacity={0.12 + r() * 0.2} strokeWidth={10 + r() * 24} strokeLinecap="round" fill="none" />)
        }
        break
      }
      case 'leaf': {
        const leaf = (x: number, y: number, rot: number, s: number, c: string) => (
          <g key={key()} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
            <path d="M0 0 C 40 -40 110 -50 170 0 C 110 50 40 40 0 0Z" fill={c} />
            <path d="M0 0 L170 0 M40 0 L80 -22 M40 0 L80 22 M85 0 L125 -18 M85 0 L125 18" stroke="#F7F3EA" strokeOpacity=".5" fill="none" />
          </g>
        )
        els.push(<path key={key()} d="M200 470 C 190 380 210 300 200 210" stroke={t.line} strokeOpacity=".6" strokeWidth="3" fill="none" />)
        els.push(leaf(200, 300, -40, 1.1, t.fg), leaf(200, 340, 205, 1.25, t.accent), leaf(200, 215, -78, 0.8, t.fg))
        els.push(<path key={key()} d="M200 215 C 186 180 192 150 200 120 C 208 150 214 180 200 215Z" fill={t.line} opacity=".55" />)
        break
      }
      case 'paper': {
        for (let i = 0; i < 220; i++) {
          const x = r() * W, y = r() * H, l = 10 + r() * 40, a = r() * 6.28
          els.push(<path key={key()} d={`M${x} ${y} q ${Math.cos(a) * l * 0.5} ${Math.sin(a) * l * 0.5 + 6} ${Math.cos(a) * l} ${Math.sin(a) * l}`} stroke={t.line} strokeOpacity={0.06 + r() * 0.14} fill="none" strokeWidth={0.6 + r() * 0.6} />)
        }
        break
      }
      case 'ceramic': {
        for (let i = 0; i < 14; i++) {
          const y = i * 40 + r() * 12
          els.push(<path key={key()} d={`M-10 ${y} C 100 ${y + 40 * (r() - 0.3)}, 260 ${y - 50 * r()}, 410 ${y + 30}`} stroke={[t.fg, t.accent, t.line][i % 3]} strokeOpacity={0.15 + r() * 0.25} strokeWidth={10 + r() * 36} fill="none" strokeLinecap="round" />)
        }
        break
      }
      case 'wood': {
        for (let i = 0; i < 60; i++) {
          const x = i * 7 + r() * 4
          els.push(<path key={key()} d={`M${x} -10 C ${x + 14 * (r() - 0.5)} 150, ${x - 14 * r()} 320, ${x + 8} ${H + 10}`} stroke={t.line} strokeOpacity={0.05 + r() * 0.16} strokeWidth={0.6 + r() * 1.6} fill="none" />)
        }
        els.push(<ellipse key={key()} cx={260} cy={180} rx={22} ry={46} fill="none" stroke={t.line} strokeOpacity=".2" />, <ellipse key={key()} cx={260} cy={180} rx={10} ry={24} fill="none" stroke={t.line} strokeOpacity=".2" />)
        break
      }
      case 'grid': {
        for (let i = 0; i < 12; i++) for (let j = 0; j < 15; j++) els.push(<rect key={key()} x={20 + i * 31} y={20 + j * 31} width={24} height={24} fill={[t.fg, t.accent, t.line, t.bg2][Math.floor(r() * 4)]} opacity={0.25 + r() * 0.55} />)
        break
      }
      case 'tin': {
        els.push(<rect key={key()} x={110} y={150} width={180} height={230} rx={6} fill={t.fg} opacity=".9" />, <rect key={key()} x={104} y={132} width={192} height={36} rx={6} fill={t.accent} />, <rect key={key()} x={110} y={150} width={36} height={230} fill="#fff" opacity=".1" />, <ellipse key={key()} cx={200} cy={400} rx={110} ry={10} fill={t.line} opacity=".14" />)
        break
      }
      case 'type': {
        els.push(<text key={key()} x={30} y={300} fontFamily="Cormorant Garamond, serif" fontSize={250} fill={t.line} opacity=".12">Aa</text>, <text key={key()} x={34} y={420} fontFamily="Jost, sans-serif" fontSize={26} letterSpacing="6" fill={t.line} opacity=".35">ABCDEFG</text>)
        break
      }
    }
    return els
  }, [kind, seed, tone, peak])

  const sky = kind === 'fields' || kind === 'terrace'
  return (
    <svg className={`plate block h-full w-full ${className}`} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label={label || 'Illustration'}>
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.bg} />
          <stop offset="1" stopColor={sky ? t.bg2 : t.bg} />
        </linearGradient>
        <filter id={`f${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed={seed} />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .09 0" />
        </filter>
      </defs>
      <rect width={W} height={H} fill={`url(#g${id})`} />
      {content}
      <rect width={W} height={H} filter={`url(#f${id})`} />
    </svg>
  )
}
