/**
 * The lane registry. One object per lane drives everything:
 * home cards, nav, index pages, filter chips, row badges, and the
 * meta strip on entry pages. Add or change a lane here, nowhere else.
 */

export interface MetaCell {
  label: string;
  value: string;
  href?: string;
}

export interface Badge {
  text: string;
  /** optional extra class, e.g. evidence coloring: ev-strong */
  cls?: string;
}

export interface Lane {
  /** URL segment and collection name */
  id: 'recipes' | 'supplements' | 'techniques' | 'mobility';
  num: string;
  name: string;
  /** Short mono sub-line under the lane name */
  sub: string;
  /** One-liner on the home card */
  def: string;
  /** Longer intro at the top of the lane index */
  desc: string;
  /** Line-icon SVG inner markup (44x44 viewBox, stroke: currentColor) */
  icon: string;
  /** Frontmatter fields that become filter chip groups, in display order */
  filters: { field: string; label: string }[];
  /** Compact badges on an index row */
  badges: (d: Record<string, any>) => Badge[];
  /** Meta strip cells on the entry page */
  meta: (d: Record<string, any>) => MetaCell[];
  /** Optional featured tool banner on the lane index */
  tool?: { href: string; label: string; desc: string };
}

const fmt = (v: string) => String(v).replace(/-/g, ' ');

/** Canonical display order for filter chip values (mirrors the schema enums). */
export const FIELD_ORDER: Record<string, string[]> = {
  meal: ['breakfast', 'lunch', 'dinner', 'snack', 'shake'],
  difficulty: ['easy', 'moderate', 'involved'],
  category: [
    'vitamins', 'minerals', 'amino-acids', 'fatty-acids', 'whole-food',
    'adaptogens', 'nootropics', 'antioxidants', 'gut', 'joints',
    'recovery', 'performance', 'hormones', 'specialized',
  ],
  evidence: ['strong', 'moderate', 'limited', 'experimental'],
  discipline: ['muay-thai', 'boxing', 'grappling', 'mma'],
  level: ['beginner', 'intermediate', 'advanced'],
  type: ['strike', 'clinch', 'defense', 'footwork', 'combo'],
  focus: ['mobility', 'strength', 'conditioning'],
  body_area: ['hips', 'knees', 'ankles', 'shoulders', 'spine', 'neck', 'full-body'],
};

export const LANES: Lane[] = [
  {
    id: 'recipes',
    num: '01',
    name: 'Recipes',
    sub: 'THE FUEL / COOKED, NOT ORDERED',
    def: 'Food you make with your own hands. Cut-friendly, camp-tested, firehouse-proof.',
    desc: 'What I actually cook. Every recipe here has earned its spot — it either fuels training, survives a fight camp, or feeds a firehouse shift. Macros where they matter, no filler steps.',
    icon: `<path d="M8 22 H36 C36 31 30 37 22 37 C14 37 8 31 8 22 Z"/><path d="M12 8 L30 19"/><path d="M17 5 L33 17"/>`,
    filters: [
      { field: 'meal', label: 'Meal' },
      { field: 'difficulty', label: 'Difficulty' },
    ],
    badges: (d) => [{ text: d.meal }, { text: `${d.time_min} min` }, { text: d.difficulty }],
    meta: (d) => [
      { label: 'Meal', value: fmt(d.meal) },
      { label: 'Time', value: `${d.time_min} min` },
      { label: 'Difficulty', value: fmt(d.difficulty) },
      ...(d.protein_g ? [{ label: 'Protein', value: `${d.protein_g} g` }] : []),
      ...(d.calories ? [{ label: 'Calories', value: `${d.calories}` }] : []),
    ],
  },
  {
    id: 'supplements',
    num: '02',
    name: 'Supplements',
    sub: 'THE STACK / EVIDENCE FIRST',
    def: 'The stack, evidence first. Adjusted from bloodwork — not influencer videos.',
    desc: 'Deep dives on the supplements worth understanding — what they actually do, the real evidence level, dose, and the watch-outs. Same taxonomy as the Field Guide; these entries go deeper.',
    icon: `<rect x="15" y="6" width="14" height="32" rx="7"/><path d="M15 22 H29"/>`,
    filters: [
      { field: 'category', label: 'Category' },
      { field: 'evidence', label: 'Evidence' },
    ],
    badges: (d) => [
      { text: fmt(d.category) },
      { text: `${d.evidence} evidence`, cls: `ev-${d.evidence}` },
    ],
    meta: (d) => [
      { label: 'Category', value: fmt(d.category) },
      { label: 'Evidence', value: fmt(d.evidence) },
      { label: 'Dose', value: d.dose },
      { label: 'Timing', value: d.timing },
    ],
    tool: {
      href: '/supplement-field-guide/',
      label: 'Supplement Field Guide',
      desc: 'The interactive map of the whole landscape — 60+ supplements in plain English, evidence-coded, with a stack builder you can export and take to bloodwork.',
    },
  },
  {
    id: 'techniques',
    num: '03',
    name: 'Techniques',
    sub: 'THE ART / FROM THE ROOM',
    def: 'Breakdowns from the training room. Muay Thai as the root — boxing, grappling, MMA as the branches.',
    desc: 'Technique broken down the way it gets taught in the room — setup, execution, the details that make it land, and the mistakes everyone makes first. Filter by discipline or level.',
    icon: `<path d="M6 22 L22 6 L38 22 L22 38 Z"/><path d="M14 22 L22 14 L30 22 L22 30 Z"/><circle cx="22" cy="22" r="2" fill="currentColor"/>`,
    filters: [
      { field: 'discipline', label: 'Discipline' },
      { field: 'level', label: 'Level' },
      { field: 'type', label: 'Type' },
    ],
    badges: (d) => [{ text: fmt(d.discipline) }, { text: d.level }, { text: d.type }],
    meta: (d) => [
      { label: 'Discipline', value: fmt(d.discipline) },
      { label: 'Level', value: fmt(d.level) },
      { label: 'Type', value: fmt(d.type) },
      ...(d.video_url ? [{ label: 'Video', value: 'Watch ↗', href: d.video_url }] : []),
    ],
  },
  {
    id: 'mobility',
    num: '04',
    name: 'Mobility & S&C',
    sub: 'THE VEHICLE / KEPT AVAILABLE',
    def: 'The systems that keep the body available for training. Mobility, strength, conditioning.',
    desc: 'Bulletproofing work. The mobility, strength, and conditioning pieces that keep the body available for the art — filterable by body area so you can fix what actually hurts.',
    icon: `<path d="M15 15 C13 7 31 7 29 15"/><circle cx="22" cy="26" r="11"/>`,
    filters: [
      { field: 'focus', label: 'Focus' },
      { field: 'body_area', label: 'Body area' },
      { field: 'level', label: 'Level' },
    ],
    badges: (d) => [{ text: d.focus }, { text: fmt(d.body_area) }, { text: d.level }],
    meta: (d) => [
      { label: 'Focus', value: fmt(d.focus) },
      { label: 'Body area', value: fmt(d.body_area) },
      { label: 'Level', value: fmt(d.level) },
      { label: 'Equipment', value: d.equipment?.length ? d.equipment.join(', ') : 'none' },
    ],
  },
];

export function getLane(id: string): Lane {
  const lane = LANES.find((l) => l.id === id);
  if (!lane) throw new Error(`Unknown lane: ${id}`);
  return lane;
}
