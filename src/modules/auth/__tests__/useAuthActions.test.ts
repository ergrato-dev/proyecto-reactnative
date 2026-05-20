/**
 * Tests unitarios de useAuthActions.
 *
 * @what Verifica que `register`, `login`, `logout` y `clearError` gestionan
 *   correctamente el estado loading/error y retornan el resultado esperado.
 * @why `useAuthActions` es la capa de integración con Supabase Auth; si falla
 *   silenciosamente, el usuario no recibe feedback de errores de autenticación.
 * @impact Cubre `useAuthActions` + mock del cliente Supabase.
 */

import { renderHook, act } from '@testing-library/react-native';
import { useAuthActions } from '../hooks/useAuthActions';
import { supabase } from '@/shared/lib/supabaseClient';

// ─── Mock de Supabase ─────────────────────────────────────────────────────────

jest.mock('@/shared/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

const mockSignUp = supabase.auth.signUp as jest.Mock;
const mockSignInWithPassword = supabase.auth.signInWithPassword as jest.Mock;
const mockSignOut = supabase.auth.signOut as jest.Mock;

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('useAuthActions', () => {
  describe('register', () => {
    it('debería retornar true y estado limpio en registro exitoso', async () => {
      mockSignUp.mockResolvedValue({ error: null });
      const { result } = renderHook(() => useAuthActions());

      let ok: boolean;
      await act(async () => {
        ok = await result.current.register('test@cosmos.dev', 'password123');
      });

      expect(ok!).toBe(true);
      expect(result.current.state.error).toBeNull();
      expect(result.current.state.loading).toBe(false);
    });

    it('debería retornar false y error en español cuando Supabase falla', async () => {
      mockSignUp.mockResolvedValue({ error: { message: 'User already registered' } });
      const { result } = renderHook(() => useAuthActions());

      let ok: boolean;
      await act(async () => {
        ok = await result.current.register('existing@cosmos.dev', 'pass123');
      });

      expect(ok!).toBe(false);
      expect(result.current.state.error).toMatch(/Error al registrarse/);
      expect(result.current.state.error).toContain('User already registered');
    });
  });

  describe('login', () => {
    it('debería retornar true y estado limpio en login exitoso', async () => {
      mockSignInWithPassword.mockResolvedValue({ error: null });
      const { result } = renderHook(() => useAuthActions());

      let ok: boolean;
      await act(async () => {
        ok = await result.current.login('user@cosmos.dev', 'pass123');
      });

      expect(ok!).toBe(true);
      expect(result.current.state.error).toBeNull();
      expect(result.current.state.loading).toBe(false);
    });

    it('debería retornar false y error en español cuando las credenciales son incorrectas', async () => {
      mockSignInWithPassword.mockResolvedValue({ error: { message: 'Invalid login credentials' } });
      const { result } = renderHook(() => useAuthActions());

      let ok: boolean;
      await act(async () => {
        ok = await result.current.login('user@cosmos.dev', 'wrongpass');
      });

      expect(ok!).toBe(false);
      expect(result.current.state.error).toMatch(/Error al iniciar sesión/);
    });
  });

  describe('logout', () => {
    it('debería llamar a signOut y limpiar el estado de carga', async () => {
      mockSignOut.mockResolvedValue({ error: null });
      const { result } = renderHook(() => useAuthActions());

      await act(async () => {
        await result.current.logout();
      });

      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(result.current.state.loading).toBe(false);
    });
  });

  describe('clearError', () => {
    it('debería limpiar el error sin afectar loading', async () => {
      mockSignInWithPassword.mockResolvedValue({ error: { message: 'Bad request' } });
      const { result } = renderHook(() => useAuthActions());

      await act(async () => {
        await result.current.login('x@x.com', '123456');
      });

      expect(result.current.state.error).not.toBeNull();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.state.error).toBeNull();
      expect(result.current.state.loading).toBe(false);
    });
  });
});
