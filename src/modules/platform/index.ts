/**
 * @what Barrel de exportación del módulo de plataforma.
 * @why Permite importar desde `@/modules/platform` sin conocer la estructura interna,
 *   siguiendo el patrón de módulo autónomo del proyecto.
 * @impact Cambios en este barrel afectan a cualquier consumidor del módulo
 *   (actualmente solo RootDrawerNavigator).
 */

export { PlatformShowcaseScreen } from './screens/PlatformShowcaseScreen';
export { DifferenceCard } from './components/DifferenceCard';
export { usePlatformCapabilities } from './hooks/usePlatformCapabilities';
export { PLATFORM_DIFFERENCES, getCurrentPlatform } from './data/differences';
export type { PlatformDifference, SupportedPlatform, SupportLevel } from './data/differences';
