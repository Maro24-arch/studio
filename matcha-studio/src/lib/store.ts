import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)
export const now = () => new Date().toISOString()

export interface Note { id: string; title: string; body: string; createdAt: string; updatedAt: string }
export interface JournalEntry { id: string; date: string; text: string }
export interface Milestone { id: string; text: string; done: boolean; when?: string }
export interface Place { id: string; name: string; kind: string; regionId?: string; status: 'established' | 'lead' | 'custom'; note: string; visited: boolean; refId?: string }
export interface Question { id: string; text: string; to: string; answer: string }
export interface ItineraryItem { id: string; text: string }
export interface ItineraryDay { id: string; title: string; items: ItineraryItem[] }
export interface Flavor { sweetness: number; bitterness: number; umami: number; creaminess: number; intensity: number }
export interface Experiment {
  id: string; name: string; concept: string; format: string; flavor: Flavor
  ingredients: string[]; notes: string; favorite: boolean; createdAt: string
}
export interface Collection { id: string; name: string; note: string }
export interface InspoItem {
  id: string; kind: 'prompt' | 'image' | 'note' | 'color' | 'link'
  category: string; title: string; note: string; tags: string[]
  collections: string[]; image?: string; colors?: string[]; source?: string; promptId?: string; createdAt: string
}
export interface SupplierRow {
  id: string; name: string; region: string; cultivar: string; flush: string; moq: string
  price: string; leadTime: string; organic: string; samples: string; contact: string; notes: string
}
export interface SampleTest {
  id: string; supplier: string; lot: string; date: string
  color: number; aroma: number; umami: number; sweetness: number; bitterness: number; astringency: number; texture: number
  notes: string
}
export interface Costs {
  jpyPerKg: number; fx: number; kg: number; unitGrams: number; packaging: number; labour: number
  shipping: number; dutyPct: number; vatPct: number; testing: number; other: number; price: number
}

export interface AppData {
  notes: Note[]; journal: JournalEntry[]; milestones: Milestone[]
  savedRegions: string[]; places: Place[]; questions: Question[]; itinerary: ItineraryDay[]; tripNotes: string
  experiments: Experiment[]; collections: Collection[]; inspo: InspoItem[]
  suppliers: SupplierRow[]; samples: SampleTest[]; costs: Costs
  checks: Record<string, boolean>; stepNotes: Record<string, string>; emailTemplate: string
  lastExport: string | null; createdAt: string
}

export const defaultEmail = `Subject: Question about your matcha / tencha — small-scale enquiry

Dear [name / team],

My name is [your name] and I am based in [city, country]. I am at an early stage of exploring whether to create a small matcha product of my own, and I would be grateful for a little guidance from people who know the tea best.

Could you tell me whether you work with new, small-volume customers, and if so:
- which cultivars and harvests you offer (and whether they are single-cultivar or blended),
- whether you can send small samples, and under what conditions,
- your usual minimum order and how export / shipping to Spain is handled,
- what certifications or documents you can provide (e.g. organic, residue analysis, traceability).

I would also love to visit and learn about your work if it is possible, at a time that suits you. Please tell me if it is easier to continue in Japanese or with a translator.

Thank you very much for your time.

Kind regards,
[your name]`

export const defaultCosts: Costs = {
  jpyPerKg: 0, fx: 0, kg: 0, unitGrams: 30, packaging: 0, labour: 0, shipping: 0, dutyPct: 0, vatPct: 0, testing: 0, other: 0, price: 0,
}

export const initial = (): AppData => ({
  notes: [], journal: [], milestones: [], savedRegions: [], places: [], questions: [], itinerary: [], tripNotes: '',
  experiments: [], collections: [{ id: 'c-first', name: 'First impressions', note: 'Anything that catches my eye — no reason needed.' }],
  inspo: [], suppliers: [], samples: [], costs: defaultCosts, checks: {}, stepNotes: {}, emailTemplate: defaultEmail,
  lastExport: null, createdAt: now(),
})

