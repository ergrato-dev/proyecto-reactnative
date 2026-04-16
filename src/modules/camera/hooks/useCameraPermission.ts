import { useState, useEffect, useCallback } from 'react';
import { useCameraPermissions, PermissionStatus } from 'expo-camera';

/** Estado expuesto por `useCameraPermission` */
export interface CameraPermissionState {
  /** El permiso fue concedido y la cámara puede usarse */
  granted: boolean;
  /** True mientras se espera la respuesta del SO al solicitar permiso */
  requesting: boolean;
  /** Solicita el permiso al sistema operativo */
  requestPermission: () => Promise<void>;
}

/**
 * @what Hook que gestiona el ciclo de vida del permiso de cámara usando
 *   la API de `expo-camera`.
 * @why Centraliza la lógica de permisos para que `ARConstellationScreen`
 *   solo reciba el estado final y no necesite interactuar directamente con
 *   `useCameraPermissions` de expo-camera.
 * @impact Cualquier cambio aquí afecta al flujo de permiso del módulo AR;
 *   los tests deben mockear `expo-camera`.
 */
export function useCameraPermission(): CameraPermissionState {
  const [permission, requestExpoPermission] = useCameraPermissions();
  const [requesting, setRequesting] = useState(false);

  // Sincronizar el estado de solicitud con la respuesta del hook de expo
  useEffect(() => {
    if (permission !== null) {
      setRequesting(false);
    }
  }, [permission]);

  const requestPermission = useCallback(async () => {
    setRequesting(true);
    await requestExpoPermission();
  }, [requestExpoPermission]);

  const granted = permission?.status === PermissionStatus.GRANTED;

  return { granted, requesting, requestPermission };
}
