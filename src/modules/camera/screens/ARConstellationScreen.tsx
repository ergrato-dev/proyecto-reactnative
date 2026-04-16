import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import { CameraView } from 'expo-camera';
import { ConstellationOverlay } from '../components/ConstellationOverlay';
import { useCameraPermission } from '../hooks/useCameraPermission';
import { useGyroscope } from '@/modules/sensors/hooks/useGyroscope';
import { AR_CONSTELLATIONS } from '../data/constellations';

/**
 * @what Pantalla principal del módulo de cámara AR. Muestra la vista en vivo
 *   de la cámara trasera con un overlay SVG de constelaciones alineado por
 *   giroscopio. Incluye botón de captura de foto y degradación en Web.
 * @why Demuestra la integración de expo-camera + react-native-svg + expo-sensors
 *   en un caso de uso astronómico: "apunta al cielo y ve las constelaciones".
 * @impact Requiere permiso `CAMERA`; en Web muestra pantalla informativa.
 *   La captura de foto se registra en el estado local (no se persiste en disco
 *   para simplificar el demo — el módulo `storage/` es el responsable del guardado).
 */
export function ARConstellationScreen() {
  // Degradación en Web — expo-camera no funciona en navegadores
  if (Platform.OS === 'web') {
    return (
      <View style={styles.degraded} testID="web-fallback">
        <Text style={styles.degradedIcon}>📷</Text>
        <Text style={styles.degradedTitle}>Cámara AR no disponible en Web</Text>
        <Text style={styles.degradedSubtitle}>
          Esta función requiere una cámara nativa.{'\n'}
          Usa la app en Android o iOS para ver las constelaciones en AR.
        </Text>
      </View>
    );
  }

  return <ARConstellationNative />;
}

/** Implementación nativa de la pantalla AR (iOS / Android) */
function ARConstellationNative() {
  const { granted, requesting, requestPermission } = useCameraPermission();
  const { rotation } = useGyroscope();

  // Última foto capturada (URI temporal de expo-camera)
  const [lastPhotoUri, setLastPhotoUri] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Referencia a la cámara para la captura
  const cameraRef = React.useRef<CameraView>(null);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) {
        setLastPhotoUri(photo.uri);
        setShowPreview(true);
      }
    } catch {
      // Captura fallida — ignorar silenciosamente en el demo
    }
  }, []);

  // Pantalla de solicitud de permiso
  if (!granted) {
    return (
      <View style={styles.permission} testID="permission-screen">
        <Text style={styles.permissionIcon}>🔭</Text>
        <Text style={styles.permissionTitle}>Permiso de cámara requerido</Text>
        <Text style={styles.permissionBody}>
          Para ver las constelaciones superpuestas en tiempo real, la app necesita
          acceso a la cámara trasera de tu dispositivo.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
          disabled={requesting}
          accessibilityLabel="Conceder permiso de cámara"
          accessibilityRole="button"
          testID="btn-request-permission"
        >
          <Text style={styles.permissionButtonText}>
            {requesting ? 'Solicitando…' : 'Conceder permiso'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Pantalla de previsualización de la foto capturada
  if (showPreview && lastPhotoUri) {
    return (
      <View style={styles.preview} testID="photo-preview">
        <Image source={{ uri: lastPhotoUri }} style={styles.previewImage} resizeMode="contain" />
        <TouchableOpacity
          style={styles.previewClose}
          onPress={() => setShowPreview(false)}
          accessibilityLabel="Cerrar previsualización"
          accessibilityRole="button"
          testID="btn-close-preview"
        >
          <Text style={styles.previewCloseText}>✕ Cerrar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Pantalla AR principal: cámara + overlay SVG
  return (
    <View style={styles.container} testID="ar-screen">
      {/* Vista en vivo de la cámara trasera */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        testID="camera-view"
      />

      {/* Overlay de constelaciones (sin bloquear eventos táctiles a la cámara) */}
      <ConstellationOverlay
        constellations={AR_CONSTELLATIONS}
        pitchDeg={rotation.x * (180 / Math.PI)}
        rollDeg={rotation.z * (180 / Math.PI)}
      />

      {/* Barra de controles inferior */}
      <View style={styles.controls}>
        {/* Botón de captura */}
        <TouchableOpacity
          style={styles.captureButton}
          onPress={handleCapture}
          accessibilityLabel="Capturar foto con overlay de constelaciones"
          accessibilityRole="button"
          testID="btn-capture"
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
      </View>

      {/* Panel de info: nombre de la constelación más centrada */}
      <View style={styles.infoPanel} testID="info-panel">
        <Text style={styles.infoPanelText}>
          {AR_CONSTELLATIONS.length} constelaciones visibles
        </Text>
        <Text style={styles.infoPanelSub}>
          Gira el dispositivo para explorar el cielo
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  // ── Degradación Web ───────────────────────────────────────────────────────
  degraded: {
    flex: 1,
    backgroundColor: '#050d24',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  degradedIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  degradedTitle: {
    color: '#4fc3f7',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  degradedSubtitle: {
    color: '#90a4ae',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  // ── Solicitud de permiso ──────────────────────────────────────────────────
  permission: {
    flex: 1,
    backgroundColor: '#050d24',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  permissionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  permissionBody: {
    color: '#90a4ae',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#4fc3f7',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
    minWidth: 200,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#050d24',
    fontWeight: '700',
    fontSize: 16,
  },
  // ── AR principal ──────────────────────────────────────────────────────────
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
  },
  infoPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(5,13,36,0.7)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  infoPanelText: {
    color: '#4fc3f7',
    fontSize: 13,
    fontWeight: '700',
  },
  infoPanelSub: {
    color: '#90a4ae',
    fontSize: 11,
    marginTop: 2,
  },
  // ── Previsualización de foto ──────────────────────────────────────────────
  preview: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewImage: {
    flex: 1,
  },
  previewClose: {
    position: 'absolute',
    top: 48,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  previewCloseText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
