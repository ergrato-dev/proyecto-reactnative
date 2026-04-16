/**
 * Tests del hook useNotificationPermission.
 *
 * @what Verifica: estado inicial `undetermined`, transición a `granted`,
 *   transición a `denied`, y que `requestPermission` actualiza el estado.
 * @why La solicitud de permisos es crítica en Android 13+; un comportamiento
 *   inesperado del hook puede impedir que las notificaciones lleguen al usuario.
 * @impact Cubre `hooks/useNotificationPermission.ts`. Mock de `expo-notifications`
 *   para aislar de APIs nativas.
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useNotificationPermission } from '../hooks/useNotificationPermission';

// ─── Mock de expo-notifications ───────────────────────────────────────────────

const mockGetPermissionsAsync = jest.fn();
const mockRequestPermissionsAsync = jest.fn();

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: (...args: unknown[]) => mockGetPermissionsAsync(...args),
  requestPermissionsAsync: (...args: unknown[]) =>
    mockRequestPermissionsAsync(...args),
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  SchedulableTriggerInputTypes: { DAILY: 'daily' },
  AndroidImportance: { MAX: 5, HIGH: 4 },
}));

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('useNotificationPermission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('inicia en estado undetermined mientras carga el permiso', () => {
    // Promesa que nunca resuelve para capturar estado intermedio
    mockGetPermissionsAsync.mockReturnValue(new Promise(() => null));

    const { result } = renderHook(() => useNotificationPermission());

    expect(result.current.status).toBe('undetermined');
    expect(result.current.isGranted).toBe(false);
    expect(result.current.isLoading).toBe(true);
  });

  it('expone isGranted=true cuando el permiso ya estaba concedido', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });

    const { result } = renderHook(() => useNotificationPermission());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.status).toBe('granted');
    expect(result.current.isGranted).toBe(true);
  });

  it('expone isGranted=false cuando el permiso está denegado', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'denied' });

    const { result } = renderHook(() => useNotificationPermission());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.status).toBe('denied');
    expect(result.current.isGranted).toBe(false);
  });

  it('solicita permiso y actualiza el estado a granted', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
    mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });

    const { result } = renderHook(() => useNotificationPermission());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let returnedStatus: string | undefined;
    await act(async () => {
      returnedStatus = await result.current.requestPermission();
    });

    expect(returnedStatus).toBe('granted');
    expect(result.current.status).toBe('granted');
    expect(result.current.isGranted).toBe(true);
  });

  it('actualiza el estado a denied cuando el usuario rechaza', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
    mockRequestPermissionsAsync.mockResolvedValue({ status: 'denied' });

    const { result } = renderHook(() => useNotificationPermission());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let returnedStatus: string | undefined;
    await act(async () => {
      returnedStatus = await result.current.requestPermission();
    });

    expect(returnedStatus).toBe('denied');
    expect(result.current.isGranted).toBe(false);
  });

  it('mapea valores desconocidos de expo a undetermined', async () => {
    // Expo puede devolver 'can-ask-again', 'restricted', etc.
    mockGetPermissionsAsync.mockResolvedValue({ status: 'can-ask-again' });

    const { result } = renderHook(() => useNotificationPermission());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.status).toBe('undetermined');
    expect(result.current.isGranted).toBe(false);
  });
});
