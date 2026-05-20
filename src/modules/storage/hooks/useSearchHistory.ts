/**
 * Hook `useSearchHistory` — historial de búsquedas de asteroides.
 *
 * @what Mantiene las últimas N búsquedas de asteroides persistidas en
 *   AsyncStorage, exponiendo helpers para añadir y borrar entradas.
 * @why Permite al usuario reutilizar búsquedas anteriores sin volver a
 *   introducir las fechas manualmente; mejora la UX del formulario NeoWs.
 * @impact Depende de AsyncStorage. Cambios en `SearchHistoryEntry` requieren
 *   una migración de datos para no romper entradas antiguas almacenadas.
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Número máximo de búsquedas guardadas */
export const MAX_HISTORY_ITEMS = 10;

/** Clave de AsyncStorage para el historial */
const HISTORY_KEY = 'search-history:asteroids';

/** Una entrada del historial de búsquedas */
export interface SearchHistoryEntry {
  /** Fecha de inicio de la búsqueda (YYYY-MM-DD) */
  startDate: string;
  /** Fecha de fin de la búsqueda (YYYY-MM-DD) */
  endDate: string;
  /** Timestamp UNIX (ms) de cuando se realizó la búsqueda */
  timestamp: number;
}

/**
 * Hook para gestionar el historial de búsquedas de asteroides.
 *
 * @what Carga el historial persistido al montar, ofrece `addEntry` para
 *   insertar búsquedas nuevas y `clearHistory` para borrar todo.
 * @why Centraliza la lógica de persistencia para reutilizarla en
 *   `AsteroidSearchScreen` y en la pantalla de gestión de caché.
 * @impact El historial es circular: si supera `MAX_HISTORY_ITEMS` se descarta
 *   la entrada más antigua. El orden es de más reciente a más antiguo.
 *
 * @returns Objeto con `history`, `addEntry`, `clearHistory` e `isLoading`.
 */
export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carga inicial
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(HISTORY_KEY);
        if (!cancelled) {
          setHistory(raw ? (JSON.parse(raw) as SearchHistoryEntry[]) : []);
        }
      } catch {
        // Error de lectura: lista vacía
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Persiste la nueva lista del historial en AsyncStorage y actualiza el estado.
   *
   * @what Serializa `newList` en JSON y la escribe bajo `HISTORY_KEY`; actualiza
   *   el estado `history` para reflejar el cambio en el ciclo de renderizado.
   * @why Centraliza la escritura para que `addEntry` y `clearHistory` no
   *   dupliquen la lógica de `setItem`.
   * @impact Silencia errores de escritura; el estado en memoria se actualiza
   *   igualmente aunque AsyncStorage falle.
   *
   * @param newList - Nueva lista de entradas del historial a persistir
   */
  const persist = useCallback(async (newList: SearchHistoryEntry[]) => {
    setHistory(newList);
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newList));
    } catch {
      // Error de escritura: silencioso
    }
  }, []);

  /**
   * Añade una nueva búsqueda al inicio del historial con deduplicación y límite.
   *
   * @what Crea una entrada con `startDate`, `endDate` y timestamp actual;
   *   filtra entradas duplicadas con las mismas fechas; antepone la nueva entrada
   *   al array y trunca el resultado a `MAX_HISTORY_ITEMS`.
   * @why Garantiza que el historial muestre siempre las búsquedas más recientes
   *   primero, sin duplicados y con tamaño acotado en disco.
   * @impact Desencadena escritura en AsyncStorage; las entradas más antiguas se
   *   descartan si el array supera `MAX_HISTORY_ITEMS`.
   *
   * @param startDate - Fecha de inicio de la búsqueda (YYYY-MM-DD)
   * @param endDate   - Fecha de fin de la búsqueda (YYYY-MM-DD)
   */
  const addEntry = useCallback(
    async (startDate: string, endDate: string) => {
      const entry: SearchHistoryEntry = { startDate, endDate, timestamp: Date.now() };
      const filtered = history.filter(
        (h) => !(h.startDate === startDate && h.endDate === endDate),
      );
      const updated = [entry, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      await persist(updated);
    },
    [history, persist],
  );

  /**
   * Elimina todas las entradas del historial de búsquedas.
   *
   * @what Llama a `persist` con un array vacío.
   * @why Proporciona un punto de limpieza explícito para la pantalla de gestión
   *   de almacenamiento sin exponer `persist` directamente al consumidor.
   * @impact Acción irreversible; AsyncStorage queda vacío bajo `HISTORY_KEY`.
   */
  const clearHistory = useCallback(async () => {
    await persist([]);
  }, [persist]);

  return { history, addEntry, clearHistory, isLoading };
}
