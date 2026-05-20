/**
 * Paleta de colores del sistema de diseño de CosmosRN.
 *
 * @what Define los tokens de color para los modos dark y light,
 *   manteniendo la estética espacial como hilo narrativo de la app.
 * @why Centralizar los colores evita valores mágicos dispersos y permite
 *   adaptar toda la UI con un único cambio de esquema.
 * @impact Consumido por `useTheme()`. Cualquier cambio aquí afecta a todos
 *   los componentes que usen el sistema de tema.
 */

/** Tokens de color compartidos (no dependen del esquema). */
export const COLORS_SHARED = {
  /** Azul cian primario — acento estelar. */
  primary: '#4fc3f7',
  /** Color sobre primario — máximo contraste. */
  onPrimary: '#050d24',
  /** Rojo de error / asteroides peligrosos. */
  error: '#ef9a9a',
  /** Éxito / verde orbital. */
  success: '#a5d6a7',
  /** Advertencia solar. */
  warning: '#ffe082',
} as const;

/** Paleta oscura — cielo nocturno (predeterminada). */
export const COLORS_DARK = {
  /** Fondo principal — vacío del espacio. */
  background: '#050d24',
  /** Superficie de tarjeta / panel. */
  surface: '#0d1b3e',
  /** Superficie elevada (modales, overlays). */
  surfaceElevated: '#152040',
  /** Texto principal — alta visibilidad. */
  text: '#e8eaf6',
  /** Texto secundario — subtítulos y metadatos. */
  textSecondary: '#90a4ae',
  /** Texto sobre superficie de acento. */
  textOnAccent: '#050d24',
  /** Borde sutil con transparencia. */
  border: 'rgba(79,195,247,0.2)',
  /** Sombra para tarjetas elevadas. */
  shadow: 'rgba(0,0,0,0.6)',
  ...COLORS_SHARED,
} as const;

/** Paleta clara — amanecer astronómico. */
export const COLORS_LIGHT = {
  /** Fondo principal — cielo al alba. */
  background: '#f0f4ff',
  /** Superficie de tarjeta. */
  surface: '#ffffff',
  /** Superficie elevada. */
  surfaceElevated: '#e8eeff',
  /** Texto principal. */
  text: '#0a1530',
  /** Texto secundario. */
  textSecondary: '#546e7a',
  /** Texto sobre superficie de acento. */
  textOnAccent: '#ffffff',
  /** Borde sutil. */
  border: 'rgba(79,195,247,0.35)',
  /** Sombra suave. */
  shadow: 'rgba(0,0,0,0.15)',
  ...COLORS_SHARED,
} as const;

/** Tipo derivado de los tokens de color disponibles en cualquier esquema.
 *  Usa `string` en los valores para ser compatible con ambas paletas (dark / light). */
export type AppColors = { [K in keyof typeof COLORS_DARK]: string };
