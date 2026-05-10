export interface Category {
  id: string;
  name: string;
  icon: string;
  sub: string;       // subtitle shown on cards
  desc?: string;     // optional longer description
}

export const CATEGORIES: Category[] = [
  { id: 'electrochemical', name: 'Electrochemical', icon: '⚗️', sub: 'Workstations & Accessories' },
  { id: 'lab',             name: 'Lab Instruments', icon: '🔬', sub: 'Precision Lab Equipment' },
  { id: 'controllers',     name: 'Controllers',     icon: '🎛️', sub: 'Industrial Automation' },
  { id: 'pyrometer',       name: 'Pyrometers',      icon: '🌡️', sub: 'Temperature Measurement' },
  { id: 'recorder',        name: 'Recorders',       icon: '📊', sub: 'Data & Signal Recorders' },
  { id: 'thyristor',       name: 'Thyristors',      icon: '⚡', sub: 'Power Control Devices' },
  { id: 'fuel-cell',       name: 'Fuel Cell',       icon: '🔋', sub: 'Energy Studies' },
  { id: 'battery',         name: 'Battery Testing', icon: '🪫', sub: 'Battery Analyzers' },
];
