/* eslint-disable prefer-exponentiation-operator, no-restricted-properties, no-continue, no-restricted-syntax, prefer-template */
// ─────────────────────────────────────────────────────────────────────────────
// VERBATIM COPY of zena `src/lib/colorimetry.ts` (branch `preview`).
// Do NOT edit the logic below: the mobile colour test must classify exactly
// like the web one. When zena's file changes, re-copy it over everything under
// this header and re-run the equivalence check. The lint rules the source
// breaks are disabled above so the body stays byte-identical to zena's.
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Matemática de la colorimetría: de píxeles a estación cromática.
 *
 * Todo aquí es puro y determinista a propósito. La cámara mide lo que la cámara
 * sabe medir —el subtono y la claridad de la piel bajo la luz real— y el
 * cuestionario aporta lo que una foto no puede leer con fiabilidad: el color de
 * raíz sin teñir, el de los ojos y cómo reacciona la piel al sol. La estación
 * sale de cruzar las dos cosas, no de una corazonada del modelo.
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export interface Lab {
  /** Claridad, 0 (negro) a 100 (blanco). */
  l: number;
  /** Eje verde(−) ↔ rojo(+). */
  a: number;
  /** Eje azul(−) ↔ amarillo(+). En piel es el que delata el subtono. */
  b: number;
}

// ─── Conversión de color ──────────────────────────────────────────────────────

/** sRGB (0-255) a lineal (0-1), deshaciendo la corrección gamma. */
const toLinear = (channel: number) => {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

/** Punto blanco D65, el del sRGB. */
const WHITE_D65 = { x: 95.047, y: 100.0, z: 108.883 };

const labF = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);

/**
 * sRGB → CIELAB. Se usa LAB y no HSV porque en LAB la distancia entre dos
 * colores se parece a la que percibe el ojo, que es justo lo que hace falta
 * para decir "esta prenda es de este tono".
 */
export const rgbToLab = ({ r, g, b }: Rgb): Lab => {
  const rl = toLinear(r) * 100;
  const gl = toLinear(g) * 100;
  const bl = toLinear(b) * 100;

  const x = (rl * 0.4124 + gl * 0.3576 + bl * 0.1805) / WHITE_D65.x;
  const y = (rl * 0.2126 + gl * 0.7152 + bl * 0.0722) / WHITE_D65.y;
  const z = (rl * 0.0193 + gl * 0.1192 + bl * 0.9505) / WHITE_D65.z;

  const fx = labF(x);
  const fy = labF(y);
  const fz = labF(z);

  return { l: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
};

export const hexToRgb = (hex: string): Rgb | null => {
  const clean = hex.replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
};

/** Distancia perceptual entre dos colores (CIE76). Bajo = se parecen. */
export const deltaE = (a: Lab, b: Lab) =>
  Math.sqrt((a.l - b.l) ** 2 + (a.a - b.a) ** 2 + (a.b - b.b) ** 2);

// ─── Lectura de la foto ───────────────────────────────────────────────────────

/** Recuadro relativo (0-1) sobre la imagen, para muestrear una zona. */
export interface Patch {
  x: number;
  y: number;
  size: number;
}

/**
 * Zonas de piel limpia, en coordenadas relativas al óvalo de la guía.
 *
 * El óvalo es lo que permite saber dónde está la cara sin detectar puntos
 * faciales: si la cara encaja dentro, la frente y las mejillas caen siempre por
 * aquí. Se evitan cejas, ojos, labios y el filo de la mandíbula, que es donde
 * se acumulan sombras.
 */
export const SKIN_PATCHES: Patch[] = [
  { x: 0.5, y: 0.24, size: 0.12 }, // frente
  { x: 0.27, y: 0.55, size: 0.11 }, // mejilla izquierda
  { x: 0.73, y: 0.55, size: 0.11 }, // mejilla derecha
];

/**
 * Promedia una zona descartando el 20% más claro y el 20% más oscuro.
 *
 * Ese recorte es lo que quita el brillo especular (la luz reflejada en la
 * nariz o la frente) y las sombras, que si entran en la media desplazan el
 * subtono y arruinan la lectura.
 */
export const averagePatch = (
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  patch: Patch
): Rgb | null => {
  const half = (patch.size * Math.min(width, height)) / 2;
  const cx = patch.x * width;
  const cy = patch.y * height;

  const samples: { rgb: Rgb; luma: number }[] = [];
  for (let y = Math.max(0, Math.round(cy - half)); y < Math.min(height, cy + half); y++) {
    for (let x = Math.max(0, Math.round(cx - half)); x < Math.min(width, cx + half); x++) {
      const i = (y * width + x) * 4;
      const rgb = { r: pixels[i], g: pixels[i + 1], b: pixels[i + 2] };
      samples.push({ rgb, luma: 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b });
    }
  }
  if (samples.length === 0) return null;

  samples.sort((p, q) => p.luma - q.luma);
  const from = Math.floor(samples.length * 0.2);
  const to = Math.ceil(samples.length * 0.8);
  const kept = samples.slice(from, to);
  if (kept.length === 0) return null;

  const sum = kept.reduce(
    (acc, s) => ({ r: acc.r + s.rgb.r, g: acc.g + s.rgb.g, b: acc.b + s.rgb.b }),
    { r: 0, g: 0, b: 0 }
  );
  return {
    r: Math.round(sum.r / kept.length),
    g: Math.round(sum.g / kept.length),
    b: Math.round(sum.b / kept.length),
  };
};

/** Luminosidad media de un fotograma, 0 a 1. Alimenta el medidor de luz. */
export const frameLuminance = (pixels: Uint8ClampedArray): number => {
  let total = 0;
  let count = 0;
  // Se salta píxeles: para una media no hace falta mirarlos todos y así el
  // medidor puede correr en cada fotograma sin comerse la batería.
  for (let i = 0; i < pixels.length; i += 4 * 16) {
    total += 0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2];
    count++;
  }
  return count === 0 ? 0 : total / count / 255;
};

