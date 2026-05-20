/**
 * Tests del hook useIssRealtime.
 *
 * @what Verifica que el hook suscribe al canal Supabase Realtime, actualiza
 *   `realtimePosition` al recibir INSERTs, expone el estado correcto y
 *   limpia el canal al desmontar.
 * @why Es el núcleo del módulo `realtime/`; si la suscripción o la limpieza
 *   fallan, los clientes quedan con canales huérfanos o sin datos.
 * @impact Mockea el cliente Supabase completo; no requiere conexión real.
 */

import { act, renderHook } from '@testing-library/react-native';
import { useIssRealtime, ISS_REALTIME_CHANNEL, ISS_POSITIONS_TABLE } from '../hooks/useIssRealtime';
import { supabase } from '@/shared/lib/supabaseClient';

// ─── Mock del cliente Supabase ────────────────────────────────────────────────
// La factory usa jest.fn() inline para evitar el problema de hoisting de jest.mock.
// Los mocks específicos se configuran en beforeEach mediante mockReturnValue / mockImplementation.

jest.mock('@/shared/lib/supabaseClient', () => ({
  supabase: {
    channel: jest.fn(),
    removeChannel: jest.fn(),
    from: jest.fn(),
  },
}));

// Alias tipado del supabase mockeado
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

// Callbacks capturados durante el montaje del hook
let capturedStatusCallback: ((status: string) => void) | null = null;
let capturedPayloadCallback: ((payload: { new: object }) => void) | null = null;

// Mock del método insert reutilizable entre suites
const mockInsert = jest.fn();

/**
 * Construye el objeto "canal" Realtime con la cadena de mocks
 * .on() → (captura payloadCb) → devuelve mismo objeto
 * .subscribe() → (captura statusCb) → devuelve mismo objeto
 */
function buildChannelMock() {
  const channelObj: {
    on: jest.Mock;
    subscribe: jest.Mock;
  } = {
    on: jest.fn(),
    subscribe: jest.fn(),
  };

  channelObj.on.mockImplementation(
    (_event: string, _filter: object, cb: (payload: { new: object }) => void) => {
      capturedPayloadCallback = cb;
      return channelObj;
    },
  );

  channelObj.subscribe.mockImplementation((statusCb: (status: string) => void) => {
    capturedStatusCallback = statusCb;
    return channelObj;
  });

  return channelObj;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useIssRealtime — suscripción', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedStatusCallback = null;
    capturedPayloadCallback = null;
    mockInsert.mockResolvedValue({ error: null });

    const channelMock = buildChannelMock();
    (mockSupabase.channel as jest.Mock).mockReturnValue(channelMock);
    (mockSupabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });
  });

  it('crea un canal con el nombre correcto al montar', () => {
    renderHook(() => useIssRealtime());
    expect(mockSupabase.channel).toHaveBeenCalledWith(ISS_REALTIME_CHANNEL);
  });

  it('isConnecting es true antes de recibir el estado SUBSCRIBED', () => {
    const { result } = renderHook(() => useIssRealtime());
    expect(result.current.isConnecting).toBe(true);
    expect(result.current.isSubscribed).toBe(false);
  });

  it('isSubscribed es true y isConnecting es false al recibir SUBSCRIBED', () => {
    const { result } = renderHook(() => useIssRealtime());

    act(() => {
      capturedStatusCallback?.('SUBSCRIBED');
    });

    expect(result.current.isSubscribed).toBe(true);
    expect(result.current.isConnecting).toBe(false);
  });

  it('isSubscribed es false al recibir CHANNEL_ERROR', () => {
    const { result } = renderHook(() => useIssRealtime());

    act(() => {
      capturedStatusCallback?.('CHANNEL_ERROR');
    });

    expect(result.current.isSubscribed).toBe(false);
    expect(result.current.isConnecting).toBe(false);
  });

  it('isSubscribed es false al recibir TIMED_OUT', () => {
    const { result } = renderHook(() => useIssRealtime());

    act(() => {
      capturedStatusCallback?.('TIMED_OUT');
    });

    expect(result.current.isSubscribed).toBe(false);
    expect(result.current.isConnecting).toBe(false);
  });

  it('llama removeChannel al desmontar', () => {
    const { unmount } = renderHook(() => useIssRealtime());
    unmount();
    expect(mockSupabase.removeChannel).toHaveBeenCalledTimes(1);
  });
});

describe('useIssRealtime — recepción de posición', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedStatusCallback = null;
    capturedPayloadCallback = null;
    mockInsert.mockResolvedValue({ error: null });

    const channelMock = buildChannelMock();
    (mockSupabase.channel as jest.Mock).mockReturnValue(channelMock);
    (mockSupabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });
  });

  it('realtimePosition es null antes de recibir el primer evento', () => {
    const { result } = renderHook(() => useIssRealtime());
    expect(result.current.realtimePosition).toBeNull();
  });

  it('actualiza realtimePosition al recibir un INSERT', () => {
    const { result } = renderHook(() => useIssRealtime());

    act(() => {
      capturedPayloadCallback?.({
        new: { latitude: 51.5, longitude: -0.1, timestamp: 1713000000 },
      });
    });

    expect(result.current.realtimePosition).toEqual({
      latitude: 51.5,
      longitude: -0.1,
      timestamp: 1713000000,
    });
  });

  it('sobreescribe la posición con cada nuevo INSERT', () => {
    const { result } = renderHook(() => useIssRealtime());

    act(() => {
      capturedPayloadCallback?.({
        new: { latitude: 10.0, longitude: 20.0, timestamp: 1713000000 },
      });
    });

    act(() => {
      capturedPayloadCallback?.({
        new: { latitude: 15.0, longitude: 25.0, timestamp: 1713000005 },
      });
    });

    expect(result.current.realtimePosition?.latitude).toBe(15.0);
    expect(result.current.realtimePosition?.longitude).toBe(25.0);
  });
});

describe('useIssRealtime — publishPosition', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedStatusCallback = null;
    capturedPayloadCallback = null;
    mockInsert.mockResolvedValue({ error: null });

    const channelMock = buildChannelMock();
    (mockSupabase.channel as jest.Mock).mockReturnValue(channelMock);
    (mockSupabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });
  });

  it('inserta en la tabla correcta al llamar publishPosition', async () => {
    const { result } = renderHook(() => useIssRealtime());

    await act(async () => {
      await result.current.publishPosition({
        latitude: 48.85,
        longitude: 2.35,
        timestamp: 1713000000,
      });
    });

    expect(mockSupabase.from).toHaveBeenCalledWith(ISS_POSITIONS_TABLE);
    expect(mockInsert).toHaveBeenCalledWith({
      latitude: 48.85,
      longitude: 2.35,
      timestamp: 1713000000,
    });
  });

  it('lanza error si Supabase devuelve error en insert', async () => {
    mockInsert.mockResolvedValueOnce({ error: { message: 'RLS denied' } });

    const { result } = renderHook(() => useIssRealtime());

    await expect(
      result.current.publishPosition({ latitude: 0, longitude: 0, timestamp: 0 }),
    ).rejects.toThrow('Error al publicar posición ISS');
  });
});
