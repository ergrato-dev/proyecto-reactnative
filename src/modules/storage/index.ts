/**
 * Módulo `storage/` — APOD viewer con caché offline y favoritos.
 *
 * @what Demuestra el uso de AsyncStorage (vía @react-native-async-storage)
 *   combinado con TanStack Query para persistir datos entre sesiones y
 *   ofrecer contenido offline. Incluye gestión de caché y favoritos.
 * @why El módulo de almacenamiento es el núcleo de la experiencia offline de
 *   CosmosRN: sin él, la app no funciona sin conexión ni recuerda preferencias.
 * @impact Las pantallas exportadas reemplazan los placeholders en `APODStack`.
 *   Los hooks son reutilizables desde cualquier módulo que necesite persistencia.
 */

// Pantallas
export { APODDetailScreen } from './screens/APODDetailScreen';
export { APODGalleryScreen } from './screens/APODGalleryScreen';

// Hooks
export { useApod } from './hooks/useApod';
export { useFavorites } from './hooks/useFavorites';
export { useSearchHistory } from './hooks/useSearchHistory';

// Utilidades de caché
export {
  persistApod,
  readPersistedApod,
  listApodCacheKeys,
  clearApodCache,
} from './hooks/useApod';

// Componentes
export { ApodMedia, ApodLoadingPlaceholder } from './components/ApodMedia';
