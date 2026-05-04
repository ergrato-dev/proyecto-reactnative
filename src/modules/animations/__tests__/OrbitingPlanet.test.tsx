/**
 * Tests del componente `OrbitingPlanet`.
 *
 * @what Verifica que el componente renderiza el anillo orbital, el punto del
 *   planeta con el `testID` correcto, y que llama al callback `onPress`
 *   al interactuar con el planeta.
 * @why `OrbitingPlanet` es la unidad visual fundamental del sistema solar
 *   animado. Si no renderiza o no dispara el callback, la pantalla de
 *   animaciones queda sin interactividad.
 * @impact Mock completo de `react-native-reanimated` para aislar la lógica
 *   de UI de los worklets nativos que no ejecutan en entorno Jest.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

// ─── Mock de react-native-reanimated ─────────────────────────────────────────
// Los worklets de Reanimated requieren el hilo de UI nativo; se reemplaza por
// versiones no-op para que Jest pueda instanciar el componente sin hardware.

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: { View },
    useSharedValue: (v: unknown) => ({ value: v }),
    useAnimatedStyle: (_fn: () => unknown) => ({}),
    withSpring: (v: unknown) => v,
    cancelAnimation: jest.fn(),
    runOnJS: (fn: (...args: unknown[]) => unknown) => fn,
  };
});

import { OrbitingPlanet } from '../components/OrbitingPlanet';
import type { PlanetData } from '../data/planets';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

/** Planeta de prueba con valores mínimos */
const MOCK_PLANET: PlanetData = {
  id: 'earth',
  name: 'Tierra',
  color: '#4B9CD3',
  radius: 10,
  orbitRadius: 145,
  periodMs: 8000,
};

/** SharedValue simulado (sin animación real) */
const mockAngle = { value: 0 };

describe('OrbitingPlanet', () => {
  it('renderiza el planeta con el testID correcto', () => {
    render(
      <OrbitingPlanet
        planet={MOCK_PLANET}
        angle={mockAngle as never}
        centerX={200}
        centerY={200}
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByTestId('planet-earth')).toBeTruthy();
  });

  it('renderiza el anillo orbital (View con posición absoluta)', () => {
    const { toJSON } = render(
      <OrbitingPlanet
        planet={MOCK_PLANET}
        angle={mockAngle as never}
        centerX={200}
        centerY={200}
        onPress={jest.fn()}
      />,
    );
    // El JSON del árbol debe existir (el anillo orbital se renderiza como View)
    expect(toJSON()).not.toBeNull();
  });

  it('llama a onPress con el planeta al pulsar el punto del planeta', () => {
    const onPressMock = jest.fn();
    render(
      <OrbitingPlanet
        planet={MOCK_PLANET}
        angle={mockAngle as never}
        centerX={200}
        centerY={200}
        onPress={onPressMock}
      />,
    );
    // El TouchableOpacity tiene accessibilityRole="button" y accessibilityLabel
    // "Ver detalles de {name}". Se usa getByRole para encontrarlo directamente
    // en lugar del Animated.View contenedor (que no tiene onPress propio).
    fireEvent.press(screen.getByRole('button', { name: /Ver detalles de Tierra/i }));
    expect(onPressMock).toHaveBeenCalledTimes(1);
    expect(onPressMock).toHaveBeenCalledWith(MOCK_PLANET);
  });

  it('pasa el accesibilityLabel correcto al botón del planeta', () => {
    render(
      <OrbitingPlanet
        planet={MOCK_PLANET}
        angle={mockAngle as never}
        centerX={200}
        centerY={200}
        onPress={jest.fn()}
      />,
    );
    expect(
      screen.getByRole('button', { name: /Ver detalles de Tierra/i }),
    ).toBeTruthy();
  });

  it('renderiza correctamente con distintos planetas', () => {
    const mercury: PlanetData = {
      id: 'mercury',
      name: 'Mercurio',
      color: '#B5B5B5',
      radius: 5,
      orbitRadius: 60,
      periodMs: 1927,
    };
    render(
      <OrbitingPlanet
        planet={mercury}
        angle={mockAngle as never}
        centerX={100}
        centerY={100}
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByTestId('planet-mercury')).toBeTruthy();
  });
});
