/**
 * Módulo `camera/` — Cámara AR con overlay de constelaciones.
 *
 * @what Demuestra el uso de `expo-camera` para vista en vivo de la cámara
 *   trasera, con un overlay SVG de constelaciones alineado mediante el
 *   giroscopio del dispositivo (`expo-sensors`). Incluye captura de foto.
 * @why El caso de uso astronómico es "apunta al cielo y ve las constelaciones
 *   superpuestas en tiempo real" — muestra la integración de múltiples APIs
 *   nativas (cámara, sensores, SVG) en un único módulo cohesivo.
 * @impact Requiere permiso `CAMERA` en Android e iOS.
 *   En Web, renderiza una pantalla de degradación informativa.
 *   Depende del módulo `sensors/` para el hook `useGyroscope`.
 */

export { ARConstellationScreen } from './screens/ARConstellationScreen';
export { ConstellationOverlay } from './components/ConstellationOverlay';
export { useCameraPermission } from './hooks/useCameraPermission';
export { AR_CONSTELLATIONS } from './data/constellations';
export type { ARConstellation, ARStar } from './data/constellations';
export type { CameraPermissionState } from './hooks/useCameraPermission';
export type { ConstellationOverlayProps } from './components/ConstellationOverlay';
