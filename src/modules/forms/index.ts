/**
 * Barrel export del módulo `forms/`.
 *
 * @what Exporta los elementos públicos del módulo de formularios:
 *   pantalla principal, hook y schema de validación.
 * @why Mantener las importaciones de los consumidores (navegadores, tests)
 *   desacopladas de la estructura interna del módulo.
 * @impact `ExploreStack` importa `AsteroidSearchScreen` desde aquí.
 *   Cambiar el path de la pantalla requiere actualizar solo este archivo.
 */

export { AsteroidSearchScreen } from './screens/AsteroidSearchScreen';
export { useNeoWs } from './hooks/useNeoWs';
export { asteroidSearchSchema, type AsteroidSearchFormValues } from './schemas/asteroidSearchSchema';
export type { FlatAsteroid } from './hooks/useNeoWs';
