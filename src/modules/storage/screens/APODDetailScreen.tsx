/**
 * Pantalla `APODDetailScreen` — imagen astronómica del día.
 *
 * @what Muestra la imagen (o vídeo) del día de la NASA con título, descripción,
 *   créditos, navegación a días anteriores (hasta 30 días atrás) y botón de
 *   compartir; persiste el resultado en AsyncStorage para acceso offline.
 * @why El módulo `storage/` demuestra la combinación de TanStack Query + AsyncStorage:
 *   datos frescos en línea y fallback offline, sin duplicar lógica en la UI.
 * @impact Depende de `useApod`, `ApodMedia` y expo-sharing. El historial de
 *   fecha pasada está limitado por la API NASA (rango: 1995-06-16 → hoy).
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Share,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { useApod } from '../hooks/useApod';
import { ApodMedia } from '../components/ApodMedia';
import type { APODDetailScreenProps } from '@/modules/navigation/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convierte un objeto `Date` a string en formato YYYY-MM-DD.
 *
 * @what Extrae los primeros 10 caracteres del ISO 8601 producido por
 *   `d.toISOString()`.
 * @why La API NASA acepta fechas exclusivamente en formato YYYY-MM-DD;
 *   centralizar la conversión evita inconsistencias en distintos puntos.
 * @impact Usado por `today`, `addDays` y como argumento de `useApod`.
 *
 * @param d - Fecha a convertir
 * @returns String en formato YYYY-MM-DD
 */
function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Devuelve la fecha actual en formato YYYY-MM-DD.
 *
 * @what Llama a `toDateString` con `new Date()`.
 * @why Permite comparar `selectedDate` con la fecha de hoy sin instanciar
 *   `Date` directamente en el JSX ni repetir la conversión.
 * @impact Determinista respecto al reloj del sistema; los tests que dependan
 *   de esta función deben mockear `Date`.
 *
 * @returns Fecha de hoy en formato YYYY-MM-DD
 */
function today(): string {
  return toDateString(new Date());
}

/**
 * Suma o resta un número de días a una fecha en formato YYYY-MM-DD.
 *
 * @what Parsea `dateStr` con `new Date()`, modifica `getDate()` por `days`
 *   y convierte el resultado con `toDateString`.
 * @why Necesario para la navegación día a día en `APODDetailScreen` sin
 *   depender de librerías de fechas externas.
 * @impact No valida que el resultado esté en el rango soportado por la API;
 *   esa validación la realizan `isPrevDisabled` / `isNextDisabled`.
 *
 * @param dateStr - Fecha base en formato YYYY-MM-DD
 * @param days    - Número de días a sumar (negativo para restar)
 * @returns Nueva fecha en formato YYYY-MM-DD
 */
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return toDateString(d);
}

/**
 * Calcula la diferencia en días entre `dateStr` y la fecha actual.
 *
 * @what Normaliza ambas fechas a medianoche, resta los timestamps y divide
 *   entre los ms de un día (86 400 000), redondeando al entero más próximo.
 * @why Permite saber cuántos días separan `selectedDate` de hoy para
 *   deshabilitar los botones de navegación en los límites del rango.
 * @impact Devuelve negativo para fechas pasadas y positivo para futuras;
 *   la lógica `isPrevDisabled` / `isNextDisabled` depende de este signo.
 *
 * @param dateStr - Fecha a evaluar en formato YYYY-MM-DD
 * @returns Diferencia en días (negativa si `dateStr` es anterior a hoy)
 */
function daysFromToday(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  return Math.round((target.getTime() - now.getTime()) / 86_400_000);
}

// ─── Constantes ───────────────────────────────────────────────────────────────

/** Días máximos de retroceso en la navegación */
const MAX_DAYS_BACK = 30;

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Pantalla principal del módulo `storage/`: imagen astronómica del día con
 * navegación temporal, caché offline y opción de compartir.
 *
 * @what Muestra la APOD del día seleccionado usando `useApod` (TanStack Query
 *   + AsyncStorage). Permite navegar hasta 30 días atrás con botones ‹ /›
 *   y compartir imagen (expo-sharing) o URL de vídeo (Share nativo).
 * @why Es la pantalla raíz de `APODStack`; demuestra la integración de caché
 *   offline, manejo de estados de carga/error y la API Share de React Native.
 * @impact Depende de `useApod`, `ApodMedia`, `expo-sharing` y `expo-file-system`.
 *   Si la API NASA falla, TanStack Query intenta mostrar datos en caché.
 */
