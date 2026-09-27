// ─────────────────────────────────────────────────────────────────────────────
// VERBATIM COPY of zena `src/constants/colorimetry.ts` (branch `preview`).
// Only the import path changed (`@/lib/colorimetry` → `./colorimetry`). The
// Spanish strings stay: `label`/`title` are what zena sends to the model in the
// `answers` text, so they must match byte for byte. The UI shows the i18n keys
// under `styles.colorimetry.*` instead. Re-sync when zena's file changes.
// ─────────────────────────────────────────────────────────────────────────────
import type { ColorimetryAnswers, SeasonKey } from "./colorimetry";

/**
 * Paletas de las 12 estaciones y el cuestionario que las alimenta.
 *
 * Las paletas están escritas a mano y no las genera la IA: la colorimetría es
 * una disciplina con paletas establecidas, y pedírselas al modelo en cada
 * análisis devolvía hex distintos para la misma estación. Aquí son estables,
 * gratis y comparables entre usuarios.
 */

export interface PaletteColor {
  hex: string;
  name: string;
}

export interface SeasonPalette {
  /** Nombre que ve el usuario. */
  label: string;
  /** Una línea sobre el carácter de la estación. */
  vibe: string;
  favor: PaletteColor[];
  avoid: PaletteColor[];
}

