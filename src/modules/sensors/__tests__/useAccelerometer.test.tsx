/**
 * Tests unitarios del hook useAccelerometer.
 *
 * @what Verifica disponibilidad del sensor, actualización de lecturas y
 *   cleanup de la suscripción al desmontar el hook.
 * @why El acelerómetro alimenta el banner de estado de la pantalla StarMap
 *   y futuras funciones de orientación del dispositivo.
 * @impact Mock de expo-sensors — tests aislados del hardware real.
 */

import { renderHook, act } from '@testing-library/react-native';
import { useAccelerometer } from '../hooks/useAccelerometer';

// ─── Mock de expo-sensors ─────────────────────────────────────────────────────

const mockSubscriptionRemove = jest.fn();
const mockAddListener = jest.fn();
const mockIsAvailableAsync = jest.fn();
const mockSetUpdateInterval = jest.fn();

jest.mock('expo-sensors', () => ({
  Accelerometer: {
    isAvailableAsync: (...args: unknown[]) => mockIsAvailableAsync(...args),
    addListener: (...args: unknown[]) => mockAddListener(...args),
    setUpdateInterval: (...args: unknown[]) => mockSetUpdateInterval(...args),
  },
  Gyroscope: {
    isAvailableAsync: jest.fn().mockResolvedValue(false),
    addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
    setUpdateInterval: jest.fn(),
  },
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useAccelerometer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAddListener.mockReturnValue({ remove: mockSubscriptionRemove });
  });

  it('retorna isAvailable=false cuando el sensor no está disponible', async () => {
    mockIsAvailableAsync.mockResolvedValue(false);

    const { result } = renderHook(() => useAccelerometer());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isAvailable).toBe(false);
  });

  it('retorna isAvailable=true cuando el sensor está disponible', async () => {
    mockIsAvailableAsync.mockResolvedValue(true);

    const { result } = renderHook(() => useAccelerometer());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isAvailable).toBe(true);
    expect(mockAddListener).toHaveBeenCalled();
    expect(mockSetUpdateInterval).toHaveBeenCalled();
  });

  it('retorna lectura inicial {0, 0, 0}', async () => {
    mockIsAvailableAsync.mockResolvedValue(true);

    const { result } = renderHook(() => useAccelerometer());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.acceleration).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('actualiza acceleration cuando el listener emite datos', async () => {
    mockIsAvailableAsync.mockResolvedValue(true);

    let capturedListener: ((data: { x: number; y: number; z: number }) => void) | null = null;
    mockAddListener.mockImplementation((cb) => {
      capturedListener = cb;
      return { remove: mockSubscriptionRemove };
    });

    const { result } = renderHook(() => useAccelerometer());

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      capturedListener?.({ x: 0.1, y: -0.5, z: 0.9 });
    });

    expect(result.current.acceleration).toEqual({ x: 0.1, y: -0.5, z: 0.9 });
  });

  it('remueve la suscripción al desmontar el hook', async () => {
    mockIsAvailableAsync.mockResolvedValue(true);

    const { unmount } = renderHook(() => useAccelerometer());

    await act(async () => {
      await Promise.resolve();
    });

    unmount();

    expect(mockSubscriptionRemove).toHaveBeenCalled();
  });
});