export function APODDetailScreen(_props: APODDetailScreenProps) {
  const [selectedDate, setSelectedDate] = useState<string>(today());

  const { data, isLoading, isError, isFetching } = useApod(
    selectedDate === today() ? undefined : selectedDate,
  );

  /**
   * Retrocede un día en la navegación temporal de la APOD.
   *
   * @what Decrementa `selectedDate` en un día con `addDays(date, -1)`.
   * @why Permite al usuario consultar APODs históricas; el límite de 30 días
   *   evita peticiones fuera del rango razonable de uso.
   * @impact Bloquea el retroceso si `daysFromToday(selectedDate) <= -MAX_DAYS_BACK`.
   */
  const goToPrev = useCallback(() => {
    if (daysFromToday(selectedDate) <= -MAX_DAYS_BACK) return;
    setSelectedDate((d) => addDays(d, -1));
  }, [selectedDate]);

  /**
   * Avanza un día en la navegación temporal de la APOD.
   *
   * @what Incrementa `selectedDate` en un día con `addDays(date, 1)`.
   * @why Necesario para volver al presente tras haber retrocedido; la API NASA
   *   no sirve fechas futuras.
   * @impact Bloquea el avance si `selectedDate >= today()`.
   */
  const goToNext = useCallback(() => {
    if (selectedDate >= today()) return;
    setSelectedDate((d) => addDays(d, 1));
  }, [selectedDate]);

  /**
   * Comparte la imagen o el enlace de vídeo de la APOD actualmente visible.
   *
   * @what Para imágenes: descarga el archivo al directorio de caché con
   *   `expo-file-system` y lo comparte con `expo-sharing`. Para vídeos y como
   *   fallback: usa el `Share` nativo de React Native con el título y la URL.
   * @why La API Share nativa solo admite texto; para compartir la imagen real
   *   se necesita un archivo local, que se obtiene descargándolo previamente.
   * @impact Requiere acceso al directorio de caché. Silencia errores de descarga
   *   y hace fallback a Share de texto para no bloquear al usuario.
   */
  const handleShare = useCallback(async () => {
    if (!data) return;

    if (data.media_type === 'video') {
      await Share.share({ message: `${data.title}\n${data.url}` });
      return;
    }

    // Imagen: descargar a caché y compartir con expo-sharing
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        await Share.share({ message: `${data.title}\n${data.url}` });
        return;
      }
      const ext = data.url.includes('.gif') ? '.gif' : '.jpg';
      const destFile = new File(Paths.cache, `apod_share${ext}`);
      const downloaded = await File.downloadFileAsync(data.url, destFile);
      await Sharing.shareAsync(downloaded.uri, { mimeType: 'image/jpeg', dialogTitle: data.title });
    } catch {
      // Fallback al Share nativo si falla la descarga
      await Share.share({ message: `${data.title}\n${data.url}` });
    }
  }, [data]);

  const isPrevDisabled = daysFromToday(selectedDate) <= -MAX_DAYS_BACK;
  const isNextDisabled = selectedDate >= today();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID="apod-scroll"
    >
      {/* ── Controles de fecha ─────────────────────────────────────── */}
      <View style={styles.dateRow}>
        <TouchableOpacity
          testID="apod-prev-button"
          onPress={goToPrev}
          disabled={isPrevDisabled}
          style={[styles.dateBtn, isPrevDisabled && styles.dateBtnDisabled]}
          accessibilityLabel="Día anterior"
        >
          <Text style={styles.dateBtnText}>‹</Text>
        </TouchableOpacity>

        <Text testID="apod-date-label" style={styles.dateLabel}>
          {selectedDate}
        </Text>

        <TouchableOpacity
          testID="apod-next-button"
          onPress={goToNext}
          disabled={isNextDisabled}
          style={[styles.dateBtn, isNextDisabled && styles.dateBtnDisabled]}
          accessibilityLabel="Día siguiente"
        >
          <Text style={styles.dateBtnText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* ── Estado de carga ────────────────────────────────────────── */}
      {(isLoading || isFetching) && !data && (
        <View style={styles.centerView} testID="loading-view">
          <ActivityIndicator size="large" color="#4fc3f7" />
          <Text style={styles.loadingText}>Cargando APOD…</Text>
        </View>
      )}

      {/* ── Estado de error ────────────────────────────────────────── */}
      {isError && !data && (
        <View style={styles.centerView} testID="error-view">
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>No se pudo cargar la imagen del día.</Text>
          <Text style={styles.errorSub}>Comprueba tu conexión e inténtalo de nuevo.</Text>
        </View>
      )}

      {/* ── Contenido ─────────────────────────────────────────────── */}
      {data && (
        <>
          <ApodMedia apod={data} />

          <View style={styles.body}>
            {/* Título */}
            <Text testID="apod-title" style={styles.title}>
              {data.title}
            </Text>

            {/* Créditos */}
            {data.copyright && (
              <Text testID="apod-copyright" style={styles.copyright}>
                © {data.copyright}
              </Text>
            )}

            {/* Descripción */}
            <Text testID="apod-explanation" style={styles.explanation}>
              {data.explanation}
            </Text>

            {/* Botón compartir */}
            <TouchableOpacity
              testID="share-button"
              onPress={handleShare}
              style={styles.shareBtn}
              accessibilityRole="button"
              accessibilityLabel="Compartir APOD"
            >
              <Text style={styles.shareBtnText}>Compartir</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050d24',
  },
  content: {
    paddingBottom: 40,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0a1628',
  },
  dateBtn: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#1a2a4a',
    minWidth: 44,
    alignItems: 'center',
  },
  dateBtnDisabled: {
    opacity: 0.3,
  },
  dateBtnText: {
    fontSize: 22,
    color: '#4fc3f7',
    lineHeight: 24,
  },
  dateLabel: {
    color: '#e8eaf6',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  centerView: {
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  loadingText: {
    color: '#607d8b',
    fontSize: 14,
  },
  errorIcon: { fontSize: 40 },
  errorText: {
    color: '#ef5350',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorSub: {
    color: '#607d8b',
    fontSize: 13,
    textAlign: 'center',
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e8eaf6',
    lineHeight: 26,
  },
  copyright: {
    fontSize: 12,
    color: '#90a4ae',
    fontStyle: 'italic',
  },
  explanation: {
    fontSize: 15,
    color: '#b0bec5',
    lineHeight: 22,
  },
  shareBtn: {
    marginTop: 8,
    backgroundColor: '#1565c0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' } as object,
    }),
  },
  shareBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
