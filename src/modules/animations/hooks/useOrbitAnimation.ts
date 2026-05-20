import { useCallback, useRef, useState } from 'react';
import {
  cancelAnimation,
  Easing,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

/**
 * @what Hook que gestiona la animación de ángulo orbital continuo para un planeta.
 * @why Encapsula el ciclo de vida de la animación Reanimated (arrancar, pausar, reanudar)
 *   para que OrbitingPlanet solo reciba datos y no gestione shared values.
 * @impact Cada planeta tiene su propio hook; pausar todos implica llamar `pause()`
 *   en cada instancia. Requiere `react-native-reanimated` ≥ 4.x instalado.
 *
 * @param periodMs - Duración de una órbita completa en milisegundos.
 * @param initialAngle - Ángulo de inicio en radianes (por defecto 0).
 * @returns Objeto con `angle` (SharedValue), `pause`, `resume` e `isPlaying`.
 */
export function useOrbitAnimation(periodMs: number, initialAngle = 0) {
  const angle = useSharedValue(initialAngle);
  const [isPlaying, setIsPlaying] = useState(true);
  // Guardamos el ángulo en el momento de pausa para reanudar desde ahí
  const pausedAngleRef = useRef(initialAngle);

  /** Inicia la animación orbital desde el ángulo actual hasta 2π (+ repetición infinita) */
  const startAnimation = useCallback(
    (fromAngle: number) => {
      // Calculamos el tiempo restante proporcional al ángulo que falta
      const remaining = 2 * Math.PI - (fromAngle % (2 * Math.PI));
      const initialDuration = Math.round((remaining / (2 * Math.PI)) * periodMs);

      // Primer ciclo: llega hasta 2π; luego repite infinitamente ciclos completos
      angle.value = fromAngle;
      angle.value = withRepeat(
        withTiming(fromAngle + remaining, {
          duration: initialDuration,
          easing: Easing.linear,
        }),
        -1,
        false,
      );
    },
    [angle, periodMs],
  );

  /** Pausa la animación guardando el ángulo actual */
  const pause = useCallback(() => {
    pausedAngleRef.current = angle.value;
    cancelAnimation(angle);
    setIsPlaying(false);
  }, [angle]);

  /** Reanuda la animación desde el ángulo en el que se pausó */
  const resume = useCallback(() => {
    startAnimation(pausedAngleRef.current);
    setIsPlaying(true);
  }, [startAnimation]);

  // Arranque inicial (sólo una vez; el hook no necesita cleanup porque
  // el shared value vive mientras el componente esté montado)
  const startedRef = useRef(false);
  if (!startedRef.current) {
    startedRef.current = true;
    startAnimation(initialAngle);
  }

  return { angle, isPlaying, pause, resume };
}
