/**
 * Barrel export del módulo `notifications`.
 *
 * @what Reexporta los componentes públicos del módulo para consumo
 *   desde otros módulos (principalmente `navigation/`).
 * @why Permite importar desde `@/modules/notifications` sin exponer la
 *   estructura interna del módulo.
 * @impact Cualquier cambio en los nombres de exportación de este archivo
 *   romperá los importadores en `navigation/navigators/NotificationsStack.tsx`.
 */

export { NotificationSettingsScreen } from './screens/NotificationSettingsScreen';
export { useDonki, isMajorSolarFlare } from './hooks/useDonki';
export { useNotificationPermission } from './hooks/useNotificationPermission';
export {
  configureNotificationHandler,
  scheduleSolarStormAlert,
  scheduleApodDailyReminder,
  cancelApodDailyReminder,
  NOTIFICATION_IDENTIFIERS,
} from './lib/notificationScheduler';
