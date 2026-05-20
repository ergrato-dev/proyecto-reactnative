/**
 * Tests de integración de StarMapScreen.
 *
 * @what Verifica que la pantalla renderiza el canvas de estrellas, muestra
 *   el nombre de la constelación más cercana, el botón de centrado y los
 *   mensajes contextuales según la disponibilidad del giroscopio.
 * @why La pantalla combina sensores, proyección y rendering; estos tests
 *   aseguran que la integración funciona end-to-end con mocks.
 * @impact Mock de `expo-sensors` y de `useWindowDimensions` — sin hardware real.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { StarMapScreen } from '../screens/StarMapScreen';

// ─── Mock de expo-sensors ─────────────────────────────────────────────────────

const mockGyroIsAvailable = jest.fn();
const mockAccelIsAvailable = jest.fn();
const mockReset = jest.fn();

// Mock de los hooks del módulo
jest.mock('../hooks/useGyroscope', () => ({
  useGyroscope: () => ({
    rotation: { x: 0, y: 0, z: 0 },
    isAvailable: mockGyroIsAvailable(),
    reset: mockReset,
  }),
}));

jest.mock('../hooks/useAccelerometer', () => ({
  useAccelerometer: () => ({
    acceleration: { x: 0, y: 0, z: 0 },
    isAvailable: mockAccelIsAvailable(),
  }),
}));

jest.mock('expo-sensors', () => ({
  Gyroscope: {
    isAvailableAsync: jest.fn().mockResolvedValue(false),
    addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
    setUpdateInterval: jest.fn(),
  },
  Accelerometer: {
    isAvailableAsync: jest.fn().mockResolvedValue(false),
    addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
    setUpdateInterval: jest.fn(),
  },
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('StarMapScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza el contenedor principal con testID', () => {
    mockGyroIsAvailable.mockReturnValue(false);
    mockAccelIsAvailable.mockReturnValue(false);

    render(<StarMapScreen />);

    expect(screen.getByTestId('star-map-screen')).toBeTruthy();
  });

  it('muestra la etiqueta de constelación más cercana', () => {
    mockGyroIsAvailable.mockReturnValue(false);
    mockAccelIsAvailable.mockReturnValue(false);

    render(<StarMapScreen />);

    // La etiqueta debe estar presente (empieza centrada en Orión)
    const label = screen.getByTestId('constellation-label');
    expect(label).toBeTruthy();
    // El texto debe contener el nombre de alguna constelación
    expect(label.props.children).toBeDefined();
  });

  it('muestra el botón de centrado', () => {
    mockGyroIsAvailable.mockReturnValue(false);
    mockAccelIsAvailable.mockReturnValue(false);

    render(<StarMapScreen />);

    expect(screen.getByTestId('center-button')).toBeTruthy();
  });

  it('llama a reset() al presionar el botón de centrado', () => {
    mockGyroIsAvailable.mockReturnValue(false);
    mockAccelIsAvailable.mockReturnValue(false);

    render(<StarMapScreen />);

    fireEvent.press(screen.getByTestId('center-button'));

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('muestra el fallback banner cuando el giroscopio no está disponible', () => {
    mockGyroIsAvailable.mockReturnValue(false);
    mockAccelIsAvailable.mockReturnValue(false);

    render(<StarMapScreen />);

    // El fallback banner contiene texto sobre gestos táctiles
    const banner = screen.getByText(/arrastra|gesturas|giroscopio/i);
    expect(banner).toBeTruthy();
  });

  it('NO muestra el fallback banner cuando el giroscopio está disponible', () => {
    mockGyroIsAvailable.mockReturnValue(true);
    mockAccelIsAvailable.mockReturnValue(true);

    render(<StarMapScreen />);

    const banner = screen.queryByText(/arrastra|gesturas/i);
    expect(banner).toBeNull();
  });

  it('muestra el estado del sensor en la interfaz', () => {
    mockGyroIsAvailable.mockReturnValue(true);
    mockAccelIsAvailable.mockReturnValue(true);

    render(<StarMapScreen />);

    // Cuando el giroscopio está activo, debe mostrar ese estado
    expect(screen.getByText(/giroscopio activo/i)).toBeTruthy();
  });
});
