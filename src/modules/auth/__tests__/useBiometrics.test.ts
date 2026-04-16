/**
 * Tests unitarios de useBiometrics.
 *
 * @what Verifica la detección de hardware biométrico, el mapeo de tipos a
 *   etiquetas legibles y el comportamiento de `authenticate()` en escenarios
 *   de éxito, error y cancelación del usuario.
 * @why La biometría es una característica condicional — si se muestra el botón
 *   cuando no hay hardware disponible, la UX falla; si no se limpia el error
 *   en cancelación, el usuario ve un mensaje confuso.
 * @impact Cubre `useBiometrics` + mock de `expo-local-authentication`.
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useBiometrics } from '../hooks/useBiometrics';

// ─── Mock de expo-local-authentication ───────────────────────────────────────
// Se usa jest.requireMock() para garantizar acceso al objeto registrado en el
// registro de mocks de Jest, evitando problemas de interop con import *.

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  supportedAuthenticationTypesAsync: jest.fn(),
  authenticateAsync: jest.fn(),
  AuthenticationType: { FINGERPRINT: 1, FACIAL_RECOGNITION: 2, IRIS: 3 },
}));

const LocalAuthMock = jest.requireMock<{
  hasHardwareAsync: jest.Mock;
  isEnrolledAsync: jest.Mock;
  supportedAuthenticationTypesAsync: jest.Mock;
  authenticateAsync: jest.Mock;
}>('expo-local-authentication');

const mockHasHardware = LocalAuthMock.hasHardwareAsync;
const mockIsEnrolled = LocalAuthMock.isEnrolledAsync;
const mockSupportedTypes = LocalAuthMock.supportedAuthenticationTypesAsync;
const mockAuthenticate = LocalAuthMock.authenticateAsync;

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('useBiometrics', () => {
  describe('disponibilidad de hardware', () => {
    it('debería indicar isAvailable=false cuando no hay hardware', async () => {
      mockHasHardware.mockResolvedValue(false);
      mockIsEnrolled.mockResolvedValue(false);
      mockSupportedTypes.mockResolvedValue([]);

      const { result } = renderHook(() => useBiometrics());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.isAvailable).toBe(false);
      expect(result.current.biometryType).toBeNull();
    });

    it('debería indicar isAvailable=false cuando hay hardware pero sin datos registrados', async () => {
      mockHasHardware.mockResolvedValue(true);
      mockIsEnrolled.mockResolvedValue(false);
      mockSupportedTypes.mockResolvedValue([1]);

      const { result } = renderHook(() => useBiometrics());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.isAvailable).toBe(false);
    });

    it('debería indicar isAvailable=true con huella dactilar registrada', async () => {
      mockHasHardware.mockResolvedValue(true);
      mockIsEnrolled.mockResolvedValue(true);
      mockSupportedTypes.mockResolvedValue([1]); // FINGERPRINT

      const { result } = renderHook(() => useBiometrics());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.isAvailable).toBe(true);
      expect(result.current.biometryType).toBe('Huella dactilar');
    });

    it('debería indicar biometryType="Face ID" con reconocimiento facial', async () => {
      mockHasHardware.mockResolvedValue(true);
      mockIsEnrolled.mockResolvedValue(true);
      mockSupportedTypes.mockResolvedValue([2]); // FACIAL_RECOGNITION

      const { result } = renderHook(() => useBiometrics());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.biometryType).toBe('Face ID');
    });

    it('debería indicar biometryType="Reconocimiento de iris" con IRIS', async () => {
      mockHasHardware.mockResolvedValue(true);
      mockIsEnrolled.mockResolvedValue(true);
      mockSupportedTypes.mockResolvedValue([3]); // IRIS

      const { result } = renderHook(() => useBiometrics());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.biometryType).toBe('Reconocimiento de iris');
    });

    it('debería manejar errores del hardware sin lanzar excepción', async () => {
      mockHasHardware.mockRejectedValue(new Error('sensor error'));
      mockIsEnrolled.mockResolvedValue(false);
      mockSupportedTypes.mockResolvedValue([]);

      const { result } = renderHook(() => useBiometrics());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.isAvailable).toBe(false);
    });
  });

  describe('authenticate()', () => {
    beforeEach(() => {
      mockHasHardware.mockResolvedValue(true);
      mockIsEnrolled.mockResolvedValue(true);
      mockSupportedTypes.mockResolvedValue([1]);
    });

    it('debería retornar true cuando la autenticación es exitosa', async () => {
      mockAuthenticate.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useBiometrics());
      await waitFor(() => expect(result.current.loading).toBe(false));

      let ok: boolean;
      await act(async () => {
        ok = await result.current.authenticate();
      });

      expect(ok!).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('debería retornar false y establecer error cuando falla la autenticación', async () => {
      mockAuthenticate.mockResolvedValue({ success: false, error: 'lockout' });

      const { result } = renderHook(() => useBiometrics());
      await waitFor(() => expect(result.current.loading).toBe(false));

      let ok: boolean;
      await act(async () => {
        ok = await result.current.authenticate();
      });

      expect(ok!).toBe(false);
      expect(result.current.error).toBe('Autenticación biométrica fallida');
    });

    it('debería retornar false sin error cuando el usuario cancela', async () => {
      mockAuthenticate.mockResolvedValue({ success: false, error: 'user_cancel' });

      const { result } = renderHook(() => useBiometrics());
      await waitFor(() => expect(result.current.loading).toBe(false));

      let ok: boolean;
      await act(async () => {
        ok = await result.current.authenticate();
      });

      expect(ok!).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});
