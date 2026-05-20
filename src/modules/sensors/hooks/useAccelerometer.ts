import { useState, useEffect } from 'react';
import { Accelerometer } from 'expo-sensors';

/** Componentes de aceleración normalizados (–1 a +1 aproximadamente) */
export interface AccelerometerReading {
  /** Inclinación lateral (eje X del dispositivo) */
  x: number;
  /** Inclinación vertical (eje Y del dispositivo) */
  y: number;
  /** Componente perpendicular a la pantalla (eje Z) */
  z: number;
}

/** Intervalo de muestreo del acelerómetro en ms */
const SAMPLE_INTERVAL_MS = 32; // ~30 fps (menos suave que giroscopio, suficiente para tilt)

/**
 * Hook que suscribe al acelerómetro del dispositivo y expone la inclinación
 * actual normalizada.
 *
 * @what Escucha `Accelerometer` de expo-sensors y expone los valores brutos
 *   de aceleración (incluye gravedad). No acumula: cada lectura es absoluta.
 * @why El star map usa el acelerómetro como complemento al giroscopio para
 *   controlar la inclinación (pitch/roll) del horizonte estelar.
 * @impact Cancela la suscripción en `unmount`. Si no hay hardware disponible,
 *   `isAvailable` es `false` y los valores permanecen en cero.
 *
 * @returns Objeto con última lectura de aceleración y disponibilidad
 */
export function useAccelerometer(): {
  acceleration: AccelerometerReading;
  isAvailable: boolean;
} {
  const [acceleration, setAcceleration] = useState<AccelerometerReading>({
    x: 0,
    y: 0,
    z: 0,
  });
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    let subscription: ReturnType<typeof Accelerometer.addListener> | null = null;

    Accelerometer.isAvailableAsync()
      .then((available) => {
        setIsAvailable(available);
        if (!available) return;

        Accelerometer.setUpdateInterval(SAMPLE_INTERVAL_MS);
        subscription = Accelerometer.addListener(({ x, y, z }) => {
          setAcceleration({ x, y, z });
        });
      })
      .catch(() => setIsAvailable(false));

    return () => {
      subscription?.remove();
    };
  }, []);

  return { acceleration, isAvailable };
}
