/**
 * Hook para obtener y mantener actualizada la posición de la ISS.
 *
 * @what Usa TanStack Query con `refetchInterval` de 5 s para hacer polling
 *   continuo a Open-Notify y exponer la posición geográfica actual de la ISS.
 * @why El módulo `maps/` necesita coordenadas actualizadas para mover el
 *   marcador en el mapa en tiempo casi real sin gestionar timers manualmente.
 * @impact Cualquier cambio en `staleTime` o `refetchInterval` afecta directamente
 *   la frecuencia de actualización del marcador ISS en `ISSMapScreen`.
 *   Depende de `issClient.fetchIssPosition`.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchIssPosition } from '@/shared/lib/issClient';
import type { IssNowResponse } from '@/shared/lib/issClient';

/** Intervalo de polling en milisegundos — la ISS viaja ~7.7 km/s */
const POLLING_INTERVAL_MS = 5_000;

/** Número máximo de puntos de trayectoria a conservar */
export const MAX_TRAJECTORY_POINTS = 120;

/**
 * Coordenadas geográficas de la ISS como números (no strings).
 */
export interface IssCoordinates {
  latitude: number;
  longitude: number;
  timestamp: number;
}

/**
 * Convierte la respuesta del cliente ISS a coordenadas numéricas.
 *
 * @what Parsea los strings de latitud/longitud de la respuesta a `number`.
 * @why La API devuelve coordenadas como strings; react-native-maps necesita
 *   `number` para `MapView.region` y `Marker.coordinate`.
 * @impact Usado exclusivamente por `useIssPosition`; cambios aquí requieren
 *   actualizar los tests de conversión.
 *
 * @param response - Respuesta cruda del cliente ISS
 * @returns Coordenadas numéricas con timestamp
 */
export function toCoordinates(response: IssNowResponse): IssCoordinates {
  return {
    latitude: parseFloat(response.iss_position.latitude),
    longitude: parseFloat(response.iss_position.longitude),
    timestamp: response.timestamp,
  };
}

/**
 * Hook que hace polling de la posición ISS cada 5 segundos.
 *
 * @what Llama a `fetchIssPosition` vía TanStack Query con `refetchInterval`.
 * @why Encapsula la lógica de polling en un hook reutilizable para que
 *   `ISSMapScreen` solo consuma `{ coordinates, isLoading, isError }`.
 * @impact Si se cambia a `staleTime: 0`, cada suscripción adicional lanzará
 *   una petición extra; mantener una única instancia del hook por pantalla.
 *
 * @returns Estado de la query con coordenadas numéricas parseadas
 */
export function useIssPosition() {
  const query = useQuery({
    queryKey: ['iss', 'position'],
    queryFn: fetchIssPosition,
    staleTime: 0,
    refetchInterval: POLLING_INTERVAL_MS,
    select: toCoordinates,
  });

  return {
    coordinates: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
