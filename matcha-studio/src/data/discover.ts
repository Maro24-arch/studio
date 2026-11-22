export interface Stage {
  id: string; name: string; jp: string; romaji: string; when: string; tagline: string; body: string[]; facts: [string, string][]; plate: 'fields' | 'shade' | 'leaf' | 'steam' | 'flakes' | 'mill' | 'tin'
}
export const STAGES: Stage[] = [
  { id: 'grow', name: 'Growing', jp: '栽培', romaji: 'saibai', when: 'All year · new growth in spring', tagline: 'Patient bushes, tended for years.',
    body: ['Matcha comes from the same species as every true tea — Camellia sinensis. Tea bushes in Japan are usually propagated from cuttings of a named cultivar, so every bush in a field is a genetic copy, which is why cultivar choice matters so much.',
      'The bushes rest through winter. In early spring the first new buds begin to open, and that is the moment the matcha farmer’s year really begins.'],
    facts: [['Species', 'Camellia sinensis'], ['Propagation', 'Mostly cuttings (clonal cultivars)'], ['Watch for', 'Frost in early spring']], plate: 'fields' },
  { id: 'shade', name: 'Shading', jp: '被覆', romaji: 'hifuku', when: 'About 3–4 weeks before harvest', tagline: 'The step that makes matcha, matcha.',
    body: ['Several weeks before harvest, the bushes are covered so only a small fraction of sunlight reaches them. Traditionally this was done with reed screens and rice straw (hon-zu, 本簀) — still used by some Uji growers for their finest leaf. Today many farms use black synthetic shade cloth, often increasing the shading gradually.',
      'In low light the plant makes more chlorophyll (a deeper green) and keeps more amino acids such as L-theanine, which are responsible for umami and sweetness, while producing fewer of the catechins that taste bitter and astringent. Try the slider below to see the direction of the change.'],
    facts: [['Typical duration', 'Roughly 20–30 days (varies)'], ['Traditional covering', 'Reed screens + rice straw'], ['Modern covering', 'Synthetic shade cloth']], plate: 'shade' },
  { id: 'harvest', name: 'Harvest', jp: '摘採', romaji: 'tekisai', when: 'Late April – May (first flush)', tagline: 'Only the youngest leaves.',
    body: ['For the best tencha, only the tender new growth of the first flush (ichibancha, 一番茶) is picked, because that is when the leaf is richest in amino acids. It is cut by machine on many farms, and still by hand at some small producers.',
      'Later harvests (nibancha and beyond) are generally more bitter and astringent and are often used for lower-priced or ingredient-oriented products. Timing differs by region: warmer places like Kagoshima start earlier than Kyoto.'],
    facts: [['First flush', 'ichibancha (一番茶)'], ['Picked', 'Young shoots only'], ['By hand?', 'Sometimes; often machine-cut']], plate: 'leaf' },
  { id: 'steam', name: 'Steaming', jp: '蒸し', romaji: 'mushi', when: 'Immediately after picking', tagline: 'Seconds that fix colour and flavour.',
    body: ['Freshly picked leaves would begin to oxidise (like a cut apple turning brown). A very brief steaming — in the order of tens of seconds — switches off the enzymes responsible, locking in the green colour and the fresh, grassy-sweet aroma.',
      'This is the main reason Japanese tea is green and tastes “fresh”, compared with Chinese pan-fired greens or oxidised teas.'],
    facts: [['Purpose', 'Stop oxidation'], ['Duration', 'Roughly 15–30 s (varies)'], ['Result', 'Green colour & fresh aroma']], plate: 'steam' },
  { id: 'dry', name: 'Drying', jp: '乾燥', romaji: 'kansō', when: 'Same day', tagline: 'Dried flat — never rolled.',
    body: ['For sencha, leaves are rolled into needles as they dry. For tencha, they are not. Steamed leaves are blown or spread and carried through a multi-level drying furnace (tencha-ro, 碾茶炉) until crisp, so they stay flat, light and papery.',
      'This unrolled, dried leaf is called tencha (碾茶) — literally “tea for grinding”. It is not matcha yet.'],
    facts: [['Not rolled', 'Unlike sencha / gyokuro'], ['Equipment', 'Tencha furnace (tencha-ro)'], ['Product', 'Tencha 碾茶']], plate: 'flakes' },
  { id: 'refine', name: 'Sorting', jp: '仕上げ', romaji: 'shiage', when: 'After drying · often rested in cold storage', tagline: 'Stems and veins removed.',
    body: ['Dried leaves are separated from stems and veins, then cut into small flakes. What remains is the soft part of the leaf — the part that grinds into a smooth powder without grit or fibre.',
      'Many producers rest tencha in cold storage for some months so the flavour mellows before milling. Skilled blenders may also combine tencha from several fields or cultivars to create a consistent flavour (gōgumi, 合組).'],
    facts: [['Removed', 'Stems & veins'], ['Cut to', 'Small flakes'], ['Craft', 'Blending (gōgumi)']], plate: 'flakes' },
  { id: 'mill', name: 'Stone milling', jp: '石臼挽き', romaji: 'ishiusu-biki', when: 'Mostly on demand', tagline: 'Slow, cool and very, very fine.',
    body: ['Tencha is ground between granite stones that turn slowly, so the leaf does not heat and lose its aroma. It is often cited that one traditional stone mill yields only roughly 30–40 grams of matcha an hour — which is part of why the best matcha is expensive.',
      'The resulting particles are extremely small, a few micrometres to some tens of micrometres, which gives matcha its silky texture. Some producers use other kinds of mills, especially for large-volume ingredient matcha; what suits a product depends on what it is for.'],
    facts: [['Often cited', '~30–40 g per hour per stone mill'], ['Stone', 'Granite (ishiusu, 石臼)'], ['Why slow', 'Avoid heat damage']], plate: 'mill' },
  { id: 'store', name: 'Packing & storage', jp: '保存', romaji: 'hozon', when: 'Always', tagline: 'Light, air, heat and smell are the enemies.',
    body: ['Matcha is a fine, whole-leaf powder with a large surface area, so it loses colour and aroma quickly when exposed to light, oxygen, heat and moisture. Good producers use opaque, airtight packaging and cool storage; many advise refrigeration after opening and finishing within a few weeks.',
      'Storage and freshness are as important as the leaf itself — a point worth remembering when you think about packaging later.'],
    facts: [['Protect from', 'Light · air · heat · moisture · odours'], ['After opening', 'Airtight, cool, use soon'], ['Why it matters', 'Colour & aroma fade fast']], plate: 'tin' },
]

