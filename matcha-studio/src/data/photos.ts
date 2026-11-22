// Photo slots. Drop a real, properly licensed image at public/photos/<slot>.jpg and it replaces the illustration
// automatically. Add its credit below so it is shown with the picture. See PHOTOS.md.
export interface Credit { author: string; source: string; license: string; url?: string }
export const PHOTO_CREDITS: Record<string, Credit> = {
  // 'hero': { author: 'Photographer name', source: 'Wikimedia Commons', license: 'CC BY-SA 4.0', url: 'https://…' },
}
export const PHOTO_SLOTS: Record<string, string> = {
  hero: 'Wide landscape: tea fields, ideally early morning light (Uji, Wazuka or Shizuoka)',
  'ch-discover': 'Close-up of shaded tea leaves, or a whisked bowl of matcha',
  'ch-japan': 'Terraced tea hills, Wazuka or Yame',
  'ch-lab': 'Matcha powder macro, or whisk and chawan',
  'ch-library': 'Textures: washi paper, ceramic glaze, tea tins',
  'ch-roadmap': 'Tea farm path, or a tea merchant’s counter',
  'ch-workspace': 'Desk, notebook and tea bowl',
  'quote-1': 'Tea picking / harvest scene',
  'stage-grow': 'Tea bushes in early spring',
  'stage-shade': 'Shaded tea field (cloth or reed screens over the bushes)',
  'stage-harvest': 'Harvest of young shoots',
  'stage-steam': 'Steaming',
  'stage-dry': 'Tencha drying furnace / flat dried leaf',
  'stage-refine': 'Tencha flakes after sorting',
  'stage-mill': 'Granite stone mill (ishiusu)',
  'stage-store': 'Tins / storage',
  'region-uji': 'Uji — river, Byodo-in area, or tea fields',
  'region-wazuka': 'Wazuka terraced hills',
  'region-nishio': 'Nishio tea fields',
  'region-shizuoka': 'Shizuoka tea rows with Mt Fuji',
  'region-yame': 'Yame — Hoshino tea hills',
  'region-kagoshima': 'Kagoshima — Chiran or Sakurajima view',
  'region-mie': 'Ise / Mie tea fields',
}
