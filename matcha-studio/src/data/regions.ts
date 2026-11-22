import type { Peak, Tone } from '../components/Plate'

export type Status = 'established' | 'lead'
export interface Visit { id: string; name: string; jp?: string; kind: string; status: Status; desc: string }
export interface Region {
  id: string; name: string; jp: string; pref: string; lat: number; lon: number; tagline: string
  summary: string[]; character: string; known: string[]; season: string; tradition: string
  visits: Visit[]; peak: Peak; tone: Tone; seed: number
}

export const REGIONS: Region[] = [
  {
    id: 'uji', name: 'Uji & Wazuka', jp: '宇治・和束', pref: 'Kyoto', lat: 34.85, lon: 135.85, peak: 'river', tone: 'sage', seed: 3,
    tagline: 'The historic heart of matcha.',
    summary: ['South of Kyoto city, Uji is the name most strongly associated with matcha and the tea ceremony. The tradition of shading tea here is centuries old, and techniques such as shading with reed screens and straw are still practised by some growers.',
      'Nearby Wazuka, up in the hills, is known for its terraced slopes and is a major supplier of Uji-area tea. “Uji tea” is also a regional brand with rules about where leaf is grown and processed — worth asking producers to explain precisely what “Uji” means for their product.'],
    character: 'Delicate, aromatic, deeply sweet and savoury; a reputation for refinement, and a strong sense of heritage.',
    known: ['Traditional hon-zu shading', 'Asahi, Gokō, Samidori and other cultivars', 'Close links to tea ceremony schools', 'Long-established merchants'],
    season: 'Shading from about April; first-flush tencha harvest roughly early to mid May.',
    tradition: 'Often traced to the 13th-century monk Myōe, who planted tea at Kōzan-ji (Kyoto) with seeds associated with Eisai; Uji later became the centre of the powdered-tea tradition under shogunal and ceremonial patronage.',
    visits: [
      { id: 'uji-tsuen', name: 'Tsuen Tea', jp: '通圓', kind: 'Tea house', status: 'established', desc: 'A tea house beside Uji Bridge, widely described as among Japan’s oldest tea shops. A way to taste Uji tea in context.' },
      { id: 'uji-nakamura', name: 'Nakamura Tokichi Honten', jp: '中村藤吉本店', kind: 'Merchant & café', status: 'established', desc: 'Long-established Uji tea merchant with a main shop and café near Uji Station.' },
      { id: 'uji-ito', name: 'Itō Kyūemon Honten', jp: '伊藤久右衛門', kind: 'Merchant & café', status: 'established', desc: 'Uji tea merchant with a main shop and café in Uji.' },
      { id: 'uji-taihoan', name: 'Taihō-an tea house', jp: '対鳳庵', kind: 'Tea ceremony experience', status: 'established', desc: 'A tea house near Uji Bridge where visitors can take part in a tea ceremony experience. Check how to book.' },
      { id: 'uji-kozanji', name: 'Kōzan-ji (Toganoo)', jp: '高山寺', kind: 'Historic site', status: 'established', desc: 'Temple in northwest Kyoto, associated with early tea cultivation in Japan.' },
      { id: 'uji-ippodo', name: 'Ippodo Tea (Kyoto city)', jp: '一保堂茶舗', kind: 'Merchant & tea room', status: 'established', desc: 'Historic Kyoto tea merchant with a tea room in the city — useful for tasting and for understanding how a house sells and explains its tea.' },
      { id: 'uji-marukyu', name: 'Marukyu Koyamaen', jp: '丸久小山園', kind: 'Producer', status: 'established', desc: 'A well-known Uji matcha producer. Whether visits are possible is something to ask — many producers do not host walk-ins.' },
      { id: 'uji-wazuka', name: 'Wazuka terraced tea hills', jp: '和束町', kind: 'Landscape · farm visits', status: 'lead', desc: 'The terraced slopes are a highlight. Several farms offer tours, but availability changes — research who is currently open and book ahead.' },
    ],
  },
  {
    id: 'nishio', name: 'Nishio', jp: '西尾', pref: 'Aichi', lat: 34.86, lon: 137.06, peak: 'rolling', tone: 'ivory', seed: 6,
    tagline: 'A powerhouse of tencha and matcha.',
    summary: ['On the plain near the Mikawa Bay, Nishio is among Japan’s largest producers of tencha and matcha, and many large and small makers supply both Japan and overseas. It is a less romantic landscape than Uji, but central to the real industry.',
      'The area has regional-brand recognition for its matcha — ask producers how that is defined — and a visible matcha culture, with local experiences around grinding and whisking.'],
    character: 'Strong colour and body; very good for both drinking and for products that need reliable, consistent supply.',
    known: ['Large volumes of tencha', 'Producers who export', 'Matcha used in confectionery and drinks', 'Local matcha experiences'],
    season: 'First-flush tencha roughly late April to May.',
    tradition: 'Local tradition dates tea cultivation here back to roughly the 13th century.',
    visits: [
      { id: 'nishio-aiya', name: 'Aiya', jp: 'あいや', kind: 'Producer', status: 'established', desc: 'A large Nishio-based matcha producer and exporter. Ask about supply for small volumes and whether visits can be arranged.' },
      { id: 'nishio-exp', name: 'Matcha grinding & whisking experiences', kind: 'Experience', status: 'lead', desc: 'Nishio promotes hands-on matcha experiences. Ask the city’s tourism information office which currently run, and in which language.' },
      { id: 'nishio-fields', name: 'Tea fields around Isshiki / Yoshida', kind: 'Landscape', status: 'lead', desc: 'Tea-growing districts on the coast side of Nishio. Worth asking locally which are best seen and when.' },
    ],
  },
  {
    id: 'shizuoka', name: 'Shizuoka', jp: '静岡', pref: 'Shizuoka', lat: 34.9, lon: 138.2, peak: 'fuji', tone: 'sage', seed: 9,
    tagline: 'Japan’s best-known tea prefecture.',
    summary: ['Shizuoka is traditionally Japan’s largest tea-producing prefecture and is famous above all for sencha, grown on the sunny plateaus and hills with Mount Fuji often in view. Tencha and matcha are made here too, in smaller volume, alongside very deep-steamed (fukamushi) styles.',
      'It is a good place to see the whole tea industry: farms, auction markets, research stations, and museums.'],
    character: 'Rounded, clean and approachable; strongest reputation in sencha, with growing interest in matcha.',
    known: ['Sencha and deep-steamed tea', 'Makinohara plateau', 'Tea markets & research', 'Views of Fuji'],
    season: 'First flush typically from late April.',
    tradition: 'Shizuoka’s tea history is often linked to the monk Shōichi Kokushi (Enni), said to have brought tea seeds from China in the 13th century.',
    visits: [
      { id: 'shz-museum', name: 'Fujinokuni Chanomiyako Museum', jp: 'ふじのくに茶の都ミュージアム', kind: 'Museum', status: 'established', desc: 'A tea museum with gardens and tea rooms in Shimada — an easy way to understand Japanese tea broadly.' },
      { id: 'shz-makinohara', name: 'Makinohara plateau tea fields', kind: 'Landscape', status: 'lead', desc: 'A vast tea-growing plateau. Research visiting seasons, farm tours and access without a car.' },
      { id: 'shz-kawane', name: 'Kawane tea hills', jp: '川根', kind: 'Landscape', status: 'lead', desc: 'Mountain tea country along the Ōi River, known for high-quality leaf. Research farm-stay and tour options.' },
    ],
  },
  {
    id: 'yame', name: 'Yame', jp: '八女', pref: 'Fukuoka', lat: 33.2, lon: 130.55, peak: 'rolling', tone: 'clay', seed: 12,
    tagline: 'Gyokuro country, with quiet matcha.',
    summary: ['Yame, in the hills of northern Kyushu, is celebrated above all for gyokuro, the shade-grown steeped tea. Because the shading skills are shared with tencha, it also makes matcha, often with a delicate sweet-savoury character.',
      'The small mountain village of Hoshino is well known for its tea terraces and misty mornings.'],
    character: 'Soft, sweet, umami-rich; often described as gentle and refined.',
    known: ['Gyokuro, among the finest in Japan', 'Hoshino mountain tea district', 'Shading expertise', 'Smaller family producers'],
    season: 'Harvest typically late April–May.',
    tradition: 'Local tradition dates tea cultivation in Yame back to roughly the 15th century.',
    visits: [
      { id: 'yame-hoshino', name: 'Hoshino village tea hills', jp: '星野村', kind: 'Landscape', status: 'lead', desc: 'A mountain district known for tea terraces and small farms. Research which farms welcome visitors and how to reach them.' },
      { id: 'yame-gyokuro', name: 'Gyokuro shading demonstrations', kind: 'Farm visit', status: 'lead', desc: 'Some producers can show traditional shading. Ask in advance; timing around harvest is limiting.' },
    ],
  },
  {
    id: 'kagoshima', name: 'Kagoshima', jp: '鹿児島', pref: 'Kagoshima', lat: 31.4, lon: 130.45, peak: 'sakurajima', tone: 'moss', seed: 15,
    tagline: 'Southern warmth, large scale, first to harvest.',
    summary: ['Kagoshima is among Japan’s largest tea-producing prefectures. Its warm climate means the harvest begins earlier than in Kyoto, and its broad, flat farms suit large-scale mechanised production. Many growers here supply tencha and matcha, increasingly for export and organic markets.',
      'The volcano Sakurajima across the bay gives the area its distinctive landscape.'],
    character: 'Bright, strong colour and a punchy, rich flavour; well suited to drinks and cooking.',
    known: ['Early harvest', 'Large, mechanised farms', 'Organic production', 'Cultivars such as Saemidori and Yutakamidori'],
    season: 'First flush often begins in April, earlier than Kyoto.',
    tradition: 'A comparatively modern tea region, which grew substantially in the 20th century.',
    visits: [
      { id: 'kgs-chiran', name: 'Chiran tea fields', jp: '知覧', kind: 'Landscape', status: 'lead', desc: 'A well-known tea town. Research farm visits and what is open to the public.' },
      { id: 'kgs-organic', name: 'Organic tencha producers', kind: 'Producers', status: 'lead', desc: 'Organic matcha production is a theme here. Ask potential suppliers about certification and documentation.' },
    ],
  },
  {
    id: 'mie', name: 'Ise & Mie', jp: '伊勢・三重', pref: 'Mie', lat: 34.6, lon: 136.45, peak: 'rolling', tone: 'ivory', seed: 18,
    tagline: 'A quieter neighbour with its own style.',
    summary: ['Mie, east of Nara and south of Uji, is a significant tea region — often ranked among the major producing prefectures — known for Ise tea and kabuse (lightly shaded) teas. Some producers make tencha.',
      'Its closeness to Kyoto, Nara and the Ise Grand Shrine makes it easy to combine with a wider trip.'],
    character: 'Often rich in body; a less famous name that can mean more approachable small producers.',
    known: ['Ise tea', 'Kabuse (shaded) styles', 'Proximity to Ise Grand Shrine'],
    season: 'Spring harvest from late April.',
    tradition: 'Tea has been grown here for centuries, much of it historically used in blends elsewhere.',
    visits: [
      { id: 'mie-ise', name: 'Ise tea producers & farm tours', kind: 'Research lead', status: 'lead', desc: 'Research which producers make tencha and welcome visitors. Combine with a visit to Ise.' },
    ],
  },
]

