/**
 * Hook que gestiona el ciclo de vida de la sesión de autenticación con Supabase.
 *
 * @what Suscribe al listener `onAuthStateChange` y expone el usuario actual
 *   y el estado de carga inicial de la sesión.
 * @why Centraliza la lógica de sesión en un único punto de verdad para evitar
 *   subscripciones duplicadas en múltiples pantallas y garantizar que la sesión
 *   persiste entre reinicios de la app (via expo-secure-store).
 * @impact Cualquier cambio en este hook afecta a todas las pantallas protegidas.
 *   Requiere test unitario actualizado.
 *
 * @returns {{ user, session, loading }} — `loading` es true solo durante la
 *   verificación inicial de sesión al montar la app.
 */

import { useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/shared/lib/supabaseClient';

export interface AuthState {
  user: User | null;
  session: Session | null;
  /** true solo durante la hidratación inicial de la sesión */
  loading: boolean;
}

export function useAuthSession(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    // Obtener la sesión actual de forma síncrona/asíncrona al montar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ user: session?.user ?? null, session, loading: false });
    });

    // Suscribir a cambios posteriores (login, logout, refresh de token)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null, session, loading: false });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
