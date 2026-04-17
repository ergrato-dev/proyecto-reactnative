/**
 * Hook que gestiona la autenticación biométrica del dispositivo.
 *
 * @what Consulta si el hardware biométrico está disponible y, si es así,
 *   ejecuta el prompt nativo de huella dactilar / Face ID.
 * @why La autenticación biométrica ofrece una experiencia de login rápida
 *   y segura sin revelar la contraseña al usuario en cada apertura.
 * @impact Depende de `expo-local-authentication`. En Web y en emuladores
 *   sin sensores, `isAvailable` devuelve false y el botón biométrico no se
 *   muestra. No almacena contraseñas — solo verifica identidad local antes
 *   de leer la sesión de expo-secure-store.
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
}

export interface UseBiometricsResult extends BiometricsState {
  /**
   * Lanza el prompt biométrico nativo.
   * @returns true si la autenticación fue exitosa
   */
  authenticate: () => Promise<boolean>;
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

export function useBiometrics(): UseBiometricsResult {
  const [state, setState] = useState<BiometricsState>({
    isAvailable: false,
    biometryType: null,
    loading: true,
    error: null,
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
          });
        }
      } catch {
        if (!cancelled) {
          setState({ isAvailable: false, biometryType: null, loading: false, error: null });
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
        setState((prev) => ({
          ...prev,
          error: result.error === 'user_cancel' ? null : 'Autenticación biométrica fallida',
        }));
        return false;
      }
      return true;
    } catch {
      setState((prev) => ({ ...prev, error: 'Error al intentar autenticación biométrica' }));
      return false;
    }
  }, []);

  return { ...state, authenticate };
}
