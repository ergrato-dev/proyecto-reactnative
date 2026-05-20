/**
 * Componente `ApodMedia` — imagen o vídeo de la APOD.
 *
 * @what Renderiza el contenido multimedia de la APOD:
 *   - Si `media_type === 'image'`: muestra la imagen con `expo-image` (carga progresiva).
 *   - Si `media_type === 'video'`: muestra una tarjeta de miniatura con botón para
 *     abrir el vídeo en el navegador externo mediante `Linking.openURL`.
 * @why La API APOD devuelve tanto imágenes como vídeos (frecuentemente YouTube);
 *   expo-image gestiona el blurhash y la transición de carga; los vídeos no
 *   se incrustan para evitar depender de WebView en Fase 4.
 * @impact Usado en `APODDetailScreen`. Cambios en `ApodResponse.media_type`
 *   o en el campo `url` afectan directamente a este componente.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import type { ApodResponse } from '@/shared/lib/nasaClient';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ApodMediaProps {
  /** Datos de la APOD con tipo de medio y URL */
  apod: Pick<ApodResponse, 'media_type' | 'url' | 'hdurl' | 'title'>;
  /** Altura del contenedor de medios en píxeles */
  height?: number;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

/** Placeholder de blurhash mientras carga la imagen */
const BLURHASH_PLACEHOLDER = 'L020g500?b~q00-;M{Rj00xu9Ftl';

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Renderiza el contenido multimedia de una APOD: imagen con carga progresiva
 * o tarjeta de enlace externo cuando el medio es un vídeo.
 *
 * @what Si `media_type === 'image'` usa `expo-image` con blurhash y transición
 *   de 400 ms. Si `media_type === 'video'` muestra una tarjeta con icono de
 *   reproducción que abre la URL con `Linking.openURL`.
 * @why Desacopla la lógica de presentación del tipo de medio de `APODDetailScreen`,
 *   facilitando el testing independiente de cada rama (imagen vs. vídeo).
 * @impact Cambios en `ApodResponse.media_type` o en los campos `url`/`hdurl`
 *   afectan directamente el renderizado. Requiere actualizar los tests asociados.
 *
 * @param apod   - Datos parciales de la APOD (media_type, url, hdurl, title)
 * @param height - Altura del contenedor en píxeles (por defecto 280)
 */
export function ApodMedia({ apod, height = 280 }: ApodMediaProps) {
  if (apod.media_type === 'image') {
    return (
      <Image
        testID="apod-image"
        source={{ uri: apod.hdurl ?? apod.url }}
        style={[styles.image, { height }]}
        contentFit="cover"
        transition={400}
        placeholder={{ blurhash: BLURHASH_PLACEHOLDER }}
        accessible
        accessibilityLabel={apod.title}
      />
    );
  }

  // Tipo vídeo — mostrar tarjeta con botón de apertura externa
  return (
    <TouchableOpacity
      testID="apod-video-card"
      style={[styles.videoCard, { height }]}
      onPress={() => Linking.openURL(apod.url)}
      accessibilityRole="button"
      accessibilityLabel={`Abrir vídeo: ${apod.title}`}
    >
      <Text style={styles.videoIcon}>▶️</Text>
      <Text style={styles.videoLabel}>Ver vídeo en navegador</Text>
      <Text style={styles.videoUrl} numberOfLines={1}>
        {apod.url}
      </Text>
    </TouchableOpacity>
  );
}

/**
 * Indicador de carga mientras se obtiene la APOD.
 *
 * @what Muestra un ActivityIndicator centrado con el color del tema.
 * @why Evita que la pantalla quede vacía durante la petición inicial.
 * @impact Usado en `APODDetailScreen` dentro de la rama `isLoading`.
 */
export function ApodLoadingPlaceholder({ height = 280 }: { height?: number }) {
  return (
    <View style={[styles.placeholder, { height }]} testID="apod-loading-placeholder">
      <ActivityIndicator size="large" color="#4fc3f7" />
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  image: {
    width: '100%',
    backgroundColor: '#0a1628',
  },
  videoCard: {
    width: '100%',
    backgroundColor: '#0d1f3c',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
  },
  videoIcon: { fontSize: 48 },
  videoLabel: {
    color: '#4fc3f7',
    fontSize: 16,
    fontWeight: '600',
  },
  videoUrl: {
    color: '#607d8b',
    fontSize: 12,
    paddingHorizontal: 24,
  },
  placeholder: {
    width: '100%',
    backgroundColor: '#0a1628',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
