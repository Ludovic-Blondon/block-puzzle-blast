export interface Theme {
  id: string;
  name: string;
  price: number; // 0 = free/unlocked by default
  unlockLevel?: number; // level required to buy
  background: string;
  backgroundLight: string;
  surface: string;
  surfaceLight: string;
  grid: string;
  cellEmpty: string;
  blockColors: string[];
  accent: string;
}

export const THEMES: Theme[] = [
  {
    id: 'default',
    name: 'Midnight',
    price: 0,
    background: '#1a1a2e',
    backgroundLight: '#16213e',
    surface: '#0f3460',
    surfaceLight: '#1a4a7a',
    grid: '#252545',
    cellEmpty: '#1e1e3a',
    blockColors: ['#e94560', '#0ea5e9', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#06b6d4', '#f97316'],
    accent: '#e94560',
  },
  {
    id: 'neon',
    name: 'Neon',
    price: 500,
    background: '#0a0a0a',
    backgroundLight: '#111111',
    surface: '#1a1a1a',
    surfaceLight: '#2a2a2a',
    grid: '#151515',
    cellEmpty: '#0d0d0d',
    blockColors: ['#ff0080', '#00ff80', '#0080ff', '#ff8000', '#8000ff', '#ff0040', '#00ffff', '#ffff00'],
    accent: '#ff0080',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    price: 500,
    background: '#0c1445',
    backgroundLight: '#122060',
    surface: '#1a3a6a',
    surfaceLight: '#254a80',
    grid: '#152050',
    cellEmpty: '#101840',
    blockColors: ['#00b4d8', '#0077b6', '#48cae4', '#90e0ef', '#00a6a6', '#2ec4b6', '#20c997', '#0096c7'],
    accent: '#00b4d8',
  },
  {
    id: 'forest',
    name: 'Forest',
    price: 750,
    unlockLevel: 10,
    background: '#1a2e1a',
    backgroundLight: '#1e3e1e',
    surface: '#2a4a2a',
    surfaceLight: '#3a5a3a',
    grid: '#253525',
    cellEmpty: '#1e2e1e',
    blockColors: ['#22c55e', '#86efac', '#16a34a', '#a3e635', '#65a30d', '#84cc16', '#4ade80', '#15803d'],
    accent: '#22c55e',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    price: 750,
    unlockLevel: 15,
    background: '#2e1a1a',
    backgroundLight: '#3e2020',
    surface: '#4a2a2a',
    surfaceLight: '#5a3535',
    grid: '#352020',
    cellEmpty: '#2e1a1a',
    blockColors: ['#f97316', '#fb923c', '#ef4444', '#f59e0b', '#dc2626', '#fbbf24', '#ea580c', '#b91c1c'],
    accent: '#f97316',
  },
  {
    id: 'retro',
    name: 'Retro',
    price: 1000,
    unlockLevel: 20,
    background: '#2b2b2b',
    backgroundLight: '#3a3a3a',
    surface: '#4a4a4a',
    surfaceLight: '#5a5a5a',
    grid: '#333333',
    cellEmpty: '#282828',
    blockColors: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da', '#fcbad3', '#a8d8ea'],
    accent: '#4ecdc4',
  },
  {
    id: 'galaxy',
    name: 'Galaxy',
    price: 1000,
    unlockLevel: 25,
    background: '#0d0221',
    backgroundLight: '#150340',
    surface: '#1a0550',
    surfaceLight: '#250870',
    grid: '#120330',
    cellEmpty: '#0a0118',
    blockColors: ['#c471f5', '#fa71cd', '#7c4dff', '#536dfe', '#448aff', '#40c4ff', '#e040fb', '#f48fb1'],
    accent: '#c471f5',
  },
  {
    id: 'candy',
    name: 'Candy',
    price: 1500,
    unlockLevel: 30,
    background: '#2e1a35',
    backgroundLight: '#3a2040',
    surface: '#4a2850',
    surfaceLight: '#5a3560',
    grid: '#352040',
    cellEmpty: '#2a1530',
    blockColors: ['#ff6f91', '#ff9671', '#ffc75f', '#f9f871', '#d65db1', '#845ec2', '#ff6f91', '#00c9a7'],
    accent: '#ff6f91',
  },
];

export function getThemeById(id: string): Theme {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}
