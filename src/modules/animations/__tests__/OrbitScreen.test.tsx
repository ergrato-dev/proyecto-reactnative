/**
 * Tests de integración de OrbitScreen.
 *
 * @what Verifica que la pantalla renderiza el sol, los 4 planetas (leyenda),
 *   el botón de control y el panel de info al tocar un planeta.
 * @why La pantalla combina Reanimated + GestureDetector + estado local;
 *   estos tests aseguran que la integración funciona con mocks del entorno nativo.
 * @impact Mock de react-native-reanimated, react-native-gesture-handler y
 *   del hook useOrbitAnimation para aislar la lógica de UI pura.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

// ─── Mock de react-native-reanimated ─────────────────────────────────────────
// Mock manual completo: react-native-reanimated/mock carga el módulo nativo en
// Reanimated 4 (via react-native-worklets) y falla en entorno Jest sin hardware.
// Se exporta `default` como objeto con `View` para que `Animated.View` funcione.

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  const mockAnimatedView = View;
  return {
    __esModule: true,
    default: { View: mockAnimatedView },
    useSharedValue: (v: unknown) => ({ value: v }),
    useAnimatedStyle: (_fn: () => unknown) => ({}),
    withSpring: (v: unknown) => v,
    withTiming: (v: unknown) => v,
    withRepeat: (v: unknown) => v,
    cancelAnimation: jest.fn(),
    runOnJS: (fn: (...args: unknown[]) => unknown) => fn,
    Easing: { linear: 'linear' },
  };
});

// ─── Mock de react-native-gesture-handler ────────────────────────────────────

jest.mock('react-native-gesture-handler', () => {
  const actual = require('react-native-gesture-handler/jestSetup');
  return {
    ...actual,
    GestureDetector: ({ children }: { children: React.ReactNode }) => children,
    Gesture: {
      Pan: () => ({
        onUpdate: () => ({ onEnd: () => ({}) }),
      }),
    },
  };
});

// ─── Mock de useOrbitAnimation para simplificar el entorno de test ────────────

const mockPause = jest.fn();
const mockResume = jest.fn();
let mockIsPlaying = true;

jest.mock('../hooks/useOrbitAnimation', () => ({
  useOrbitAnimation: () => ({
    angle: { value: 0 },
    isPlaying: mockIsPlaying,
    pause: mockPause,
    resume: mockResume,
  }),
}));

// ─── Import de la pantalla (después de los mocks) ────────────────────────────

import { OrbitScreen } from '../screens/OrbitScreen';

/** Helper que genera props mínimos de navegación para el Drawer */
function makeDrawerProps() {
  return {
    navigation: {
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
      setOptions: jest.fn(),
      openDrawer: jest.fn(),
      closeDrawer: jest.fn(),
    },
    route: { key: 'Animations', name: 'Animations', params: undefined },
  } as unknown as React.ComponentProps<typeof OrbitScreen>;
}

describe('OrbitScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsPlaying = true;
  });

  it('renderiza el contenedor principal con testID "orbit-screen"', () => {
    render(<OrbitScreen {...makeDrawerProps()} />);
    expect(screen.getByTestId('orbit-screen')).toBeTruthy();
  });

  it('renderiza el sol con testID "sun"', () => {
    render(<OrbitScreen {...makeDrawerProps()} />);
    expect(screen.getByTestId('sun')).toBeTruthy();
  });

  it('muestra los 4 planetas en la leyenda', () => {
    render(<OrbitScreen {...makeDrawerProps()} />);
    expect(screen.getByTestId('planet-label-legend-mercury')).toBeTruthy();
    expect(screen.getByTestId('planet-label-legend-venus')).toBeTruthy();
    expect(screen.getByTestId('planet-label-legend-earth')).toBeTruthy();
    expect(screen.getByTestId('planet-label-legend-mars')).toBeTruthy();
  });

  it('muestra el texto "Pausar" cuando isPlaying = true', () => {
    render(<OrbitScreen {...makeDrawerProps()} />);
    expect(screen.getByText(/Pausar/i)).toBeTruthy();
  });

  it('el botón de control tiene testID "pause-resume-button"', () => {
    render(<OrbitScreen {...makeDrawerProps()} />);
    expect(screen.getByTestId('pause-resume-button')).toBeTruthy();
  });

  it('al presionar Pausar se llama pause() en cada planeta (4 veces)', () => {
    render(<OrbitScreen {...makeDrawerProps()} />);
    fireEvent.press(screen.getByTestId('pause-resume-button'));
    // pauseAll llama pause() 4 veces (una por planeta)
    expect(mockPause).toHaveBeenCalledTimes(4);
  });

  it('muestra el título del sistema solar', () => {
    render(<OrbitScreen {...makeDrawerProps()} />);
    expect(screen.getByText('Sistema Solar Interior')).toBeTruthy();
  });

  it('no muestra panel de info cuando no se ha tocado ningún planeta', () => {
    render(<OrbitScreen {...makeDrawerProps()} />);
    // No debe existir ningún testID planet-label-{id} sin {id} en leyenda
    expect(screen.queryByTestId('planet-label-mercury')).toBeNull();
    expect(screen.queryByTestId('planet-label-venus')).toBeNull();
  });

  it('muestra el texto "Reanudar" cuando isPlaying = false', () => {
    mockIsPlaying = false;
    render(<OrbitScreen {...makeDrawerProps()} />);
    expect(screen.getByText(/Reanudar/i)).toBeTruthy();
  });

  it('al presionar Reanudar se llama resume() en cada planeta (4 veces)', () => {
    mockIsPlaying = false;
    render(<OrbitScreen {...makeDrawerProps()} />);
    fireEvent.press(screen.getByTestId('pause-resume-button'));
    expect(mockResume).toHaveBeenCalledTimes(4);
  });

  it('al tocar un planeta aparece el panel de información con el nombre', () => {
    render(<OrbitScreen {...makeDrawerProps()} />);
    // OrbitingPlanet renderiza un TouchableOpacity con accessibilityRole="button"
    // y accessibilityLabel="Ver detalles de {name}". Se usa getByRole para
    // llegar al elemento correcto sin depender del Animated.View contenedor.
    fireEvent.press(screen.getByRole('button', { name: /Ver detalles de Mercurio/i }));
    // El panel de info debe aparecer; se verifica por testID para evitar
    // ambigüedad con el nombre en la leyenda inferior.
    expect(screen.getByTestId('planet-label-mercury')).toBeTruthy();
  });

  it('el panel de información muestra el período orbital del planeta seleccionado', () => {
    render(<OrbitScreen {...makeDrawerProps()} />);
    fireEvent.press(screen.getByRole('button', { name: /Ver detalles de Tierra/i }));
    expect(screen.getByText(/Período orbital/i)).toBeTruthy();
  });
});
