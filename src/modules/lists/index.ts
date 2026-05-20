/**
 * Módulo `lists` — Catálogo del sistema solar.
 *
 * @what Exporta las pantallas y hooks del módulo de catálogo solar:
 *   `SolarCatalogScreen`, `BodyDetailScreen`, `useBodyList`, `useBodyDetail`.
 * @why Centralizar las exportaciones permite al ExploreStack importar las pantallas
 *   reales de este módulo sin conocer la estructura interna de carpetas.
 * @impact Al agregar nuevas pantallas o hooks al módulo, deben exportarse aquí.
 *   El ExploreStack y cualquier test de integración importan desde este barrel.
 */

export { SolarCatalogScreen } from './screens/SolarCatalogScreen';
export { BodyDetailScreen } from './screens/BodyDetailScreen';
export { useBodyList } from './hooks/useBodyList';
export { useBodyDetail } from './hooks/useBodyDetail';
