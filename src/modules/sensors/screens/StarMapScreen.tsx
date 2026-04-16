/**
 * Pantalla de mapa estelar controlado por giroscopio.
 *
 * @what Renderiza ≥ 100 estrellas del catálogo Hipparcos sobre un canvas
 *   oscuro. El giroscopio del dispositivo controla la rotación del cielo;
 *   si no hay hardware disponible, dos paneles táctiles permiten desplazar
 *   el mapa con el dedo. Muestra la constelación más cercana al centro.
 * @why Demuestra el uso de `expo-sensors` (Gyroscope + Accelerometer) con
 *   integración de velocidad angular en tiempo real, proyección esférica
 *   equidistante y fallback táctil para dispositivos o emuladores sin sensor.
 * @impact Depende de `useGyroscope`, `useAccelerometer`, `stars.ts`.
 *   No requiere red — funciona completamente offline.
 *   El canvas usa React Native `View` + posicionamiento absoluto (no SVG)
 *   para máxima compatibilidad cross-platform.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useGyroscope } from '../hooks/useGyroscope';
import { useAccelerometer } from '../hooks/useAccelerometer';
import { BRIGHT_STARS, CONSTELLATIONS, type Star } from '../data/stars';

// ─── Proyección ───────────────────────────────────────────────────────────────

/**
 * Proyecta coordenadas esféricas (RA, Dec) a píxeles de pantalla usando
 * proyección acimutal equidistante centrada en el punto de mira.
 *
 * @what Convierte RA/Dec (grados) al punto (x, y) en una ventana de
 *   `width × height` píxeles dado el desplazamiento del observador.
 * @why La proyección equidistante conserva ángulos desde el centro, lo que
 *   resulta en un look natural para un star map portátil.
 * @impact Usada por `StarDot` y `ConstellationLines` — cambios aquí afectan
 *   la distorsión visual del mapa.
 *
 * @param ra       - Ascensión recta de la estrella (grados)
 * @param dec      - Declinación de la estrella (grados)
 * @param offsetRa - Desplazamiento horizontal del observador (grados)
 * @param offsetDec- Desplazamiento vertical del observador (grados)
 * @param width    - Ancho de la pantalla (px)
 * @param height   - Alto de la pantalla (px)
 * @returns Coordenadas {x, y} en píxeles, o null si la estrella está detrás
 */
function projectStar(
  ra: number,
  dec: number,
  offsetRa: number,
  offsetDec: number,
  width: number,
  height: number,
): { x: number; y: number } | null {
  const SCALE = 3.5; // grados por píxel (campo de visión)
  const cx = width / 2;
  const cy = height / 2;

  // Diferencia angular normalizada (–180 a +180)
  let dRa = ra - offsetRa;
  while (dRa > 180) dRa -= 360;
  while (dRa < -180) dRa += 360;

  const dDec = dec - offsetDec;

  // Fuera del campo visual → no proyectar
  const halfFovH = (cx / SCALE) * 1.2;
  const halfFovV = (cy / SCALE) * 1.2;
  if (Math.abs(dRa) > halfFovH || Math.abs(dDec) > halfFovV) return null;

  const x = cx + (dRa * SCALE);
  const y = cy - (dDec * SCALE);
  return { x, y };
}

/**
 * Encuentra la constelación cuyo centro está más cerca del punto de mira.
 *
 * @what Calcula la distancia angular entre el centro de cada constelación
 *   y las coordenadas actuales del observador.
 * @why La pantalla muestra el nombre de la constelación más cercana al centro.
 * @impact Llamada en cada render; con 12 constelaciones el coste es insignificante.
 *
 * @param offsetRa  - RA actual del observador (grados)
 * @param offsetDec - Dec actual del observador (grados)
 * @returns Nombre de la constelación más próxima
 */
function nearestConstellationName(offsetRa: number, offsetDec: number): string {
  let minDist = Infinity;
  let nearest = '';

  for (const c of CONSTELLATIONS) {
    let dRa = c.centerRa - offsetRa;
    while (dRa > 180) dRa -= 360;
    while (dRa < -180) dRa += 360;
    const dDec = c.centerDec - offsetDec;
    const dist = Math.sqrt(dRa * dRa + dDec * dDec);
    if (dist < minDist) {
      minDist = dist;
      nearest = c.name;
    }
  }
  return nearest;
}

