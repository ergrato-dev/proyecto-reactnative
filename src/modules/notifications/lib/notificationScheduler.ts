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
import type { DonkiSolarFlare } from '@/shared/lib/nasaClient';
import { isMajorSolarFlare } from '../hooks/useDonki';

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
