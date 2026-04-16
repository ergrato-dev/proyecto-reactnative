/**
 * Tests del hook useNetworkReconnect.
 *
 * @what Verifica que el hook detecta cambios de conectividad, expone el estado
 *   correcto y llama al callback `onReconnect` solo en la transición offline→online.
 * @why La reconexión automática del canal Realtime depende de este hook;
 *   si no detecta correctamente la transición, los clientes quedan sin datos.
 * @impact Mockea `@react-native-community/netinfo`.
 */

import { act, renderHook } from '@testing-library/react-native';
import { useNetworkReconnect } from '../hooks/useNetworkReconnect';

// ─── Mock de NetInfo ──────────────────────────────────────────────────────────

type NetInfoListener = (state: { isConnected: boolean | null }) => void;
let capturedListener: NetInfoListener | null = null;

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: (listener: NetInfoListener) => {
    capturedListener = listener;
    // Devuelve la función de unsubscribe
    return jest.fn();
  },
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useNetworkReconnect — estado inicial', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedListener = null;
  });

  it('isConnected es true por defecto', () => {
    const { result } = renderHook(() => useNetworkReconnect());
    expect(result.current.isConnected).toBe(true);
  });

  it('justReconnected es false por defecto', () => {
    const { result } = renderHook(() => useNetworkReconnect());
    expect(result.current.justReconnected).toBe(false);
  });
});

describe('useNetworkReconnect — cambios de conectividad', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedListener = null;
  });

  it('isConnected pasa a false cuando la red se pierde', () => {
    const { result } = renderHook(() => useNetworkReconnect());

    act(() => {
      capturedListener?.({ isConnected: false });
    });

    expect(result.current.isConnected).toBe(false);
  });

  it('isConnected vuelve a true cuando se recupera la red', () => {
    const { result } = renderHook(() => useNetworkReconnect());

    act(() => {
      capturedListener?.({ isConnected: false });
    });

    act(() => {
      capturedListener?.({ isConnected: true });
    });

    expect(result.current.isConnected).toBe(true);
  });

  it('trata isConnected null como false', () => {
    const { result } = renderHook(() => useNetworkReconnect());

    act(() => {
      capturedListener?.({ isConnected: null });
    });

    expect(result.current.isConnected).toBe(false);
  });
});

describe('useNetworkReconnect — callback onReconnect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedListener = null;
  });

  it('llama onReconnect en la transición offline → online', () => {
    const onReconnect = jest.fn();
    renderHook(() => useNetworkReconnect(onReconnect));

    // Simular pérdida de red
    act(() => {
      capturedListener?.({ isConnected: false });
    });

    // Simular recuperación
    act(() => {
      capturedListener?.({ isConnected: true });
    });

    expect(onReconnect).toHaveBeenCalledTimes(1);
  });

  it('NO llama onReconnect si la red ya estaba conectada (online → online)', () => {
    const onReconnect = jest.fn();
    renderHook(() => useNetworkReconnect(onReconnect));

    // Sin pasar por offline, la transición online→online no dispara el callback
    act(() => {
      capturedListener?.({ isConnected: true });
    });

    expect(onReconnect).not.toHaveBeenCalled();
  });

  it('llama onReconnect cada vez que se repite el ciclo offline → online', () => {
    const onReconnect = jest.fn();
    renderHook(() => useNetworkReconnect(onReconnect));

    // Ciclo 1
    act(() => { capturedListener?.({ isConnected: false }); });
    act(() => { capturedListener?.({ isConnected: true }); });

    // Ciclo 2
    act(() => { capturedListener?.({ isConnected: false }); });
    act(() => { capturedListener?.({ isConnected: true }); });

    expect(onReconnect).toHaveBeenCalledTimes(2);
  });

  it('funciona sin callback onReconnect (sin errores)', () => {
    expect(() => {
      const { result } = renderHook(() => useNetworkReconnect());

      act(() => {
        capturedListener?.({ isConnected: false });
      });
      act(() => {
        capturedListener?.({ isConnected: true });
      });

      expect(result.current.isConnected).toBe(true);
    }).not.toThrow();
  });
});
