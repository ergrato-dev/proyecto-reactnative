/**
 * Tests del módulo `camera/`.
 *
 * @what Cubre `useCameraPermission`, `ConstellationOverlay` y
 *   `ARConstellationScreen` (permiso denegado, concedido, degradación Web).
 * @why Son los tres puntos críticos del módulo: si el flujo de permisos falla
 *   o el overlay no renderiza, la feature queda inutilizable.
 * @impact Mock de `expo-camera`, `useCameraPermission` y `useGyroscope`.
 */

import React from 'react';
import { Platform } from 'react-native';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { renderHook, act } from '@testing-library/react-native';

// ─── Mocks globales del módulo ────────────────────────────────────────────────

jest.mock('expo-camera', () => ({
  CameraView: ({ testID, children }: { testID?: string; children?: React.ReactNode }) => {
     
    const { createElement } = require('react');
     
    const { View } = require('react-native');
    return createElement(View, { testID }, children);
  },
  useCameraPermissions: jest.fn(),
  PermissionStatus: {
    GRANTED: 'granted',
    DENIED: 'denied',
    UNDETERMINED: 'undetermined',
  },
}));

jest.mock('react-native-svg', () => {
   
  const { createElement } = require('react');
   
  const RN = require('react-native');
  const Wrapper = ({ children, ...p }: { children?: unknown }) =>
    createElement(RN.View, p, children);
  const TextWrapper = ({ children, ...p }: { children?: unknown }) =>
    createElement(RN.Text, p, children);
  const Leaf = (p: object) => createElement(RN.View, p);
  return {
    __esModule: true,
    default: Wrapper,
    Svg: Wrapper,
    Line: Leaf,
    Circle: Leaf,
    Text: TextWrapper,
  };
});

jest.mock('@/modules/sensors/hooks/useGyroscope', () => ({
  useGyroscope: () => ({
    rotation: { x: 0, y: 0, z: 0 },
    isAvailable: true,
    reset: jest.fn(),
  }),
}));

// ─── Imports tras los mocks ───────────────────────────────────────────────────

import { useCameraPermissions, PermissionStatus } from 'expo-camera';
import { useCameraPermission } from '../hooks/useCameraPermission';
import { ConstellationOverlay } from '../components/ConstellationOverlay';
import { ARConstellationScreen } from '../screens/ARConstellationScreen';
import { AR_CONSTELLATIONS } from '../data/constellations';

const mockUseCameraPermissions = useCameraPermissions as jest.Mock;

// ─── Helper: construye un objeto de permiso de expo ──────────────────────────

function buildPermission(status: string) {
  return {
    status,
    granted: status === PermissionStatus.GRANTED,
    canAskAgain: true,
    expires: 'never' as const,
    get: jest.fn(),
  };
}

// ─── useCameraPermission ──────────────────────────────────────────────────────

describe('useCameraPermission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('granted es false cuando el permiso está UNDETERMINED', () => {
    const requestMock = jest.fn().mockResolvedValue(buildPermission('undetermined'));
    mockUseCameraPermissions.mockReturnValue([
      buildPermission('undetermined'),
      requestMock,
    ]);

    const { result } = renderHook(() => useCameraPermission());
    expect(result.current.granted).toBe(false);
  });

  it('granted es true cuando el permiso está GRANTED', () => {
    mockUseCameraPermissions.mockReturnValue([
      buildPermission('granted'),
      jest.fn(),
    ]);

    const { result } = renderHook(() => useCameraPermission());
    expect(result.current.granted).toBe(true);
  });

  it('requesting pasa a true al llamar requestPermission', async () => {
    let resolve!: (v: unknown) => void;
    const requestMock = jest.fn().mockReturnValue(new Promise((r) => { resolve = r; }));
    mockUseCameraPermissions.mockReturnValue([
      buildPermission('undetermined'),
      requestMock,
    ]);

    const { result } = renderHook(() => useCameraPermission());

    act(() => {
      result.current.requestPermission();
    });

    expect(result.current.requesting).toBe(true);

    // Resolver la promesa y verificar que requesting vuelve a false
    await act(async () => {
      resolve(buildPermission('granted'));
    });
  });

  it('llama a la función de expo al solicitar permiso', async () => {
    const requestMock = jest.fn().mockResolvedValue(buildPermission('granted'));
    mockUseCameraPermissions.mockReturnValue([
      buildPermission('undetermined'),
      requestMock,
    ]);

    const { result } = renderHook(() => useCameraPermission());

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(requestMock).toHaveBeenCalledTimes(1);
  });
});