export interface Cultivar { id: string; name: string; jp: string; note: string; sweet: number; umami: number; bitter: number; astr: number; where: string }
export const CULTIVARS: Cultivar[] = [
  { id: 'yabukita', name: 'Yabukita', jp: 'やぶきた', where: 'Throughout Japan', sweet: 3, umami: 3, bitter: 3, astr: 3, note: 'By far Japan’s most widely planted tea cultivar — often quoted at roughly 70% of tea acreage. Balanced and dependable, mostly known for sencha, but also used for tencha, especially outside the traditional matcha heartlands.' },
  { id: 'samidori', name: 'Samidori', jp: 'さみどり', where: 'Kyoto / Uji area', sweet: 4, umami: 5, bitter: 2, astr: 2, note: 'Popular for tencha. Often described as having a vivid green colour and a strong, rounded umami with a clean, lightly sweet finish.' },
  { id: 'okumidori', name: 'Okumidori', jp: 'おくみどり', where: 'Kyoto, Shizuoka, Kagoshima', sweet: 3, umami: 3, bitter: 2, astr: 3, note: 'A later-sprouting cultivar commonly used for matcha and gyokuro. Often described as clean and mild with a pleasant lingering finish.' },
  { id: 'asahi', name: 'Asahi', jp: 'あさひ', where: 'Uji', sweet: 4, umami: 4, bitter: 3, astr: 2, note: 'A traditional Uji cultivar that has long been prized for matcha, associated with a rich, sweet, “shaded” aroma known as ooika (覆い香).' },
  { id: 'goko', name: 'Gokō', jp: 'ごこう', where: 'Uji', sweet: 4, umami: 4, bitter: 2, astr: 2, note: 'Another classic Uji cultivar associated with high-end matcha — often described as elegant, aromatic and deeply sweet-savoury.' },
  { id: 'ujihikari', name: 'Uji-hikari', jp: '宇治光', where: 'Uji', sweet: 4, umami: 3, bitter: 2, astr: 2, note: 'A traditional Uji cultivar. Usually described as bright, gentle and smooth.' },
  { id: 'saemidori', name: 'Saemidori', jp: 'さえみどり', where: 'Kagoshima, Kyushu', sweet: 4, umami: 4, bitter: 2, astr: 1, note: 'A more recent cultivar valued for vivid green colour and sweetness with very little astringency; widely grown in southern Japan.' },
  { id: 'asatsuyu', name: 'Asatsuyu', jp: '朝露', where: 'Uji, Yame', sweet: 5, umami: 4, bitter: 1, astr: 1, note: '“Morning dew”. A cultivar historically associated with gyokuro and tencha, known for notable sweetness and a smooth, mellow character.' },
]

