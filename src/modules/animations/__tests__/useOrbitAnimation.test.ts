/**
 * Tests unitarios del hook useOrbitAnimation.
 *
 * @what Verifica el estado inicial, las transiciones pause/resume y que
 *   los callbacks de Reanimated son invocados correctamente.
 * @why El hook gestiona el ciclo de vida de las animaciones orbitales;
 *   si pausar/reanudar no funciona, toda la pantalla deja de responder.
 * @impact Mock completo de `react-native-reanimated` — no requiere entorno nativo.
 *   Accede a los jest.fn() vía jest.requireMock para evitar el problema de hoisting.
 */

import { renderHook, act } from '@testing-library/react-native';

// ─── Mock de react-native-reanimated ─────────────────────────────────────────
// Todas las funciones se definen inline en la factory para evitar el problema
// de hoisting: jest.mock() se eleva al inicio y las variables externas son
// undefined en ese momento aunque tengan prefijo 'mock'.

jest.mock('react-native-reanimated', () => ({
  useSharedValue: (initial: number) => ({ value: initial }),
  cancelAnimation: jest.fn(),
  withRepeat: jest.fn((animation: unknown) => animation),
  withTiming: jest.fn((toValue: unknown, _config: unknown) => toValue),
  Easing: { linear: 'linear' },
}));

// Acceso a los mocks tras el hoisting
import * as Reanimated from 'react-native-reanimated';
const mockedReanimated = jest.requireMock<typeof Reanimated>('react-native-reanimated');

// ─── Import del hook bajo test (después del mock) ─────────────────────────────

import { useOrbitAnimation } from '../hooks/useOrbitAnimation';

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useOrbitAnimation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('arranca en estado isPlaying = true', () => {
    const { result } = renderHook(() => useOrbitAnimation(8000));
    expect(result.current.isPlaying).toBe(true);
  });

  it('expone angle como objeto con propiedad value', () => {
    const { result } = renderHook(() => useOrbitAnimation(4000));
    expect(result.current.angle).toHaveProperty('value');
  });

  it('pause() cambia isPlaying a false', () => {
    const { result } = renderHook(() => useOrbitAnimation(8000));
    act(() => {
      result.current.pause();
    });
    expect(result.current.isPlaying).toBe(false);
  });

  it('pause() llama a cancelAnimation', () => {
    const { result } = renderHook(() => useOrbitAnimation(8000));
    act(() => {
      result.current.pause();
    });
    expect(mockedReanimated.cancelAnimation).toHaveBeenCalled();
  });

  it('resume() cambia isPlaying a true después de pause()', () => {
    const { result } = renderHook(() => useOrbitAnimation(8000));
    act(() => { result.current.pause(); });
    act(() => { result.current.resume(); });
    expect(result.current.isPlaying).toBe(true);
  });

  it('resume() llama a withRepeat para reiniciar la animación', () => {
    const { result } = renderHook(() => useOrbitAnimation(8000));
    // Limpiar llamadas del arranque inicial
    jest.clearAllMocks();
    act(() => { result.current.pause(); });
    act(() => { result.current.resume(); });
    expect(mockedReanimated.withRepeat).toHaveBeenCalled();
  });

  it('acepta un ángulo inicial personalizado', () => {
    const { result } = renderHook(() => useOrbitAnimation(8000, Math.PI));
    expect(result.current.angle.value).toBeDefined();
  });

  it('withTiming se llama en el arranque con una duración <= periodMs', () => {
    renderHook(() => useOrbitAnimation(5000));
    expect(mockedReanimated.withTiming).toHaveBeenCalled();
    const calls = (mockedReanimated.withTiming as jest.Mock).mock.calls;
    // El segundo argumento es { duration, easing }
    const { duration } = calls[0][1] as { duration: number; easing: unknown };
    expect(duration).toBeGreaterThan(0);
    expect(duration).toBeLessThanOrEqual(5000);
  });
});
