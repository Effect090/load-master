/**
 * Default U-value presets W/(m²·K). Conservative ranges typical of modern
 * insulated construction; users can edit any of these.
 */
export interface UValuePreset {
  id: string;
  label: string;
  type: "wall" | "roof" | "floor" | "window" | "door";
  uValue: number;
}

export const DEFAULT_U_VALUES: UValuePreset[] = [
  // Walls
  { id: "wall-uninsulated", label: "Uninsulated masonry wall", type: "wall", uValue: 1.8 },
  { id: "wall-light-insulated", label: "Lightly insulated wall (5 cm)", type: "wall", uValue: 0.7 },
  { id: "wall-modern", label: "Modern insulated wall (10 cm)", type: "wall", uValue: 0.35 },
  { id: "wall-passive", label: "High-performance / passive wall", type: "wall", uValue: 0.18 },
  // Roofs
  { id: "roof-uninsulated", label: "Uninsulated flat roof", type: "roof", uValue: 2.0 },
  { id: "roof-modern", label: "Modern insulated roof", type: "roof", uValue: 0.25 },
  { id: "roof-passive", label: "Passive-house roof", type: "roof", uValue: 0.15 },
  // Floors
  { id: "floor-on-ground", label: "Floor on ground (insulated)", type: "floor", uValue: 0.4 },
  { id: "floor-over-unconditioned", label: "Floor over unheated space", type: "floor", uValue: 0.5 },
  { id: "floor-passive", label: "High-performance floor", type: "floor", uValue: 0.18 },
  // Windows
  { id: "window-single", label: "Single glazing", type: "window", uValue: 5.6 },
  { id: "window-double", label: "Double glazing", type: "window", uValue: 2.8 },
  { id: "window-double-le", label: "Double glazing low-e", type: "window", uValue: 1.6 },
  { id: "window-triple", label: "Triple glazing", type: "window", uValue: 0.9 },
  // Doors
  { id: "door-wood", label: "Wood door", type: "door", uValue: 2.5 },
  { id: "door-insulated", label: "Insulated metal door", type: "door", uValue: 1.5 },
];

/** Default Solar Heat Gain Coefficients per glazing family. */
export const DEFAULT_SHGC: Record<string, number> = {
  single: 0.85,
  double: 0.75,
  double_le: 0.55,
  triple: 0.45,
  solar_control: 0.3,
};
