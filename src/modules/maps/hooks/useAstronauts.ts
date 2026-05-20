/**
 * Hook para obtener la lista de personas actualmente en el espacio.
 *
 * @what Usa TanStack Query para llamar a `fetchAstronauts` de `issClient`
 *   y exponer nombre + nave de cada tripulante activo.
 * @why La tripulación cambia raramente (cada pocos meses); staleTime de 1 h
 *   evita peticiones innecesarias sin perder frescura de datos.
 * @impact Depende de `issClient.fetchAstronauts`. Usado en `AstronautsScreen`.
 *   Cambiar el staleTime afecta cuándo se refresca la lista en fondo.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchAstronauts } from '@/shared/lib/issClient';
import type { Astronaut } from '@/shared/lib/issClient';

export type { Astronaut };

/**
 * Hook que obtiene la tripulación actual en el espacio.
 *
 * @what Llama a `fetchAstronauts` con staleTime de 1 h.
 * @why El módulo `maps/` muestra la lista de astronautas junto al mapa ISS;
 *   no es necesario refrescar tan frecuentemente como la posición.
 * @impact Cambios en la estructura de `Astronaut` (issClient) rompen este hook
 *   y `AstronautsScreen`. Requiere actualizar los tests correspondientes.
 *
 * @returns Lista de astronautas, conteo total y estado de la query
 */
export function useAstronauts() {
  const query = useQuery({
    queryKey: ['iss', 'astronauts'],
    queryFn: fetchAstronauts,
    staleTime: 60 * 60 * 1_000, // 1 hora
  });

  return {
    astronauts: query.data?.people ?? [],
    count: query.data?.number ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
