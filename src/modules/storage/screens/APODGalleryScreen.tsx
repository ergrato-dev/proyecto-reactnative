/**
 * Pantalla `APODGalleryScreen` — galería y gestión de caché APOD.
 *
 * @what Lista las fechas de APOD guardadas en AsyncStorage, muestra el tamaño
 *   estimado de caché y ofrece un botón para borrarla.
 * @why El módulo `storage/` demuestra la gestión de datos locales: lectura de
 *   claves de AsyncStorage, estimación de espacio y limpieza controlada.
 * @impact Depende de `listApodCacheKeys` y `clearApodCache` de `useApod.ts`.
 *   Borrar la caché obliga al componente `APODDetailScreen` a hacer una nueva
 *   petición a la API.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { listApodCacheKeys, clearApodCache } from '../hooks/useApod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { APODStackParamList } from '@/modules/navigation/types';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<APODStackParamList, 'APODGallery'>;

/** Entrada de la lista de caché con fecha y tamaño estimado */
interface CacheEntry {
  /** Clave en AsyncStorage, ej. `apod:2025-01-01` */
  key: string;
  /** Fecha extraída de la clave, ej. `2025-01-01` */
  date: string;
  /** Tamaño estimado en bytes del JSON almacenado */
  bytes: number;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Estima el tamaño en bytes del valor de una clave de AsyncStorage.
 *
 * @what Lee el valor de la clave y cuenta los bytes del string UTF-8.
 * @why La API de AsyncStorage no expone el tamaño directamente.
 * @impact Aproximado: usa la longitud del string, no la codificación real.
 *
 * @param key - Clave de AsyncStorage
 * @returns Tamaño estimado en bytes, o 0 si no existe
 */
async function estimateBytes(key: string): Promise<number> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? new TextEncoder().encode(value).length : 0;
  } catch {
    return 0;
  }
}

/**
 * Formatea una cantidad de bytes a texto legible en B o KB.
 *
 * @what Si `bytes < 1024` devuelve `"{N} B"`; en caso contrario devuelve
 *   el valor dividido entre 1024 con un decimal, ej. `"12.3 KB"`.
 * @why La interfaz de gestión de caché necesita mostrar tamaños comprensibles
 *   sin depender de librerías de formato externas.
 * @impact Puramente presentacional; no afecta a la lógica de borrado.
 *
 * @param bytes - Cantidad de bytes a formatear (≥ 0)
 * @returns String con valor y unidad, ej. `"350 B"` o `"1.2 KB"`
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Pantalla de galería APOD: lista las entradas cacheadas y permite borrar la caché.
 *
 * @what Lee las claves `apod:*` de AsyncStorage al montar, estima el tamaño de
 *   cada entrada y las muestra en un `FlatList` ordenado por fecha descendente.
 *   El botón "Borrar caché" elimina todas las entradas tras confirmación.
 * @why Demuestra la gestión de almacenamiento local: inspección de claves,
 *   estimación de tamaño y limpieza controlada sin borrar otras claves.
 * @impact Borrar la caché obliga a `APODDetailScreen` a hacer nuevas peticiones
 *   a la API NASA; la lista queda vacía hasta que el usuario consulte APODs.
 */
export function APODGalleryScreen(_props: Props) {
  const [entries, setEntries] = useState<CacheEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  /**
   * Carga las claves de caché APOD de AsyncStorage y estima sus tamaños.
   *
   * @what Llama a `listApodCacheKeys`, ordena las claves en orden descendente
   *   y resuelve el tamaño de cada una con `estimateBytes` en paralelo.
   * @why Necesario para construir la lista visible de la galería con metadatos
   *   de tamaño; se invoca al montar el componente y tras borrar la caché.
   * @impact Actualiza `entries` con el estado resultante; muestra `isLoading`
   *   mientras se resuelven los tamaños.
   */
  const loadCache = useCallback(async () => {
    setIsLoading(true);
    try {
      const keys = await listApodCacheKeys();
      const resolved: CacheEntry[] = await Promise.all(
        keys
          .sort()
          .reverse()
          .map(async (key) => {
            const bytes = await estimateBytes(key);
            const date = key.replace('apod:', '');
            return { key, date, bytes };
          }),
      );
      setEntries(resolved);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCache();
  }, [loadCache]);

  /** Total estimado de bytes en caché */
  const totalBytes = entries.reduce((sum, e) => sum + e.bytes, 0);

  /**
   * Muestra un `Alert` de confirmación y borra toda la caché APOD si el usuario acepta.
   *
   * @what Abre un diálogo nativo con el recuento de entradas y tamaño estimado;
   *   si el usuario confirma, llama a `clearApodCache()` y vacía `entries`.
   * @why La acción es irreversible y costosa (requiere nuevas peticiones a la API),
   *   por lo que se pide confirmación explícita para evitar borrados accidentales.
   * @impact Establece `isClearing` durante la operación para bloquear el botón
   *   y evitar llamadas dobles; `entries` queda vacío al finalizar.
   */
  const handleClearCache = useCallback(() => {
    Alert.alert(
      'Borrar caché APOD',
      `Se eliminarán ${entries.length} entradas (${formatBytes(totalBytes)}). ¿Continuar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            await clearApodCache();
            setEntries([]);
            setIsClearing(false);
          },
        },
      ],
    );
  }, [entries.length, totalBytes]);

  // ── Renderizado de elementos de la lista ──────────────────────────────────

  const renderItem = ({ item }: { item: CacheEntry }) => (
    <View style={styles.item}>
      <Text style={styles.itemDate}>{item.date}</Text>
      <Text style={styles.itemSize}>{formatBytes(item.bytes)}</Text>
    </View>
  );

  // ── UI ────────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <View style={styles.centerView} testID="gallery-loading">
        <ActivityIndicator size="large" color="#4fc3f7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ── Cabecera con métricas de caché ──────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Caché APOD local</Text>
        <Text testID="cache-size-text" style={styles.headerMeta}>
          {entries.length} entrada{entries.length !== 1 ? 's' : ''} · {formatBytes(totalBytes)}
        </Text>
        <TouchableOpacity
          testID="clear-cache-button"
          onPress={handleClearCache}
          disabled={entries.length === 0 || isClearing}
          style={[
            styles.clearBtn,
            (entries.length === 0 || isClearing) && styles.clearBtnDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Borrar caché"
        >
          {isClearing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.clearBtnText}>Borrar caché</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Lista de entradas ─────────────────────────────────────── */}
      <FlatList
        testID="gallery-list"
        data={entries}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        contentContainerStyle={entries.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <View testID="empty-gallery">
            <Text style={styles.emptyText}>No hay APODs en caché.</Text>
            <Text style={styles.emptySub}>Consulta la imagen del día para guardarla.</Text>
          </View>
        }
      />
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050d24',
  },
  centerView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    backgroundColor: '#0a1628',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1a2a4a',
  },
  headerTitle: {
    color: '#e8eaf6',
    fontSize: 16,
    fontWeight: '700',
  },
  headerMeta: {
    color: '#90a4ae',
    fontSize: 13,
  },
  clearBtn: {
    marginTop: 4,
    backgroundColor: '#c62828',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    minWidth: 44,
    alignItems: 'center',
  },
  clearBtnDisabled: {
    opacity: 0.4,
  },
  clearBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#0a1628',
  },
  itemDate: {
    color: '#cfd8dc',
    fontSize: 15,
  },
  itemSize: {
    color: '#607d8b',
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    color: '#607d8b',
    fontSize: 16,
    textAlign: 'center',
  },
  emptySub: {
    color: '#455a64',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
});
