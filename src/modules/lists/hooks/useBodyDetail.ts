/**
 * Hook para obtener los datos detallados de un cuerpo celeste por ID.
 *
 * @what Envuelve `fetchBodyById` en un `useQuery` con caché de 24 horas,
 *   habilitado solo cuando `id` no está vacío.
 * @why La pantalla de detalle necesita los datos completos del cuerpo elegido;
 *   este hook evita duplicar la lógica de fetching y la query key.
 * @impact Usado en `BodyDetailScreen`. El parámetro `enabled` previene una
 *   petición inválida si el ID llega vacío por error de navegación.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchBodyById } from '@/shared/lib/solarSystemClient';
import type { SolarBody } from '@/shared/lib/solarSystemClient';

/** Tiempo de validez de la caché de detalle de cuerpo: 24 horas */
export const BODY_DETAIL_STALE_TIME = 24 * 60 * 60 * 1000;

/**
 * Devuelve los datos completos de un cuerpo celeste dado su ID.
 *
 * @what Llama a `fetchBodyById(id)` y expone `data`, `isLoading`, `isError`
 *   e `isFetching` mediante TanStack Query.
 * @why Centraliza la query de detalle para evitar peticiones duplicadas cuando
 *   el usuario navega varias veces a la misma pantalla de detalle.
 * @impact La query está deshabilitada si `id` está vacío, evitando peticiones
 *   innecesarias. Cambios en el `staleTime` afectan a todas las pantallas de detalle.
 *
 * @param id - ID del cuerpo celeste (ej. `"terre"`, `"mars"`)
 */
export function useBodyDetail(id: string) {
  return useQuery<SolarBody, Error>({
    queryKey: ['solar-system', 'body', id],
    queryFn: () => fetchBodyById(id),
    staleTime: BODY_DETAIL_STALE_TIME,
    // Previene petición si el ID llega vacío por un error de navegación
    enabled: id.length > 0,
  });
}
