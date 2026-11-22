import { motion } from 'framer-motion'

export interface Series { values: number[]; color: string; label: string; dashed?: boolean; fill?: number }

/** Values 0..10 (or 0..max). Animated polygon radar. */
export default function Radar({ axes, series, size = 360, max = 10, dark = false, labelSize = 12 }: { axes: string[]; series: Series[]; size?: number; max?: number; dark?: boolean; labelSize?: number }) {
  const c = size / 2, R = size / 2 - 84, n = axes.length
  const ang = (i: number) => -Math.PI / 2 + (i / n) * Math.PI * 2
  const pt = (i: number, v: number) => [c + Math.cos(ang(i)) * R * (v / max), c + Math.sin(ang(i)) * R * (v / max)]
  const path = (vals: number[]) => vals.map((v, i) => `${i ? 'L' : 'M'}${pt(i, v)[0].toFixed(1)} ${pt(i, v)[1].toFixed(1)}`).join('') + 'Z'
  const stroke = dark ? '#F7F3EA' : '#23271F'
  const summary = series.map((s) => `${s.label}: ${axes.map((a, i) => `${a} ${Math.round(s.values[i])}`).join(', ')}`).join('. ')
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full" role="img" aria-label={`Flavour diagram. ${summary}`}>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon key={f} points={axes.map((_, i) => pt(i, max * f).join(',')).join(' ')} fill="none" stroke={stroke} strokeOpacity={f === 1 ? 0.35 : 0.14} strokeWidth="0.8" />
      ))}
      {axes.map((a, i) => {
        const [x, y] = pt(i, max * 1.2)
        const anchor = Math.abs(x - c) < 6 ? 'middle' : x > c ? 'start' : 'end'
        return (
          <g key={a}>
            <line x1={c} y1={c} x2={pt(i, max)[0]} y2={pt(i, max)[1]} stroke={stroke} strokeOpacity=".18" strokeWidth=".8" />
            <text x={x} y={y + 4} textAnchor={anchor} fontSize={labelSize} fontFamily="Jost, sans-serif" letterSpacing="1.5" fill={stroke} fillOpacity=".7" style={{ textTransform: 'uppercase' }}>{a}</text>
          </g>
        )
      })}
      {series.map((s, si) => (
        <g key={si}>
          <motion.path initial={false} animate={{ d: path(s.values) }} transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            fill={s.color} fillOpacity={s.fill ?? (si === 0 ? 0.28 : 0.1)} stroke={s.color} strokeWidth="1.6" strokeDasharray={s.dashed ? '5 4' : undefined} strokeLinejoin="round" />
          {s.values.map((v, i) => (
            <motion.circle key={i} initial={false} animate={{ cx: pt(i, v)[0], cy: pt(i, v)[1] }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} r={si === 0 ? 3.4 : 2.4} fill={s.color} />
          ))}
        </g>
      ))}
    </svg>
  )
}
