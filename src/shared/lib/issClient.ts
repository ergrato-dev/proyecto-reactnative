/**
 * Cliente HTTP centralizado para la API Open-Notify (ISS y astronautas).
 *
 * @what Exporta funciones tipadas para obtener la posición en tiempo real
 *   de la ISS y la lista de tripulantes actuales en el espacio.
 * @why Centralizar las llamadas evita duplicar el manejo del protocolo HTTP
 *   (la API solo sirve HTTP, no HTTPS) en múltiples hooks del módulo `maps/`.
 * @impact Todos los hooks del módulo `maps/` y `realtime/` dependen de este cliente.
 *   Requiere `android:usesCleartextTraffic` en Android ≥ 9 (configurado en app.json).
 *   No requiere autenticación.
 */

/**
 * URL base de Open-Notify.
 *
 * NOTA DE SEGURIDAD: esta API solo sirve HTTP (no HTTPS). En Android ≥ 9
 * se requiere habilitar `android.usesCleartextTraffic` en app.json bajo
 * `android.infoPlist` o mediante un network_security_config.xml.
 * Se documenta en constraints.md (RC-02.3).
 */
const ISS_BASE_URL = 'http://api.open-notify.org';

// ─── Tipos de respuesta ────────────────────────────────────────────────────────

/** Posición geográfica de la ISS en un instante dado */
export interface IssPosition {
  /** Latitud en grados decimales (-90 a 90) */
  latitude: string;
  /** Longitud en grados decimales (-180 a 180) */
  longitude: string;
}

/** Respuesta completa del endpoint iss-now */
export interface IssNowResponse {
  message: 'success' | 'error';
  timestamp: number;
  iss_position: IssPosition;
}

/** Un tripulante actualmente en el espacio */
export interface Astronaut {
  name: string;
  craft: string;
}

/** Respuesta del endpoint de astronautas */
export interface AstronautsResponse {
  message: 'success' | 'error';
  number: number;
  people: Astronaut[];
}

// ─── Funciones del cliente ────────────────────────────────────────────────────

/**
 * Obtiene la posición actual de la ISS en tiempo real.
 *
 * @what Llama a `/iss-now.json` y devuelve la posición geográfica inmediata.
 * @why El módulo `maps/` necesita este endpoint para actualizar el marcador
 *   de la ISS en el mapa cada 5 segundos mediante polling.
 * @impact Usado en `useIssPosition`. No aplicar `staleTime` — datos en tiempo real.
 *
 * @returns Posición actual de la ISS con timestamp Unix
 * @throws Error con mensaje en español si la respuesta no es OK
 */
export async function fetchIssPosition(): Promise<IssNowResponse> {
  const response = await fetch(`${ISS_BASE_URL}/iss-now.json`);

  if (!response.ok) {
    throw new Error(
      `Error al obtener la posición de la ISS: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<IssNowResponse>;
}

/**
 * Obtiene la lista de personas actualmente en el espacio.
 *
 * @what Llama a `/astros.json` y devuelve nombre y nave de cada tripulante.
 * @why El módulo `maps/` necesita este endpoint para mostrar la lista de
 *   astronautas junto al mapa de la ISS.
 * @impact Usado en `useAstronauts`. Aplicar `staleTime` de 1h — la tripulación
 *   cambia muy infrecuentemente.
 *
 * @returns Lista de tripulantes con nombre y nombre de la nave
 * @throws Error con mensaje en español si la respuesta no es OK
 */
export async function fetchAstronauts(): Promise<AstronautsResponse> {
  const response = await fetch(`${ISS_BASE_URL}/astros.json`);

  if (!response.ok) {
    throw new Error(
      `Error al obtener la tripulación en el espacio: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<AstronautsResponse>;
}
