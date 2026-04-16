import { useQuery } from '@tanstack/react-query';
import { fetchSolarFlares, type DonkiSolarFlare } from '@/shared/lib/nasaClient';

/** Tiempo de revalidación: 30 minutos (los eventos solares cambian con frecuencia) */
const STALE_TIME_30MIN = 30 * 60 * 1000;

/**
 * Determina si una llamarada solar requiere alerta al usuario.
 *
 * @what Devuelve `true` si la clase de la llamarada es M o X (moderada/extrema).
 * @why Las llamaradas clase C son demasiado débiles para afectar la Tierra;
 *   solo M y X tienen impacto en comunicaciones, satélites y salud.
 * @impact Usada en `useDonki` y en los tests de detección de eventos.
 *
 * @param classType - Clase de la llamarada (ej. "M1.5", "X2.0", "C3.1")
 * @returns `true` si la clase es M o X
 */
export function isMajorSolarFlare(classType: string): boolean {
  return classType.startsWith('M') || classType.startsWith('X');
}

/**
 * Hook que obtiene llamaradas solares recientes de la API NASA DONKI.
 *
 * @what Encapsula la llamada a `fetchSolarFlares` para el rango de los
 *   últimos 7 días, exponiendo eventos totales y solo los eventos M+/X+.
 * @why El módulo `notifications/` necesita saber si hay tormentas solares
 *   activas para decidir si disparar alertas locales.
 * @impact Usado en `NotificationSettingsScreen`. `staleTime` de 30 min
 *   equilibra frescura y consumo de API key.
 *
 * @param startDate - Fecha de inicio en formato `YYYY-MM-DD` (por defecto hace 7 días)
 * @param endDate   - Fecha de fin en formato `YYYY-MM-DD` (por defecto hoy)
 * @returns Objeto con `flares`, `majorFlares`, `isLoading`, `isError`, `error`
 */
export function useDonki(
  startDate?: string,
  endDate?: string,
): {
  flares: DonkiSolarFlare[];
  majorFlares: DonkiSolarFlare[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
} {
  /**
   * Calcula la fecha N días atrás en formato YYYY-MM-DD.
   *
   * @what Devuelve una cadena ISO de fecha sin fracción de tiempo.
   * @why Permite calcular el rango por defecto (últimos 7 días) sin depender
   *   de librerías externas de fechas.
   * @impact Solo usada internamente en este hook.
   *
   * @param days - Días hacia atrás desde hoy
   * @returns Fecha en formato `YYYY-MM-DD`
   */
  function daysAgo(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  }

  const start = startDate ?? daysAgo(7);
  const end = endDate ?? daysAgo(0);

  const { data, isLoading, isError, error } = useQuery<DonkiSolarFlare[], Error>({
    queryKey: ['donki', 'solar-flares', start, end],
    queryFn: () => fetchSolarFlares(start, end),
    staleTime: STALE_TIME_30MIN,
  });

  const flares = data ?? [];
  const majorFlares = flares.filter((f) => isMajorSolarFlare(f.classType));

  return {
    flares,
    majorFlares,
    isLoading,
    isError,
    error: error ?? null,
  };
}