/** Umbrales del medidor de luz, calibrados sobre la media del fotograma. */
export const LIGHT_LEVELS = { dark: 0.28, bright: 0.82 } as const;

export type LightVerdict = "dark" | "ok" | "bright";

export const judgeLight = (luminance: number): LightVerdict =>
  luminance < LIGHT_LEVELS.dark ? "dark" : luminance > LIGHT_LEVELS.bright ? "bright" : "ok";

// ─── Cuestionario ─────────────────────────────────────────────────────────────

export type SunReaction = "burns" | "both" | "tans";
export type HairTone = "black" | "darkBrown" | "lightBrown" | "blonde" | "red" | "grey";
export type EyeTone = "goldFlecks" | "brown" | "green" | "blueGrey";
export type VeinTone = "blue" | "mixed" | "green";

export interface ColorimetryAnswers {
  sun: SunReaction;
  hair: HairTone;
  eyes: EyeTone;
  veins: VeinTone;
}

/** Cuánto tira al cálido cada respuesta, de −1 (frío) a +1 (cálido). */
const WARMTH: Record<string, number> = {
  burns: -1,
  both: 0,
  tans: 1,
  black: -0.4,
  darkBrown: 0.1,
  lightBrown: 0.5,
  blonde: 0.3,
  red: 1,
  grey: -0.6,
  goldFlecks: 1,
  brown: 0.4,
  green: 0.5,
  blueGrey: -1,
  blue: -1,
  mixed: 0,
  green_vein: 1,
};

/** Claridad de referencia (L*) del pelo, para medir el contraste con la piel. */
const HAIR_LIGHTNESS: Record<HairTone, number> = {
  black: 12,
  darkBrown: 25,
  lightBrown: 45,
  blonde: 70,
  red: 45,
  grey: 68,
};

// ─── Clasificación ────────────────────────────────────────────────────────────

export type SeasonFamily = "spring" | "summer" | "autumn" | "winter";

/**
 * Las 12 estaciones, como valores y no solo como tipo: los esquemas de salida
 * de la IA las necesitan en tiempo de ejecución para forzar el enum, y así el
 * modelo no puede devolver una estación que el catálogo de paletas no conozca.
 */
export const SEASON_KEYS = [
  "clearSpring",
  "warmSpring",
  "lightSpring",
  "coolSummer",
  "softSummer",
  "lightSummer",
  "deepAutumn",
  "warmAutumn",
  "softAutumn",
  "clearWinter",
  "coolWinter",
  "deepWinter",
] as const;

export type SeasonKey = (typeof SEASON_KEYS)[number];

export interface ColorimetryMeasurement {
  /** LAB medio de la piel limpia. */
  skin: Lab;
  /** Hex de ese promedio, para poder enseñárselo al usuario. */
  skinHex: string;
}

export interface ColorimetryVerdict {
  season: SeasonKey;
  family: SeasonFamily;
  undertone: "warm" | "cool" | "neutral";
  depth: "light" | "medium" | "deep";
  contrast: "low" | "medium" | "high";
  /** 0 a 1. Baja cuando la cámara y el cuestionario no se ponen de acuerdo. */
  confidence: number;
  /** En qué se basó, para poder explicárselo al usuario. */
  reasons: string[];
}

