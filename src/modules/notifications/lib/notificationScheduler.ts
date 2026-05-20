/**
 * Librería de scheduling de notificaciones locales.
 *
 * @what Encapsula las llamadas a `expo-notifications` para programar,
 *   cancelar y mostrar notificaciones inmediatas del showcase CosmosRN.
 * @why Aislar el SDK de Expo detrás de funciones tipadas permite testear
 *   la lógica de scheduling sin importar los módulos nativos.
 * @impact Usado por `NotificationSettingsScreen`. Cambios aquí afectan
 *   a todos los tipos de alerta de la app.
 */

import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import type { DonkiSolarFlare } from '@/shared/lib/nasaClient';
import { isMajorSolarFlare } from '../hooks/useDonki';
import { fetchIssPosition } from '@/shared/lib/issClient';

/**
 * Identificadores canónicos de los canales de notificación.
 * Usados para cancelar notificaciones por tipo.
 */
export const NOTIFICATION_IDENTIFIERS = {
  SOLAR_STORM: 'solar-storm-alert',
  APOD_DAILY: 'apod-daily-reminder',
  ISS_PASS: 'iss-pass-alert',
} as const;

/**
 * Configura el handler global de notificaciones para mostrarlas mientras
 * la app está en primer plano.
 *
 * @what Llama a `setNotificationHandler` con `shouldShowBanner: true`.
 * @why Sin este handler, las notificaciones enviadas mientras la app está
 *   activa no se muestran al usuario.
 * @impact Debe llamarse una sola vez, en el arranque de la app (App.tsx).
 */
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Envía una notificación inmediata de tormenta solar si hay llamaradas M+/X+.
 *
 * @what Filtra los eventos DONKI para clase M o X y programa una notificación
 *   inmediata (trigger null) con el nivel máximo detectado.
 * @why El módulo de notificaciones necesita alertar al usuario cuando la
 *   detección de eventos mayores se completa.
 * @impact Solo envía una notificación por lote de eventos para evitar spam.
 *   Si no hay eventos M+/X+, no hace nada.
 *
 * @param flares - Lista de llamaradas del período actual (de DONKI)
 * @returns El identificador de la notificación enviada, o `null` si no aplica
 */
export async function scheduleSolarStormAlert(
  flares: DonkiSolarFlare[],
): Promise<string | null> {
  const majorFlares = flares.filter((f) => isMajorSolarFlare(f.classType));
  if (majorFlares.length === 0) return null;

  // Encontrar el nivel máximo (X > M)
  const hasXClass = majorFlares.some((f) => f.classType.startsWith('X'));
  const maxClass = hasXClass ? 'X' : 'M';
  const count = majorFlares.length;

  const id = await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDENTIFIERS.SOLAR_STORM,
    content: {
      title: `⚡ Tormenta solar clase ${maxClass} detectada`,
      body: `${count} llamarada${count > 1 ? 's' : ''} activa${count > 1 ? 's' : ''}. Posible impacto en comunicaciones satelitales.`,
      data: { type: 'solar-storm', count, maxClass },
    },
    trigger: null, // inmediata
  });

  return id;
}

/**
 * Programa una notificación diaria recordando ver la imagen APOD.
 *
 * @what Programa una notificación repetitiva diaria a las 9:00 hora local.
 * @why El usuario puede activar un recordatorio diario para ver la imagen
 *   astronómica del día desde la pantalla de configuración.
 * @impact Cancela cualquier alerta diaria previa antes de programar la nueva
 *   para evitar duplicados.
 *
 * @returns El identificador de la notificación programada
 */
export async function scheduleApodDailyReminder(): Promise<string> {
  // Cancelar la anterior si existe
  await Notifications.cancelScheduledNotificationAsync(
    NOTIFICATION_IDENTIFIERS.APOD_DAILY,
  ).catch(() => null);

  const id = await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDENTIFIERS.APOD_DAILY,
    content: {
      title: '🌌 Imagen astronómica del día',
      body: 'La NASA ha publicado una nueva imagen del cosmos. ¡Ábrela en CosmosRN!',
      data: { type: 'apod-daily' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 9,
      minute: 0,
    },
  });

  return id;
}

/**
 * Cancela la notificación diaria de APOD.
 *
 * @what Elimina la notificación programada con el identificador APOD_DAILY.
 * @why El usuario puede desactivar el recordatorio desde la configuración.
 * @impact No lanza error si la notificación no existe.
 */