interface Actions {
  set: (patch: Partial<AppData>) => void
  update: <K extends keyof AppData>(key: K, fn: (v: AppData[K]) => AppData[K]) => void
  replaceAll: (d: Partial<AppData>) => void
  mergeAll: (d: Partial<AppData>) => void
  reset: () => void
  toggleCheck: (id: string) => void
}

export const KEY = 'matcha-studio:v1'

export const useStore = create<AppData & Actions>()(
  persist(
    (set) => ({
      ...initial(),
      set: (patch) => set(patch),
      update: (key, fn) => set((s) => ({ [key]: fn(s[key] as never) }) as never),
      replaceAll: (d) => set({ ...initial(), ...d }),
      mergeAll: (d) =>
        set((s) => {
          const out: Record<string, unknown> = {}
          for (const k of Object.keys(d) as (keyof AppData)[]) {
            const cur = s[k] as unknown, inc = d[k] as unknown
            if (Array.isArray(cur) && Array.isArray(inc)) {
              const ids = new Set(cur.map((x: any) => (typeof x === 'object' ? x.id : x)))
              out[k] = [...cur, ...inc.filter((x: any) => !ids.has(typeof x === 'object' ? x.id : x))]
            } else if (cur && inc && typeof cur === 'object' && typeof inc === 'object') out[k] = { ...(cur as object), ...(inc as object) }
            else if (k !== 'createdAt') out[k] = inc
          }
          return out as Partial<AppData>
        }),
      reset: () => set({ ...initial() }),
      toggleCheck: (id) => set((s) => ({ checks: { ...s.checks, [id]: !s.checks[id] } })),
    }),
    {
      name: KEY,
      storage: createJSONStorage(() => ({
        getItem: (k: string) => { try { return localStorage.getItem(k) } catch { return null } },
        setItem: (k: string, v: string) => { try { localStorage.setItem(k, v) } catch { window.dispatchEvent(new Event('matcha-storage-error')) } },
        removeItem: (k: string) => { try { localStorage.removeItem(k) } catch { /* ignore */ } },
      })),
      partialize: (s) => {
        const { set, update, replaceAll, mergeAll, reset, toggleCheck, ...data } = s
        return data
      },
    },
  ),
)

export const DATA_KEYS = Object.keys(initial()) as (keyof AppData)[]

export function snapshot(): AppData {
  const s = useStore.getState() as any
  const out: any = {}
  DATA_KEYS.forEach((k) => (out[k] = s[k]))
  return out
}

export function exportJSON() {
  const data = snapshot()
  useStore.getState().set({ lastExport: now() })
  const blob = new Blob([JSON.stringify({ app: 'matcha-exploration-studio', version: 1, exportedAt: now(), data }, null, 2)], { type: 'application/json' })
  download(blob, `matcha-studio-backup-${new Date().toISOString().slice(0, 10)}.json`)
}

export function download(blob: Blob, name: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}

export function parseBackup(text: string): Partial<AppData> {
  const j = JSON.parse(text)
  if (j?.app !== 'matcha-exploration-studio' || typeof j.data !== 'object') throw new Error('This file does not look like a backup from this site.')
  const out: any = {}
  DATA_KEYS.forEach((k) => { if (j.data[k] !== undefined) out[k] = j.data[k] })
  return out
}

/** Downscale an uploaded image so localStorage stays small. */
export function fileToDataUrl(file: File, max = 900, q = 0.78): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onerror = () => rej(new Error('Could not read file'))
    r.onload = () => {
      const img = new Image()
      img.onerror = () => rej(new Error('Not a readable image'))
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height))
        const c = document.createElement('canvas')
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k)
        c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
        res(c.toDataURL('image/jpeg', q))
      }
      img.src = String(r.result)
    }
    r.readAsDataURL(file)
  })
}

export function storageUsageKB(): number {
  try { return Math.round(((localStorage.getItem(KEY) || '').length * 2) / 1024) } catch { return 0 }
}