export const SEASON_PALETTES: Record<SeasonKey, SeasonPalette> = {
  clearSpring: {
    label: "Primavera Clara",
    vibe: "Colores limpios y vivos, con contraste.",
    favor: [
      { hex: "#FF6F61", name: "Coral vivo" },
      { hex: "#00A9A5", name: "Turquesa" },
      { hex: "#FFD166", name: "Amarillo sol" },
      { hex: "#3D7DCA", name: "Azul brillante" },
      { hex: "#F25278", name: "Frambuesa" },
      { hex: "#2E4057", name: "Azul marino cálido" },
    ],
    avoid: [
      { hex: "#8C8C8C", name: "Gris apagado" },
      { hex: "#6B705C", name: "Verde polvoriento" },
      { hex: "#4A2C2A", name: "Marrón oscuro" },
    ],
  },
  warmSpring: {
    label: "Primavera Cálida",
    vibe: "Tonos dorados y frutales, nada de frío.",
    favor: [
      { hex: "#E8871E", name: "Naranja miel" },
      { hex: "#7BB661", name: "Verde manzana" },
      { hex: "#F4C95D", name: "Mostaza suave" },
      { hex: "#E4572E", name: "Terracota viva" },
      { hex: "#2A9D8F", name: "Verde azulado cálido" },
      { hex: "#C8963E", name: "Oro viejo" },
    ],
    avoid: [
      { hex: "#000000", name: "Negro" },
      { hex: "#B0C4DE", name: "Azul hielo" },
      { hex: "#7D8CA3", name: "Gris azulado" },
    ],
  },
  lightSpring: {
    label: "Primavera Luminosa",
    vibe: "Pasteles cálidos y luz, sin peso.",
    favor: [
      { hex: "#FFB5A7", name: "Melocotón" },
      { hex: "#A8DADC", name: "Aguamarina claro" },
      { hex: "#FCD5CE", name: "Rosa cálido" },
      { hex: "#BDE0FE", name: "Azul cielo" },
      { hex: "#F6E27F", name: "Amarillo mantequilla" },
      { hex: "#C7D59F", name: "Verde tierno" },
    ],
    avoid: [
      { hex: "#000000", name: "Negro" },
      { hex: "#4B0082", name: "Morado profundo" },
      { hex: "#5C4033", name: "Chocolate" },
    ],
  },
  coolSummer: {
    label: "Verano Frío",
    vibe: "Azules y rosados con base fría.",
    favor: [
      { hex: "#5B7C99", name: "Azul acero" },
      { hex: "#B56576", name: "Rosa palo intenso" },
      { hex: "#6D6875", name: "Malva gris" },
      { hex: "#8AB0AB", name: "Verde agua" },
      { hex: "#3D5A80", name: "Azul marino frío" },
      { hex: "#C9ADA7", name: "Topo rosado" },
    ],
    avoid: [
      { hex: "#E8871E", name: "Naranja" },
      { hex: "#C8963E", name: "Dorado" },
      { hex: "#7BB661", name: "Verde lima" },
    ],
  },
  softSummer: {
    label: "Verano Suave",
    vibe: "Todo con un velo de gris encima.",
    favor: [
      { hex: "#9A8C98", name: "Lavanda gris" },
      { hex: "#6B8E7B", name: "Salvia" },
      { hex: "#A5A58D", name: "Verde oliva suave" },
      { hex: "#B98B82", name: "Rosa arcilla" },
      { hex: "#4A5859", name: "Gris pizarra" },
      { hex: "#8E9AAF", name: "Azul niebla" },
    ],
    avoid: [
      { hex: "#FF0000", name: "Rojo puro" },
      { hex: "#000000", name: "Negro" },
      { hex: "#FFD700", name: "Amarillo intenso" },
    ],
  },
  lightSummer: {
    label: "Verano Claro",
    vibe: "Pasteles fríos, delicados y claros.",
    favor: [
      { hex: "#CDB4DB", name: "Lila" },
      { hex: "#A2D2FF", name: "Azul bebé" },
      { hex: "#FFC8DD", name: "Rosa frío" },
      { hex: "#B8E0D2", name: "Menta" },
      { hex: "#8FA1B3", name: "Azul humo" },
      { hex: "#D5C6E0", name: "Glicinia" },
    ],
    avoid: [
      { hex: "#000000", name: "Negro" },
      { hex: "#E4572E", name: "Naranja quemado" },
      { hex: "#5C4033", name: "Marrón cálido" },
    ],
  },
  deepAutumn: {
    label: "Otoño Profundo",
    vibe: "Especias oscuras y tonos tierra intensos.",
    favor: [
      { hex: "#6F1D1B", name: "Burdeos" },
      { hex: "#3E5622", name: "Verde bosque" },
      { hex: "#8B5E34", name: "Canela" },
      { hex: "#432818", name: "Chocolate" },
      { hex: "#BB6B00", name: "Ámbar" },
      { hex: "#2F4550", name: "Petróleo" },
    ],
    avoid: [
      { hex: "#FFC8DD", name: "Rosa pastel" },
      { hex: "#A2D2FF", name: "Azul bebé" },
      { hex: "#C0C0C0", name: "Plata fría" },
    ],
  },
  warmAutumn: {
    label: "Otoño Cálido",
    vibe: "Hoja seca, cobre y mostaza.",
    favor: [
      { hex: "#C1440E", name: "Teja" },
      { hex: "#DDA15E", name: "Mostaza" },
      { hex: "#606C38", name: "Oliva" },
      { hex: "#9C6644", name: "Cobre" },
      { hex: "#BC6C25", name: "Calabaza" },
      { hex: "#283618", name: "Verde musgo" },
    ],
    avoid: [
      { hex: "#FF69B4", name: "Rosa chicle" },
      { hex: "#000000", name: "Negro" },
      { hex: "#B0C4DE", name: "Azul hielo" },
    ],
  },
  softAutumn: {
    label: "Otoño Suave",
    vibe: "Tierras apagadas, nada estridente.",
    favor: [
      { hex: "#A68A64", name: "Camel" },
      { hex: "#7F5539", name: "Avellana" },
      { hex: "#8A9A5B", name: "Verde salvia cálido" },
      { hex: "#B08968", name: "Arena tostada" },
      { hex: "#9E6240", name: "Ladrillo suave" },
      { hex: "#5E6472", name: "Gris cálido" },
    ],
    avoid: [
      { hex: "#FF0000", name: "Rojo puro" },
      { hex: "#00FFFF", name: "Cian" },
      { hex: "#FFFFFF", name: "Blanco óptico" },
    ],
  },
  clearWinter: {
    label: "Invierno Brillante",
    vibe: "Colores saturados y máximo contraste.",
    favor: [
      { hex: "#D00000", name: "Rojo puro" },
      { hex: "#0353A4", name: "Azul eléctrico" },
      { hex: "#006466", name: "Esmeralda" },
      { hex: "#FFFFFF", name: "Blanco óptico" },
      { hex: "#000000", name: "Negro" },
      { hex: "#C1121F", name: "Fucsia frío" },
    ],
    avoid: [
      { hex: "#DDA15E", name: "Mostaza" },
      { hex: "#A68A64", name: "Camel" },
      { hex: "#E8871E", name: "Naranja" },
    ],
  },
  coolWinter: {
    label: "Invierno Frío",
    vibe: "Joyas frías sobre base azulada.",
    favor: [
      { hex: "#1D3557", name: "Azul marino" },
      { hex: "#7B2CBF", name: "Púrpura" },
      { hex: "#006D77", name: "Verde jade" },
      { hex: "#9D0208", name: "Rojo vino frío" },
      { hex: "#CED4DA", name: "Gris perla" },
      { hex: "#D81E5B", name: "Magenta" },
    ],
    avoid: [
      { hex: "#DDA15E", name: "Mostaza" },
      { hex: "#BC6C25", name: "Calabaza" },
      { hex: "#C8963E", name: "Dorado viejo" },
    ],
  },
  deepWinter: {
    label: "Invierno Profundo",
    vibe: "Oscuros densos con acentos fríos.",
    favor: [
      { hex: "#0B132B", name: "Azul noche" },
      { hex: "#2D0A31", name: "Berenjena" },
      { hex: "#1B4332", name: "Verde pino" },
      { hex: "#5C0029", name: "Vino" },
      { hex: "#000000", name: "Negro" },
      { hex: "#1C6E8C", name: "Azul profundo" },
    ],
    avoid: [
      { hex: "#FFB5A7", name: "Melocotón" },
      { hex: "#F6E27F", name: "Amarillo suave" },
      { hex: "#C7D59F", name: "Verde tierno" },
    ],
  },
};

