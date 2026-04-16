/**
 * Datos del catálogo de módulos para la pantalla Home.
 *
 * @what Define la lista estática de módulos del showcase con nombre,
 *   descripción, caso de uso astronómico y estado por plataforma.
 * @why Centralizar los metadatos del catálogo evita duplicaciones y
 *   facilita agregar nuevos módulos en Fases futuras.
 * @impact Usado por HomeScreen para renderizar la lista de módulos;
 *   cambios aquí se reflejan automáticamente en la UI.
 */

export type PlatformStatus = 'ready' | 'pending' | 'not-applicable';

export interface ModuleCatalogItem {
  /** Identificador único del módulo (coincide con la carpeta en src/modules/) */
  id: string;
  /** Nombre legible del módulo */
  name: string;
  /** Caso de uso astronómico que justifica el módulo */
  astronomicalUseCase: string;
  /** Estado de implementación por plataforma */
  platforms: {
    android: PlatformStatus;
    web: PlatformStatus;
    ios: PlatformStatus;
  };
  /** Fase del plan de trabajo donde se implementa */
  phase: number;
}

/**
 * Catálogo completo de los 12 módulos del showcase CosmosRN.
 * Se actualiza conforme se completan las fases del PLAN_TRABAJO.md.
 */
export const MODULE_CATALOG: ModuleCatalogItem[] = [
  {
    id: 'navigation',
    name: 'Navegación',
    astronomicalUseCase: 'Navegar entre Planetas, ISS, APOD y Eventos',
    platforms: { android: 'ready', web: 'ready', ios: 'pending' },
    phase: 1,
  },
  {
    id: 'lists',
    name: 'Catálogo Solar',
    astronomicalUseCase: 'Catálogo de planetas, lunas y asteroides',
    platforms: { android: 'pending', web: 'pending', ios: 'pending' },
    phase: 2,
  },
  {
    id: 'forms',
    name: 'Formularios',
    astronomicalUseCase: 'Búsqueda de asteroides por fecha y distancia',
    platforms: { android: 'pending', web: 'pending', ios: 'pending' },
    phase: 3,
  },
  {
    id: 'animations',
    name: 'Animaciones',
    astronomicalUseCase: 'Órbitas planetarias y rotación 3D de planetas',
    platforms: { android: 'pending', web: 'pending', ios: 'pending' },
    phase: 4,
  },
  {
    id: 'camera',
    name: 'Cámara AR',
    astronomicalUseCase: 'Overlay de constelaciones apuntando al cielo',
    platforms: { android: 'pending', web: 'not-applicable', ios: 'pending' },
    phase: 5,
  },
  {
    id: 'maps',
    name: 'Mapas',
    astronomicalUseCase: 'Posición en tiempo real de la ISS',
    platforms: { android: 'ready', web: 'ready', ios: 'pending' },
    phase: 6,
  },
  {
    id: 'artemis',
    name: 'Programa Artemis',
    astronomicalUseCase: 'Misiones lunares y galería de imágenes NASA Artemis',
    platforms: { android: 'ready', web: 'ready', ios: 'pending' },
    phase: 13,
  },
  {
    id: 'storage',
    name: 'Almacenamiento',
    astronomicalUseCase: 'Caché de imágenes APOD y favoritos',
    platforms: { android: 'ready', web: 'ready', ios: 'pending' },
    phase: 7,
  },
  {
    id: 'notifications',
    name: 'Notificaciones',
    astronomicalUseCase: 'Alertas de tormentas solares y paso de la ISS',
    platforms: { android: 'ready', web: 'not-applicable', ios: 'pending' },
    phase: 8,
  },
  {
    id: 'sensors',
    name: 'Sensores',
    astronomicalUseCase: 'Giroscopio para mover el cielo estrellado',
    platforms: { android: 'pending', web: 'not-applicable', ios: 'pending' },
    phase: 9,
  },
  {
    id: 'auth',
    name: 'Autenticación',
    astronomicalUseCase: 'Perfil de observador con diario en Supabase',
    platforms: { android: 'pending', web: 'pending', ios: 'pending' },
    phase: 10,
  },
  {
    id: 'realtime',
    name: 'Tiempo Real',
    astronomicalUseCase: 'Posición ISS con Supabase Realtime broadcast',
    platforms: { android: 'pending', web: 'pending', ios: 'pending' },
    phase: 11,
  },
  {
    id: 'platform',
    name: 'Plataforma',
    astronomicalUseCase: 'Diferencias Android/Web/iOS en permisos y sensores',
    platforms: { android: 'pending', web: 'pending', ios: 'pending' },
    phase: 12,
  },
];