export const STARTER_QUESTIONS: [string, string][] = [
  ['Which cultivars are in this tencha or matcha, and is it single-cultivar or a blend?', 'Producer'],
  ['What harvest and year is it from, and when was it milled?', 'Producer'],
  ['How many days is the tea shaded, and with what material?', 'Producer'],
  ['Is the tea stone-milled? Can I see the milling?', 'Producer'],
  ['Do you work with small, new customers? What is your minimum order?', 'Supplier'],
  ['Can you send small samples? Is there a cost, and who pays shipping?', 'Supplier'],
  ['What certifications (organic, residue analysis, traceability) can you provide?', 'Supplier'],
  ['How do you recommend storing and shipping matcha to Spain?', 'Supplier'],
  ['What would you say makes a good matcha for a milk drink compared with drinking it plain?', 'Producer'],
  ['Can you show me what a lower-priced and a higher-priced lot taste like side by side?', 'Producer'],
  ['What is the best time of year to visit, and would a visit be welcome?', 'Producer'],
  ['Is there a local guide or interpreter you would recommend?', 'Tourism office'],
]

export const SEASON = [
  { m: 'J', t: 'Dormant' }, { m: 'F', t: 'Dormant' }, { m: 'M', t: 'Buds swelling · frost watch' }, { m: 'A', t: 'Shading begins · early harvest in the south' },
  { m: 'M', t: 'First-flush tencha harvest' }, { m: 'J', t: 'Later harvests · milling & selling' }, { m: 'J', t: 'Later harvests' }, { m: 'A', t: 'Quiet' },
  { m: 'S', t: 'Some autumn harvests' }, { m: 'O', t: 'Autumn · tea festivals in places' }, { m: 'N', t: 'New tencha rests; milling' }, { m: 'D', t: 'Dormant' },
]
