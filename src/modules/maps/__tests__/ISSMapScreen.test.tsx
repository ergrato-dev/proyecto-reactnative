/**
 * Tests de la pantalla ISSMapScreen.
 *
 * @what Verifica los estados de carga, error, render del panel de coordenadas
 *   y el botón de navegación a la tripulación, tanto en plataforma nativa
 *   como en el fallback web.
 * @why `ISSMapScreen` es la pantalla principal del módulo ISS; si no maneja
 *   correctamente los estados o no navega al pulsar "Ver tripulación",
 *   la experiencia de usuario del módulo de mapas queda rota.
 * @impact Cubre `ISSMapScreen` en plataforma nativa y web.
 *   Mockea `react-native-maps` (no disponible en Jest/node) y `useIssPosition`.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { ISSMapScreen } from '../screens/ISSMapScreen';

// ─── Mock de react-native-maps ────────────────────────────────────────────────
jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: object) => <View testID="mock-map-view" {...props} />,
    Marker: (props: object) => <View testID="mock-marker" {...props} />,
    Polyline: (props: object) => <View testID="mock-polyline" {...props} />,
  };
});

// ─── Mock de useIssPosition ───────────────────────────────────────────────────
jest.mock('../hooks/useIssPosition');
import { useIssPosition } from '../hooks/useIssPosition';
const mockUseIssPosition = useIssPosition as jest.Mock;

/** Props mínimas de navegación */
function buildNavProps(navigateMock = jest.fn()) {
  return {
    navigation: { navigate: navigateMock } as unknown as Parameters<
      typeof ISSMapScreen
    >[0]['navigation'],
    route: {} as Parameters<typeof ISSMapScreen>[0]['route'],
  };
}

// ─── Suite nativa (Platform.OS = 'ios') ──────────────────────────────────────
// En el entorno de test, Platform.OS por defecto es 'ios', por lo que
// los componentes de react-native-maps se importan (mocked). Esta suite
// cubre el path nativo del componente.

describe('ISSMapScreen — plataforma nativa', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería mostrar el indicador de carga inicial sin coordenadas', () => {
    mockUseIssPosition.mockReturnValue({
      coordinates: null,
      isLoading: true,
      isError: false,
      error: null,
    });
    render(<ISSMapScreen {...buildNavProps()} />);
    expect(screen.getByTestId('loading-view')).toBeTruthy();
    expect(screen.getByText('Localizando la ISS…')).toBeTruthy();
  });

  it('debería mostrar el mensaje de error sin coordenadas', () => {
    mockUseIssPosition.mockReturnValue({
      coordinates: null,
      isLoading: false,
      isError: true,
      error: new Error('Network error'),
    });
    render(<ISSMapScreen {...buildNavProps()} />);
    expect(screen.getByTestId('error-view')).toBeTruthy();
    expect(screen.getByText('No se pudo obtener la posición de la ISS')).toBeTruthy();
  });

  it('debería renderizar el contenedor del mapa con coordenadas', () => {
    mockUseIssPosition.mockReturnValue({
      coordinates: { latitude: 28.61, longitude: 77.21, timestamp: 1700000000 },
      isLoading: false,
      isError: false,
      error: null,
    });
    render(<ISSMapScreen {...buildNavProps()} />);
    expect(screen.getByTestId('iss-map-container')).toBeTruthy();
    expect(screen.getByTestId('coord-panel')).toBeTruthy();
  });

  it('debería mostrar las coordenadas en el panel superpuesto', () => {
    mockUseIssPosition.mockReturnValue({
      coordinates: { latitude: 51.5074, longitude: -0.1278, timestamp: 1700000000 },
      isLoading: false,
      isError: false,
      error: null,
    });
    render(<ISSMapScreen {...buildNavProps()} />);
    expect(screen.getByTestId('iss-lat')).toBeTruthy();
    expect(screen.getByTestId('iss-lng')).toBeTruthy();
  });

  it('debería navegar a Astronauts al pulsar el botón de tripulación', () => {
    const navigate = jest.fn();
    mockUseIssPosition.mockReturnValue({
      coordinates: { latitude: 0, longitude: 0, timestamp: 0 },
      isLoading: false,
      isError: false,
      error: null,
    });
    render(<ISSMapScreen {...buildNavProps(navigate)} />);
    fireEvent.press(screen.getByTestId('crew-button'));
    expect(navigate).toHaveBeenCalledWith('Astronauts');
  });
});

// ─── Suite web (Platform.OS = 'web') ─────────────────────────────────────────

describe('ISSMapScreen — fallback web', () => {
  const originalOS = Platform.OS;
  beforeAll(() => {
    Object.defineProperty(Platform, 'OS', { get: () => 'web' });
  });
  afterAll(() => {
    Object.defineProperty(Platform, 'OS', { get: () => originalOS });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería mostrar el indicador de carga en web', () => {
    mockUseIssPosition.mockReturnValue({
      coordinates: null,
      isLoading: true,
      isError: false,
      error: null,
    });
    render(<ISSMapScreen {...buildNavProps()} />);
    expect(screen.getByTestId('loading-view')).toBeTruthy();
  });

  it('debería mostrar el fallback web con coordenadas', () => {
    mockUseIssPosition.mockReturnValue({
      coordinates: { latitude: 28.61, longitude: 77.21, timestamp: 1700000000 },
      isLoading: false,
      isError: false,
      error: null,
    });
    render(<ISSMapScreen {...buildNavProps()} />);
    expect(screen.getByTestId('iss-web-fallback')).toBeTruthy();
    expect(screen.getByTestId('iss-lat')).toBeTruthy();
    expect(screen.getByTestId('iss-lng')).toBeTruthy();
  });

  it('debería mostrar el mensaje de error en web', () => {
    mockUseIssPosition.mockReturnValue({
      coordinates: null,
      isLoading: false,
      isError: true,
      error: new Error('Network error'),
    });
    render(<ISSMapScreen {...buildNavProps()} />);
    expect(screen.getByTestId('error-view')).toBeTruthy();
    expect(screen.getByText('Error al obtener la posición de la ISS')).toBeTruthy();
  });

  it('debería mostrar el botón de tripulación en web', () => {
    mockUseIssPosition.mockReturnValue({
      coordinates: { latitude: 0, longitude: 0, timestamp: 0 },
      isLoading: false,
      isError: false,
      error: null,
    });
    render(<ISSMapScreen {...buildNavProps()} />);
    expect(screen.getByTestId('crew-button')).toBeTruthy();
  });
});
