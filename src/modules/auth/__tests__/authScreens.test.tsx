/**
 * Tests de las pantallas del módulo auth.
 *
 * Cubre:
 * - LoginScreen: carga, sesión activa, formulario de login, biometría disponible
 * - RegisterScreen: renderizado, validación, estado de éxito
 * - ObservationsScreen: carga, lista vacía, lista con datos
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ObservationsScreen } from '../screens/ObservationsScreen';
import { useAuthSession } from '../hooks/useAuthSession';
import { useAuthActions } from '../hooks/useAuthActions';
import { useBiometrics } from '../hooks/useBiometrics';
import { useObservations } from '../hooks/useObservations';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '@/modules/navigation/types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../hooks/useAuthSession');
jest.mock('../hooks/useAuthActions');
jest.mock('../hooks/useBiometrics');
jest.mock('../hooks/useObservations');

// ─── Props fake ───────────────────────────────────────────────────────────────

const fakeNavigation = { navigate: jest.fn(), goBack: jest.fn() };
const fakeLoginProps = {
  navigation: fakeNavigation,
  route: { key: 'auth', name: 'Auth', params: undefined },
} as unknown as NativeStackScreenProps<ProfileStackParamList, 'Auth'>;

const fakeRegisterProps = {
  navigation: fakeNavigation,
  route: { key: 'register', name: 'Register', params: undefined },
} as unknown as NativeStackScreenProps<ProfileStackParamList, 'Register'>;

const fakeObsProps = {
  navigation: fakeNavigation,
  route: { key: 'obs', name: 'ObservationLog', params: undefined },
} as unknown as NativeStackScreenProps<ProfileStackParamList, 'ObservationLog'>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockAuthSession = useAuthSession as jest.MockedFunction<typeof useAuthSession>;
const mockAuthActions = useAuthActions as jest.MockedFunction<typeof useAuthActions>;
const mockBiometrics = useBiometrics as jest.MockedFunction<typeof useBiometrics>;
const mockObservations = useObservations as jest.MockedFunction<typeof useObservations>;

function buildAuthActions(overrides = {}) {
  return {
    state: { loading: false, error: null },
    login: jest.fn().mockResolvedValue(undefined),
    logout: jest.fn().mockResolvedValue(undefined),
    register: jest.fn().mockResolvedValue(undefined),
    clearError: jest.fn(),
    ...overrides,
  };
}

function buildBiometrics(overrides = {}) {
  return {
    isAvailable: false,
    biometryType: null,
    loading: false,
    error: null,
    failCount: 0,
    isLocked: false,
    authenticate: jest.fn().mockResolvedValue({ success: false }),
    resetLock: jest.fn(),
    ...overrides,
  };
}

// ─── LoginScreen ──────────────────────────────────────────────────────────────

describe('LoginScreen', () => {
  beforeEach(() => {
    mockAuthActions.mockReturnValue(buildAuthActions());
    mockBiometrics.mockReturnValue(buildBiometrics());
  });

  describe('estado de carga de sesión', () => {
    it('muestra pantalla de carga mientras verifica la sesión', () => {
      mockAuthSession.mockReturnValue({ user: null, loading: true, session: null });
      render(<LoginScreen {...fakeLoginProps} />);
      expect(screen.getByTestId('loading-screen')).toBeTruthy();
    });
  });

  describe('sesión activa — perfil de usuario', () => {
    it('muestra el perfil cuando hay sesión activa', () => {
      mockAuthSession.mockReturnValue({
        user: { id: 'u1', email: 'test@example.com' } as never,
        loading: false,
        session: {} as never,
      });
      render(<LoginScreen {...fakeLoginProps} />);
      expect(screen.getByTestId('profile-screen')).toBeTruthy();
    });

    it('muestra el botón de ir al diario', () => {
      mockAuthSession.mockReturnValue({
        user: { id: 'u1', email: 'test@example.com' } as never,
        loading: false,
        session: {} as never,
      });
      render(<LoginScreen {...fakeLoginProps} />);
      expect(screen.getByTestId('go-to-diary-button')).toBeTruthy();
    });

    it('llama a logout al pulsar "Cerrar sesión"', async () => {
      const logoutMock = jest.fn().mockResolvedValue(undefined);
      mockAuthSession.mockReturnValue({
        user: { id: 'u1', email: 'test@example.com' } as never,
        loading: false,
        session: {} as never,
      });
      mockAuthActions.mockReturnValue(buildAuthActions({ logout: logoutMock }));
      render(<LoginScreen {...fakeLoginProps} />);
      await act(async () => {
        fireEvent.press(screen.getByTestId('logout-button'));
      });
      expect(logoutMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('sin sesión — formulario de login', () => {
    beforeEach(() => {
      mockAuthSession.mockReturnValue({ user: null, loading: false, session: null });
    });

    it('muestra el formulario de login', () => {
      render(<LoginScreen {...fakeLoginProps} />);
      expect(screen.getByTestId('login-screen')).toBeTruthy();
    });

    it('muestra el campo email y contraseña', () => {
      render(<LoginScreen {...fakeLoginProps} />);
      expect(screen.getByTestId('email-input')).toBeTruthy();
      expect(screen.getByTestId('password-input')).toBeTruthy();
    });

    it('muestra error de validación si el email es inválido', async () => {
      render(<LoginScreen {...fakeLoginProps} />);
      fireEvent.changeText(screen.getByTestId('email-input'), 'no-es-un-email');
      fireEvent.changeText(screen.getByTestId('password-input'), '123456');
      await act(async () => {
        fireEvent.press(screen.getByTestId('login-button'));
      });
      expect(screen.getByTestId('error-banner')).toBeTruthy();
    });

    it('llama a login con credenciales válidas', async () => {
      const loginMock = jest.fn().mockResolvedValue(undefined);
      mockAuthActions.mockReturnValue(buildAuthActions({ login: loginMock }));
      render(<LoginScreen {...fakeLoginProps} />);
      fireEvent.changeText(screen.getByTestId('email-input'), 'user@cosmos.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
      await act(async () => {
        fireEvent.press(screen.getByTestId('login-button'));
      });
      expect(loginMock).toHaveBeenCalledWith('user@cosmos.com', 'password123');
    });

    it('muestra el botón biométrico cuando la biometría está disponible', () => {
      mockBiometrics.mockReturnValue(
        buildBiometrics({ isAvailable: true, biometryType: 'Fingerprint' }),
      );
      render(<LoginScreen {...fakeLoginProps} />);
      expect(screen.getByTestId('biometric-button')).toBeTruthy();
    });

    it('llama a biometrics.authenticate al pulsar el botón biométrico', async () => {
      const authenticateMock = jest.fn().mockResolvedValue(false);
      mockBiometrics.mockReturnValue(
        buildBiometrics({ isAvailable: true, authenticate: authenticateMock }),
      );
      render(<LoginScreen {...fakeLoginProps} />);
      await act(async () => {
        fireEvent.press(screen.getByTestId('biometric-button'));
      });
      expect(authenticateMock).toHaveBeenCalledTimes(1);
    });

    it('muestra error biométrico cuando authenticate falla con error', async () => {
      const authenticateMock = jest.fn().mockResolvedValue(false);
      mockBiometrics.mockReturnValue(
        buildBiometrics({
          isAvailable: true,
          authenticate: authenticateMock,
          error: 'Biometría no disponible',
        }),
      );
      render(<LoginScreen {...fakeLoginProps} />);
      // El error de biometría se muestra como displayError
      expect(screen.getByTestId('error-banner')).toBeTruthy();
    });

    it('muestra el error de autenticación de Supabase cuando authState.error existe', () => {
      mockAuthActions.mockReturnValue(
        buildAuthActions({ state: { loading: false, error: 'Credenciales incorrectas' } }),
      );
      render(<LoginScreen {...fakeLoginProps} />);
      expect(screen.getByTestId('error-banner')).toBeTruthy();
      expect(screen.getByText('Credenciales incorrectas')).toBeTruthy();
    });

    it('navega a registro al pulsar el enlace', () => {
      render(<LoginScreen {...fakeLoginProps} />);
      fireEvent.press(screen.getByTestId('go-to-register-button'));
      expect(fakeNavigation.navigate).toHaveBeenCalledWith('Register');
    });

    it('oculta el botón biométrico y muestra el banner de bloqueo cuando isLocked=true', () => {
      mockBiometrics.mockReturnValue(
        buildBiometrics({ isAvailable: true, biometryType: 'Huella dactilar', isLocked: true }),
      );
      render(<LoginScreen {...fakeLoginProps} />);
      // El botón biométrico no debe aparecer
      expect(screen.queryByTestId('biometric-button')).toBeNull();
      // El banner de bloqueo sí debe aparecer
      expect(screen.getByTestId('biometric-locked-banner')).toBeTruthy();
      expect(screen.getByText(/usa tu contraseña/i)).toBeTruthy();
    });

    it('llama a resetLock al pulsar "Reintentar biometría" en el banner de bloqueo', () => {
      const resetLockMock = jest.fn();
      mockBiometrics.mockReturnValue(
        buildBiometrics({ isAvailable: true, isLocked: true, resetLock: resetLockMock }),
      );
      render(<LoginScreen {...fakeLoginProps} />);
      fireEvent.press(screen.getByTestId('biometric-reset-button'));
      expect(resetLockMock).toHaveBeenCalledTimes(1);
    });
  });
});

// ─── RegisterScreen ───────────────────────────────────────────────────────────

describe('RegisterScreen', () => {
  beforeEach(() => {
    mockAuthActions.mockReturnValue(buildAuthActions());
  });

  it('muestra el formulario de registro', () => {
    render(<RegisterScreen {...fakeRegisterProps} />);
    expect(screen.getByTestId('register-screen')).toBeTruthy();
  });

  it('muestra campos de email, contraseña y confirmación', () => {
    render(<RegisterScreen {...fakeRegisterProps} />);
    expect(screen.getByTestId('email-input')).toBeTruthy();
    expect(screen.getByTestId('password-input')).toBeTruthy();
    expect(screen.getByTestId('confirm-password-input')).toBeTruthy();
  });

  it('muestra error si las contraseñas no coinciden', async () => {
    render(<RegisterScreen {...fakeRegisterProps} />);
    fireEvent.changeText(screen.getByTestId('email-input'), 'user@cosmos.com');
    fireEvent.changeText(screen.getByTestId('password-input'), 'abc123');
    fireEvent.changeText(screen.getByTestId('confirm-password-input'), 'diferente');
    await act(async () => {
      fireEvent.press(screen.getByTestId('register-button'));
    });
    expect(screen.getByTestId('error-banner')).toBeTruthy();
  });

  it('llama a register con datos válidos', async () => {
    const registerMock = jest.fn().mockResolvedValue(undefined);
    mockAuthActions.mockReturnValue(buildAuthActions({ register: registerMock }));
    render(<RegisterScreen {...fakeRegisterProps} />);
    fireEvent.changeText(screen.getByTestId('email-input'), 'astro@cosmos.com');
    fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
    fireEvent.changeText(screen.getByTestId('confirm-password-input'), 'password123');
    await act(async () => {
      fireEvent.press(screen.getByTestId('register-button'));
    });
    expect(registerMock).toHaveBeenCalledWith('astro@cosmos.com', 'password123');
  });

  it('vuelve a login al pulsar el enlace (goBack)', () => {
    render(<RegisterScreen {...fakeRegisterProps} />);
    fireEvent.press(screen.getByTestId('go-to-login-link'));
    expect(fakeNavigation.goBack).toHaveBeenCalledTimes(1);
  });
});

// ─── ObservationsScreen ───────────────────────────────────────────────────────

describe('ObservationsScreen', () => {
  describe('estado de carga', () => {
    it('muestra el indicador de carga', () => {
      mockObservations.mockReturnValue({
        observations: [],
        loading: true,
        error: null,
        create: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        refresh: jest.fn(),
      });
      render(<ObservationsScreen {...fakeObsProps} />);
      expect(screen.getByTestId('loading-state')).toBeTruthy();
    });
  });

  describe('lista vacía', () => {
    it('muestra el estado vacío cuando no hay observaciones', () => {
      mockObservations.mockReturnValue({
        observations: [],
        loading: false,
        error: null,
        create: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        refresh: jest.fn(),
      });
      render(<ObservationsScreen {...fakeObsProps} />);
      expect(screen.getByTestId('empty-state')).toBeTruthy();
    });
  });

  describe('lista con observaciones', () => {
    const mockObs = [
      { id: '1', title: 'Júpiter', body: 'planet', observed_at: '2025-01-01', notes: '' },
      { id: '2', title: 'Luna llena', body: 'satellite', observed_at: '2025-01-02', notes: 'Clara' },
    ];

    beforeEach(() => {
      mockObservations.mockReturnValue({
        observations: mockObs as never,
        loading: false,
        error: null,
        create: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        refresh: jest.fn(),
      });
    });

    it('muestra las tarjetas de observación', () => {
      render(<ObservationsScreen {...fakeObsProps} />);
      expect(screen.getByTestId('observation-card-1')).toBeTruthy();
      expect(screen.getByTestId('observation-card-2')).toBeTruthy();
    });

    it('muestra el botón de añadir observación', () => {
      render(<ObservationsScreen {...fakeObsProps} />);
      expect(screen.getByTestId('add-observation-button')).toBeTruthy();
    });

    it('abre el formulario al pulsar añadir', () => {
      render(<ObservationsScreen {...fakeObsProps} />);
      fireEvent.press(screen.getByTestId('add-observation-button'));
      expect(screen.getByTestId('new-observation-form')).toBeTruthy();
    });

    it('cancela el formulario al pulsar "Cancelar"', () => {
      render(<ObservationsScreen {...fakeObsProps} />);
      fireEvent.press(screen.getByTestId('add-observation-button'));
      fireEvent.press(screen.getByTestId('cancel-form-button'));
      expect(screen.queryByTestId('new-observation-form')).toBeNull();
    });

    it('guarda una observación válida al pulsar "Guardar"', async () => {
      const createMock = jest.fn().mockResolvedValue(true);
      mockObservations.mockReturnValue({
        observations: mockObs as never,
        loading: false,
        error: null,
        create: createMock,
        update: jest.fn(),
        remove: jest.fn(),
        refresh: jest.fn(),
      });

      render(<ObservationsScreen {...fakeObsProps} />);
      fireEvent.press(screen.getByTestId('add-observation-button'));
      fireEvent.changeText(screen.getByTestId('title-input'), 'Saturno');
      fireEvent.changeText(screen.getByTestId('body-input'), 'planeta');
      await act(async () => {
        fireEvent.press(screen.getByTestId('save-observation-button'));
      });
      expect(createMock).toHaveBeenCalledTimes(1);
      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Saturno', body: 'planeta' }),
      );
    });

    it('no llama a create cuando faltan campos obligatorios', async () => {
      const createMock = jest.fn().mockResolvedValue(true);
      mockObservations.mockReturnValue({
        observations: mockObs as never,
        loading: false,
        error: null,
        create: createMock,
        update: jest.fn(),
        remove: jest.fn(),
        refresh: jest.fn(),
      });

      render(<ObservationsScreen {...fakeObsProps} />);
      fireEvent.press(screen.getByTestId('add-observation-button'));
      // Solo rellena el título, falta "body"
      fireEvent.changeText(screen.getByTestId('title-input'), 'Saturno');
      await act(async () => {
        fireEvent.press(screen.getByTestId('save-observation-button'));
      });
      expect(createMock).not.toHaveBeenCalled();
    });

    it('abre el diálogo de confirmación al pulsar eliminar', () => {
      const { Alert } = require('react-native');
      jest.spyOn(Alert, 'alert');

      render(<ObservationsScreen {...fakeObsProps} />);
      fireEvent.press(screen.getByTestId('delete-observation-1'));
      expect(Alert.alert).toHaveBeenCalledWith(
        'Eliminar observación',
        expect.stringContaining('¿Seguro'),
        expect.any(Array),
      );

      jest.restoreAllMocks();
    });

    it('llama a remove al confirmar la eliminación en el Alert', () => {
      const removeMock = jest.fn().mockResolvedValue(true);
      mockObservations.mockReturnValue({
        observations: mockObs as never,
        loading: false,
        error: null,
        create: jest.fn(),
        update: jest.fn(),
        remove: removeMock,
        refresh: jest.fn(),
      });

      const { Alert } = require('react-native');
      // Intercepta Alert.alert y llama directamente al botón "Eliminar"
      jest.spyOn(Alert, 'alert').mockImplementation((_title, _msg, buttons) => {
        const confirmBtn = (buttons as { text: string; onPress?: () => void }[])
          .find((b) => b.text === 'Eliminar');
        confirmBtn?.onPress?.();
      });

      render(<ObservationsScreen {...fakeObsProps} />);
      fireEvent.press(screen.getByTestId('delete-observation-1'));
      expect(removeMock).toHaveBeenCalledWith('1');

      jest.restoreAllMocks();
    });
  });

  describe('manejo de errores', () => {
    it('muestra el banner de error cuando hay fallo de carga', () => {
      mockObservations.mockReturnValue({
        observations: [],
        loading: false,
        error: 'Error al cargar observaciones',
        create: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        refresh: jest.fn(),
      });
      render(<ObservationsScreen {...fakeObsProps} />);
      expect(screen.getByTestId('error-banner')).toBeTruthy();
    });
  });
});