const VARIANTS: Record<SeasonFamily, Record<"high" | "medium" | "low", SeasonKey>> = {
  spring: { high: "clearSpring", medium: "warmSpring", low: "lightSpring" },
  summer: { high: "coolSummer", medium: "softSummer", low: "lightSummer" },
  autumn: { high: "deepAutumn", medium: "warmAutumn", low: "softAutumn" },
  winter: { high: "clearWinter", medium: "coolWinter", low: "deepWinter" },
};

/**
 * Cruza la medición de la cámara con el cuestionario.
 *
 * El subtono lo manda la cámara (pesa 60%): es lo que mejor sabe leer un sensor
 * bajo luz real. El cuestionario pesa el 40% restante y es el único que aporta
 * el pelo de raíz y los ojos, de donde sale el contraste. Cuando ambos se
 * contradicen la confianza baja, y eso se le dice al usuario en vez de fingir
 * un resultado rotundo.
 */
export const classifySeason = (
  measurement: ColorimetryMeasurement,
  answers: ColorimetryAnswers
): ColorimetryVerdict => {
  const { skin } = measurement;
  const reasons: string[] = [];

  // b* alto = amarillo = cálido. Se normaliza sobre el rango habitual de piel.
  const cameraWarmth = Math.max(-1, Math.min(1, (skin.b - 16) / 10));

  const answerWarmth =
    (WARMTH[answers.sun] +
      WARMTH[answers.hair] +
      WARMTH[answers.eyes] +
      WARMTH[answers.veins === "green" ? "green_vein" : answers.veins]) /
    4;

  const warmth = cameraWarmth * 0.6 + answerWarmth * 0.4;
  const undertone = warmth > 0.15 ? "warm" : warmth < -0.15 ? "cool" : "neutral";

  reasons.push(
    cameraWarmth > 0
      ? "La cámara leyó matices dorados en tu piel."
      : "La cámara leyó matices rosados en tu piel."
  );
  if (Math.sign(cameraWarmth) !== Math.sign(answerWarmth) && answerWarmth !== 0) {
    reasons.push("Tus respuestas apuntaban al lado contrario, así que el resultado es mixto.");
  }

  const depth: ColorimetryVerdict["depth"] =
    skin.l >= 65 ? "light" : skin.l >= 48 ? "medium" : "deep";

  // Contraste = distancia de claridad entre pelo y piel. Es lo que separa a un
  // "clara" de un "profunda" dentro de la misma familia.
  const gap = Math.abs(skin.l - HAIR_LIGHTNESS[answers.hair]);
  const contrast: ColorimetryVerdict["contrast"] =
    gap >= 42 ? "high" : gap >= 24 ? "medium" : "low";
  reasons.push(
    contrast === "high"
      ? "Hay mucha diferencia entre tu pelo y tu piel: aguantas colores rotundos."
      : contrast === "low"
        ? "Tu pelo y tu piel están cerca en claridad: te sientan mejor los tonos suaves."
        : "Tu pelo y tu piel tienen una diferencia media."
  );

  // Familia: el subtono elige el lado cálido o frío; la profundidad, si es la
  // versión luminosa o la oscura.
  const isWarm = undertone === "warm" || (undertone === "neutral" && warmth >= 0);
  const isDeep = depth === "deep" || (depth === "medium" && contrast === "high");
  const family: SeasonFamily = isWarm
    ? isDeep
      ? "autumn"
      : "spring"
    : isDeep
      ? "winter"
      : "summer";

  const confidence = Math.max(
    0.35,
    Math.min(1, 0.55 + Math.abs(warmth) * 0.35 + (undertone === "neutral" ? -0.1 : 0.1))
  );

  return {
    season: VARIANTS[family][contrast],
    family,
    undertone,
    depth,
    contrast,
    confidence: Math.round(confidence * 100) / 100,
    reasons,
  };
};

// ─── Color dominante de una prenda ────────────────────────────────────────────

/** Por encima de esta claridad se considera fondo y no prenda. */
const BACKGROUND_L = 92;

/** Lado del cubo LAB en el que se agrupan los píxeles para votar el dominante. */
const BIN_SIZE = 10;

/**
 * Color dominante de una prenda a partir de su recorte.
 *
 * Las prendas del clóset se guardan recortadas sobre blanco, así que el fondo
 * se descarta por claridad y lo que queda es la prenda.
 *
 * Se vota, no se promedia. Promediar convierte cualquier estampado en el punto
 * medio de sus colores —un pantalón blanco y negro daba un gris que no existe
 * en la prenda, y ese gris inventado luego encajaba en gamas a las que la
 * prenda no pertenece—. Agrupando los píxeles en cubos de LAB y quedándose con
 * el más poblado sale el tono que de verdad domina la prenda.
 */
