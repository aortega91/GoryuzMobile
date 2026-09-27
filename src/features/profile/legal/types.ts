/**
 * Los documentos legales (Términos y Condiciones y Aviso de Privacidad) viven
 * aquí como datos, no como cadenas sueltas de i18n: son textos largos, con
 * listas y subsecciones, que se actualizan de golpe cuando legal firma una
 * versión nueva. Tenerlos en un solo módulo evita que una sección se quede a
 * medio actualizar en un idioma y que la app muestre dos versiones distintas
 * del mismo contrato.
 *
 * La versión vinculante es la española (son documentos mexicanos, redactados
 * conforme a la LFPDPPP y la LFPC). `LEGAL_DOCUMENT_LANGUAGE` marca ese hecho
 * para que la vista avise cuando la usuaria tiene la app en otro idioma.
 */

/** Un bloque de contenido dentro de una sección. */
export type LegalBlock =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] };

export interface LegalSection {
  /** Título de la sección. Vacío cuando el bloque continúa la anterior. */
  title?: string;
  /** `true` para numerales de segundo nivel (7.1, 8.2, …), que se indentan. */
  isSubsection?: boolean;
  blocks: LegalBlock[];
}

export interface LegalDocument {
  /** Título tal como aparece en el documento firmado. */
  title: string;
  /** Fecha de última actualización del documento vigente. */
  lastUpdated: string;
  /** Párrafos de cabecera, antes del articulado. */
  intro: LegalBlock[];
  sections: LegalSection[];
}

/** Idioma en el que están redactadas las versiones vinculantes. */
export const LEGAL_DOCUMENT_LANGUAGE = 'es';
