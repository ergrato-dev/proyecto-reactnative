/**
 * Tests unitarios de useAuthSession.
 *
 * @what Verifica el ciclo de vida completo del hook: estado inicial de carga,
 *   hidratación de sesión con `getSession`, reacción a cambios vía
 *   `onAuthStateChange` y limpieza del listener al desmontar.
 * @why `useAuthSession` es el punto central de verdad de la sesión; un fallo
 *   aquí afecta a todas las pantallas que dependan del usuario autenticado.
 * @impact Cubre `useAuthSession` + mock del cliente Supabase.
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAuthSession } from '../hooks/useAuthSession';
import { supabase } from '@/shared/lib/supabaseClient';

// ─── Mock de Supabase ─────────────────────────────────────────────────────────
// Se define el módulo con jest.fn() dentro del factory para evitar problemas
// de hoisting de variables externas.

jest.mock('@/shared/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

// Alias tipados para acceder a los mocks tras importar el módulo mockeado
const mockGetSession = supabase.auth.getSession as jest.Mock;
const mockOnAuthStateChange = supabase.auth.onAuthStateChange as jest.Mock;
const mockUnsubscribe = jest.fn();

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockUnsubscribe.mockReset();
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: mockUnsubscribe } },
  });
  mockGetSession.mockResolvedValue({ data: { session: null } });
});

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('useAuthSession', () => {
  it('debería iniciar con loading=true y sin usuario', () => {
    const { result } = renderHook(() => useAuthSession());
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it('debería actualizar a loading=false tras resolver getSession (sin sesión)', async () => {
    const { result } = renderHook(() => useAuthSession());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it('debería hidratar el usuario cuando getSession devuelve sesión activa', async () => {
    const fakeUser = { id: 'abc-123', email: 'test@cosmos.dev' };
    const fakeSession = { user: fakeUser, access_token: 'token-xyz' };
    mockGetSession.mockResolvedValue({ data: { session: fakeSession } });

    const { result } = renderHook(() => useAuthSession());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).toEqual(fakeUser);
    expect(result.current.session).toEqual(fakeSession);
  });

  it('debería actualizar el usuario cuando onAuthStateChange emite SIGNED_IN', async () => {
    let capturedCallback: ((event: string, session: unknown) => void) | null = null;
    mockOnAuthStateChange.mockImplementation((cb) => {
      capturedCallback = cb;
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });

    const { result } = renderHook(() => useAuthSession());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const fakeUser = { id: 'xyz-789', email: 'astro@cosmos.dev' };
    const fakeSession = { user: fakeUser, access_token: 'new-token' };

    act(() => {
      capturedCallback!('SIGNED_IN', fakeSession);
    });

    expect(result.current.user).toEqual(fakeUser);
    expect(result.current.session).toEqual(fakeSession);
  });

  it('debería limpiar la sesión cuando onAuthStateChange emite SIGNED_OUT', async () => {
    let capturedCallback: ((event: string, session: unknown) => void) | null = null;
    mockOnAuthStateChange.mockImplementation((cb) => {
      capturedCallback = cb;
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });

    const fakeUser = { id: 'abc', email: 'test@cosmos.dev' };
    mockGetSession.mockResolvedValue({ data: { session: { user: fakeUser, access_token: 'tok' } } });

    const { result } = renderHook(() => useAuthSession());
    await waitFor(() => expect(result.current.user).toEqual(fakeUser));

    act(() => {
      capturedCallback!('SIGNED_OUT', null);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it('debería llamar a unsubscribe al desmontar', async () => {
    const { unmount } = renderHook(() => useAuthSession());
    await waitFor(() => expect(mockGetSession).toHaveBeenCalledTimes(1));
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
