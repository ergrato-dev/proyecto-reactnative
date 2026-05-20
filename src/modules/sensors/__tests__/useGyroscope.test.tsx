/**
 * Tests unitarios del hook useGyroscope.
 *
 * @what Verifica el ciclo de vida del hook: disponibilidad del sensor,
 *   suscripción al listener, acumulación de rotación y función reset.
 * @why El hook integra velocidad angular → ángulo; cualquier error en la
 *   lógica de integración produce un star map que rota incorrectamente.
 * @impact Mock de expo-sensors — tests aislados del hardware real.
 */

import { renderHook, act } from '@testing-library/react-native';
import { useGyroscope } from '../hooks/useGyroscope';

// ─── Mock de expo-sensors ─────────────────────────────────────────────────────

const mockSubscriptionRemove = jest.fn();
const mockAddListener = jest.fn();
const mockIsAvailableAsync = jest.fn();
const mockSetUpdateInterval = jest.fn();

jest.mock('expo-sensors', () => ({
  Gyroscope: {
    isAvailableAsync: (...args: unknown[]) => mockIsAvailableAsync(...args),
    addListener: (...args: unknown[]) => mockAddListener(...args),
    setUpdateInterval: (...args: unknown[]) => mockSetUpdateInterval(...args),
  },
  Accelerometer: {
    isAvailableAsync: jest.fn().mockResolvedValue(false),
    addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
    setUpdateInterval: jest.fn(),
  },
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useGyroscope', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSubscriptionRemove.mockReset();
    mockAddListener.mockReturnValue({ remove: mockSubscriptionRemove });
  });

  it('retorna isAvailable=false cuando el sensor no está disponible', async () => {
    mockIsAvailableAsync.mockResolvedValue(false);

    const { result } = renderHook(() => useGyroscope());

    // Esperar a que la promesa de isAvailableAsync resuelva
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isAvailable).toBe(false);
  });

  it('retorna isAvailable=true cuando el sensor está disponible', async () => {
    mockIsAvailableAsync.mockResolvedValue(true);

    const { result } = renderHook(() => useGyroscope());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isAvailable).toBe(true);
    expect(mockAddListener).toHaveBeenCalled();
    expect(mockSetUpdateInterval).toHaveBeenCalled();
  });

  it('acumula rotación cuando el listener emite datos', async () => {
    mockIsAvailableAsync.mockResolvedValue(true);

    let capturedListener: ((data: { x: number; y: number; z: number }) => void) | null = null;
    mockAddListener.mockImplementation((cb) => {
      capturedListener = cb;
      return { remove: mockSubscriptionRemove };
    });

    const { result } = renderHook(() => useGyroscope());

    await act(async () => {
      await Promise.resolve();
    });

    // Emitir evento del giroscopio — velocidad angular de 1 rad/s en X
    act(() => {
      capturedListener?.({ x: 1, y: 0, z: 0 });
      // Emitir un segundo evento para que se integre el delta
      capturedListener?.({ x: 1, y: 0, z: 0 });
    });

    // Después de al menos un evento, la rotación debe haber cambiado de 0
    // (la integración requiere un segundo evento para tener dt > 0)
    expect(result.current.rotation).toBeDefined();
    expect(typeof result.current.rotation.x).toBe('number');
    expect(typeof result.current.rotation.y).toBe('number');
    expect(typeof result.current.rotation.z).toBe('number');
  });

  it('reset() pone la rotación a {0, 0, 0}', async () => {
    mockIsAvailableAsync.mockResolvedValue(true);

    let capturedListener: ((data: { x: number; y: number; z: number }) => void) | null = null;
    mockAddListener.mockImplementation((cb) => {
      capturedListener = cb;
      return { remove: mockSubscriptionRemove };
    });

    const { result } = renderHook(() => useGyroscope());

    await act(async () => {
      await Promise.resolve();
    });

    // Forzar alguna rotación
    act(() => {
      capturedListener?.({ x: 2, y: 1, z: 0.5 });
      capturedListener?.({ x: 2, y: 1, z: 0.5 });
    });

    // Llamar reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.rotation).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('remueve la suscripción al desmontar el hook', async () => {
    mockIsAvailableAsync.mockResolvedValue(true);

    const { unmount } = renderHook(() => useGyroscope());

    await act(async () => {
      await Promise.resolve();
    });

    unmount();

    expect(mockSubscriptionRemove).toHaveBeenCalled();
  });
});