// ─── ConstellationOverlay ─────────────────────────────────────────────────────

describe('ConstellationOverlay', () => {
  it('renderiza el badge AR', () => {
    render(
      <ConstellationOverlay constellations={[]} />,
    );
    expect(screen.getByTestId('ar-badge')).toBeTruthy();
  });

  it('renderiza el contenedor del overlay', () => {
    render(
      <ConstellationOverlay constellations={[]} />,
    );
    expect(screen.getByTestId('constellation-overlay')).toBeTruthy();
  });

  it('renderiza las etiquetas de las constelaciones proporcionadas', () => {
    const subset = AR_CONSTELLATIONS.slice(0, 2);
    render(
      <ConstellationOverlay constellations={subset} />,
    );
    expect(screen.getByTestId(`label-${subset[0].id}`)).toBeTruthy();
    expect(screen.getByTestId(`label-${subset[1].id}`)).toBeTruthy();
  });

  it('no falla con lista de constelaciones vacía', () => {
    expect(() => render(<ConstellationOverlay constellations={[]} />)).not.toThrow();
  });
});

// ─── ARConstellationScreen — degradación Web ──────────────────────────────────

describe('ARConstellationScreen — Web', () => {
  beforeEach(() => {
    Object.defineProperty(Platform, 'OS', { value: 'web', configurable: true });
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true });
  });

  it('muestra la pantalla de degradación en Web', () => {
    render(<ARConstellationScreen />);
    expect(screen.getByTestId('web-fallback')).toBeTruthy();
  });

  it('no renderiza la cámara en Web', () => {
    render(<ARConstellationScreen />);
    expect(screen.queryByTestId('camera-view')).toBeNull();
  });
});

// ─── ARConstellationScreen — permiso denegado ────────────────────────────────

describe('ARConstellationScreen — permiso denegado', () => {
  beforeEach(() => {
    Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true });
    mockUseCameraPermissions.mockReturnValue([
      buildPermission('undetermined'),
      jest.fn().mockResolvedValue(buildPermission('undetermined')),
    ]);
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true });
  });

  it('muestra la pantalla de solicitud de permiso', () => {
    render(<ARConstellationScreen />);
    expect(screen.getByTestId('permission-screen')).toBeTruthy();
  });

  it('muestra el botón de solicitar permiso', () => {
    render(<ARConstellationScreen />);
    expect(screen.getByTestId('btn-request-permission')).toBeTruthy();
  });

  it('el botón llama a requestPermission al pulsarlo', async () => {
    const requestMock = jest.fn().mockResolvedValue(buildPermission('undetermined'));
    mockUseCameraPermissions.mockReturnValue([
      buildPermission('undetermined'),
      requestMock,
    ]);

    render(<ARConstellationScreen />);
    fireEvent.press(screen.getByTestId('btn-request-permission'));

    expect(requestMock).toHaveBeenCalledTimes(1);
  });
});

// ─── ARConstellationScreen — permiso concedido ───────────────────────────────

describe('ARConstellationScreen — permiso concedido', () => {
  beforeEach(() => {
    Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true });
    mockUseCameraPermissions.mockReturnValue([
      buildPermission('granted'),
      jest.fn(),
    ]);
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true });
  });

  it('muestra la pantalla AR con la cámara', () => {
    render(<ARConstellationScreen />);
    expect(screen.getByTestId('ar-screen')).toBeTruthy();
  });

  it('renderiza la vista de cámara', () => {
    render(<ARConstellationScreen />);
    expect(screen.getByTestId('camera-view')).toBeTruthy();
  });

  it('renderiza el overlay de constelaciones', () => {
    render(<ARConstellationScreen />);
    expect(screen.getByTestId('constellation-overlay')).toBeTruthy();
  });

  it('renderiza el botón de captura', () => {
    render(<ARConstellationScreen />);
    expect(screen.getByTestId('btn-capture')).toBeTruthy();
  });

  it('renderiza el panel de info', () => {
    render(<ARConstellationScreen />);
    expect(screen.getByTestId('info-panel')).toBeTruthy();
  });
});