export interface Style { id: string; name: string; short: string; vivid: number; sweet: number; umami: number; bitter: number; astr: number; use: string; ask: string; made: string }
export const STYLES: Style[] = [
  { id: 'a', name: 'Single-cultivar, first harvest', short: 'Single cultivar', vivid: 9, sweet: 8, umami: 9, bitter: 2, astr: 2, use: 'Drinking straight with water, usucha or koicha.',
    made: 'Well-shaded, first-flush tencha from one cultivar, stone-milled in small batches.', ask: 'Cultivar, harvest year, shading method and days, who milled it and how.' },
  { id: 'b', name: 'Blended house style', short: 'House blend', vivid: 8, sweet: 7, umami: 8, bitter: 3, astr: 3, use: 'Drinking straight; consistent flavour year to year.',
    made: 'Tencha from several cultivars or fields combined by a blender (gōgumi) to hit a target flavour.', ask: 'Which cultivars and harvests are in the blend, and how consistent is it between lots?' },
  { id: 'c', name: 'Made for milk drinks', short: 'For milk drinks', vivid: 6, sweet: 5, umami: 5, bitter: 6, astr: 5, use: 'Lattes and iced drinks, where body and a stronger edge stand up to milk.',
    made: 'Often later or lighter-shaded harvests, or blends designed to keep their character when diluted.', ask: 'Does it taste good with the milk I will use? Ask for samples to test, not only to sip plain.' },
  { id: 'd', name: 'Ingredient matcha', short: 'Ingredient', vivid: 5, sweet: 4, umami: 4, bitter: 7, astr: 6, use: 'Baking, confectionery, ice-cream and manufacturing.',
    made: 'Typically larger volumes, later harvests, and sometimes different milling methods, selected for cost and stability in recipes.', ask: 'How does it hold colour when heated or mixed? What are the specs for particle size and moisture?' },
]

