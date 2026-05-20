/**
 * Barrel export del módulo `maps/`.
 *
 * @what Exporta todas las pantallas y hooks públicos del módulo de rastreo ISS.
 * @why Centraliza los imports para que la capa de navegación solo dependa de
 *   `@/modules/maps`, no de rutas internas del módulo.
 * @impact Al añadir nuevas pantallas o hooks, registrarlos aquí.
 *   Depende de react-native-maps@1.27.2 y @tanstack/react-query.
 */

export { ISSMapScreen } from './screens/ISSMapScreen';
export { AstronautsScreen } from './screens/AstronautsScreen';
export { useIssPosition } from './hooks/useIssPosition';
export { useAstronauts } from './hooks/useAstronauts';
export type { IssCoordinates } from './hooks/useIssPosition';
export type { Astronaut } from './hooks/useAstronauts';
