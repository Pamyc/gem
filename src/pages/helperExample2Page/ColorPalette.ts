
export type PaletteType = 'default' | 'cool' | 'warm' | 'gray' | 'yellow' | 'strict' | 'pastel';

export const PALETTES: Record<PaletteType, string[]> = {
  // Текущий набор (яркий, смешанный)
  default: [
    '#6366f1', // Indigo
    '#ec4899', // Pink
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#8b5cf6', // Violet
    '#0ea5e9', // Sky
    '#f43f5e', // Rose
    '#84cc16', // Lime
    '#14b8a6'  // Teal
  ],
  // Холодные тона (синий, голубой, фиолетовый, бирюзовый)
  cool: [
    '#3b82f6', // Blue 500
    '#06b6d4', // Cyan 500
    '#8b5cf6', // Violet 500
    '#6366f1', // Indigo 500
    '#0ea5e9', // Sky 500
    '#14b8a6', // Teal 500
    '#2563eb', // Blue 600
    '#0891b2', // Cyan 600
    '#7c3aed'  // Violet 600
  ],
  // Теплые тона (красный, оранжевый, желтый, розовый)
  warm: [
    '#f97316', // Orange 500
    '#ef4444', // Red 500
    '#eab308', // Yellow 500
    '#f43f5e', // Rose 500
    '#ec4899', // Pink 500
    '#f59e0b', // Amber 500
    '#dc2626', // Red 600
    '#d946ef', // Fuchsia 500
    '#fb923c'  // Orange 400
  ],
  // Серые тона (монохром, металл, асфальт)
  gray: [
    '#64748b', // Slate 500
    '#94a3b8', // Slate 400
    '#475569', // Slate 600
    '#cbd5e1', // Slate 300
    '#334155', // Slate 700
    '#e2e8f0', // Slate 200
    '#1e293b', // Slate 800
    '#a1a1aa', // Zinc 400
    '#52525b'  // Zinc 600
  ],
  // Светло-желтые и янтарные тона (золото, солнце, песок)
  yellow: [
    '#eab308', // Yellow 500
    '#f59e0b', // Amber 500
    '#facc15', // Yellow 400
    '#d97706', // Amber 600
    '#fbbf24', // Amber 400
    '#ca8a04', // Yellow 600
    '#fde047', // Yellow 300
    '#b45309', // Amber 700
    '#fef08a'  // Yellow 200
  ],
  // Строгий (Корпоративный, финансовый, глубокий синий и сталь)
  strict: [
    '#0f172a', // Slate 900
    '#1e3a8a', // Blue 900
    '#334155', // Slate 700
    '#1e40af', // Blue 800
    '#475569', // Slate 600
    '#1d4ed8', // Blue 700
    '#64748b', // Slate 500
    '#2563eb', // Blue 600
    '#94a3b8'  // Slate 400
  ],
  // Лаконичный (Пастельные, мягкие, ненавязчивые цвета)
  pastel: [
    '#94a3b8', // Slate 400 (Neutral base)
    '#fca5a5', // Red 300
    '#fdba74', // Orange 300
    '#fcd34d', // Amber 300
    '#86efac', // Green 300
    '#67e8f9', // Cyan 300
    '#93c5fd', // Blue 300
    '#c4b5fd', // Violet 300
    '#f0abfc'  // Fuchsia 300
  ]
};

export const getColorPalette = (type: PaletteType = 'default'): string[] => {
  return PALETTES[type];
};