export const TERMS: { term: string; says: string; ask: string }[] = [
  { term: '“Ceremonial grade”', says: 'A marketing term, mainly used outside Japan. It has no single official definition in Japan or the EU, so two products with this label can differ enormously.', ask: 'What are the cultivar, harvest, shading and milling details behind the word?' },
  { term: '“Premium” / “Culinary” / “Latte grade”', says: 'Also informal trade words. They usually hint at an intended use, not a measured quality level.', ask: 'What was it designed for, and can I taste it in that use?' },
  { term: 'First harvest (一番茶, ichibancha)', says: 'Picked in the first flush of the year; generally the most amino-acid-rich leaf. A meaningful, checkable claim.', ask: 'Which year, and when was it milled?' },
  { term: 'Cultivar (品種)', says: 'The named tea variety. Real information when a producer states it, and a clue that blending or traceability is taken seriously.', ask: 'Single cultivar, or blend of which ones?' },
  { term: 'Region (e.g. “Uji”, “Nishio”)', says: 'Region names carry reputation and, in some cases, regional branding rules. What exactly qualifies can be subtle.', ask: 'Where was the tea grown, and where was it processed?' },
  { term: 'Organic (JAS / EU)', says: 'A certified production standard — a verifiable claim, but a statement about farming method, not about taste.', ask: 'Which certification, which body, and can I see the certificate?' },
]

export const TASTES = [
  { id: 'umami', name: 'Umami', jp: 'うま味', gist: 'Savoury depth. A broth-like, lingering roundness that coats the mouth.', cause: 'Amino acids, above all L-theanine and glutamic acid — which shading helps preserve.', notice: 'Hold a small sip for a moment. Does a savoury, “fresh pea / sea-air” feeling stay after you swallow?' },
  { id: 'sweet', name: 'Sweetness', jp: '甘味', gist: 'A gentle, rounded sweetness without any sugar — like sweet corn or steamed greens.', cause: 'Sugars and amino acids; higher in well-shaded, young first-flush leaf.', notice: 'Notice sweetness at the front of the sip, and in the aftertaste after you swallow.' },
  { id: 'bitter', name: 'Bitterness', jp: '苦味', gist: 'A bright, sometimes pleasant bite at the back of the tongue. In balance it adds structure; in excess it dominates.', cause: 'Caffeine and catechins. More in later, less-shaded leaf, or when too much powder or too-hot water is used.', notice: 'Taste again with water that is a little hotter. Does bitterness rise?' },
  { id: 'astr', name: 'Astringency', jp: '渋味', gist: 'Not really a flavour — a dry, puckering feeling in the mouth, like strong black tea or unripe fruit.', cause: 'Catechins and tannins binding to proteins in saliva.', notice: 'Run your tongue along your teeth after sipping. Do they feel dry or “squeaky”?' },
]

export const INFLUENCES: { title: string; body: string; meta: string }[] = [
  { title: 'Shading', meta: 'Colour · umami · sweetness', body: 'Length and density of shading shape how much chlorophyll and amino acid the leaf holds. It is the single biggest lever on colour and sweetness.' },
  { title: 'Cultivar', meta: 'Aroma · sweetness · colour', body: 'Different cultivars have different natural levels of amino acids and catechins, leaf thickness, and aroma, so they behave differently when shaded, steamed and ground.' },
  { title: 'Harvest timing', meta: 'Bitterness · sweetness', body: 'Young first-flush shoots are the softest and richest in amino acids. Later harvests tend to be bolder and more bitter.' },
  { title: 'Soil & fertiliser', meta: 'Umami', body: 'Nitrogen-rich fertilisation is commonly used to encourage amino acid-rich growth. Good producers balance this carefully; it also relates to residue and organic questions you will meet later.' },
  { title: 'Steaming & drying', meta: 'Colour · freshness', body: 'Too little steaming and the leaf can oxidise; too much and flavour can turn flat. Drying that is too hot can create a toasted, dull character instead of a fresh one.' },
  { title: 'De-stemming & sorting', meta: 'Texture', body: 'Stems and veins are fibrous. How thoroughly they are removed affects how smooth and silky the powder feels.' },
  { title: 'Milling', meta: 'Texture · aroma', body: 'Slow, cool grinding preserves aroma and makes a very fine powder. Heat and friction from fast or poorly controlled milling can dull colour and flavour.' },
  { title: 'Freshness & storage', meta: 'Colour · aroma', body: 'Matcha fades. Look for a harvest or milling date; light, air, heat and strong odours all accelerate decline.' },
]

