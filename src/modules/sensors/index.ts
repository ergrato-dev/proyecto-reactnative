/**
 * Barrel export del módulo `sensors`.
 *
 * @what Reexporta los componentes públicos del módulo para consumo
 *   desde otros módulos (principalmente `navigation/`).
 * @why Permite importar desde `@/modules/sensors` sin exponer la
 *   estructura interna del módulo.
 * @impact Cualquier cambio en los nombres de exportación aquí
 *   romperá los importadores en `navigation/navigators/RootDrawerNavigator.tsx`.
 */

export { StarMapScreen } from './screens/StarMapScreen';
export { useGyroscope } from './hooks/useGyroscope';
export { useAccelerometer } from './hooks/useAccelerometer';
export { BRIGHT_STARS, CONSTELLATIONS } from './data/stars';
export type { Star, Constellation } from './data/stars';