export const dominantColorFromPixels = (pixels: Uint8ClampedArray): Lab | null => {
  const bins = new Map<string, { l: number; a: number; b: number; n: number }>();

  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < 128) continue; // transparente
    const lab = rgbToLab({ r: pixels[i], g: pixels[i + 1], b: pixels[i + 2] });
    if (lab.l > BACKGROUND_L) continue; // fondo blanco

    const key = `${Math.round(lab.l / BIN_SIZE)}|${Math.round(lab.a / BIN_SIZE)}|${Math.round(
      lab.b / BIN_SIZE
    )}`;
    const bin = bins.get(key);
    if (bin) {
      bin.l += lab.l;
      bin.a += lab.a;
      bin.b += lab.b;
      bin.n++;
    } else {
      bins.set(key, { l: lab.l, a: lab.a, b: lab.b, n: 1 });
    }
  }

  let winner: { l: number; a: number; b: number; n: number } | null = null;
  for (const bin of bins.values()) {
    if (!winner || bin.n > winner.n) winner = bin;
  }

  if (!winner) return null;
  return { l: winner.l / winner.n, a: winner.a / winner.n, b: winner.b / winner.n };
};

// ─── Cruce de un color de la paleta con el clóset ──────────────────────────────

/** Cuánto color tiene un tono, al margen de lo claro u oscuro que sea. */
export const chroma = ({ a, b }: Lab) => Math.hypot(a, b);

/** Ángulo de tono en grados (0-360). Solo tiene sentido si hay croma. */
export const hueAngle = ({ a, b }: Lab) => ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;

/** Por debajo de este croma un tono se lee como neutro: negro, gris o blanco. */
const NEUTRAL_CHROMA = 9;
/** Distancia perceptual máxima para dar dos tonos por parecidos. */
const MAX_DISTANCE = 30;
/** Diferencia de tono máxima, en grados, entre dos colores con color. */
const MAX_HUE_GAP = 45;
/** Diferencia de claridad máxima entre dos neutros: el negro no es el blanco. */
const MAX_NEUTRAL_LIGHTNESS_GAP = 22;

/** Diferencia entre dos ángulos de tono, por el lado corto del círculo. */
const hueGap = (a: number, b: number) => {
  const raw = Math.abs(a - b) % 360;
  return raw > 180 ? 360 - raw : raw;
};

/**
 * ¿Esta prenda es de este color? Devuelve la distancia si lo es, o `null`.
 *
 * La distancia por sí sola no basta. Un azul marino apagado y un negro están a
 * ~17 de distancia, por debajo de cualquier umbral razonable, así que al tocar
 * "Azul marino" salían las prendas negras: el resultado se leía como que la app
 * no distingue colores. Lo que los separa no es cuánto, sino qué: uno tiene
 * color y el otro no. Por eso primero se decide si cada tono es neutro o
 * cromático, y solo se comparan entre iguales —dos neutros por claridad, dos
 * cromáticos además por ángulo de tono—.
 */
export const colorDistance = (target: Lab, garment: Lab): number | null => {
  const targetNeutral = chroma(target) < NEUTRAL_CHROMA;
  const garmentNeutral = chroma(garment) < NEUTRAL_CHROMA;

  // Un neutro nunca es una prenda de color, ni al revés.
  if (targetNeutral !== garmentNeutral) return null;

  const distance = deltaE(target, garment);

  if (targetNeutral) {
    return Math.abs(target.l - garment.l) <= MAX_NEUTRAL_LIGHTNESS_GAP ? distance : null;
  }

  if (hueGap(hueAngle(target), hueAngle(garment)) > MAX_HUE_GAP) return null;
  return distance <= MAX_DISTANCE ? distance : null;
};

/** LAB de vuelta a hex, para poder pintar el color que se calculó. */
export const labToHex = ({ l, a, b }: Lab): string => {
  const fy = (l + 16) / 116;
  const fx = fy + a / 500;
  const fz = fy - b / 200;
  const inv = (t: number) => (t ** 3 > 0.008856 ? t ** 3 : (t - 16 / 116) / 7.787);

  const x = (inv(fx) * WHITE_D65.x) / 100;
  const y = (inv(fy) * WHITE_D65.y) / 100;
  const z = (inv(fz) * WHITE_D65.z) / 100;

  const toSrgb = (c: number) => {
    const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    return Math.round(Math.max(0, Math.min(1, v)) * 255);
  };

  const r = toSrgb(x * 3.2406 + y * -1.5372 + z * -0.4986);
  const g = toSrgb(x * -0.9689 + y * 1.8758 + z * 0.0415);
  const bb = toSrgb(x * 0.0557 + y * -0.204 + z * 1.057);
  return "#" + [r, g, bb].map((c) => c.toString(16).padStart(2, "0")).join("");
};