// ─── Cuestionario ─────────────────────────────────────────────────────────────

export interface QuestionOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
  /** Muestra de color, cuando la pregunta es sobre un tono. */
  swatch?: string;
}

export interface Question<K extends keyof ColorimetryAnswers> {
  id: K;
  title: string;
  subtitle: string;
  options: QuestionOption<ColorimetryAnswers[K]>[];
}

/**
 * Cuatro preguntas, ni una más: son las que capturan lo que la cámara no puede
 * leer con fiabilidad —la raíz sin teñir, los ojos y cómo responde la piel al
 * sol— más las venas, que es el desempate clásico cuando el subtono queda a
 * medio camino.
 */
export const COLORIMETRY_QUESTIONS = [
  {
    id: "sun",
    title: "¿Cómo reacciona tu piel al sol?",
    subtitle: "Piensa en el primer día de playa, sin protector alto.",
    options: [
      { value: "burns", label: "Me quemo y me cuesta broncearme" },
      { value: "both", label: "Me quemo primero, luego me bronceo" },
      { value: "tans", label: "Me bronceo con facilidad" },
    ],
  } as Question<"sun">,
  {
    id: "hair",
    title: "¿De qué color es tu pelo sin teñir?",
    subtitle: "El de la raíz, no el que llevas ahora.",
    options: [
      { value: "black", label: "Negro", swatch: "#1A1A1A" },
      { value: "darkBrown", label: "Castaño oscuro", swatch: "#3B2415" },
      { value: "lightBrown", label: "Castaño claro", swatch: "#8A5A2B" },
      { value: "blonde", label: "Rubio", swatch: "#D9B26A" },
      { value: "red", label: "Pelirrojo", swatch: "#A63A20" },
      { value: "grey", label: "Cano o gris", swatch: "#B8B8B8" },
    ],
  } as Question<"hair">,
  {
    id: "eyes",
    title: "¿Cómo son tus ojos?",
    subtitle: "Míralos de cerca con luz natural.",
    options: [
      { value: "goldFlecks", label: "Con motas doradas o miel", swatch: "#B8860B" },
      { value: "brown", label: "Marrones parejos", swatch: "#5B3A21" },
      { value: "green", label: "Verdes o avellana", swatch: "#5F8D4E" },
      { value: "blueGrey", label: "Azules o grises", swatch: "#6E8CA0" },
    ],
  } as Question<"eyes">,
  {
    id: "veins",
    title: "¿De qué color se ven tus venas?",
    subtitle: "En la cara interna de la muñeca, con luz natural.",
    options: [
      { value: "blue", label: "Azules o moradas", swatch: "#4A5FA5" },
      { value: "mixed", label: "Una mezcla de las dos", swatch: "#6A7BA2" },
      { value: "green", label: "Verdosas", swatch: "#5F7A4E" },
    ],
  } as Question<"veins">,
] as const;
