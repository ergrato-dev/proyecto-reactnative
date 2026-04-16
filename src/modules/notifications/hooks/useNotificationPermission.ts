import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';

/** Resultado posible de la solicitud de permiso */
export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

/**
 * Hook que gestiona el ciclo de vida del permiso de notificaciones.
 *
 * @what Verifica el estado actual del permiso y expone una función para
 *   solicitarlo al usuario con explicación en español.
 * @why Las notificaciones requieren permiso explícito en Android 13+ e iOS.
 *   Centralizar la lógica evita duplicar la solicitud en múltiples pantallas.
 * @impact Usado en `NotificationSettingsScreen`. Cambios aquí afectan al
 *   único punto de solicitud de permiso de la app.
 *
 * @returns Objeto con `status`, `isGranted`, `isLoading` y `requestPermission`
 */
export function useNotificationPermission(): {
  status: PermissionStatus;
  isGranted: boolean;
  isLoading: boolean;
  requestPermission: () => Promise<PermissionStatus>;
} {
  const [status, setStatus] = useState<PermissionStatus>('undetermined');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar el estado actual del permiso al montar el hook
    Notifications.getPermissionsAsync()
      .then((result) => {
        setStatus(mapStatus(result.status));
      })
      .finally(() => setIsLoading(false));
  }, []);

  /**
   * Solicita el permiso de notificaciones al usuario.
   *
   * @what Llama a `requestPermissionsAsync` y actualiza el estado local.
   * @why Separar la solicitud de la verificación permite que la UI decida
   *   cuándo mostrar el diálogo nativo del sistema.
   * @impact El permiso solo puede solicitarse una vez en iOS; en Android
   *   puede volver a solicitarse si fue denegado.
   *
   * @returns El nuevo estado del permiso tras la solicitud
   */
  async function requestPermission(): Promise<PermissionStatus> {
    setIsLoading(true);
    try {
      const result = await Notifications.requestPermissionsAsync();
      const newStatus = mapStatus(result.status);
      setStatus(newStatus);
      return newStatus;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    status,
    isGranted: status === 'granted',
    isLoading,
    requestPermission,
  };
}

/**
 * Convierte el tipo `PermissionStatus` de Expo al tipo local simplificado.
 *
 * @what Mapea `granted` → `'granted'`, `denied` → `'denied'`,
 *   cualquier otro valor → `'undetermined'`.
 * @why Aislar la API de Expo detrás de un tipo propio permite testear
 *   sin importar la constante `PermissionStatus` de expo-notifications.
 * @impact Solo usada dentro de `useNotificationPermission`.
 *
 * @param expoStatus - Estado devuelto por expo-notifications
 * @returns Estado simplificado
 */
function mapStatus(expoStatus: string): PermissionStatus {
  if (expoStatus === 'granted') return 'granted';
  if (expoStatus === 'denied') return 'denied';
  return 'undetermined';
}