export async function cancelApodDailyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(
    NOTIFICATION_IDENTIFIERS.APOD_DAILY,
  ).catch(() => null);
}

// ─── ISS Pass Alert (RF-NOTIF-03) ────────────────────────────────────────────

/**
 * Calcula la distancia en kilómetros entre dos coordenadas geográficas
 * usando la fórmula de Haversine.
 *
 * @what Devuelve la distancia del arco de círculo máximo entre dos puntos
 *   en la superficie terrestre, ignorando la altitud de la ISS (~400 km).
 * @why La fórmula de Haversine es adecuada para distancias cortas y medias
 *   sin necesidad de proyecciones cartográficas complejas. Permite determinar
 *   si la ISS está dentro del umbral de 500 km en tierra.
 * @impact Usada exclusivamente por `scheduleIssPassAlert`. No tiene efectos
 *   secundarios ni dependencias externas.
 *
 * @param lat1 - Latitud del punto 1 en grados decimales
 * @param lon1 - Longitud del punto 1 en grados decimales
 * @param lat2 - Latitud del punto 2 en grados decimales
 * @param lon2 - Longitud del punto 2 en grados decimales
 * @returns Distancia en kilómetros
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // radio medio de la Tierra en km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Umbral en km para considerar que la ISS "pasa cerca" del usuario */
export const ISS_PASS_THRESHOLD_KM = 500;

/**
 * Solicita geolocalización del usuario, obtiene la posición ISS actual y,
 * si la distancia es ≤ 500 km, programa una notificación local inmediata.
 *
 * @what Implementa el criterio de aceptación RF-NOTIF-03: alertar al usuario
 *   cuando la ISS está dentro del radio de 500 km de su posición actual.
 * @why Open-Notify no ofrece un endpoint de predicción de paso; la alternativa
 *   es comparar la posición instantánea con la del usuario cada vez que se
 *   activa el toggle ISS en `NotificationSettingsScreen`.
 * @impact Requiere permiso `FOREGROUND` de localización (`expo-location`).
 *   Si el permiso es denegado lanza `Error('location-permission-denied')`.
 *   Si la ISS está a más de 500 km devuelve `null` sin enviar notificación.
 *   Solo cancela la notificación anterior si se va a enviar una nueva.
 *
 * @returns El identificador de la notificación enviada, o `null` si la ISS
 *   no está cerca o si no hay permiso de localización.
 * @throws Error con mensaje `'location-permission-denied'` si el permiso
 *   fue denegado por el usuario o el sistema.
 */
export async function scheduleIssPassAlert(): Promise<string | null> {
  // 1. Solicitar permiso de localización en primer plano
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('location-permission-denied');
  }

  // 2. Obtener posición del usuario (precisión reducida es suficiente)
  const userLocation = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  const userLat = userLocation.coords.latitude;
  const userLon = userLocation.coords.longitude;

  // 3. Obtener posición actual de la ISS (Open-Notify)
  const issData = await fetchIssPosition();
  const issLat = parseFloat(issData.iss_position.latitude);
  const issLon = parseFloat(issData.iss_position.longitude);

  // 4. Calcular distancia en km
  const distanceKm = haversineDistance(userLat, userLon, issLat, issLon);

  // 5. Solo notificar si la ISS está dentro del umbral
  if (distanceKm > ISS_PASS_THRESHOLD_KM) {
    return null;
  }

  // 6. Cancelar alerta previa del mismo canal para evitar duplicados
  await Notifications.cancelScheduledNotificationAsync(
    NOTIFICATION_IDENTIFIERS.ISS_PASS,
  ).catch(() => null);

  const id = await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDENTIFIERS.ISS_PASS,
    content: {
      title: '🛰️ ¡La ISS está pasando cerca!',
      body: `La Estación Espacial Internacional se encuentra a ~${Math.round(distanceKm)} km de tu posición. ¡Mira al cielo!`,
      data: { type: 'iss-pass', distanceKm },
    },
    trigger: null, // inmediata
  });

  return id;
}

/**
 * Cancela cualquier alerta de paso ISS pendiente.
 *
 * @what Elimina la notificación programada con el identificador ISS_PASS.
 * @why El usuario puede desactivar el toggle ISS en cualquier momento.
 * @impact No lanza error si la notificación no existe.
 */
export async function cancelIssPassAlert(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(
    NOTIFICATION_IDENTIFIERS.ISS_PASS,
  ).catch(() => null);
}
