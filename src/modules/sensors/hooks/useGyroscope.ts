import { useState, useEffect, useRef } from 'react';
import { Gyroscope } from 'expo-sensors';

/** Rotación angular acumulada en cada eje (radianes) */
export interface GyroscopeRotation {
  x: number;
  y: number;
  z: number;
}

/** Intervalo de muestreo del giroscopio en ms */
const SAMPLE_INTERVAL_MS = 16; // ~60 fps

/**
 * Hook que suscribe al giroscopio del dispositivo y acumula la rotación
 * como deltas integrados en el tiempo.
 *
 * @what Escucha `Gyroscope` de expo-sensors e integra la velocidad angular
 *   (rad/s) × Δt para obtener rotación acumulada en X, Y y Z.
 * @why La pantalla de star map necesita la orientación del dispositivo para
 *   desplazar el cielo estrellado. El giroscopio da movimiento suave; la
 *   integración manual evita la deriva de los filtros de plataforma.
 * @impact Cancela la suscripción en `unmount` para evitar fugas de memoria.
 *   Si el hardware no está disponible, `isAvailable` es `false` y el valor
 *   permanece en cero — la UI puede degradar a gestos táctiles.
 *
 * @returns Objeto con rotación acumulada, disponibilidad y función de reset
 */
export function useGyroscope(): {
  rotation: GyroscopeRotation;
  isAvailable: boolean;
  reset: () => void;
} {
  const [rotation, setRotation] = useState<GyroscopeRotation>({ x: 0, y: 0, z: 0 });
  const [isAvailable, setIsAvailable] = useState(false);
  const lastTimestamp = useRef<number | null>(null);
  const rotationRef = useRef<GyroscopeRotation>({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    let subscription: ReturnType<typeof Gyroscope.addListener> | null = null;

    // Verificar disponibilidad del hardware antes de suscribir
    Gyroscope.isAvailableAsync()
      .then((available) => {
        setIsAvailable(available);
        if (!available) return;

        Gyroscope.setUpdateInterval(SAMPLE_INTERVAL_MS);

        subscription = Gyroscope.addListener(({ x, y, z }) => {
          const now = Date.now();
          const dt = lastTimestamp.current !== null
            ? (now - lastTimestamp.current) / 1000 // segundos
            : SAMPLE_INTERVAL_MS / 1000;
          lastTimestamp.current = now;

          // Integrar velocidad angular → rotación acumulada
          rotationRef.current = {
            x: rotationRef.current.x + x * dt,
            y: rotationRef.current.y + y * dt,
            z: rotationRef.current.z + z * dt,
          };
          setRotation({ ...rotationRef.current });
        });
      })
      .catch(() => setIsAvailable(false));

    return () => {
      subscription?.remove();
    };
  }, []);

  /**
   * Reinicia la rotación acumulada a cero.
   *
   * @what Resetea el estado `rotation` y el ref interno.
   * @why Permite al usuario centrar el cielo estrellado en la posición actual
   *   del dispositivo con el botón "centrar".
   * @impact Solo afecta el estado local del hook; no reinicia el hardware.
   */
  function reset(): void {
    rotationRef.current = { x: 0, y: 0, z: 0 };
    lastTimestamp.current = null;
    setRotation({ x: 0, y: 0, z: 0 });
  }

  return { rotation, isAvailable, reset };
}
