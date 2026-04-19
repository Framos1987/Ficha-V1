/**
 * BattleGrid v3
 * ─ Iluminação dinâmica com raycasting real
 * ─ Paredes / Portas / Janelas com materiais e espessuras
 * ─ Fontes de luz: vela, tocha, lampião, lanterna, fogueira
 * ─ Painel "Novo Elemento" intuitivo por categoria
 * ─ Tokens com sistema de tamanhos do jogo (Insignificante → Titânico)
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  ZoomIn, ZoomOut, RotateCcw, Grid3x3, Eye, EyeOff, Lightbulb,
  Plus, Minus, Trash2, ChevronUp, ChevronDown, Move, Sword, User,
  Shield, Crown, Target, CircleDot, Triangle, Square, Layers,
  Map, X, Check, Lock, Unlock, Download, Upload, Copy, Save, Sunrise, Moon, Undo2, Box, Droplet, ArrowUp, ArrowDown, Mountain
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

type WallMaterial   = "wood" | "stone" | "masonry" | "rock" | "iron";
type WallThickness  = "thin" | "normal" | "thick" | "massive";
type WallSubtype    = "wall" | "door" | "window";
type LightType      = "candle" | "torch" | "lantern" | "lamp" | "bonfire" | "alvorada" | "crepusculo";
type TerrainType    = "sand" | "stone" | "grass" | "water" | "fire" | "difficult" | "wood" | "hole" | "stairs_up" | "stairs_down" | "debris";
type BackgroundType = "none" | "sand" | "stone" | "grass";
type TokenShape     = "circle" | "square" | "triangle" | "diamond";
type TokenColor     = "red" | "blue" | "green" | "amber" | "purple" | "cyan" | "pink" | "slate";
type PanelTab       = "elements" | "tokens" | "initiative" | "arena";
type ElemCategory   = "wall" | "door" | "window" | "light" | "terrain";

interface WallSegment {
  id: string;
  x1: number; y1: number; // grid-point coords (integers = cell corners)
  x2: number; y2: number;
  material: WallMaterial;
  thickness: WallThickness;
  subtype: WallSubtype;
  isOpen: boolean;
  layer?: number;
}

interface LightSource {
  id: string;
  col: number; row: number;
  type: LightType;
  isOn: boolean;
  customLux?: number;
  layer?: number;
}

interface Token {
  id: string; label: string; shape: TokenShape; color: TokenColor;
  col: number; row: number; hp: number; maxHp: number;
  initiative: number; isPlayer: boolean;
  conditions: string[]; icon: "sword"|"shield"|"crown"|"user"|"target"|"box"|"sun"|"moon"|"droplet"|"arrow-up"|"arrow-down"|"mountain";
  sizeIndex: number;
  activeRunes: string[];
  isProp?: boolean;
  emission?: { lux: number; radius: number; glow: string };
  layer?: number;
}

interface AoeMarker {
  id: string; shape: "circle"|"cone"|"square"|"line";
  col: number; row: number; size: number;
  color: TokenColor; label: string; angle: number;
  layer?: number;
}

interface TerrainCell { col: number; row: number; type: TerrainType; layer?: number; }

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const CS = 52; // base cell size in px

const CREATURE_SIZES = [
  { name: "Insignificante", example: "Formiga",   gridCells: 0.25, occupies: "<1 Micro Quad." },
  { name: "Minúsculo",      example: "Abelha",    gridCells: 0.25, occupies: "1 Micro Quad."  },
  { name: "Diminuto",       example: "Grilo",     gridCells: 0.33, occupies: "1–2 Micro Quad."},
  { name: "Exíguo",         example: "Lagartixa", gridCells: 0.5,  occupies: "2–5 Micro Quad."},
  { name: "Miúdo",          example: "Rato",      gridCells: 0.5,  occupies: "1 Mini Quad."   },
  { name: "Nanico",         example: "Gato",      gridCells: 0.66, occupies: "1–2 Mini Quad." },
  { name: "Pequeno",        example: "Cachorro",  gridCells: 0.75, occupies: "2–5 Mini Quad." },
  { name: "Médio",          example: "Humano",    gridCells: 1,    occupies: "1 Quadrado"     },
  { name: "Grande",         example: "Cavalo",    gridCells: 2,    occupies: "1–2 Quadrados"  },
  { name: "Enorme",         example: "Elefante",  gridCells: 3,    occupies: "2–5 Quadrados"  },
  { name: "Imenso",         example: "Baleia",    gridCells: 4,    occupies: "5–10 Quadrados" },
  { name: "Gigante",        example: "Gargântua", gridCells: 6,    occupies: "10–50 Quad."    },
  { name: "Colossal",       example: "Tarrasque", gridCells: 8,    occupies: "50–100 Quad."   },
  { name: "Titânico",       example: "Aegaeon",   gridCells: 10,   occupies: "100–500 Quad."  },
];

const WALL_COLORS: Record<WallMaterial, string> = {
  wood:    "#92681A",
  stone:   "#6B7280",
  masonry: "#9CA3AF",
  rock:    "#4B5563",
  iron:    "#374151",
};

// Thickness in grid-pixels at zoom=1, based on size scale
const WALL_PX: Record<WallThickness, number> = {
  thin:    4,   // ~10cm — divisória de madeira (mini scale)
  normal:  8,   // ~1m  — parede padrão (normal scale)
  thick:   14,  // ~2m  — muro reforçado
  massive: 22,  // ~5m+ — muralha / fortaleza
};

const WALL_THICK_LABEL: Record<WallThickness, string> = {
  thin:    "Fina (10cm) — Mini",
  normal:  "Normal (1m) — Padrão",
  thick:   "Grossa (2m) — Muro",
  massive: "Maciça (5m+) — Muralha",
};

const LIGHT_DEF: Record<LightType, { icon: string; radius: number; lux: number; color: string; glow: string; label: string }> = {
  candle:     { icon: "🕯", radius: 1.5, lux: 50,     color: "rgba(255,210,90,0.18)", glow: "#fde68a", label: "Vela" },
  torch:      { icon: "🔥", radius: 3.5, lux: 100,    color: "rgba(255,140,30,0.22)", glow: "#fb923c", label: "Tocha" },
  lantern:    { icon: "🏮", radius: 4.5, lux: 500,    color: "rgba(255,220,110,0.2)", glow: "#fcd34d", label: "Lampião" },
  lamp:       { icon: "💡", radius: 5.5, lux: 1000,   color: "rgba(240,245,200,0.22)",glow: "#fef3c7", label: "Lanterna" },
  bonfire:    { icon: "🔥", radius: 8,   lux: 5000,   color: "rgba(255,90,10,0.28)",  glow: "#f97316", label: "Fogueira" },
  alvorada:   { icon: "☀️", radius: 5,   lux: 1000,   color: "rgba(253,224,71,0.20)", glow: "#fef08a", label: "Runa: Alvorada" },
  crepusculo: { icon: "🌑", radius: 5,   lux: -5000,  color: "rgba(0,0,0,0.50)",      glow: "#1e1b4b", label: "Runa: Crepúsculo" },
};

const getLuxOpacity = (lux: number) => {
  if (lux < 1)   return 0.98; // Escuro Absoluto
  if (lux < 5)   return 0.88; // Extremamente Escuro
  if (lux < 10)  return 0.75; // Muito Escuro
  if (lux < 50)  return 0.60; // Escuro
  if (lux < 100) return 0.30; // Levemente Escuro
  return 0.0;                 // Penumbra para cima
};

const TERRAIN_DEF: Record<TerrainType, { label: string; bg: string; border: string }> = {
  sand:     { label: "Areia",       bg: "linear-gradient(135deg,#c4a055 25%,#b89040 25%,#b89040 50%,#d4b070 50%,#d4b070 75%,#bfa050 75%)", border: "#b8860b" },
  stone:    { label: "Pedra",       bg: "linear-gradient(0deg,#586070 0%,#68707e 50%,#506068 100%)",  border: "#374151" },
  grass:    { label: "Grama",       bg: "linear-gradient(135deg,#4a7c35 25%,#3d6e2a 25%,#3d6e2a 50%,#588c40 50%,#588c40 75%,#487a33 75%)", border: "#166534" },
  water:    { label: "Água",        bg: "repeating-linear-gradient(90deg,#1e50c8aa 0px,#3272dcaa 3px,#1e50c8aa 3px,#1e50c8aa 6px)", border: "#1d4ed8" },
  fire:     { label: "Fogo",        bg: "radial-gradient(ellipse at 50% 70%,#ffaa0aaa 0%,#dc3200bb 60%,#960000aa 100%)", border: "#dc2626" },
  difficult:{ label: "Difícil",     bg: "radial-gradient(circle at 30% 30%,#8b5a1e,#5a3c0e)", border: "#92400e" },
  wood:     { label: "Madeira",     bg: "repeating-linear-gradient(90deg, #8B5A2B 0px, #8B5A2B 15px, #6b4421 16px, #6b4421 18px)", border: "#5c3a21" },
  hole:     { label: "Buraco Negro",bg: "radial-gradient(circle at 50% 50%, #000 0%, #111 60%, #333 100%)", border: "#ef4444" },
  stairs_up:{ label: "Escada Sobe", bg: "repeating-linear-gradient(0deg, #71717a 0px, #71717a 8px, #3f3f46 8px, #3f3f46 11px)", border: "#27272a" },
  stairs_down:{ label: "Esc. Desce",bg: "repeating-linear-gradient(0deg, #27272a 0px, #27272a 8px, #18181b 8px, #18181b 11px)", border: "#000" },
  debris:   { label: "Entulho",     bg: "repeating-radial-gradient(ellipse at 30% 30%, #52525b 0%, #71717a 30%, #3f3f46 60%)", border: "#27272a" },
};

const BG_STYLE: Record<BackgroundType, string> = {
  none:  "#0c1220",
  sand:  "linear-gradient(135deg,#c4a055 25%,#b08838 25%,#b08838 50%,#d0b060 50%,#d0b060 75%,#ba9540 75%),#c4a055",
  stone: "linear-gradient(0deg,#525a65 0%,#606875 40%,#4c5560 70%,#585f6d 100%)",
  grass: "linear-gradient(135deg,#4a7c35 25%,#3c6a29 25%,#3c6a29 50%,#558a3e 50%,#558a3e 75%,#467831 75%),#4a7c35",
};

const COLOR_MAP: Record<TokenColor, { bg: string; border: string; aoe: string }> = {
  red:    { bg: "#ef4444", border: "#991b1b", aoe: "rgba(239,68,68,0.25)"   },
  blue:   { bg: "#3b82f6", border: "#1e3a8a", aoe: "rgba(59,130,246,0.25)"  },
  green:  { bg: "#22c55e", border: "#14532d", aoe: "rgba(34,197,94,0.25)"   },
  amber:  { bg: "#f59e0b", border: "#78350f", aoe: "rgba(245,158,11,0.25)"  },
  purple: { bg: "#a855f7", border: "#4c1d95", aoe: "rgba(168,85,247,0.25)"  },
  cyan:   { bg: "#06b6d4", border: "#164e63", aoe: "rgba(6,182,212,0.25)"   },
  pink:   { bg: "#ec4899", border: "#831843", aoe: "rgba(236,72,153,0.25)"  },
  slate:  { bg: "#64748b", border: "#0f172a", aoe: "rgba(100,116,139,0.25)" },
};

const ARENA_PRESETS = [
  { name: "Taberna",           icon: "🍺", cols:  8, rows:  6, bg: "stone" as BackgroundType },
  { name: "Clareira",          icon: "🌿", cols: 12, rows: 10, bg: "grass" as BackgroundType },
  { name: "Dungeon",           icon: "🏚", cols: 16, rows: 12, bg: "stone" as BackgroundType },
  { name: "Campo de Batalha",  icon: "⚔",  cols: 24, rows: 16, bg: "grass" as BackgroundType },
  { name: "Arena",             icon: "🏟", cols: 20, rows: 20, bg: "sand"  as BackgroundType },
  { name: "Fortaleza",         icon: "🏰", cols: 30, rows: 22, bg: "stone" as BackgroundType },
];

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const genId = () => Math.random().toString(36).slice(2, 9);
const getTokenCells = (si: number) => Math.max(1, Math.ceil(CREATURE_SIZES[si]?.gridCells ?? 1));
const snap = (px: number, cs: number) => Math.round(px / cs);

/** Raycasting: compute visibility polygon from a light source */
function castRays(
  ctx: CanvasRenderingContext2D,
  lx: number, ly: number,
  radius: number,
  walls: WallSegment[],
  cs: number,
  isDarkness: boolean = false
) {
  // Only solid walls block light (closed doors block, windows don't, open doors don't)
  const blockers = walls.filter(w => {
    if (w.subtype === "window") return false;
    if (w.subtype === "door" && w.isOpen) return false;
    return true;
  });

  const angles: number[] = [];

  // Angles toward wall endpoints
  for (const w of blockers) {
    const wx1 = w.x1 * cs, wy1 = w.y1 * cs;
    const wx2 = w.x2 * cs, wy2 = w.y2 * cs;
    const a1 = Math.atan2(wy1 - ly, wx1 - lx);
    const a2 = Math.atan2(wy2 - ly, wx2 - lx);
    angles.push(a1 - 0.0001, a1, a1 + 0.0001);
    angles.push(a2 - 0.0001, a2, a2 + 0.0001);
  }

  // Fill in with evenly-spaced angles for smooth circles
  const RAYS = 120;
  for (let i = 0; i < RAYS; i++) angles.push(-Math.PI + (i / RAYS) * Math.PI * 2);
  angles.sort((a, b) => a - b);

  const pts: { x: number; y: number }[] = [];

  for (const angle of angles) {
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    let minT = radius;

    for (const w of blockers) {
      const wx1 = w.x1 * cs, wy1 = w.y1 * cs;
      const wx2 = w.x2 * cs, wy2 = w.y2 * cs;
      const wdx = wx2 - wx1, wdy = wy2 - wy1;
      const denom = dx * wdy - dy * wdx;
      if (Math.abs(denom) < 1e-10) continue;
      const t = ((wx1 - lx) * wdy - (wy1 - ly) * wdx) / denom;
      const u = ((wx1 - lx) * dy  - (wy1 - ly) * dx)  / denom;
      if (t > 0.5 && t < minT && u >= 0 && u <= 1) minT = t;
    }

    pts.push({ x: lx + minT * dx, y: ly + minT * dy });
  }

  if (pts.length === 0) return;

  // Draw gradient-filled visibility polygon
  const grad = ctx.createRadialGradient(lx, ly, 0, lx, ly, radius);
  if (isDarkness) {
    grad.addColorStop(0,    "rgba(0,0,0,0.98)");
    grad.addColorStop(0.75, "rgba(0,0,0,0.85)");
    grad.addColorStop(1,    "rgba(0,0,0,0)");
  } else {
    grad.addColorStop(0,    "rgba(0,0,0,1)");
    grad.addColorStop(0.75, "rgba(0,0,0,0.9)");
    grad.addColorStop(1,    "rgba(0,0,0,0)");
  }
  ctx.fillStyle = grad;

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.fill();
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOKEN SVG
// ═══════════════════════════════════════════════════════════════════════════════

function TokenSVG({ token, isSelected, px }: { token: Token; isSelected: boolean; px: number }) {
  const c = COLOR_MAP[token.color];
  const s = px; const cx = s / 2;
  const hpPct = Math.max(0, Math.min(1, token.hp / token.maxHp));
  const hpCol = hpPct > 0.5 ? "#22c55e" : hpPct > 0.25 ? "#f59e0b" : "#ef4444";
  const szLabel = (CREATURE_SIZES[token.sizeIndex]?.name ?? "Médio").slice(0, 3);

  return (
    <svg width={s} height={s} style={{ cursor: "grab", overflow: "visible",
      filter: isSelected ? "drop-shadow(0 0 8px #fff)" : "drop-shadow(0 2px 5px rgba(0,0,0,0.75))" }}>
      {token.activeRunes && token.activeRunes.length > 0 && (
        <circle cx={cx} cy={cx} r={cx + 3} fill="none" stroke="#eab308" strokeWidth={1.5} strokeDasharray="3 3">
          <animateTransform attributeName="transform" type="rotate" from={`0 ${cx} ${cx}`} to={`360 ${cx} ${cx}`} dur="8s" repeatCount="indefinite" />
        </circle>
      )}
      {token.shape === "circle"   && <circle cx={cx} cy={cx} r={cx - 2} fill={c.bg} stroke={c.border} strokeWidth={2.5} />}
      {token.shape === "square"   && <rect x={3} y={3} width={s-6} height={s-6} rx={7} fill={c.bg} stroke={c.border} strokeWidth={2.5} />}
      {token.shape === "diamond"  && <polygon points={`${cx},3 ${s-3},${cx} ${cx},${s-3} 3,${cx}`} fill={c.bg} stroke={c.border} strokeWidth={2.5} />}
      {token.shape === "triangle" && <polygon points={`${cx},4 ${s-3},${s-3} 3,${s-3}`} fill={c.bg} stroke={c.border} strokeWidth={2.5} />}
      {!token.isProp && (
        <>
          <rect x={5} y={s-8} width={s-10} height={5} rx={2.5} fill="rgba(0,0,0,0.65)" />
          <rect x={5} y={s-8} width={(s-10)*hpPct} height={5} rx={2.5} fill={hpCol} />
          <circle cx={s-9} cy={9} r={8} fill="rgba(0,0,0,0.8)" stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
          <text x={s-9} y={9} textAnchor="middle" dominantBaseline="central" fontSize={9} fill="#fff" fontWeight="bold">{token.initiative}</text>
          <rect x={3} y={s-20} width={22} height={11} rx={3} fill="rgba(0,0,0,0.7)" />
          <text x={14} y={s-15} textAnchor="middle" dominantBaseline="central" fontSize={7} fill="#cbd5e1" fontWeight="600">{szLabel}</text>
        </>
      )}
      {token.conditions.slice(0, 3).map((_, i) => (
        <circle key={i} cx={5 + i * 8} cy={s - 25} r={3} fill="#f59e0b" opacity={0.9} />
      ))}
      {isSelected && (
        <circle cx={cx} cy={cx} r={cx - 1} fill="none" stroke="#fff" strokeWidth={2} strokeDasharray="5 3" opacity={0.9}>
          <animateTransform attributeName="transform" type="rotate" from={`0 ${cx} ${cx}`} to={`360 ${cx} ${cx}`} dur="4s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}

function TkIcon({ icon, size = 14 }: { icon: Token["icon"]; size?: number }) {
  const p = { size, strokeWidth: 2.5 };
  if (icon === "sword")  return <Sword {...p} />;
  if (icon === "shield") return <Shield {...p} />;
  if (icon === "crown")  return <Crown {...p} />;
  if (icon === "target") return <Target {...p} />;
  if (icon === "box")    return <Box {...p} />;
  if (icon === "sun")    return <Sunrise {...p} />;
  if (icon === "moon")   return <Moon {...p} />;
  if (icon === "droplet")   return <Droplet {...p} />;
  if (icon === "arrow-up")  return <ArrowUp {...p} />;
  if (icon === "arrow-down")return <ArrowDown {...p} />;
  if (icon === "mountain")  return <Mountain {...p} />;
  return <User {...p} />;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function BattleGrid({ charInfo, currentStatus }: { charInfo?: any; currentStatus?: any }) {
  // ── Grid config ──
  const [gridCols, setGridCols] = useState(20);
  const [gridRows, setGridRows] = useState(14);
  const [bgType, setBg]         = useState<BackgroundType>("stone");
  const [ambientLux, setAmbientLux] = useState<number>(0);
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom]         = useState(1);
  const [dynLight, setDynLight] = useState(false);
  const [currentLayer, setCurrentLayer] = useState(0);

  const cs = CS * zoom;

  // ── World objects ──
  const [tokens, setTokens]   = useState<Token[]>([
    { id: genId(), label: "Herói",  shape: "circle",   color: "blue",   col: 3,  row: 3,  hp: 80,  maxHp: 100, initiative: 18, isPlayer: true,  conditions: [], icon: "sword",  sizeIndex: 7, activeRunes: [] },
    { id: genId(), label: "Mago",   shape: "square",   color: "purple", col: 4,  row: 6,  hp: 45,  maxHp: 60,  initiative: 15, isPlayer: true,  conditions: [], icon: "user",   sizeIndex: 7, activeRunes: [] },
    { id: genId(), label: "Goblin", shape: "triangle", color: "red",    col: 11, row: 4,  hp: 30,  maxHp: 30,  initiative: 12, isPlayer: false, conditions: [], icon: "target", sizeIndex: 6, activeRunes: [] },
    { id: genId(), label: "Chefe",  shape: "diamond",  color: "amber",  col: 13, row: 7,  hp: 120, maxHp: 150, initiative: 8,  isPlayer: false, conditions: [], icon: "crown",  sizeIndex: 9, activeRunes: [] },
  ]);
  const [walls, setWalls]     = useState<WallSegment[]>([
    { id: genId(), x1: 7, y1: 1, x2: 7, y2: 5, material: "stone",  thickness: "normal",  subtype: "wall",   isOpen: false },
    { id: genId(), x1: 7, y1: 5, x2: 10,y2: 5, material: "stone",  thickness: "normal",  subtype: "door",   isOpen: false },
    { id: genId(), x1: 7, y1: 1, x2: 10,y2: 1, material: "stone",  thickness: "normal",  subtype: "wall",   isOpen: false },
    { id: genId(), x1: 10,y1: 1, x2: 10,y2: 5, material: "wood",   thickness: "thin",    subtype: "window", isOpen: false },
  ]);
  const [lights, setLights]   = useState<LightSource[]>([
    { id: genId(), col: 8, row: 3, type: "torch",   isOn: true },
    { id: genId(), col: 5, row: 9, type: "lantern", isOn: true },
  ]);
  const [terrain, setTerrain] = useState<TerrainCell[]>([
    { col: 2, row: 9,  type: "water" }, { col: 3, row: 9, type: "water" }, { col: 4, row: 9, type: "water" },
    { col: 15,row: 3,  type: "fire"  }, { col: 12,row: 2, type: "sand"  }, { col: 13,row: 2, type: "sand"  },
  ]);
  const [aoes, setAoes]       = useState<AoeMarker[]>([]);

  // ── UI state ──
  const [selectedId, setSelectedId]     = useState<string | null>(null);
  const [selWallId, setSelWallId]       = useState<string | null>(null);
  const [selLightId, setSelLightId]     = useState<string | null>(null);
  const [panel, setPanel]               = useState<PanelTab>("elements");
  const [elemCat, setElemCat]           = useState<ElemCategory | null>(null);

  // Placement mode: null = move tokens
  type PlaceMode = null | "wall" | "door" | "window" | "light" | `terrain_${TerrainType}` | "erase_wall" | "erase_terrain";
  const [placeMode, setPlaceMode]       = useState<PlaceMode>(null);

  // Wall draw state
  const [wallStart, setWallStart]       = useState<{ x: number; y: number } | null>(null);
  const [wallPreview, setWallPreview]   = useState<{ x: number; y: number } | null>(null);

  // Pending element config
  const [pendWallMat,   setPendWallMat]   = useState<WallMaterial>("stone");
  const [pendWallThick, setPendWallThick] = useState<WallThickness>("normal");
  const [pendLightType, setPendLightType] = useState<LightType>("torch");
  const [pendTerrain,   setPendTerrain]   = useState<TerrainType>("sand");

  // Token drag
  const [dragging,  setDragging]  = useState<{ id: string } | null>(null);
  const [dragPos,   setDragPos]   = useState<{ x: number; y: number } | null>(null);

  // ── History Undo ──
  const [history, setHistory] = useState<string[]>([]);
  const saveUndo = useCallback(() => {
    setHistory(h => {
      const snap = JSON.stringify({ tokens, walls, lights, terrain });
      if (h[h.length - 1] === snap) return h;
      return [...h.slice(-14), snap];
    });
  }, [tokens, walls, lights, terrain]);

  const doUndo = useCallback(() => {
    setHistory(h => {
      if (h.length === 0) return h;
      const last = h[h.length - 1];
      const parsed = JSON.parse(last);
      setTokens(parsed.tokens); setWalls(parsed.walls); setLights(parsed.lights); setTerrain(parsed.terrain);
      return h.slice(0, -1);
    });
  }, []);

  // Universal Gallery
  const [showGallery, setShowGallery] = useState(false);
  const galleryTokens = JSON.parse(localStorage.getItem("rpg_saved_tokens") || "[]") as Token[];


  // Refs
  const gridRef    = useRef<HTMLDivElement>(null);
  const fogCanvas  = useRef<HTMLCanvasElement>(null);
  const frameRef   = useRef<number>(0);

  const selected      = tokens.find(t => t.id === selectedId) ?? null;
  const sortedByInit  = [...tokens].sort((a, b) => b.initiative - a.initiative);

  // ── Update fog-of-war canvas ──
  useEffect(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const canvas = fogCanvas.current;
      if (!canvas) return;
      const w = gridCols * cs, h = gridRows * cs;
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, w, h);
      if (!dynLight) return;

      // Dark base based on ambient lux
      const baseAlpha = getLuxOpacity(ambientLux);
      if (baseAlpha > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${baseAlpha})`;
        ctx.fillRect(0, 0, w, h);
      }

      // Cut visible areas for regular light
      ctx.globalCompositeOperation = "destination-out";

      const currentWalls = walls.filter(w => (w.layer || 0) === currentLayer);

      // Player tokens
      for (const tok of tokens.filter(t => t.isPlayer && (t.layer || 0) === currentLayer)) {
        castRays(ctx, (tok.col + 0.5) * cs, (tok.row + 0.5) * cs, 1.5 * cs, currentWalls, cs);
      }

      // Positive Light sources
      for (const lt of lights.filter(l => {
        const def = LIGHT_DEF[l.type];
        const emitLux = l.customLux ?? def.lux;
        return l.isOn && emitLux >= 0 && (l.layer || 0) === currentLayer;
      })) {
        const def = LIGHT_DEF[lt.type];
        castRays(ctx, (lt.col + 0.5) * cs, (lt.row + 0.5) * cs, def.radius * cs, currentWalls, cs);
      }

      // Positive Token emissions
      for (const tok of tokens.filter(t => t.emission && t.emission.lux >= 0 && (t.layer || 0) === currentLayer)) {
        castRays(ctx, (tok.col + 0.5) * cs, (tok.row + 0.5) * cs, tok.emission!.radius * cs, currentWalls, cs);
      }

      // Negative Light sources (Darkness / Crepúsculo)
      ctx.globalCompositeOperation = "source-over";
      for (const lt of lights.filter(l => {
        const def = LIGHT_DEF[l.type];
        const emitLux = l.customLux ?? def.lux;
        return l.isOn && emitLux < 0 && (l.layer || 0) === currentLayer;
      })) {
        const def = LIGHT_DEF[lt.type];
        castRays(ctx, (lt.col + 0.5) * cs, (lt.row + 0.5) * cs, def.radius * cs, currentWalls, cs, true);
      }

      // Negative Token emissions
      for (const tok of tokens.filter(t => t.emission && t.emission.lux < 0 && (t.layer || 0) === currentLayer)) {
        castRays(ctx, (tok.col + 0.5) * cs, (tok.row + 0.5) * cs, tok.emission!.radius * cs, currentWalls, cs, true);
      }

      ctx.globalCompositeOperation = "source-over";
    });
  }, [dynLight, tokens, lights, walls, zoom, gridCols, gridRows, cs, currentLayer, ambientLux]);

  // ── Token mutations ──
  const updateToken = (id: string, patch: Partial<Token>) => {
    saveUndo();
    setTokens(p => p.map(t => t.id === id ? { ...t, ...patch } : t));
  };

  const addToken = () => {
    saveUndo();
    const t: Token = { id: genId(), label: "Novo", shape: "circle", color: "slate", col: 1, row: 1, hp: 50, maxHp: 50, initiative: 10, isPlayer: false, conditions: [], icon: "user", sizeIndex: 7, activeRunes: [], layer: currentLayer };
    setTokens(p => [...p, t]); setSelectedId(t.id); setPanel("tokens");
  };

  const addPlayerCharacter = () => {
    if (!charInfo?.name) { alert("Nenhum personagem carregado."); return; }
    saveUndo();
    const t: Token = { 
      id: genId(), label: charInfo.name, shape: "circle", color: "blue", 
      col: 1, row: 1, 
      hp: currentStatus?.vida || 50, maxHp: currentStatus?.vida || 50,
      initiative: 10, isPlayer: true, conditions: [], icon: "sword", sizeIndex: 7, activeRunes: [], layer: currentLayer 
    };
    setTokens(p => [...p, t]); setSelectedId(t.id); setPanel("tokens");
  };

  const cloneToken = (target: Token) => {
    saveUndo();
    const t = { ...target, id: genId(), col: target.col + 1, row: target.row, layer: currentLayer };
    setTokens(p => [...p, t]); setSelectedId(t.id); setPanel("tokens");
  };

  const saveToGallery = (token: Token) => {
    const saved = JSON.parse(localStorage.getItem("rpg_saved_tokens") || "[]");
    localStorage.setItem("rpg_saved_tokens", JSON.stringify([...saved, token]));
    alert("Invocação/Personagem salvo na Galeria Universal!");
  };

  const loadFromGallery = (t: Token) => {
    saveUndo();
    const cloned = { ...t, id: genId(), col: 1, row: 1, layer: currentLayer };
    setTokens(p => [...p, cloned]); setSelectedId(cloned.id); setShowGallery(false);
  };


  // ── Grid event helpers ──
  const getGridPt = (e: React.MouseEvent) => {
    const rect = gridRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  // Snap to grid point (corner of cells) for wall placement
  const snapGP = (px: { x: number; y: number }) => ({
    x: Math.max(0, Math.min(gridCols, snap(px.x, cs))),
    y: Math.max(0, Math.min(gridRows, snap(px.y, cs))),
  });

  // Snap to cell center for terrain/lights
  const snapCell = (px: { x: number; y: number }) => ({
    col: Math.max(0, Math.min(gridCols - 1, Math.floor(px.x / cs))),
    row: Math.max(0, Math.min(gridRows - 1, Math.floor(px.y / cs))),
  });

  // ── Finish a wall/door/window segment ──
  const finishWall = useCallback((endGP: { x: number; y: number }, subtype: WallSubtype) => {
    if (!wallStart) return;
    const dx = Math.abs(endGP.x - wallStart.x);
    const dy = Math.abs(endGP.y - wallStart.y);
    if (dx === 0 && dy === 0) { setWallStart(null); setWallPreview(null); return; }

    // Snap to horizontal or vertical
    const isHoriz = dx >= dy;
    const x2 = isHoriz ? endGP.x : wallStart.x;
    const y2 = isHoriz ? wallStart.y : endGP.y;

    setWalls(p => [...p, {
      id: genId(), x1: wallStart.x, y1: wallStart.y, x2, y2,
      material: pendWallMat, thickness: pendWallThick, subtype, isOpen: false, layer: currentLayer
    }]);
    setWallStart(null); setWallPreview(null);
  }, [wallStart, pendWallMat, pendWallThick, saveUndo]);

  // ── Mouse handlers ──
  const handleGridMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const px = getGridPt(e);

    // Token drag
    if (!placeMode) {
      // Check if clicked on a token
      for (const tok of [...tokens].reverse()) {
        const cells = getTokenCells(tok.sizeIndex);
        const tx = tok.col * cs, ty = tok.row * cs;
        if (px.x >= tx && px.x <= tx + cells * cs && px.y >= ty && px.y <= ty + cells * cs) {
          saveUndo();
          setSelectedId(tok.id); setSelWallId(null); setSelLightId(null);
          setDragging({ id: tok.id }); setDragPos(px);
          return;
        }
      }
      setSelectedId(null);
      return;
    }

    // Wall drawing start
    if (placeMode === "wall" || placeMode === "door" || placeMode === "window") {
      if (!wallStart) {
        setWallStart(snapGP(px));
      } else {
        const subtype: WallSubtype = placeMode === "door" ? "door" : placeMode === "window" ? "window" : "wall";
        finishWall(snapGP(px), subtype);
      }
      return;
    }

    // Place light
    if (placeMode === "light") {
      const cell = snapCell(px);
      setLights(p => [...p, { id: genId(), col: cell.col, row: cell.row, type: pendLightType, isOn: true, layer: currentLayer }]);
      return;
    }

    // Terrain paint
    if (placeMode?.startsWith("terrain_") || placeMode === "erase_terrain") {
      const cell = snapCell(px);
      if (placeMode === "erase_terrain") {
        setTerrain(p => p.filter(c => !(c.col === cell.col && c.row === cell.row && (c.layer || 0) === currentLayer)));
      } else {
        const type = placeMode.replace("terrain_", "") as TerrainType;
        setTerrain(p => [...p.filter(c => !(c.col === cell.col && c.row === cell.row && (c.layer || 0) === currentLayer)), { col: cell.col, row: cell.row, type, layer: currentLayer }]);
      }
    }

    // Erase wall
    if (placeMode === "erase_wall") {
      const gp = snapGP(px);
      // Find nearest wall (within 1 grid unit) on current layer
      let closest: string | null = null;
      let minDist = 0.8;
      for (const w of walls.filter(w => (w.layer || 0) === currentLayer)) {
        const mx = (w.x1 + w.x2) / 2, my = (w.y1 + w.y2) / 2;
        const dist = Math.hypot(gp.x - mx, gp.y - my);
        if (dist < minDist) { minDist = dist; closest = w.id; }
      }
      if (closest) setWalls(p => p.filter(w => w.id !== closest));
    }
  }, [placeMode, tokens, cs, wallStart, finishWall, pendLightType, walls, currentLayer]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const px = getGridPt(e);
    if (dragging) { setDragPos(px); return; }
    if (wallStart && (placeMode === "wall" || placeMode === "door" || placeMode === "window")) {
      setWallPreview(snapGP(px));
    }
    // Terrain paint on drag
    if (e.buttons === 1 && placeMode?.startsWith("terrain_")) {
      const cell = snapCell(px);
      const type = placeMode.replace("terrain_", "") as TerrainType;
      setTerrain(p => [...p.filter(c => !(c.col === cell.col && c.row === cell.row && (c.layer || 0) === currentLayer)), { col: cell.col, row: cell.row, type, layer: currentLayer }]);
    }
    if (e.buttons === 1 && placeMode === "erase_terrain") {
      const cell = snapCell(px);
      setTerrain(p => p.filter(c => !(c.col === cell.col && c.row === cell.row && (c.layer || 0) === currentLayer)));
    }
  }, [dragging, wallStart, placeMode, currentLayer]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    const px = getGridPt(e);
    const cell = snapCell(px);
    setTokens(p => p.map(t => t.id === dragging.id ? { ...t, col: cell.col, row: cell.row } : t));
    setDragging(null); setDragPos(null);
  }, [dragging]);

  // ── Cancel placement ──
  const cancelPlacement = () => { setPlaceMode(null); setWallStart(null); setWallPreview(null); };

  // ── Enter placement mode ──
  const startPlacement = (mode: PlaceMode) => { setPlaceMode(mode); setWallStart(null); setWallPreview(null); };

  // ── Wall line preview gp → px ──
  const gpToPx = (x: number, y: number) => ({ x: x * cs, y: y * cs });

  // ─── RENDER ──────────────────────────────────────────────────────────────────

  const gridW = gridCols * cs;
  const gridH = gridRows * cs;

  // Wall SVG rendering helper
  const renderWall = (w: WallSegment) => {
    const p1 = gpToPx(w.x1, w.y1);
    const p2 = gpToPx(w.x2, w.y2);
    const thickPx = WALL_PX[w.thickness] * zoom;
    const col = WALL_COLORS[w.material];
    const isSelected = w.id === selWallId;

    if (w.subtype === "wall") {
      return (
        <g key={w.id} onClick={(e) => { e.stopPropagation(); setSelWallId(w.id === selWallId ? null : w.id); setSelectedId(null); }} style={{ cursor: "pointer" }}>
          <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={isSelected ? "#f43f5e" : col} strokeWidth={thickPx} strokeLinecap="square" />
          {isSelected && <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#f43f5e" strokeWidth={thickPx + 4} strokeLinecap="square" opacity={0.3} />}
        </g>
      );
    }

    if (w.subtype === "window") {
      return (
        <g key={w.id} onClick={(e) => { e.stopPropagation(); setSelWallId(w.id === selWallId ? null : w.id); }} style={{ cursor: "pointer" }}>
          <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={col} strokeWidth={thickPx} strokeLinecap="square" strokeDasharray={`${4*zoom} ${3*zoom}`} />
          <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(100,200,255,0.4)" strokeWidth={thickPx * 0.6} strokeLinecap="square" />
        </g>
      );
    }

    if (w.subtype === "door") {
      const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
      const isH = Math.abs(w.x2 - w.x1) > Math.abs(w.y2 - w.y1);
      const doorW = Math.hypot(p2.x - p1.x, p2.y - p1.y) * 0.35;
      return (
        <g key={w.id} onClick={(e) => { e.stopPropagation(); setSelWallId(w.id === selWallId ? null : w.id); }} style={{ cursor: "pointer" }}>
          {/* Wall on each side of door */}
          <line x1={p1.x} y1={p1.y} x2={isH ? mx - doorW : mx} y2={isH ? my : my - doorW} stroke={col} strokeWidth={thickPx} strokeLinecap="square" />
          <line x1={isH ? mx + doorW : mx} y1={isH ? my : my + doorW} x2={p2.x} y2={p2.y} stroke={col} strokeWidth={thickPx} strokeLinecap="square" />
          {/* Door indicator */}
          {w.isOpen
            ? <path d={isH
                ? `M${mx - doorW},${my} A${doorW},${doorW} 0 0,1 ${mx - doorW},${my - doorW * 0.8}`
                : `M${mx},${my - doorW} A${doorW},${doorW} 0 0,1 ${mx + doorW * 0.8},${my - doorW}`}
                fill="none" stroke="#86efac" strokeWidth={2 * zoom} />
            : <rect x={mx - doorW} y={my - thickPx * 0.6} width={doorW * 2} height={thickPx * 1.2} fill="#78350f" stroke={col} strokeWidth={1 * zoom} rx={2} transform={isH ? "" : `rotate(90,${mx},${my})`} />
          }
          <circle cx={mx} cy={my} r={3 * zoom} fill={w.isOpen ? "#86efac" : "#f87171"} />
        </g>
      );
    }
    return null;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#070b14", color: "#e2e8f0", userSelect: "none", overflow: "hidden", fontFamily: "'Courier New', monospace" }}>

      {/* ── Top bar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 14px", background: "#0f172a", borderBottom: "1px solid #1e293b", flexShrink: 0 }}>
        <span style={{ fontWeight: 700, color: "#f43f5e", fontSize: 13, letterSpacing: 2, textTransform: "uppercase" }}>⚔ Campo de Batalha</span>

        {/* Placement mode indicator */}
        {placeMode && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "rgba(244,63,94,0.2)", border: "1px solid #f43f5e", borderRadius: 6 }}>
            <span style={{ fontSize: 11, color: "#f43f5e", fontWeight: 700 }}>
              {placeMode === "wall"    && "● Desenhando PAREDE — clique para iniciar, clique novamente para finalizar"}
              {placeMode === "door"    && "● Desenhando PORTA — clique para iniciar, clique novamente para finalizar"}
              {placeMode === "window"  && "● Desenhando JANELA — clique para iniciar, clique novamente para finalizar"}
              {placeMode === "light"   && `● Colocando ${LIGHT_DEF[pendLightType].label.toUpperCase()} — clique em uma célula`}
              {placeMode?.startsWith("terrain_") && "● Pintando TERRENO — clique e arraste"}
              {placeMode === "erase_wall"    && "● Apagando PAREDE — clique sobre ela"}
              {placeMode === "erase_terrain" && "● Apagando TERRENO — clique e arraste"}
              {wallStart && " | 1° ponto definido, clique para completar"}
            </span>
            <button onClick={cancelPlacement} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#f43f5e" }}><X size={14} /></button>
          </div>
        )}

        {/* Undo button */}
        <button onClick={doUndo} disabled={history.length === 0} style={{ ...tbBtn, opacity: history.length === 0 ? 0.3 : 1 }} title="Desfazer Ação (Undo)">
          <Undo2 size={13} />
        </button>
        <div style={{ width: 1, height: 22, background: "#1e293b", margin: "0 4px" }} />

        {/* Camada / Andar Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#060a12", border: "1px solid #1e293b", borderRadius: 6, padding: "2px 8px" }}>
          <span style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Andar</span>
          <input type="number" step="1" value={currentLayer} onChange={e => setCurrentLayer(parseInt(e.target.value) || 0)} style={{ background: "transparent", border: "none", color: "#38bdf8", width: 35, fontSize: 13, fontWeight: 700, textAlign: "center", outline: "none" }} title="Escreva um número (-1, 0, 1...)" />
        </div>
        <div style={{ width: 1, height: 22, background: "#1e293b", margin: "0 4px" }} />

        <div style={{ flex: 1 }} />

        {/* Export / Import */}
        <button onClick={() => {
          const data = JSON.stringify({ tokens, walls, lights, terrain, gridCols, gridRows, bgType, ambientLux });
          const blob = new Blob([data], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = "battlegrid_map.json"; a.click();
        }} style={tbBtn} title="Exportar Mapa"><Download size={13} /></button>
        <button onClick={() => {
          const input = document.createElement("input");
          input.type = "file"; input.accept = ".json";
          input.onchange = e => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => {
              try {
                const parsed = JSON.parse(ev.target?.result as string);
                if (parsed.gridCols) {
                  setTokens(parsed.tokens || []); setWalls(parsed.walls || []);
                  setLights(parsed.lights || []); setTerrain(parsed.terrain || []);
                  setGridCols(parsed.gridCols || 20); setGridRows(parsed.gridRows || 14);
                  setBg(parsed.bgType || "stone"); setAmbientLux(parsed.ambientLux || 0);
                }
              } catch(err) { alert("Erro ao ler o mapa"); }
            };
            reader.readAsText(file);
          };
          input.click();
        }} style={tbBtn} title="Importar Mapa"><Upload size={13} /></button>
        
        <div style={{ width: 1, height: 22, background: "#1e293b", margin: "0 4px" }} />

        {/* Dynamic lighting toggle */}
        <button
          onClick={() => setDynLight(v => !v)}
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 6, border: "1px solid", borderColor: dynLight ? "#f59e0b" : "#334155", background: dynLight ? "rgba(245,158,11,0.2)" : "transparent", color: dynLight ? "#f59e0b" : "#64748b", cursor: "pointer", fontSize: 11, fontWeight: 600 }}
        >
          <Lightbulb size={13} /> {dynLight ? "Iluminação ON" : "Iluminação OFF"}
        </button>

        <div style={{ width: 1, height: 22, background: "#1e293b" }} />

        <button onClick={() => setZoom(z => Math.min(2.5, parseFloat((z + 0.1).toFixed(1))))} style={tbBtn}><ZoomIn size={13} /></button>
        <span style={{ fontSize: 11, color: "#64748b", minWidth: 34, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.max(0.3, parseFloat((z - 0.1).toFixed(1))))} style={tbBtn}><ZoomOut size={13} /></button>
        <button onClick={() => setZoom(1)} style={tbBtn}><RotateCcw size={13} /></button>
        <button onClick={() => setShowGrid(v => !v)} style={{ ...tbBtn, color: showGrid ? "#38bdf8" : "#475569" }}><Grid3x3 size={13} /></button>
      </div>

      {/* ── Main ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Grid ── */}
        <div style={{ flex: 1, overflow: "auto", padding: 14, background: "#060a12" }}
          onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
          <div ref={gridRef} onMouseDown={handleGridMouseDown}
            style={{ position: "relative", width: gridW, height: gridH, background: BG_STYLE[bgType], backgroundSize: "8px 8px", borderRadius: 8, border: "1px solid #1e293b", overflow: "hidden", flexShrink: 0, cursor: placeMode ? "crosshair" : "default" }}>

            {/* Grid SVG (lines, terrain, walls, lights, tokens) */}
            <svg style={{ position: "absolute", inset: 0, overflow: "visible" }} width={gridW} height={gridH}>
              {/* Grid lines */}
              {showGrid && Array.from({ length: gridCols + 1 }, (_, i) => (
                <line key={`v${i}`} x1={i * cs} y1={0} x2={i * cs} y2={gridH} stroke="rgba(0,0,0,0.3)" strokeWidth={0.6} />
              ))}
              {showGrid && Array.from({ length: gridRows + 1 }, (_, i) => (
                <line key={`h${i}`} x1={0} y1={i * cs} x2={gridW} y2={i * cs} stroke="rgba(0,0,0,0.3)" strokeWidth={0.6} />
              ))}

              {/* Terrain cells */}
              {terrain.filter(c => (c.layer || 0) === currentLayer).map((cell, i) => {
                const td = TERRAIN_DEF[cell.type];
                return <rect key={i} x={cell.col * cs} y={cell.row * cs} width={cs} height={cs}
                  fill={td.bg} stroke={td.border} strokeWidth={1} opacity={0.85} rx={1} />;
              })}

              {/* Light glow (colored aura under tokens, visible in daylight) */}
              {lights.filter(l => l.isOn && (l.layer || 0) === currentLayer).map(lt => {
                const def = LIGHT_DEF[lt.type];
                return (
                  <radialGradient key={`g${lt.id}`} id={`lg-${lt.id}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%"   stopColor={def.glow} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={def.glow} stopOpacity={0} />
                  </radialGradient>
                );
              })}
              {tokens.filter(t => t.emission && (t.layer || 0) === currentLayer).map(tok => (
                <radialGradient key={`t-g${tok.id}`} id={`t-lg-${tok.id}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%"   stopColor={tok.emission!.glow} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={tok.emission!.glow} stopOpacity={0} />
                </radialGradient>
              ))}

              {lights.filter(l => l.isOn && (l.layer || 0) === currentLayer).map(lt => {
                const def = LIGHT_DEF[lt.type];
                const lx = (lt.col + 0.5) * cs, ly = (lt.row + 0.5) * cs;
                const r = def.radius * cs;
                return <circle key={`ga-${lt.id}`} cx={lx} cy={ly} r={r} fill={`url(#lg-${lt.id})`} pointerEvents="none" />;
              })}
              {tokens.filter(tok => tok.emission && (tok.layer || 0) === currentLayer).map(tok => {
                const lx = (tok.col + 0.5) * cs, ly = (tok.row + 0.5) * cs;
                const r = tok.emission!.radius * cs;
                return <circle key={`t-ga-${tok.id}`} cx={lx} cy={ly} r={r} fill={`url(#t-lg-${tok.id})`} pointerEvents="none" />;
              })}

              {/* AoE markers */}
              {aoes.filter(a => (a.layer || 0) === currentLayer).map(aoe => {
                const c = COLOR_MAP[aoe.color];
                const x = aoe.col * cs, y = aoe.row * cs, sz = aoe.size * cs;
                return (
                  <g key={aoe.id}>
                    {aoe.shape === "circle" && <circle cx={x + sz/2} cy={y + sz/2} r={sz/2} fill={c.aoe} stroke={c.bg} strokeWidth={2} />}
                    {aoe.shape === "square" && <rect x={x} y={y} width={sz} height={sz} fill={c.aoe} stroke={c.bg} strokeWidth={2} rx={3} />}
                    {aoe.shape === "cone"   && <polygon points={`${x+sz/2},${y} ${x},${y+sz} ${x+sz},${y+sz}`} fill={c.aoe} stroke={c.bg} strokeWidth={2} transform={`rotate(${aoe.angle},${x+sz/2},${y+sz/2})`} />}
                    {aoe.shape === "line"   && <rect x={x} y={y+sz*0.25} width={sz} height={sz*0.5} fill={c.aoe} stroke={c.bg} strokeWidth={2} transform={`rotate(${aoe.angle},${x},${y+sz/2})`} />}
                  </g>
                );
              })}

              {/* Walls */}
              {walls.filter(w => (w.layer || 0) === currentLayer).map(w => renderWall(w))}

              {/* Wall preview */}
              {wallStart && wallPreview && (() => {
                const p1 = gpToPx(wallStart.x, wallStart.y);
                const isH = Math.abs(wallPreview.x - wallStart.x) >= Math.abs(wallPreview.y - wallStart.y);
                const ex = isH ? wallPreview.x : wallStart.x;
                const ey = isH ? wallStart.y : wallPreview.y;
                const p2 = gpToPx(ex, ey);
                return <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#f43f5e" strokeWidth={WALL_PX[pendWallThick] * zoom} strokeLinecap="square" opacity={0.6} strokeDasharray={`${6*zoom} ${4*zoom}`} />;
              })()}

              {/* Wall start point indicator */}
              {wallStart && <circle cx={wallStart.x * cs} cy={wallStart.y * cs} r={5 * zoom} fill="#f43f5e" opacity={0.9} />}
            </svg>

            {/* Tokens */}
            {tokens.filter(t => (t.layer || 0) === currentLayer && (!dragging || t.id !== dragging.id)).map(token => {
              const cells = getTokenCells(token.sizeIndex);
              const px = cells * cs - 6;
              return (
                <div key={token.id} onMouseDown={e => { if (!placeMode) { e.stopPropagation(); } }}
                  style={{ position: "absolute", left: token.col * cs, top: token.row * cs, width: cells * cs, height: cells * cs, display: "flex", alignItems: "center", justifyContent: "center", zIndex: selectedId === token.id ? 20 : 10 }}>
                  <TokenSVG token={token} isSelected={selectedId === token.id} px={px} />
                  <div style={{ position: "absolute", bottom: -16, left: "50%", transform: "translateX(-50%)", fontSize: 9, color: "#fff", background: "rgba(0,0,0,0.8)", padding: "1px 5px", borderRadius: 3, whiteSpace: "nowrap", fontWeight: 600, pointerEvents: "none" }}>{token.label}</div>
                </div>
              );
            })}

            {/* Light source icons */}
            {lights.filter(l => (l.layer || 0) === currentLayer).map(lt => {
              const def = LIGHT_DEF[lt.type];
              const isSel = lt.id === selLightId;
              return (
                <div key={lt.id} onClick={e => { e.stopPropagation(); setSelLightId(lt.id === selLightId ? null : lt.id); setSelectedId(null); setSelWallId(null); }}
                  style={{ position: "absolute", left: lt.col * cs, top: lt.row * cs, width: cs, height: cs, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 15, cursor: "pointer" }}>
                  <div style={{ fontSize: cs * 0.45, opacity: lt.isOn ? 1 : 0.35, filter: lt.isOn ? `drop-shadow(0 0 ${6*zoom}px ${def.glow})` : "none", border: isSel ? `2px solid #f59e0b` : "2px solid transparent", borderRadius: "50%", padding: 2, lineHeight: 1 }}>
                    {def.icon}
                  </div>
                </div>
              );
            })}

            {/* Drag ghost */}
            {dragging && dragPos && (() => {
              const token = tokens.find(t => t.id === dragging.id)!;
              const cells = getTokenCells(token.sizeIndex);
              const px = cells * cs - 6;
              const snapC = Math.max(0, Math.min(gridCols - 1, Math.floor(dragPos.x / cs)));
              const snapR = Math.max(0, Math.min(gridRows - 1, Math.floor(dragPos.y / cs)));
              return (
                <>
                  <div style={{ position: "absolute", left: snapC * cs, top: snapR * cs, width: cells * cs, height: cells * cs, border: "2px dashed rgba(255,255,255,0.5)", borderRadius: 6, background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
                  <div style={{ position: "absolute", left: dragPos.x - cells * cs / 2, top: dragPos.y - cells * cs / 2, width: cells * cs, height: cells * cs, opacity: 0.85, pointerEvents: "none", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <TokenSVG token={token} isSelected px={px} />
                  </div>
                </>
              );
            })()}

            {/* Fog of war canvas */}
            <canvas ref={fogCanvas} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 30 }} />
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            SIDE PANEL
            ════════════════════════════════════════════════════════════ */}
        <div style={{ width: 295, background: "#0f172a", borderLeft: "1px solid #1e293b", display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden" }}>

          {/* Tab bar */}
          <div style={{ display: "flex", borderBottom: "1px solid #1e293b", background: "#0c1220" }}>
            {[
              { id: "elements",   label: "Elementos", icon: <Plus size={11} />   },
              { id: "tokens",     label: "Tokens",    icon: <User size={11} />    },
              { id: "initiative", label: "Init.",     icon: <Sword size={11} />   },
              { id: "arena",      label: "Arena",     icon: <Map size={11} />     },
            ].map(tab => (
              <button key={tab.id} onClick={() => setPanel(tab.id as PanelTab)} style={{ flex: 1, padding: "7px 2px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontSize: 9, border: "none", borderBottom: panel === tab.id ? "2px solid #f43f5e" : "2px solid transparent", background: "transparent", color: panel === tab.id ? "#f43f5e" : "#64748b", cursor: "pointer" }}>
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>

            {/* ══════════════════════ ELEMENTOS ══════════════════════ */}
            {panel === "elements" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

                {/* Category selector */}
                <span style={SL}>Adicionar Elemento</span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {([
                    { id: "wall",    label: "🧱 Parede",   desc: "Madeira, pedra, alvenaria..." },
                    { id: "door",    label: "🚪 Porta",    desc: "Com batente e dobradiça"      },
                    { id: "window",  label: "🪟 Janela",   desc: "Deixa luz passar"             },
                    { id: "light",   label: "💡 Luz",      desc: "Vela, tocha, fogueira..."     },
                    { id: "terrain", label: "🗺 Terreno",  desc: "Areia, grama, pedra..."       },
                  ] as { id: ElemCategory; label: string; desc: string }[]).map(cat => (
                    <button key={cat.id} onClick={() => setElemCat(cat.id === elemCat ? null : cat.id)}
                      style={{ padding: "10px 8px", borderRadius: 8, textAlign: "left", border: "1px solid", borderColor: elemCat === cat.id ? "#f43f5e" : "#1e293b", background: elemCat === cat.id ? "rgba(244,63,94,0.1)" : "#070b14", cursor: "pointer", transition: "all 0.12s", gridColumn: cat.id === "terrain" ? "1 / -1" : "auto" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: elemCat === cat.id ? "#f43f5e" : "#e2e8f0" }}>{cat.label}</div>
                      <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{cat.desc}</div>
                    </button>
                  ))}
                </div>

                {/* ── Wall/Door/Window config ── */}
                {(elemCat === "wall" || elemCat === "door" || elemCat === "window") && (
                  <div style={{ padding: 12, borderRadius: 8, border: "1px solid #1e293b", background: "#070b14" }}>
                    <span style={SL}>Material</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6, marginBottom: 10 }}>
                      {(["wood", "stone", "masonry", "rock", "iron"] as WallMaterial[]).map(mat => (
                        <button key={mat} onClick={() => setPendWallMat(mat)}
                          style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 6, border: "1px solid", borderColor: pendWallMat === mat ? WALL_COLORS[mat] : "#1e293b", background: pendWallMat === mat ? `${WALL_COLORS[mat]}22` : "transparent", cursor: "pointer" }}>
                          <div style={{ width: 24, height: 6, background: WALL_COLORS[mat], borderRadius: 3, flexShrink: 0 }} />
                          <span style={{ fontSize: 11, color: pendWallMat === mat ? "#e2e8f0" : "#94a3b8", textTransform: "capitalize" }}>
                            {{ wood: "Madeira", stone: "Pedra", masonry: "Alvenaria", rock: "Rocha", iron: "Ferro" }[mat]}
                          </span>
                        </button>
                      ))}
                    </div>

                    {elemCat !== "window" && (
                      <>
                        <span style={SL}>Espessura</span>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6, marginBottom: 10 }}>
                          {(["thin", "normal", "thick", "massive"] as WallThickness[]).map(th => (
                            <button key={th} onClick={() => setPendWallThick(th)}
                              style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 6, border: "1px solid", borderColor: pendWallThick === th ? "#f43f5e" : "#1e293b", background: pendWallThick === th ? "rgba(244,63,94,0.1)" : "transparent", cursor: "pointer" }}>
                              <div style={{ width: WALL_PX[th] * 1.5, height: WALL_PX[th] * 1.5, background: WALL_COLORS[pendWallMat], borderRadius: 2, flexShrink: 0 }} />
                              <span style={{ fontSize: 10, color: pendWallThick === th ? "#f43f5e" : "#94a3b8" }}>{WALL_THICK_LABEL[th]}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    <button onClick={() => startPlacement(elemCat as PlaceMode)}
                      style={{ width: "100%", padding: "8px", borderRadius: 6, border: "1px solid #f43f5e", background: "rgba(244,63,94,0.2)", color: "#f43f5e", cursor: "pointer", fontWeight: 700, fontSize: 12, fontFamily: "inherit" }}>
                      ✦ Iniciar {elemCat === "door" ? "Porta" : elemCat === "window" ? "Janela" : "Parede"}
                    </button>
                  </div>
                )}

                {/* ── Light config ── */}
                {elemCat === "light" && (
                  <div style={{ padding: 12, borderRadius: 8, border: "1px solid #1e293b", background: "#070b14" }}>
                    <span style={SL}>Tipo de Fonte de Luz</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 8, marginBottom: 10 }}>
                      {(Object.entries(LIGHT_DEF) as [LightType, typeof LIGHT_DEF[LightType]][]).map(([type, def]) => (
                        <button key={type} onClick={() => setPendLightType(type)}
                          style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 7, border: "1px solid", borderColor: pendLightType === type ? def.glow : "#1e293b", background: pendLightType === type ? `${def.glow}18` : "#070b14", cursor: "pointer" }}>
                          <span style={{ fontSize: 20 }}>{def.icon}</span>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: pendLightType === type ? def.glow : "#e2e8f0" }}>{def.label}</div>
                            <div style={{ fontSize: 10, color: "#64748b" }}>Raio: {def.radius}m · {def.lux} Lux</div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => startPlacement("light")}
                      style={{ width: "100%", padding: "8px", borderRadius: 6, border: "1px solid #f59e0b", background: "rgba(245,158,11,0.2)", color: "#f59e0b", cursor: "pointer", fontWeight: 700, fontSize: 12, fontFamily: "inherit" }}>
                      ✦ Colocar {LIGHT_DEF[pendLightType].label}
                    </button>
                  </div>
                )}

                {/* ── Terrain config ── */}
                {elemCat === "terrain" && (
                  <div style={{ padding: 12, borderRadius: 8, border: "1px solid #1e293b", background: "#070b14" }}>
                    <span style={SL}>Tipo de Terreno</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 8, marginBottom: 10 }}>
                      {(Object.entries(TERRAIN_DEF) as [TerrainType, typeof TERRAIN_DEF[TerrainType]][]).map(([type, def]) => (
                        <button key={type} onClick={() => { setPendTerrain(type); startPlacement(`terrain_${type}` as PlaceMode); }}
                          style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 6, border: "1px solid", borderColor: pendTerrain === type && placeMode === `terrain_${type}` ? def.border : "#1e293b", background: pendTerrain === type && placeMode === `terrain_${type}` ? `${def.border}22` : "transparent", cursor: "pointer" }}>
                          <div style={{ width: 28, height: 22, borderRadius: 4, background: def.bg, border: `1px solid ${def.border}`, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: "#e2e8f0" }}>{def.label}</span>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => startPlacement("erase_terrain")}
                      style={{ width: "100%", padding: "6px", borderRadius: 6, border: "1px solid #7f1d1d", background: "rgba(127,29,29,0.2)", color: "#ef4444", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>
                      Apagar Terreno
                    </button>
                  </div>
                )}

                {/* ── Eraser tools ── */}
                <div style={{ padding: 10, borderRadius: 8, border: "1px solid #1e293b", background: "#070b14" }}>
                  <span style={SL}>Ferramentas de Remoção</span>
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <button onClick={() => startPlacement("erase_wall")} style={{ flex: 1, padding: "7px 6px", borderRadius: 6, border: "1px solid #374151", background: "rgba(55,65,81,0.2)", color: "#9ca3af", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>Apagar Parede</button>
                    <button onClick={() => { setLights([]); setWalls([]); setTerrain([]); }} style={{ flex: 1, padding: "7px 6px", borderRadius: 6, border: "1px solid #7f1d1d", background: "rgba(127,29,29,0.15)", color: "#ef4444", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>Limpar Tudo</button>
                  </div>
                </div>

                {/* ── Selected wall inspector ── */}
                {selWallId && (() => {
                  const w = walls.find(x => x.id === selWallId);
                  if (!w) return null;
                  return (
                    <div style={{ padding: 12, borderRadius: 8, border: "1px solid #f43f5e", background: "rgba(244,63,94,0.05)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 11, color: "#f43f5e", fontWeight: 700 }}>● Parede Selecionada</span>
                        <button onClick={() => { setWalls(p => p.filter(x => x.id !== selWallId)); setSelWallId(null); }} style={{ ...IBT, color: "#ef4444" }}><Trash2 size={12} /></button>
                      </div>
                      <div style={{ fontSize: 10, color: "#64748b" }}>
                        <div>Material: <span style={{ color: "#94a3b8" }}>{w.material}</span></div>
                        <div>Espessura: <span style={{ color: "#94a3b8" }}>{w.thickness}</span></div>
                        <div>Tipo: <span style={{ color: "#94a3b8" }}>{w.subtype}</span></div>
                      </div>
                      {w.subtype === "door" && (
                        <button onClick={() => setWalls(p => p.map(x => x.id === selWallId ? { ...x, isOpen: !x.isOpen } : x))}
                          style={{ marginTop: 8, width: "100%", padding: "6px", borderRadius: 5, border: "1px solid", borderColor: w.isOpen ? "#86efac" : "#fca5a5", background: w.isOpen ? "rgba(134,239,172,0.1)" : "rgba(252,165,165,0.1)", color: w.isOpen ? "#86efac" : "#fca5a5", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                          {w.isOpen ? <Unlock size={12} /> : <Lock size={12} />} {w.isOpen ? "Porta Aberta" : "Porta Fechada"}
                        </button>
                      )}
                    </div>
                  );
                })()}

                {/* ── Selected light inspector ── */}
                {selLightId && (() => {
                  const lt = lights.find(x => x.id === selLightId);
                  if (!lt) return null;
                  const def = LIGHT_DEF[lt.type];
                  return (
                    <div style={{ padding: 12, borderRadius: 8, border: "1px solid #f59e0b", background: "rgba(245,158,11,0.05)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700 }}>{def.icon} {def.label}</span>
                        <button onClick={() => { setLights(p => p.filter(x => x.id !== selLightId)); setSelLightId(null); }} style={{ ...IBT, color: "#ef4444" }}><Trash2 size={12} /></button>
                      </div>
                      <div style={{ fontSize: 10, color: "#64748b", marginBottom: 8 }}>Raio: {def.radius}m · Lux Original: {def.lux} · {lt.isOn ? "Ativa" : "Inativa"}</div>
                      <label style={LBL}>Lux Personalizado (Opcional)</label>
                      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                        <input type="number" placeholder={String(def.lux)} value={lt.customLux ?? ""} onChange={e => {
                          const val = e.target.value === "" ? undefined : parseInt(e.target.value);
                          setLights(p => p.map(x => x.id === selLightId ? { ...x, customLux: val } : x));
                        }} style={{...INP, marginBottom: 0}} />
                        <button onClick={() => setLights(p => p.map(x => x.id === selLightId ? { ...x, customLux: undefined } : x))} style={{...IBT, padding: "0 8px"}}>Reset</button>
                      </div>
                      <button onClick={() => setLights(p => p.map(x => x.id === selLightId ? { ...x, isOn: !x.isOn } : x))}
                        style={{ width: "100%", padding: "6px", borderRadius: 5, border: "1px solid", borderColor: lt.isOn ? "#f59e0b" : "#374151", background: lt.isOn ? "rgba(245,158,11,0.15)" : "transparent", color: lt.isOn ? "#f59e0b" : "#64748b", cursor: "pointer", fontSize: 11, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                        <Lightbulb size={12} /> {lt.isOn ? "Apagar" : "Acender"}
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ══════════════════════ TOKENS ══════════════════════ */}
            {panel === "tokens" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={SL}>Tokens</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={addToken} style={IBT} title="Criar Token"><Plus size={13} /></button>
                    <button onClick={addPlayerCharacter} style={{...IBT, color: "#38bdf8", borderColor: "#0284c7"}} title="Adicionar Meu Personagem"><User size={13} /></button>
                    <button onClick={() => setShowGallery(!showGallery)} style={{...IBT, background: showGallery ? "#374151" : "transparent"}} title="Galeria Universal"><Save size={13} /></button>
                  </div>
                </div>

                {showGallery && (
                  <div style={{ padding: 12, borderRadius: 8, border: "1px solid #1e293b", background: "#0f172a" }}>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8, fontWeight: 700 }}>Galeria Universal</div>
                    {galleryTokens.length === 0 ? (
                      <div style={{ fontSize: 10, color: "#475569" }}>Nenhum token salvo. Edite um token abaixo e salve-o.</div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {galleryTokens.map((gt, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", background: "#1e293b", borderRadius: 6 }}>
                             <div style={{ fontSize: 11, fontWeight: 600 }}>{gt.label} <span style={{fontSize:9, color:"#94a3b8"}}>{gt.isProp ? "(Objeto)" : ""}</span></div>
                             <button onClick={() => loadFromGallery(gt)} style={{...IBT, background: "#0ea5e9", color: "#fff", padding: "2px 6px"}}>Invocar</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {tokens.map(token => (
                  <div key={token.id} onClick={() => { setSelectedId(token.id === selectedId ? null : token.id); setCurrentLayer(token.layer || 0); }}
                    style={{ padding: 10, borderRadius: 8, border: "1px solid", borderColor: selectedId === token.id ? "#f43f5e" : "#1e293b", background: selectedId === token.id ? "rgba(244,63,94,0.08)" : "#070b14", cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 26, height: 26, borderRadius: token.shape === "circle" ? "50%" : 5, background: COLOR_MAP[token.color].bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><TkIcon icon={token.icon} size={13} /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>
                          {token.label} {token.isProp && <span style={{fontSize:9, color:"#fbbf24"}}>(Objeto)</span>} 
                          {(token.layer || 0) !== currentLayer && <span style={{fontSize:10, color:"#38bdf8", marginLeft: 4}}>Lv{token.layer || 0}</span>}
                        </div>
                        {!token.isProp ? (
                          <div style={{ fontSize: 10, color: "#64748b" }}>PV {token.hp}/{token.maxHp} · Init {token.initiative} · {CREATURE_SIZES[token.sizeIndex]?.name}</div>
                        ) : (
                          <div style={{ fontSize: 10, color: "#64748b" }}>Ocupa: {CREATURE_SIZES[token.sizeIndex]?.name}</div>
                        )}
                      </div>
                      <button onClick={e => { e.stopPropagation(); setTokens(p => p.filter(t => t.id !== token.id)); if (selectedId === token.id) setSelectedId(null); }} style={{ ...IBT, color: "#ef4444" }}><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}

                {/* Token editor */}
                {selected && (
                  <div style={{ marginTop: 4, padding: 12, borderRadius: 8, border: "1px solid #1e293b", background: "#070b14" }}>
                    <div style={{ fontSize: 10, color: "#f43f5e", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>● {selected.label}</div>

                    <label style={LBL}>Nome</label>
                    <input value={selected.label} onChange={e => updateToken(selected.id, { label: e.target.value })} style={INP} />

                    {!selected.isProp && (
                      <>
                        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                          <div style={{ flex: 1 }}>
                            <label style={LBL}>PV Atual</label>
                            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                              <button onClick={() => updateToken(selected.id, { hp: Math.max(0, selected.hp - 1) })} style={{ ...IBT, padding: 3 }}><Minus size={10} /></button>
                              <input type="number" value={selected.hp} onChange={e => updateToken(selected.id, { hp: parseInt(e.target.value) || 0 })} style={{ ...INP, width: 44, marginBottom: 0, textAlign: "center" }} />
                              <button onClick={() => updateToken(selected.id, { hp: Math.min(selected.maxHp, selected.hp + 1) })} style={{ ...IBT, padding: 3 }}><Plus size={10} /></button>
                            </div>
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={LBL}>PV Máx</label>
                            <input type="number" value={selected.maxHp} onChange={e => updateToken(selected.id, { maxHp: parseInt(e.target.value) || 1 })} style={INP} />
                          </div>
                        </div>

                        <label style={LBL}>Iniciativa</label>
                        <input type="number" value={selected.initiative} onChange={e => updateToken(selected.id, { initiative: parseInt(e.target.value) || 0 })} style={INP} />
                      </>
                    )}

                    <label style={LBL}>Tamanho</label>
                    <select value={selected.sizeIndex} onChange={e => updateToken(selected.id, { sizeIndex: parseInt(e.target.value) })} style={{ ...INP, appearance: "none" as any }}>
                      {CREATURE_SIZES.map((sz, i) => (
                        <option key={i} value={i}>{sz.name} — {sz.example} ({sz.gridCells >= 1 ? `${Math.ceil(sz.gridCells)}×${Math.ceil(sz.gridCells)} sq` : "<1 sq"})</option>
                      ))}
                    </select>
                    <div style={{ fontSize: 10, color: "#475569", marginTop: -6, marginBottom: 8 }}>Ocupa: {CREATURE_SIZES[selected.sizeIndex]?.occupies}</div>

                    <label style={{...LBL, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", marginBottom: 8}}>
                      <input type="checkbox" checked={selected.isProp || false} onChange={e => updateToken(selected.id, { isProp: e.target.checked })} />
                      Isso é um Objeto / Prop (Esconde Vida/Init)
                    </label>

                    <label style={{...LBL, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", marginBottom: 2}}>
                      <input type="checkbox" checked={!!selected.emission} onChange={e => updateToken(selected.id, { emission: e.target.checked ? { lux: 1000, radius: 20, glow: "#fcd34d" } : undefined })} />
                      Item com Emissão (Luz ou Sombra)
                    </label>
                    {selected.emission && (
                      <div style={{ display: "flex", gap: 4, marginBottom: 8, padding: 8, background: "rgba(0,0,0,0.3)", borderRadius: 6, flexWrap: "wrap", border: "1px solid #1e293b" }}>
                        <div style={{ flex: 1, minWidth: 60 }}>
                          <label style={{...LBL, fontSize: 9}}>Lux</label>
                          <input type="number" value={selected.emission.lux} onChange={e => updateToken(selected.id, { emission: { ...selected.emission!, lux: parseInt(e.target.value)||0 } })} style={{...INP, marginBottom:0}} title="(Ex: Sol = 1000, Escuro = -500)" />
                        </div>
                        <div style={{ flex: 1, minWidth: 60 }}>
                          <label style={{...LBL, fontSize: 9}}>Raio (M)</label>
                          <input type="number" value={selected.emission.radius} onChange={e => updateToken(selected.id, { emission: { ...selected.emission!, radius: Math.max(0, parseInt(e.target.value)||1) } })} style={{...INP, marginBottom:0}} />
                        </div>
                        <div style={{ flex: 1, minWidth: 60 }}>
                          <label style={{...LBL, fontSize: 9}}>Cor Hex</label>
                          <input type="text" value={selected.emission.glow} onChange={e => updateToken(selected.id, { emission: { ...selected.emission!, glow: e.target.value } })} style={{...INP, marginBottom:0}} />
                        </div>
                      </div>
                    )}

                    <label style={LBL}>Ícone & Forma</label>
                    <div style={{ display: "flex", gap: 3, marginBottom: 4, flexWrap: "wrap" }}>
                      {(["sword", "shield", "crown", "user", "target", "box", "sun", "moon"] as Token["icon"][]).map(ic => (
                        <button key={ic} onClick={() => updateToken(selected.id, { icon: ic })} style={{ padding: 4, borderRadius: 4, border: selected.icon === ic ? "1px solid #38bdf8" : "1px solid transparent", background: selected.icon === ic ? "rgba(56,189,248,0.2)" : "transparent", color: "#94a3b8", cursor: "pointer" }}>
                           <TkIcon icon={ic} size={14} />
                        </button>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
                      {(["circle", "square", "diamond", "triangle"] as TokenShape[]).map(s => (
                        <button key={s} onClick={() => updateToken(selected.id, { shape: s })} style={{ ...IBT, flex: 1, borderColor: selected.shape === s ? "#f43f5e" : "#1e293b", background: selected.shape === s ? "rgba(244,63,94,0.18)" : "transparent" }}>
                          {s === "circle" && <CircleDot size={12} />}{s === "square" && <Square size={12} />}{s === "diamond" && <Target size={12} />}{s === "triangle" && <Triangle size={12} />}
                        </button>
                      ))}
                    </div>

                    <label style={LBL}>Cor</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                      {(Object.keys(COLOR_MAP) as TokenColor[]).map(color => (
                        <button key={color} onClick={() => updateToken(selected.id, { color })} style={{ width: 22, height: 22, borderRadius: "50%", background: COLOR_MAP[color].bg, border: selected.color === color ? "3px solid #fff" : "2px solid transparent", cursor: "pointer" }} />
                      ))}
                    </div>

                    <label style={LBL}>Tipo</label>
                    <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                      {[{ val: true, label: "Jogador" }, { val: false, label: "NPC" }].map(opt => (
                        <button key={String(opt.val)} onClick={() => updateToken(selected.id, { isPlayer: opt.val })} style={{ flex: 1, padding: "4px", borderRadius: 5, fontSize: 10, border: "1px solid", borderColor: selected.isPlayer === opt.val ? "#38bdf8" : "#1e293b", background: selected.isPlayer === opt.val ? "rgba(56,189,248,0.14)" : "transparent", color: selected.isPlayer === opt.val ? "#38bdf8" : "#64748b", cursor: "pointer", fontFamily: "inherit" }}>{opt.label}</button>
                      ))}
                    </div>

                    <label style={LBL}>Runas Ativas (Auras Menores)</label>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
                      {["Alvorada", "Crepúsculo", "Conservação", "Preservação"].map(rune => {
                        const active = selected.activeRunes?.includes(rune);
                        return (
                          <button key={rune} onClick={() => {
                            const activeRunes = active ? selected.activeRunes.filter(r => r !== rune) : [...(selected.activeRunes || []), rune];
                            updateToken(selected.id, { activeRunes });
                          }} style={{ padding: "4px 8px", borderRadius: 5, fontSize: 10, border: "1px solid", borderColor: active ? "#eab308" : "#1e293b", background: active ? "rgba(234,179,8,0.15)" : "transparent", color: active ? "#eab308" : "#64748b", cursor: "pointer", fontFamily: "inherit" }}>
                            {rune}
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                       <button onClick={() => cloneToken(selected)} style={{ flex: 1, padding: "6px", background: "#1e293b", color: "#e2e8f0", border: "none", borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}><Copy size={12}/> Clonar</button>
                       <button onClick={() => saveToGallery(selected)} style={{ flex: 1, padding: "6px", background: "#0ea5e9", color: "#fff", border: "none", borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}><Save size={12}/> Guardar</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════ INICIATIVA ══════════════════════ */}
            {panel === "initiative" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={SL}>Ordem de Iniciativa</span>
                </div>
                {sortedByInit.map((token, idx) => {
                  const c = COLOR_MAP[token.color];
                  const hp = token.hp / token.maxHp;
                  const hc = hp > 0.5 ? "#22c55e" : hp > 0.25 ? "#f59e0b" : "#ef4444";
                  return (
                    <div key={token.id} onClick={() => { setSelectedId(token.id); setCurrentLayer(token.layer || 0); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 7, border: "1px solid", borderColor: selectedId === token.id ? c.bg : "#1e293b", background: selectedId === token.id ? `${c.bg}20` : "#070b14", cursor: "pointer" }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: idx === 0 ? "#f59e0b" : "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: idx === 0 ? "#000" : "#64748b", flexShrink: 0 }}>{idx + 1}</div>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.bg, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>
                          {token.label} 
                          {(token.layer || 0) !== currentLayer && <span style={{fontSize:10, color:"#38bdf8", marginLeft: 4}}>Lv{token.layer || 0}</span>}
                        </div>
                        <div style={{ fontSize: 9, color: "#475569" }}>{CREATURE_SIZES[token.sizeIndex]?.name}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                          <div style={{ flex: 1, height: 3, borderRadius: 2, background: "#1e293b" }}><div style={{ width: `${hp * 100}%`, height: "100%", borderRadius: 2, background: hc }} /></div>
                          <span style={{ fontSize: 9, color: "#64748b" }}>{token.hp}/{token.maxHp}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <button onClick={e => { e.stopPropagation(); updateToken(token.id, { initiative: token.initiative + 1 }); }} style={{ ...IBT, padding: 2 }}><ChevronUp size={10} /></button>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{token.initiative}</span>
                        <button onClick={e => { e.stopPropagation(); updateToken(token.id, { initiative: Math.max(1, token.initiative - 1) }); }} style={{ ...IBT, padding: 2 }}><ChevronDown size={10} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ══════════════════════ ARENA ══════════════════════ */}
            {panel === "arena" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                <span style={SL}>Presets de Arena</span>
                {ARENA_PRESETS.map(p => (
                  <button key={p.name} onClick={() => { setGridCols(p.cols); setGridRows(p.rows); setBg(p.bg); setWalls([]); setTerrain([]); setLights([]); }}
                    style={{ padding: "8px 10px", borderRadius: 7, textAlign: "left", border: "1px solid", borderColor: gridCols === p.cols && gridRows === p.rows ? "#f43f5e" : "#1e293b", background: gridCols === p.cols && gridRows === p.rows ? "rgba(244,63,94,0.1)" : "#070b14", cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ fontSize: 18 }}>{p.icon}</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: gridCols === p.cols && gridRows === p.rows ? "#f43f5e" : "#e2e8f0" }}>{p.name}</div>
                        <div style={{ fontSize: 10, color: "#64748b" }}>{p.cols}×{p.rows} metros · {p.bg}</div>
                      </div>
                    </div>
                  </button>
                ))}

                <div style={{ padding: 10, borderRadius: 8, border: "1px solid #1e293b", background: "#070b14" }}>
                  <span style={SL}>Tamanho Personalizado</span>
                  <div style={{ display: "flex", gap: 8, marginTop: 7 }}>
                    <div style={{ flex: 1 }}>
                      <label style={LBL}>Colunas (m)</label>
                      <input type="number" min={4} max={60} value={gridCols} onChange={e => setGridCols(parseInt(e.target.value) || 4)} style={INP} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={LBL}>Linhas (m)</label>
                      <input type="number" min={4} max={40} value={gridRows} onChange={e => setGridRows(parseInt(e.target.value) || 4)} style={INP} />
                    </div>
                  </div>
                </div>

                <div style={{ padding: 10, borderRadius: 8, border: "1px solid #1e293b", background: "#070b14", marginTop: 7 }}>
                  <span style={{...SL, color: "#f59e0b", display: "flex", alignItems: "center", gap: 5}}><Lightbulb size={12} /> Luminosidade Global</span>
                  <select value={ambientLux} onChange={e => setAmbientLux(Number(e.target.value))} style={{ ...INP, marginTop: 7, marginBottom: 0 }}>
                    <option value={0}>0 Lux — Escuro Absoluto</option>
                    <option value={2}>1-4 Lux — Extremamente Escuro</option>
                    <option value={5}>5-9 Lux — Muito Escuro</option>
                    <option value={10}>10-49 Lux — Escuro</option>
                    <option value={50}>50-99 Lux — Levemente Escuro</option>
                    <option value={100}>100-499 Lux — Penumbra</option>
                    <option value={500}>500-999 Lux — Levemente Claro</option>
                    <option value={1000}>1.000+ Lux — Claro</option>
                  </select>
                </div>

                <div>
                  <span style={SL}>Piso / Fundo</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 7 }}>
                    {([
                      { id: "none",  label: "Escuro",  preview: "#0c1220" },
                      { id: "sand",  label: "🏜 Areia", preview: "#c4a055" },
                      { id: "stone", label: "🪨 Pedra", preview: "#586070" },
                      { id: "grass", label: "🌿 Grama", preview: "#4a7c35" },
                    ] as { id: BackgroundType; label: string; preview: string }[]).map(bg => (
                      <button key={bg.id} onClick={() => setBg(bg.id)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 6, border: "1px solid", borderColor: bgType === bg.id ? "#f43f5e" : "#1e293b", background: bgType === bg.id ? "rgba(244,63,94,0.1)" : "#070b14", cursor: "pointer" }}>
                        <div style={{ width: 24, height: 24, borderRadius: 4, background: bg.preview, border: "1px solid #334155", flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: bgType === bg.id ? "#f43f5e" : "#94a3b8" }}>{bg.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status bar */}
          <div style={{ padding: "7px 12px", borderTop: "1px solid #1e293b", fontSize: 10, color: "#334155", display: "flex", gap: 10 }}>
            <span>{gridCols}×{gridRows}m</span>
            <span>{tokens.length} tokens</span>
            <span>{walls.length} paredes</span>
            <span>{lights.filter(l => l.isOn).length} luzes</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Micro-styles ─────────────────────────────────────────────────────────────
const tbBtn: React.CSSProperties = { padding: "4px 6px", borderRadius: 5, border: "1px solid #1e293b", background: "transparent", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
const IBT:   React.CSSProperties = { padding: "4px 6px", borderRadius: 5, border: "1px solid #1e293b", background: "transparent", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
const LBL:   React.CSSProperties = { display: "block", fontSize: 10, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 };
const INP:   React.CSSProperties = { width: "100%", padding: "5px 8px", borderRadius: 5, border: "1px solid #1e293b", background: "#070b14", color: "#e2e8f0", fontSize: 12, outline: "none", marginBottom: 8, boxSizing: "border-box", fontFamily: "inherit" };
const SL:    React.CSSProperties = { fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, display: "block" };
