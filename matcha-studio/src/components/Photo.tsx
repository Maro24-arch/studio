import { useState } from 'react'
import Plate, { PlateKind, Tone, Peak } from './Plate'
import { PHOTO_CREDITS } from '../data/photos'

interface Props {
  slot: string
  plate: PlateKind
  seed?: number
  tone?: Tone
  peak?: Peak
  alt: string
  className?: string
  zoom?: boolean
  credit?: boolean
}

/** Shows /photos/<slot>.jpg when present; otherwise an original illustrated plate. */
export default function Photo({ slot, plate, seed, tone, peak, alt, className = '', zoom = true, credit = true }: Props) {
  const [failed, setFailed] = useState(false)
  const c = PHOTO_CREDITS[slot]
  return (
    <div className={`relative overflow-hidden bg-paper ${zoom ? 'img-zoom' : ''} ${className}`}>
      {!failed ? (
        <img src={`${import.meta.env.BASE_URL}photos/${slot}.jpg`} alt={alt} loading="lazy" onError={() => setFailed(true)} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <Plate kind={plate} seed={seed} tone={tone} peak={peak} label={alt} />
      )}
      {!failed && c && credit && (
        <span className="absolute bottom-1 right-2 font-sans text-[10px] tracking-wide text-white/90 drop-shadow">
          {c.author} · {c.license}
        </span>
      )}
    </div>
  )
}
