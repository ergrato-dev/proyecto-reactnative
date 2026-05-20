/**
 * Hook `useFavorites` — planetas favoritos persistidos localmente.
 *
 * @what Gestiona una lista de IDs de planetas favoritos usando AsyncStorage
 *   como capa de persistencia y `useState` como estado reactivo en memoria.
 * @why El usuario puede marcar planetas favoritos desde el catálogo solar
 *   y consultarlos sin conexión; AsyncStorage garantiza la persistencia
 *   entre sesiones.
 * @impact Depende de AsyncStorage. Cambios en la clave de almacenamiento
 *   requieren una migración de datos para los usuarios existentes.
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Clave de AsyncStorage para la lista de favoritos */
const FAVORITES_KEY = 'favorites:planets';

/**
 * Tipo de retorno del hook `useFavorites`.
 */
export interface UseFavoritesReturn {
  /** IDs de los planetas marcados como favoritos */
  favorites: string[];
  /** Si un ID dado está en favoritos */
  isFavorite: (id: string) => boolean;
  /** Alterna el estado de favorito de un planeta */
  toggleFavorite: (id: string) => Promise<void>;
  /** Borra todos los favoritos */
  clearFavorites: () => Promise<void>;
  /** Si la carga inicial desde AsyncStorage está en progreso */
  isLoading: boolean;
}

/**
 * Hook para gestionar favoritos de planetas con persistencia en AsyncStorage.
 *
 * @what Carga la lista de favoritos al montar, expone helpers para leer y
 *   mutar la lista y persiste cada cambio de forma asíncrona.
 * @why Centraliza la lógica de persistencia fuera de los componentes para
 *   facilitar el testing y reutilizar en múltiples pantallas.
 * @impact Cualquier pantalla que consuma este hook comparte el mismo estado
 *   de favoritos. Si se desmonta y remonta, la lista se recarga desde disco.
 *
 * @returns Objeto con la lista, helpers de consulta/mutación e `isLoading`.
 */
export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carga inicial desde AsyncStorage
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(FAVORITES_KEY);
        if (!cancelled) {
          setFavorites(raw ? (JSON.parse(raw) as string[]) : []);
        }
      } catch {
        // Error de lectura: partimos de lista vacía
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Persiste la nueva lista de favoritos en AsyncStorage y actualiza el estado.
   *
   * @what Escribe `newList` serializada en JSON bajo `FAVORITES_KEY` y actualiza
   *   `favorites` en el estado local de React.
   * @why Centraliza la escritura para que `toggleFavorite` y `clearFavorites`
   *   no dupliquen la lógica de `setItem`.
   * @impact Silencia errores de escritura; el estado en memoria se actualiza
   *   igualmente, lo que puede generar inconsistencia transitoria si AsyncStorage falla.
   *
   * @param newList - Nueva lista de IDs de planetas favoritos
   */
  const persist = useCallback(async (newList: string[]) => {
    setFavorites(newList);
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newList));
    } catch {
      // Error de escritura: silencioso
    }
  }, []);

  /**
   * Comprueba si un planeta ya está en la lista de favoritos.
   *
   * @what Realiza una búsqueda lineal en el array `favorites` por el ID dado.
   * @why Proporciona una API de consulta pura sin efectos secundarios, útil para
   *   renderizado condicional (ej. cambiar el icono del botón de favorito).
   * @impact Derivado del estado en memoria; no accede a AsyncStorage.
   *
   * @param id - ID del planeta a buscar (ej. 'terre', 'mars')
   * @returns `true` si el ID está en la lista de favoritos
   */
  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  /**
   * Alterna el estado de favorito de un planeta: lo agrega si no estaba, lo elimina si estaba.
   *
   * @what Si `id` ya está en `favorites` lo filtra; de lo contrario lo concatena
   *   al final. Llama a `persist` con la lista resultante.
   * @why Encapsula la lógica toggle en un único punto para que los componentes
   *   no necesiten conocer la estructura interna del array.
   * @impact Desencadena una escritura en AsyncStorage en cada llamada.
   *
   * @param id - ID del planeta cuyo estado de favorito se quiere alternar
   */
  const toggleFavorite = useCallback(
    async (id: string) => {
      const updated = favorites.includes(id)
        ? favorites.filter((f) => f !== id)
        : [...favorites, id];
      await persist(updated);
    },
    [favorites, persist],
  );

  /**
   * Elimina todos los planetas de la lista de favoritos.
   *
   * @what Llama a `persist` con un array vacío para borrar la lista completa.
   * @why Ofrece un punto de entrada limpio para la acción "Borrar favoritos"
   *   sin exponer `persist` directamente al consumidor del hook.
   * @impact Acción irreversible en la sesión actual; AsyncStorage queda vacío
   *   bajo la clave `FAVORITES_KEY`.
   */
  const clearFavorites = useCallback(async () => {
    await persist([]);
  }, [persist]);

  return { favorites, isFavorite, toggleFavorite, clearFavorites, isLoading };
}
