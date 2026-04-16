/**
 * Cliente HTTP centralizado para las APIs de NASA (APOD, NeoWs, DONKI).
 *
 * @what Exporta funciones tipadas para cada endpoint de NASA, inyectando
 *   automáticamente la API key desde las variables de entorno.
 * @why Centralizar las llamadas a NASA evita duplicar la lógica de autenticación
 *   y permite aplicar políticas de caché uniformes en TanStack Query.
 * @impact Todos los hooks de los módulos `lists/`, `forms/`, `storage/` y
 *   `notifications/` dependen de este cliente. Cambios aquí afectan a toda
 *   la capa de fetching de datos NASA.
 */

/** URL base de la API de NASA */
const NASA_BASE_URL = 'https://api.nasa.gov';

/** Clave de API leída desde variables de entorno de Expo */
const NASA_API_KEY = process.env.EXPO_PUBLIC_NASA_API_KEY ?? 'DEMO_KEY';

// ─── Tipos de respuesta ────────────────────────────────────────────────────────

/** Respuesta de la API APOD (Astronomy Picture of the Day) */
export interface ApodResponse {
  copyright?: string;
  date: string;
  explanation: string;
  hdurl?: string;
  media_type: 'image' | 'video';
  service_version: string;
  title: string;
  url: string;
}

/** Un asteroide cercano a la Tierra devuelto por NeoWs */
export interface NeoWsAsteroid {
  id: string;
  name: string;
  nasa_jpl_url: string;
  absolute_magnitude_h: number;
  is_potentially_hazardous_asteroid: boolean;
  estimated_diameter: {
    kilometers: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  close_approach_data: Array<{
    close_approach_date: string;
    relative_velocity: { kilometers_per_hour: string };
    miss_distance: { kilometers: string };
  }>;
}

/** Respuesta de NeoWs para un rango de fechas */
export interface NeoWsFeedResponse {
  element_count: number;
  near_earth_objects: Record<string, NeoWsAsteroid[]>;
}

/** Un evento de clima espacial de la API DONKI */
export interface DonkiSolarFlare {
  flrID: string;
  beginTime: string;
  peakTime: string | null;
  endTime: string | null;
  classType: string; // ej. "M1.5", "X2.0"
  sourceLocation: string;
  activeRegionNum: number | null;
}

// ─── Funciones del cliente ────────────────────────────────────────────────────

/**
 * Construye la URL completa para un endpoint de NASA con la API key incluida.
 *
 * @what Concatena la base URL, el path y los parámetros de consulta.
 * @why Evita repetir la concatenación de la API key en cada función.
 * @impact Interno — solo usado por las funciones de este módulo.
 *
 * @param path   - Ruta del endpoint (ej. `/planetary/apod`)
 * @param params - Parámetros adicionales de consulta
 * @returns URL completa con la API key inyectada
 */
function buildUrl(path: string, params: Record<string, string> = {}): string {
  const url = new URL(`${NASA_BASE_URL}${path}`);
  url.searchParams.set('api_key', NASA_API_KEY);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
}

/**
 * Obtiene la imagen astronómica del día (APOD) de NASA.
 *
 * @what Llama a `/planetary/apod` y devuelve los datos tipados.
 * @why El módulo `storage/` necesita este endpoint para mostrar y cachear la APOD.
 * @impact Usado en `useApod`. Aplicar `staleTime` de 1h en la query.
 *
 * @param date - Fecha en formato `YYYY-MM-DD`. Si se omite, devuelve la del día.
 * @returns Datos de la APOD para la fecha indicada
 * @throws Error con mensaje en español si la respuesta no es OK
 */
export async function fetchApod(date?: string): Promise<ApodResponse> {
  const params: Record<string, string> = date ? { date } : {};
  const url = buildUrl('/planetary/apod', params);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error al obtener la imagen del día: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<ApodResponse>;
}

/**
 * Obtiene asteroides cercanos a la Tierra para un rango de fechas (NeoWs).
 *
 * @what Llama a `/neo/rest/v1/feed` con `start_date` y `end_date`.
 * @why El módulo `forms/` necesita este endpoint para el buscador de asteroides.
 * @impact Usado en `useNeoWs`. El rango máximo aceptado por la API es de 7 días.
 *
 * @param startDate - Fecha de inicio en formato `YYYY-MM-DD`
 * @param endDate   - Fecha de fin en formato `YYYY-MM-DD` (máx. 7 días después)
 * @returns Colección de asteroides agrupados por fecha
 * @throws Error con mensaje en español si la respuesta no es OK
 */
export async function fetchNeoWsFeed(
  startDate: string,
  endDate: string,
): Promise<NeoWsFeedResponse> {
  const url = buildUrl('/neo/rest/v1/feed', {
    start_date: startDate,
    end_date: endDate,
  });
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error al buscar asteroides: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<NeoWsFeedResponse>;
}

/**
 * Obtiene eventos de tormentas solares (DONKI — Solar Flare) para un rango.
 *
 * @what Llama a `/DONKI/FLR` con `startDate` y `endDate`.
 * @why El módulo `notifications/` necesita este endpoint para detectar eventos M+ y X+.
 * @impact Usado en `useDonki`. Aplicar `staleTime` de 30 min en la query.
 *
 * @param startDate - Fecha de inicio en formato `YYYY-MM-DD`
 * @param endDate   - Fecha de fin en formato `YYYY-MM-DD`
 * @returns Lista de eventos de llamaradas solares en el rango
 * @throws Error con mensaje en español si la respuesta no es OK
 */
export async function fetchSolarFlares(
  startDate: string,
  endDate: string,
): Promise<DonkiSolarFlare[]> {
  const url = buildUrl('/DONKI/FLR', {
    startDate,
    endDate,
  });
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Error al obtener datos de clima espacial: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  // La API puede devolver null si no hay eventos en el rango
  return (data as DonkiSolarFlare[] | null) ?? [];
}
