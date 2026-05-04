/**
 * Hook que gestiona la autenticación biométrica del dispositivo.
 *
 * @what Consulta si el hardware biométrico está disponible y, si es así,
 *   ejecuta el prompt nativo de huella dactilar / Face ID. Implementa el
 *   criterio de aceptación HU-12: tras 3 intentos fallidos consecutivos el
 *   hook entra en estado bloqueado (`isLocked = true`) para forzar el uso
 *   de contraseña como alternativa.
 * @why La autenticación biométrica ofrece una experiencia de login rápida
 *   y segura sin revelar la contraseña al usuario en cada apertura. El
 *   bloqueo automático a los 3 fallos evita ataques de fuerza bruta físicos
 *   y protege al usuario ante lecturas erróneas del sensor.
 * @impact Depende de `expo-local-authentication`. En Web y en emuladores
 *   sin sensores, `isAvailable` devuelve false y el botón biométrico no se
 *   muestra. No almacena contraseñas — solo verifica identidad local antes
 *   de leer la sesión de expo-secure-store. `LoginScreen` debe comprobar
 *   `isLocked` para mostrar el formulario de contraseña cuando sea true.
 */

import { useState, useEffect, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

export interface BiometricsState {
  /** true cuando el dispositivo tiene hardware biométrico y datos registrados */
  isAvailable: boolean;
  /** Nombre legible del tipo de biometría disponible */
  biometryType: string | null;
  loading: boolean;
  error: string | null;
  /**
   * Número de intentos biométricos fallidos consecutivos.
   * Se reinicia a 0 con cada intento exitoso o al llamar `resetLock`.
   */
  failCount: number;
  /**
   * true cuando el contador de fallos ha alcanzado MAX_FAIL_ATTEMPTS (3).
   * En este estado el botón biométrico debe ocultarse y mostrar contraseña.
   */
  isLocked: boolean;
}

export interface UseBiometricsResult extends BiometricsState {
  /**
   * Lanza el prompt biométrico nativo.
   * @returns true si la autenticación fue exitosa
   */
  authenticate: () => Promise<boolean>;
  /**
   * Restablece el contador de fallos y desbloquea el acceso biométrico.
   * Útil cuando el usuario elige "usar contraseña" y luego quiere volver
   * a intentar biometría (por ejemplo al navegar de vuelta a LoginScreen).
   */
  resetLock: () => void;
}

/** Mapea el enum de expo-local-authentication a texto legible */
function biometryLabel(types: LocalAuthentication.AuthenticationType[]): string | null {
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return 'Face ID';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return 'Huella dactilar';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return 'Reconocimiento de iris';
  }
  return null;
}

/** Número máximo de intentos biométricos fallidos antes de bloquear */
const MAX_FAIL_ATTEMPTS = 3;

export function useBiometrics(): UseBiometricsResult {
  const [state, setState] = useState<BiometricsState>({
    isAvailable: false,
    biometryType: null,
    loading: true,
    error: null,
    failCount: 0,
    isLocked: false,
  });

  useEffect(() => {
    let cancelled = false;

    const checkAvailability = async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        const types = hasHardware
          ? await LocalAuthentication.supportedAuthenticationTypesAsync()
          : [];

        if (!cancelled) {
          setState({
            isAvailable: hasHardware && isEnrolled,
            biometryType: biometryLabel(types),
            loading: false,
            error: null,
            failCount: 0,
            isLocked: false,
          });
        }
      } catch {
        if (!cancelled) {
          setState({ isAvailable: false, biometryType: null, loading: false, error: null, failCount: 0, isLocked: false });
        }
      }
    };

    checkAvailability();
    return () => { cancelled = true; };
  }, []);

  const authenticate = useCallback(async (): Promise<boolean> => {
    setState((prev) => ({ ...prev, error: null }));
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirma tu identidad para acceder',
        cancelLabel: 'Cancelar',
        fallbackLabel: 'Usar contraseña',
        disableDeviceFallback: false,
      });
      if (!result.success) {
        setState((prev) => {
          const nextFail = result.error === 'user_cancel' ? prev.failCount : prev.failCount + 1;
          return {
            ...prev,
            error: result.error === 'user_cancel' ? null : 'Autenticación biométrica fallida',
            failCount: nextFail,
            isLocked: nextFail >= MAX_FAIL_ATTEMPTS,
          };
        });
        return false;
      }
      // Autenticación exitosa: reiniciar contador de fallos
      setState((prev) => ({ ...prev, failCount: 0, isLocked: false, error: null }));
      return true;
    } catch {
      setState((prev) => {
        const nextFail = prev.failCount + 1;
        return {
          ...prev,
          error: 'Error al intentar autenticación biométrica',
          failCount: nextFail,
          isLocked: nextFail >= MAX_FAIL_ATTEMPTS,
        };
      });
      return false;
    }
  }, []);

  const resetLock = useCallback(() => {
    setState((prev) => ({ ...prev, failCount: 0, isLocked: false, error: null }));
  }, []);

  return { ...state, authenticate, resetLock };
}
