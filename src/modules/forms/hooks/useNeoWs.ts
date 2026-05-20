/**
 * Hook `useNeoWs` — búsqueda de asteroides cercanos a la Tierra.
 *
 * @what Envuelve `fetchNeoWsFeed` con TanStack Query y aplana la respuesta
 *   agrupada por fecha en un array plano de asteroides ordenado por
 *   fecha de aproximación.
 * @why El formulario necesita un array plano para renderizar en FlatList;
 *   la API devuelve un objeto indexado por fecha que debe transformarse.
 * @impact Depende de `nasaClient.fetchNeoWsFeed`. Cambiar la query key
 *   invalida la caché compartida con otras pantallas que usen NeoWs.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchNeoWsFeed, type NeoWsAsteroid } from '@/shared/lib/nasaClient';

// ─── Constantes ───────────────────────────────────────────────────────────────

/** staleTime para NeoWs: los datos de una búsqueda no cambian durante 30 minutos */
const NEOWS_STALE_TIME = 30 * 60 * 1000;

// ─── Tipos exportados ─────────────────────────────────────────────────────────

/** Asteroide aplanado con la fecha de aproximación incluida */
export interface FlatAsteroid extends NeoWsAsteroid {
  /** Fecha de aproximación en formato YYYY-MM-DD (clave del grupo original) */
  approachDate: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Ejecuta la búsqueda de asteroides NeoWs y devuelve un array plano.
 *
 * @what Llama a `fetchNeoWsFeed(startDate, endDate)` y transforma el resultado
 *   en `FlatAsteroid[]` ordenado por fecha de aproximación ascendente.
 * @why La pantalla `AsteroidSearchScreen` usa FlatList que espera un array
 *   plano; la agrupación por fecha de la API no sirve directamente.
 * @impact La query se deshabilita automáticamente cuando `startDate` o
 *   `endDate` están vacíos, evitando llamadas con parámetros inválidos.
 *
 * @param startDate - Fecha de inicio YYYY-MM-DD (vacío = query deshabilitada)
 * @param endDate   - Fecha de fin YYYY-MM-DD (vacío = query deshabilitada)
 */
export function useNeoWs(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['nasa', 'neows', startDate, endDate],
    queryFn: async (): Promise<FlatAsteroid[]> => {
      const response = await fetchNeoWsFeed(startDate, endDate);

      // Aplanar el objeto agrupado por fecha en un array plano con approachDate
      const flat: FlatAsteroid[] = [];
      for (const [date, asteroids] of Object.entries(response.near_earth_objects)) {
        for (const asteroid of asteroids) {
          flat.push({ ...asteroid, approachDate: date });
        }
      }

      // Ordenar por fecha de aproximación ascendente
      flat.sort((a, b) => a.approachDate.localeCompare(b.approachDate));
      return flat;
    },
    staleTime: NEOWS_STALE_TIME,
    enabled: startDate.length > 0 && endDate.length > 0,
  });
}
