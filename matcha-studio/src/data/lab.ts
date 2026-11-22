import type { Flavor } from '../lib/store'

export const AXES: { key: keyof Flavor; label: string; low: string; high: string }[] = [
  { key: 'sweetness', label: 'Sweetness', low: 'Dry', high: 'Dessert-like' },
  { key: 'bitterness', label: 'Bitterness', low: 'Soft', high: 'Bold edge' },
  { key: 'umami', label: 'Umami', low: 'Light', high: 'Deep & savoury' },
  { key: 'creaminess', label: 'Creaminess', low: 'Clear', high: 'Velvety' },
  { key: 'intensity', label: 'Intensity', low: 'Delicate', high: 'Powerful' },
]

export interface Concept { id: string; name: string; line: string; preset: Flavor; wonder: string[] }
export const CONCEPTS: Concept[] = [
  { id: 'powder', name: 'Traditional matcha powder', line: 'The tea itself, honestly presented.', preset: { sweetness: 6, bitterness: 3, umami: 8, creaminess: 2, intensity: 6 },
    wonder: ['What origin story would you want to tell?', 'Who would whisk it, and with what?', 'What makes it different from what already exists?'] },
  { id: 'blend', name: 'Matcha blends', line: 'Matcha joined by another tea or powder.', preset: { sweetness: 5, bitterness: 4, umami: 6, creaminess: 3, intensity: 6 },
    wonder: ['What would you blend with — roasted tea, rice, herbs, fruit powders?', 'Is the blend about taste, colour, or function?'] },
  { id: 'flavored', name: 'Flavoured matcha', line: 'A single clear flavour direction.', preset: { sweetness: 6, bitterness: 3, umami: 5, creaminess: 3, intensity: 5 },
    wonder: ['Which flavour feels truly Japanese to you? Which feels like yours?', 'Does the flavour support the tea or hide it?'] },
  { id: 'latte', name: 'Matcha latte mix', line: 'Made to be stirred into milk.', preset: { sweetness: 7, bitterness: 3, umami: 5, creaminess: 8, intensity: 4 },
    wonder: ['Sweetened or not? Dairy, plant-based, or both?', 'What should it taste like hot, and cold?'] },
  { id: 'rtd', name: 'Ready-to-drink', line: 'Open and sip, anywhere.', preset: { sweetness: 5, bitterness: 3, umami: 5, creaminess: 6, intensity: 4 },
    wonder: ['Still, sparkling, milky?', 'What would make it feel handcrafted rather than industrial?'] },
  { id: 'innovative', name: 'Something new', line: 'Matcha in a form that does not quite exist yet.', preset: { sweetness: 5, bitterness: 5, umami: 6, creaminess: 5, intensity: 5 },
    wonder: ['An aperitif? A seasoning? A dessert component? A gift ritual?', 'What would you love to find on a shelf that isn’t there?'] },
]

export interface Format { id: string; name: string; think: string[] }
export const FORMATS: Format[] = [
  { id: 'loose', name: 'Loose powder', think: ['Lowest packaging cost per gram, most flexible.', 'Needs a good resealable barrier against light, air and moisture.', 'Customers need to measure — and know how to prepare it.'] },
  { id: 'sachet', name: 'Sachets', think: ['Each serving stays fresh until opened.', 'More packaging material per gram; filling needs suitable equipment or a packer.', 'Great for sampling and travelling.'] },
  { id: 'tin', name: 'Tins', think: ['Protective, giftable, reusable.', 'Inner seals or bags are usually used for freshness.', 'Heavier and costlier to ship.'] },
  { id: 'bottle', name: 'Bottled drinks', think: ['A big step from powder: liquid stability, shelf life and processing change everything.', 'Typically needs a specialist contract producer and extra testing.', 'Colour can fade in light — packaging matters.'] },
  { id: 'kit', name: 'Preparation kits', think: ['Bowl, whisk, scoop plus matcha — a way to teach the ritual.', 'More components to source, store and ship.', 'Can be a gift; consider breakage and customs.'] },
]

export interface Ingredient { id: string; name: string; note: string; adds: Partial<Flavor> }
export const INGREDIENTS: Ingredient[] = [
  { id: 'oat', name: 'Oat milk', note: 'Soft, naturally sweet; a familiar plant-milk pairing.', adds: { creaminess: 2, sweetness: 1 } },
  { id: 'milk', name: 'Whole milk', note: 'Rounds off bitterness with richness.', adds: { creaminess: 3, bitterness: -1 } },
  { id: 'coconut', name: 'Coconut', note: 'Tropical creaminess; can overshadow delicate tea.', adds: { creaminess: 2, sweetness: 1 } },
  { id: 'vanilla', name: 'Vanilla', note: 'Perceived sweetness without sugar; classic and gentle.', adds: { sweetness: 1 } },
  { id: 'yuzu', name: 'Yuzu', note: 'Bright Japanese citrus; lifts and cuts richness.', adds: { intensity: 1, creaminess: -1, bitterness: 1 } },
  { id: 'sakura', name: 'Salted sakura', note: 'Floral, lightly saline — spring in a flavour.', adds: { umami: 1, intensity: 1 } },
  { id: 'sesame', name: 'Black sesame', note: 'Nutty, deep, toasty; pairs with matcha’s savoury side.', adds: { umami: 1, creaminess: 1, intensity: 1 } },
  { id: 'kinako', name: 'Kinako', note: 'Roasted soybean flour: nutty and sweet.', adds: { sweetness: 1, creaminess: 1 } },
  { id: 'azuki', name: 'Azuki', note: 'Sweet red bean, a traditional partner.', adds: { sweetness: 2, creaminess: 1 } },
  { id: 'whitechoc', name: 'White chocolate', note: 'Very sweet and rich; may mute the tea.', adds: { sweetness: 3, creaminess: 2, bitterness: -1 } },
  { id: 'honey', name: 'Honey or kuromitsu', note: 'Syrups bring sweetness and character.', adds: { sweetness: 2 } },
  { id: 'genmai', name: 'Roasted rice', note: 'Toasty, popcorn-like; echoes genmaicha.', adds: { umami: 1, intensity: 1 } },
  { id: 'hojicha', name: 'Hojicha', note: 'Roasted tea; softens bitterness, adds warmth.', adds: { bitterness: -1, sweetness: 1 } },
  { id: 'ginger', name: 'Ginger', note: 'Warm, spicy kick.', adds: { intensity: 2, bitterness: 1 } },
  { id: 'mint', name: 'Mint', note: 'Cooling, fresh; takes over quickly.', adds: { intensity: 1, creaminess: -1 } },
  { id: 'strawberry', name: 'Strawberry', note: 'A popular bright pairing; sweet-tart.', adds: { sweetness: 2, bitterness: -1 } },
  { id: 'cacao', name: 'Cacao', note: 'Bitter-sweet depth; strong flavours compete.', adds: { bitterness: 1, creaminess: 1, sweetness: 1 } },
  { id: 'sparkling', name: 'Sparkling water', note: 'Light and effervescent; a refreshing format.', adds: { creaminess: -2, intensity: -1 } },
  { id: 'tonic', name: 'Tonic', note: 'Adds a bitter-citrus dimension for adult drinks.', adds: { bitterness: 2 } },
  { id: 'rose', name: 'Rose', note: 'Floral; use lightly.', adds: { sweetness: 1 } },
]
