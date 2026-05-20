/**
 * Galería de imágenes oficiales del programa Artemis (NASA Images API).
 *
 * @what Muestra una cuadrícula de imágenes de la misión Artemis obtenidas
 *   en tiempo real desde la NASA Images and Video Library.
 * @why Demuestra el patrón de fetching remoto de imágenes con TanStack Query,
 *   carga optimista, manejo de errores y virtualización con FlatList 2 columnas.
 * @impact Depende de `useArtemisImages` → `fetchArtemisImages` (nasaClient).
 *   No requiere permisos especiales. Requiere conexión a internet.
 */

import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ArtemisStackParamList } from '@/modules/navigation/types';
import type { NasaImageItem } from '@/shared/lib/nasaClient';
import { useArtemisImages } from '../hooks/useArtemisImages';

/** Props de la pantalla de galería */
type Props = NativeStackScreenProps<ArtemisStackParamList, 'ArtemisGallery'>;

/** Ancho de cada ítem de la cuadrícula (2 columnas con margen) */
const COLUMN_COUNT = 2;
const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEM_SIZE = (SCREEN_WIDTH - 16 * 3) / COLUMN_COUNT;

// ─── Ítem de imagen ───────────────────────────────────────────────────────────

/**
 * Ítem de la cuadrícula de imágenes Artemis.
 *
 * @what Renderiza la miniatura de una imagen NASA con su título truncado.
 * @why Encapsula el ítem para facilitar pruebas unitarias y mantener
 *   `ArtemisGalleryScreen` legible.
 * @impact Solo usado en `ArtemisGalleryScreen`. Depende de `NasaImageItem`.
 *
 * @param item - Ítem de imagen de la NASA Images API
 */
function GalleryItem({ item }: { item: NasaImageItem }) {
  const thumbUrl = item.links?.[0]?.href ?? '';
  const title = item.data?.[0]?.title ?? '';
  const nasaId = item.data?.[0]?.nasa_id ?? '';

  return (
    <View style={itemStyles.container} testID={`gallery-item-${nasaId}`}>
      {thumbUrl ? (
        <Image
          source={{ uri: thumbUrl }}
          style={itemStyles.image}
          resizeMode="cover"
          accessibilityLabel={title}
          testID={`gallery-image-${nasaId}`}
        />
      ) : (
        <View style={[itemStyles.image, itemStyles.imagePlaceholder]}>
          <Text style={itemStyles.placeholderText}>🌙</Text>
        </View>
      )}
      <Text style={itemStyles.title} numberOfLines={2}>
        {title}
      </Text>
    </View>
  );
}

const itemStyles = StyleSheet.create({
  container: {
    width: ITEM_SIZE,
    marginBottom: 12,
  },
  image: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 8,
    backgroundColor: '#0d1b3e',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  title: {
    fontSize: 11,
    color: '#9fa8da',
    marginTop: 5,
    lineHeight: 15,
  },
});

// ─── Pantalla principal ───────────────────────────────────────────────────────

/**
 * Pantalla de galería de imágenes del programa Artemis.
 *
 * @what Renderiza una cuadrícula de 2 columnas con imágenes oficiales de
 *   la NASA, con estados de carga y error explícitos.
 * @why Demuestra el patrón estándar de carga remota de imágenes en React Native:
 *   `useQuery` + `FlatList` + `Image` con URI remota.
 * @impact Depende de `useArtemisImages`. Sin datos almacenados en caché local.
 *   La galería se recarga automáticamente si los datos expiran (staleTime 6 h).
 */
export function ArtemisGalleryScreen({ navigation }: Props) {
  const { images, isLoading, isError, error, refetch } = useArtemisImages();

  if (isLoading) {
    return (
      <View style={styles.centered} testID="loading-indicator">
        <ActivityIndicator size="large" color="#3f51b5" />
        <Text style={styles.loadingText}>Cargando imágenes de Artemis…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered} testID="error-container">
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorText}>
          {error?.message ?? 'No se pudieron cargar las imágenes'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch} testID="retry-button">
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={images}
        keyExtractor={(item) => item.data?.[0]?.nasa_id ?? Math.random().toString()}
        renderItem={({ item }) => <GalleryItem item={item} />}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              testID="back-button"
            >
              <Text style={styles.backText}>← Misiones</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Galería Artemis</Text>
            <Text style={styles.count}>{images.length} imágenes oficiales NASA</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.centered} testID="empty-state">
            <Text style={styles.emptyText}>No se encontraron imágenes</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#050d1a',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#050d1a',
    minHeight: 200,
  },
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  row: {
    gap: 12,
    marginBottom: 4,
  },
  header: {
    paddingBottom: 16,
    paddingTop: 12,
  },
  backButton: {
    marginBottom: 10,
  },
  backText: {
    color: '#7986cb',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#e8eaf6',
    marginBottom: 4,
  },
  count: {
    fontSize: 13,
    color: '#9fa8da',
    marginBottom: 8,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9fa8da',
  },
  errorEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#ef9a9a',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#1a237e',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: '#c5cae9',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
    color: '#9fa8da',
  },
});
