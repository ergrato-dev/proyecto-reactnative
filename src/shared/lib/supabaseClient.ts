/**
 * Cliente singleton de Supabase para CosmosRN.
 *
 * @what Crea y exporta una única instancia de `SupabaseClient` configurada
 *   con un adaptador de almacenamiento seguro (`expo-secure-store`) para
 *   persistir la sesión de autenticación cifrada en el dispositivo.
 * @why Un singleton garantiza que no se abran múltiples conexiones WebSocket
 *   innecesarias (canal Realtime) y que la sesión se gestione en un único
 *   punto de verdad a lo largo de toda la app.
 * @impact Importado por `useAuthSession`, los módulos `auth/` y `realtime/`.
 *   Cambios en la configuración afectan a toda la capa de backend. La clave
 *   `service_role` NUNCA debe usarse en el cliente — solo `anon key`.
 */

import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import type { SupabaseClientOptions } from '@supabase/supabase-js';

// ─── Validación de variables de entorno ──────────────────────────────────────

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan variables de entorno de Supabase. ' +
      'Asegúrate de definir EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY en .env',
  );
}

// ─── Adaptador de almacenamiento seguro ──────────────────────────────────────

/**
 * Adaptador que usa `expo-secure-store` como storage para los tokens de sesión.
 *
 * @what Implementa la interfaz `storage` de Supabase usando el almacenamiento
 *   cifrado del sistema operativo (Keychain en iOS, Keystore en Android).
 * @why Guardar tokens JWT en AsyncStorage (sin cifrar) es una vulnerabilidad de
 *   seguridad. expo-secure-store cifra los valores antes de persistirlos.
 * @impact Solo aplica en dispositivos nativos (Android/iOS). En Web, Supabase
 *   usa `localStorage` como fallback automático.
 */
const secureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// ─── Opciones del cliente ─────────────────────────────────────────────────────

const options: SupabaseClientOptions<'public'> = {
  auth: {
    storage: secureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // no aplicable en React Native
  },
};

// ─── Instancia singleton ──────────────────────────────────────────────────────

/**
 * Instancia única del cliente Supabase para toda la aplicación.
 *
 * @example
 * ```ts
 * import { supabase } from '@/shared/lib/supabaseClient';
 *
 * const { data, error } = await supabase.from('observations').select('*');
 * ```
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, options);
