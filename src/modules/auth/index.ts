/**
 * Módulo: Autenticación y diario de observaciones (`auth/`)
 *
 * @what Demuestra autenticación completa con Supabase (registro, login,
 *   logout), autenticación biométrica (expo-local-authentication) y
 *   operaciones CRUD sobre la tabla `observations` con Row Level Security.
 * @why Este módulo justifica el caso de uso "Perfil de observador": el
 *   usuario guarda sus observaciones astronómicas en la nube, protegidas
 *   por su cuenta. Demuestra integración de Supabase Auth + DB + RLS en
 *   un flujo React Native real.
 * @impact Requiere variables de entorno `EXPO_PUBLIC_SUPABASE_URL` y
 *   `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Permisos nativos: biometría (Android /
 *   iOS). Tokens persistidos en `expo-secure-store`. Si se modifica el
 *   esquema de la tabla `observations`, actualizar la interfaz `Observation`
 *   en `useObservations.ts`.
 */

export { LoginScreen } from './screens/LoginScreen';
export { RegisterScreen } from './screens/RegisterScreen';
export { ObservationsScreen } from './screens/ObservationsScreen';
export { useAuthSession } from './hooks/useAuthSession';
export type { AuthState } from './hooks/useAuthSession';
export { useAuthActions } from './hooks/useAuthActions';
export type { AuthActionState, UseAuthActionsResult } from './hooks/useAuthActions';
export { useBiometrics } from './hooks/useBiometrics';
export type { BiometricsState, UseBiometricsResult } from './hooks/useBiometrics';
export { useObservations } from './hooks/useObservations';
export type { Observation, ObservationInput, UseObservationsResult } from './hooks/useObservations';
