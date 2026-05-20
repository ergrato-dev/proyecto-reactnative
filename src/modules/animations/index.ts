/**
 * @what Barrel de exportación del módulo de animaciones.
 * @why Permite importar desde `@/modules/animations` sin conocer la estructura interna,
 *   siguiendo el patrón de módulo autónomo del proyecto.
 * @impact Cualquier pantalla o componente que use este módulo debe importar únicamente
 *   desde este barrel para mantener el encapsulamiento.
 */

export { OrbitScreen } from './screens/OrbitScreen';
export { OrbitingPlanet } from './components/OrbitingPlanet';
export { useOrbitAnimation } from './hooks/useOrbitAnimation';
export { PLANETS } from './data/planets';
export type { PlanetData } from './data/planets';
