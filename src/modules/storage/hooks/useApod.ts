/**
 * Hook `useApod` — imagen astronómica del día.
 *
 * @what Envuelve `fetchApod` con TanStack Query y persiste el resultado
 *   en AsyncStorage para disponibilidad offline.
 * @why El módulo `storage/` necesita mostrar la APOD del día aunque no haya
 *   conexión; la caché de 1h evita peticiones innecesarias a la API NASA.
 * @impact Depende de `fetchApod` de `nasaClient` y de AsyncStorage.
 *   Cualquier cambio en `ApodResponse` requiere actualizar la clave de caché.
 *
 * @param date - Fecha YYYY-MM-DD. Si se omite, devuelve la del día actual.
 */

import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchApod, type ApodResponse } from '@/shared/lib/nasaClient';

/** Tiempo de vida de la caché en TanStack Query: 1 hora */
const STALE_TIME_MS = 60 * 60 * 1000;

/** Prefijo de clave en AsyncStorage para la APOD */
const APOD_STORAGE_PREFIX = 'apod:';

/**
 * Persiste una respuesta APOD en AsyncStorage.
 *
 * @what Serializa y guarda `data` bajo la clave `apod:<date>`.
 * @why Permite mostrar la APOD aunque la app se abra sin conexión.
 * @impact Silencia errores de escritura para no interrumpir la UI.
 *
 * @param date - Fecha YYYY-MM-DD usada como clave
 * @param data - Datos de la APOD a persistir
 */
export async function persistApod(date: string, data: ApodResponse): Promise<void> {
  try {
    await AsyncStorage.setItem(`${APOD_STORAGE_PREFIX}${date}`, JSON.stringify(data));
  } catch {
    // Error de escritura: silencioso para no interrumpir la UI
  }
}

/**
 * Lee una APOD persistida en AsyncStorage.
 *
 * @what Deserializa el valor almacenado bajo `apod:<date>`.
 * @why Fuente de datos offline para `useApod`.
 * @impact Devuelve `null` si no existe la entrada o si la deserialisación falla.
 *
 * @param date - Fecha YYYY-MM-DD de la APOD buscada
 * @returns Datos de la APOD o `null` si no está almacenada
 */
export async function readPersistedApod(date: string): Promise<ApodResponse | null> {
  try {
    const raw = await AsyncStorage.getItem(`${APOD_STORAGE_PREFIX}${date}`);
    if (!raw) return null;
    return JSON.parse(raw) as ApodResponse;
  } catch {
    return null;
  }
}

/**
 * Devuelve todas las claves APOD guardadas en AsyncStorage.
 *
 * @what Filtra las claves de AsyncStorage que empiezan por `apod:`.
 * @why Usada por la pantalla de gestión de caché para listar y borrar entradas.
 * @impact Devuelve array vacío si AsyncStorage falla.
 *
 * @returns Array de claves APOD en AsyncStorage
 */
export async function listApodCacheKeys(): Promise<string[]> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    return allKeys.filter((k) => k.startsWith(APOD_STORAGE_PREFIX));
  } catch {
    return [];
  }
}

/**
 * Borra todas las entradas APOD del AsyncStorage.
 *
 * @what Elimina todas las claves cuyo prefijo sea `apod:`.
 * @why Opción de "limpiar caché" en la pantalla de gestión de almacenamiento.
 * @impact Irreversible; la próxima apertura de la APOD hará una petición a la red.
 */
export async function clearApodCache(): Promise<void> {
  try {
    const keys = await listApodCacheKeys();
    if (keys.length > 0) {
      await AsyncStorage.multiRemove(keys);
    }
  } catch {
    // Error de borrado: silencioso
  }
}

/**
 * Hook principal para obtener y cachear la imagen astronómica del día.
 *
 * @what Ejecuta la query NASA APOD con TanStack Query, guarda el resultado en
 *   AsyncStorage y proporciona el estado de carga, error y datos.
 * @why Combina caché en memoria (TanStack) con persistencia offline (AsyncStorage)
 *   sin duplicar la lógica en los componentes.
 * @impact Depende de `fetchApod` y AsyncStorage. Si `date` cambia, se lanza
 *   una nueva query con la clave `['nasa', 'apod', date]`.
 *
 * @param date - Fecha YYYY-MM-DD. Por defecto: hoy.
 * @returns Objeto de query de TanStack con `data: ApodResponse | undefined`
 */
export function useApod(date?: string) {
  return useQuery<ApodResponse>({
    queryKey: ['nasa', 'apod', date ?? 'today'],
    queryFn: async () => {
      const data = await fetchApod(date);
      // Persistir para acceso offline
      const key = date ?? new Date().toISOString().slice(0, 10);
      await persistApod(key, data);
      return data;
    },
    staleTime: STALE_TIME_MS,
  });
}
