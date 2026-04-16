/**
 * Barrel export del módulo `artemis`.
 *
 * @what Reexporta los componentes públicos del módulo para consumo
 *   desde otros módulos (principalmente `navigation/`).
 * @why Permite importar desde `@/modules/artemis` sin exponer la
 *   estructura interna del módulo.
 * @impact Cualquier cambio en los nombres de exportación de este archivo
 *   romperá los importadores en `navigation/navigators/ArtemisStack.tsx`.
 */

export { MissionStatusScreen } from './screens/MissionStatusScreen';
export { ArtemisGalleryScreen } from './screens/ArtemisGalleryScreen';
export { useArtemisImages } from './hooks/useArtemisImages';
export { ARTEMIS_MISSIONS } from './data/missions';
export type { ArtemisMission, MissionStatus } from './data/missions';
