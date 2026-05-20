/**
 * Hook para obtener la lista de cuerpos del sistema solar.
 *
 * @what Envuelve `fetchAllBodies` en un `useQuery` de TanStack Query con
 *   caché de 24 horas y query key estandarizada.
 * @why Centraliza la lógica de fetching y caché del catálogo solar; cualquier
 *   pantalla que muestre la lista (FlatList o SectionList) consume este hook.
 * @impact Usado en `SolarCatalogScreen`. Cambios en `queryKey` o `staleTime`
 *   afectan directamente al comportamiento de caché de toda la lista.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchAllBodies } from '@/shared/lib/solarSystemClient';
import type { SolarBody } from '@/shared/lib/solarSystemClient';

/** Tiempo de validez de la caché de la lista de cuerpos: 24 horas */
export const BODY_LIST_STALE_TIME = 24 * 60 * 60 * 1000;

/**
 * Devuelve la lista completa de cuerpos del sistema solar con estado de carga y error.
 *
 * @what Llama a `fetchAllBodies` y expone `data`, `isLoading`, `isError`,
 *   `isFetching` y `refetch` mediante TanStack Query.
 * @why Evita duplicar la lógica de fetching y caché en cada componente que
 *   necesita el catálogo solar.
 * @impact Cualquier componente que use este hook comparte la misma entrada de caché
 *   `['solar-system', 'bodies']`.
 */
export function useBodyList() {
  return useQuery<SolarBody[], Error>({
    queryKey: ['solar-system', 'bodies'],
    queryFn: fetchAllBodies,
    staleTime: BODY_LIST_STALE_TIME,
  });
}
