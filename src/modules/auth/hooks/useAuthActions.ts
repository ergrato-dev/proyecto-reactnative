/**
 * Hook que expone las acciones de autenticación de Supabase.
 *
 * @what Envuelve `signUp`, `signInWithPassword` y `signOut` de Supabase,
 *   gestionando el estado de carga y los errores en español.
 * @why Desacopla la lógica de autenticación de los componentes de UI, de modo
 *   que `LoginScreen` y `RegisterScreen` solo llaman funciones sin conocer
 *   los detalles del cliente de Supabase.
 * @impact Usado por `LoginScreen` y `RegisterScreen`. Cualquier cambio en la
 *   API de Supabase Auth se aísla aquí.
 */

import { useState } from 'react';
import { supabase } from '@/shared/lib/supabaseClient';

export interface AuthActionState {
  loading: boolean;
  error: string | null;
}

export interface UseAuthActionsResult {
  state: AuthActionState;
  /**
   * Registra un usuario nuevo con email y contraseña.
   * @param email    - Email del usuario
   * @param password - Contraseña (mínimo 6 caracteres, validado por Supabase)
   */
  register: (email: string, password: string) => Promise<boolean>;
  /**
   * Inicia sesión con email y contraseña.
   * @param email    - Email del usuario
   * @param password - Contraseña
   */
  login: (email: string, password: string) => Promise<boolean>;
  /** Cierra la sesión actual. */
  logout: () => Promise<void>;
  /** Limpia el error actual. */
  clearError: () => void;
}

export function useAuthActions(): UseAuthActionsResult {
  const [state, setState] = useState<AuthActionState>({
    loading: false,
    error: null,
  });

  const register = async (email: string, password: string): Promise<boolean> => {
    setState({ loading: true, error: null });
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setState({ loading: false, error: `Error al registrarse: ${error.message}` });
      return false;
    }
    setState({ loading: false, error: null });
    return true;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setState({ loading: true, error: null });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setState({ loading: false, error: `Error al iniciar sesión: ${error.message}` });
      return false;
    }
    setState({ loading: false, error: null });
    return true;
  };

  const logout = async (): Promise<void> => {
    setState({ loading: true, error: null });
    await supabase.auth.signOut();
    setState({ loading: false, error: null });
  };

  const clearError = () => setState((prev) => ({ ...prev, error: null }));

  return { state, register, login, logout, clearError };
}