export interface Prep { id: string; name: string; jp?: string; g: number; ml: number; temp: string; extra?: string; steps: string[]; note: string; trad: boolean }
export const PREPS: Prep[] = [
  { id: 'usucha', name: 'Usucha', jp: '薄茶 · thin tea', g: 2, ml: 70, temp: '70–80 °C', trad: true,
    steps: ['Warm the bowl (chawan) and whisk (chasen) with hot water; dry the bowl.', 'Sift the powder through a fine sieve (furui) into the bowl — this prevents clumps.', 'Add the hot water (not boiling).', 'Whisk briskly in a “W” or “M” motion with a relaxed wrist until a fine, even foam forms; finish with a slow circle.', 'Drink straight away.'],
    note: 'The everyday form of tea ceremony, and the best way to taste a matcha honestly.' },
  { id: 'koicha', name: 'Koicha', jp: '濃茶 · thick tea', g: 4, ml: 40, temp: '70–80 °C', trad: true,
    steps: ['Sift a larger amount of powder into the warmed bowl.', 'Add a little hot water.', 'Knead slowly with the whisk to a glossy, paint-like consistency — not whisked into foam.', 'Sip slowly; it should be remarkably sweet and thick.'],
    note: 'Traditionally made with the finest, least bitter tea; mediocre matcha makes unpleasant koicha.' },
  { id: 'iced', name: 'Iced matcha', g: 2, ml: 150, temp: 'Paste: 70–80 °C, then cold', trad: false,
    steps: ['Sift powder into a bowl or glass.', 'Add a splash (about 30 ml) of hot water and whisk to a smooth paste.', 'Add cold water (about 120 ml) and ice.', 'Stir or shake gently.'],
    note: 'Making the paste first avoids clumps in cold liquids.' },
  { id: 'latte', name: 'Matcha latte', g: 2, ml: 200, temp: 'Paste: 70–80 °C; milk to taste', trad: false,
    steps: ['Sift powder and whisk to a paste with about 40 ml hot water.', 'Warm or chill about 160 ml milk (or plant milk) and froth if you like.', 'Pour over the paste, or ice, and stir.', 'Sweeten only if you wish.'],
    note: 'Milk softens bitterness and also mutes delicate aromas, so a bolder matcha often suits.' },
  { id: 'shaker', name: 'Shaker bottle', g: 2, ml: 150, temp: 'Cool or cold water', trad: false,
    steps: ['Add powder and cool water to a shaker with a whisk ball or a lid that seals fully.', 'Shake hard for 15–20 seconds.', 'Pour over ice.'],
    note: 'No special tools; a good starting point for ready-to-drink thinking.' },
]

export const GLOSSARY: [string, string, string][] = [
  ['Tencha', '碾茶', 'Shade-grown, steamed, unrolled dried leaf — the raw material for matcha.'],
  ['Ichibancha', '一番茶', 'The first harvest of the year.'],
  ['Ooika', '覆い香', 'The distinctive sweet, seaweed-like aroma of shade-grown tea.'],
  ['Hon-zu', '本簀', 'Traditional shade covering of reed screens and straw.'],
  ['Aracha', '荒茶', 'Rough, unrefined tea straight out of primary processing.'],
  ['Shiage', '仕上げ', 'Finishing: sorting, de-stemming, cutting, blending.'],
  ['Ishiusu', '石臼', 'Granite stone mill.'],
  ['Chawan', '茶碗', 'Tea bowl.'],
  ['Chasen', '茶筅', 'Bamboo whisk.'],
  ['Chashaku', '茶杓', 'Bamboo scoop for powdered tea.'],
  ['Furui', '篩', 'Fine sieve for sifting matcha.'],
  ['Usucha / Koicha', '薄茶 / 濃茶', 'Thin tea / thick tea.'],
]