// ─── StarDot ──────────────────────────────────────────────────────────────────

/** Tamaño máximo de una estrella (magnitud = –1.46 → Sirio) */
const MAX_STAR_SIZE = 8;
/** Tamaño mínimo de estrella visible */
const MIN_STAR_SIZE = 1.5;

/**
 * Punto visual de una estrella en el canvas.
 *
 * @what Renderiza un círculo blanco con radio proporcional a la magnitud.
 * @why Las estrellas más brillantes (magnitud baja) deben ser más grandes
 *   para un aspecto realista del cielo nocturno.
 * @impact No tiene lógica de posicionamiento — recibe coordenadas ya proyectadas.
 *
 * @param x         - Posición X en px
 * @param y         - Posición Y en px
 * @param magnitude - Magnitud aparente (menor = más brillante)
 * @param name      - Nombre propio (opcional, se muestra si la estrella es brillante)
 */
function StarDot({
  x,
  y,
  magnitude,
  name,
}: {
  x: number;
  y: number;
  magnitude: number;
  name?: string;
}) {
  // Mapear magnitud (–2 a 4) a tamaño (MAX a MIN)
  const size = Math.max(
    MIN_STAR_SIZE,
    MAX_STAR_SIZE - ((magnitude + 2) / 6) * (MAX_STAR_SIZE - MIN_STAR_SIZE),
  );

  // Opacidad: estrellas brillantes son más blancas
  const opacity = magnitude < 1 ? 1 : magnitude < 2 ? 0.9 : 0.75;

  return (
    <View
      style={[
        styles.star,
        {
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity,
        },
      ]}
    >
      {name && magnitude < 1.5 && (
        <Text style={[styles.starLabel, { top: size + 2, left: -20 }]}>{name}</Text>
      )}
    </View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────

/**
 * Pantalla StarMapScreen — star map interactivo con giroscopio.
 *
 * @what Renderiza el cielo estrellado proyectado en la pantalla con
 *   desplazamiento controlado por el giroscopio del dispositivo.
 *   Fallback táctil si el giroscopio no está disponible.
 * @why Demuestra la integración de sensores nativos con renderizado en
 *   tiempo real en React Native sin depender de WebGL ni librerías 3D.
 * @impact Este componente se renderiza como pantalla del drawer Sensors.
 *   No tiene dependencias de red.
 */
export function StarMapScreen() {
  const { width, height } = useWindowDimensions();
  const { rotation, isAvailable: gyroAvailable, reset } = useGyroscope();
  const { isAvailable: accelAvailable } = useAccelerometer();

  // Posición base del observador (RA/Dec en grados)
  const [baseRa, setBaseRa] = useState(83.8); // centrado en Orión al inicio
  const [baseDec, setBaseDec] = useState(0.0);

  // El giroscopio controla el desplazamiento respecto a la base
  // rotation.y integra el movimiento horizontal (eje Y del teléfono = RA)
  // rotation.x integra el movimiento vertical (eje X del teléfono = Dec)
  const RAD_TO_DEG = 180 / Math.PI;
  const GYRO_SENSITIVITY = 30; // factor de escala grados/rad
  const offsetRa = gyroAvailable
    ? baseRa - rotation.y * RAD_TO_DEG * GYRO_SENSITIVITY
    : baseRa;
  const offsetDec = gyroAvailable
    ? baseDec + rotation.x * RAD_TO_DEG * GYRO_SENSITIVITY
    : baseDec;

  // Pan responder para fallback táctil (desplazamiento con dedo)
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !gyroAvailable,
    onMoveShouldSetPanResponder: () => !gyroAvailable,
    onPanResponderMove: (_, gestureState) => {
      // 1 px de movimiento ≈ 0.15 grados
      const TOUCH_SENSITIVITY = 0.15;
      setBaseRa((prev) => prev - gestureState.dx * TOUCH_SENSITIVITY);
      setBaseDec((prev) => prev + gestureState.dy * TOUCH_SENSITIVITY);
    },
  });

  const constellationName = nearestConstellationName(offsetRa, offsetDec);

  /**
   * Centra el star map en Orión y reinicia la rotación del giroscopio.
   *
   * @what Pone la base en RA=83.8, Dec=0 (centro de Orión) y llama a `reset`.
   * @why Permite al usuario orientarse rápidamente si se pierde en el cielo.
   * @impact Solo afecta el estado local — no hay llamadas de red ni efectos.
   */
  const handleCenter = useCallback(() => {
    setBaseRa(83.8);
    setBaseDec(0.0);
    reset();
  }, [reset]);

  // Proyectar todas las estrellas visibles
  const visibleStars: Array<{ star: Star; x: number; y: number }> = [];
  for (const star of BRIGHT_STARS) {
    const pos = projectStar(star.ra, star.dec, offsetRa, offsetDec, width, height);
    if (pos) visibleStars.push({ star, x: pos.x, y: pos.y });
  }

  const sensorsLabel = gyroAvailable
    ? '🔄 Giroscopio activo'
    : accelAvailable
    ? '📱 Giroscopio no disponible — usa gestos táctiles'
    : '⚠️ Sensores no disponibles — usa gestos táctiles';

  return (
    <View style={styles.container} testID="star-map-screen">
      {/* Canvas del cielo */}
      <View style={[styles.canvas, { width, height }]} {...panResponder.panHandlers}>
        {/* Estrellas */}
        {visibleStars.map(({ star, x, y }) => (
          <StarDot
            key={star.id}
            x={x}
            y={y}
            magnitude={star.magnitude}
            name={star.name}
          />
        ))}

        {/* Retícula central */}
        <View
          style={[styles.reticle, { left: width / 2 - 15, top: height / 2 - 15 }]}
          pointerEvents="none"
        />
      </View>

      {/* Overlay superior: constelación más cercana */}
      <View style={styles.topOverlay} pointerEvents="none">
        <Text style={styles.constellationLabel} testID="constellation-label">
          ✦ {constellationName}
        </Text>
        <Text style={styles.sensorStatus}>{sensorsLabel}</Text>
      </View>

      {/* Controles inferiores */}
      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.controlButton} onPress={handleCenter} testID="center-button">
          <Text style={styles.controlButtonText}>⊕ Centrar</Text>
        </TouchableOpacity>
        <Text style={styles.coordsLabel}>
          RA {offsetRa.toFixed(1)}° Dec {offsetDec.toFixed(1)}°
        </Text>
        <Text style={styles.starsCount}>{visibleStars.length} estrellas</Text>
      </View>

      {/* Banner de fallback táctil */}
      {!gyroAvailable && (
        <View style={styles.fallbackBanner} pointerEvents="none">
          <Text style={styles.fallbackText}>
            {Platform.OS === 'web'
              ? 'Giroscopio no disponible en Web. Usa gestos táctiles.'
              : 'Mueve el dispositivo o arrastra con el dedo para explorar el cielo.'}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000008',
  },
  canvas: {
    position: 'absolute',
    backgroundColor: '#000008',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#ffffff',
  },
  starLabel: {
    position: 'absolute',
    color: '#b0bec5',
    fontSize: 9,
    width: 60,
    textAlign: 'center',
  },
  reticle: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(79,195,247,0.5)',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 52,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  constellationLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4fc3f7',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  sensorStatus: {
    fontSize: 11,
    color: 'rgba(144,164,174,0.8)',
    marginTop: 4,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  controlButton: {
    backgroundColor: 'rgba(13,30,70,0.85)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#1565c0',
  },
  controlButtonText: {
    color: '#4fc3f7',
    fontSize: 14,
    fontWeight: '600',
  },
  coordsLabel: {
    color: 'rgba(144,164,174,0.7)',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  starsCount: {
    color: 'rgba(144,164,174,0.7)',
    fontSize: 11,
  },
  fallbackBanner: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(21,101,192,0.75)',
    borderRadius: 12,
    padding: 12,
  },
  fallbackText: {
    color: '#e3f2fd',
    fontSize: 13,
    textAlign: 'center',
  },
});
