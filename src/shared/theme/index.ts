/**
 * Módulo de tema — CosmosRN design system.
 *
 * @what Exporta los tokens de color, los tipos y el hook `useTheme` del sistema
 *   de diseño oscuro/claro de la app.
 * @why Punto único de importación para cualquier componente que necesite adaptar
 *   su estilo al esquema activo del dispositivo.
 * @impact Añadir o cambiar tokens aquí afecta todos los consumidores de `useTheme`.
 */
export { COLORS_DARK, COLORS_LIGHT, COLORS_SHARED } from './colors';
export type { AppColors } from './colors';
export { useTheme } from './useTheme';
