/**
 * Tests del componente HomeScreen.
 *
 * @what Verifica que HomeScreen renderiza el catálogo de módulos correctamente:
 *   título de la app, los 12 módulos con sus badges de plataforma y la
 *   navegación al pulsar un módulo implementado.
 * @why HomeScreen es la pantalla raíz del showcase; si no renderiza el catálogo
 *   completo o si los badges de estado son incorrectos, el usuario pierde la
 *   referencia visual del proyecto.
 * @impact Cubre `HomeScreen`, `ModuleCard` y la función `platformBadge`.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { MODULE_CATALOG } from '../moduleCatalog';

// ─── Props mínimas de navegación ─────────────────────────────────────────────
// HomeScreen usa `navigation.navigate` del prop, no el hook useNavigation.
// Se construye un mock mínimo tipado con `as unknown as` para evitar instalar
// todo el contexto de React Navigation en estos tests unitarios.

/** Construye las props mínimas que HomeScreen necesita de React Navigation */
function buildNavProps(navigateMock: jest.Mock) {
  return {
    navigation: { navigate: navigateMock } as unknown as Parameters<
      typeof HomeScreen
    >[0]['navigation'],
    route: {} as Parameters<typeof HomeScreen>[0]['route'],
  };
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('HomeScreen', () => {
  it('debería renderizar el título de la aplicación', () => {
    render(<HomeScreen {...buildNavProps(jest.fn())} />);
    expect(screen.getByText('CosmosRN')).toBeTruthy();
  });

  it('debería renderizar el subtítulo del showcase', () => {
    render(<HomeScreen {...buildNavProps(jest.fn())} />);
    expect(screen.getByText('Showcase de React Native con astronomía')).toBeTruthy();
  });

  it('debería renderizar los 12 módulos del catálogo', () => {
    render(<HomeScreen {...buildNavProps(jest.fn())} />);
    MODULE_CATALOG.forEach((mod) => {
      expect(screen.getByText(mod.name)).toBeTruthy();
    });
  });

  it('debería mostrar el caso de uso astronómico de cada módulo', () => {
    render(<HomeScreen {...buildNavProps(jest.fn())} />);
    // Verificamos el primero y el último para cubrir el recorrido de la lista
    expect(screen.getByText(MODULE_CATALOG[0].astronomicalUseCase)).toBeTruthy();
    expect(
      screen.getByText(MODULE_CATALOG[MODULE_CATALOG.length - 1].astronomicalUseCase),
    ).toBeTruthy();
  });

  it('debería mostrar el indicador de fase para cada módulo', () => {
    render(<HomeScreen {...buildNavProps(jest.fn())} />);
    MODULE_CATALOG.forEach((mod) => {
      expect(screen.getByText('F' + mod.phase)).toBeTruthy();
    });
  });

  it('debería mostrar badges de plataforma Android, Web e iOS por módulo', () => {
    render(<HomeScreen {...buildNavProps(jest.fn())} />);
    // Verificamos que la tarjeta del módulo navegación existe y tiene testID
    expect(screen.getByTestId('module-card-navigation')).toBeTruthy();
    // Cada módulo tiene 3 badges; puede haber matches extra en descripciones
    expect(screen.getAllByText(/Android/).length).toBeGreaterThanOrEqual(
      MODULE_CATALOG.length,
    );
    expect(screen.getAllByText(/Web/).length).toBeGreaterThanOrEqual(
      MODULE_CATALOG.length,
    );
    expect(screen.getAllByText(/iOS/).length).toBeGreaterThanOrEqual(
      MODULE_CATALOG.length,
    );
  });

  it('debería navegar a SolarCatalog al pulsar el módulo lists', () => {
    const navigate = jest.fn();
    render(<HomeScreen {...buildNavProps(navigate)} />);
    const listsCard = screen.getByTestId('module-card-lists');
    fireEvent.press(listsCard);
    expect(navigate).toHaveBeenCalledWith('SolarCatalog');
  });

  it('debería navegar a AsteroidSearch al pulsar el módulo forms', () => {
    const navigate = jest.fn();
    render(<HomeScreen {...buildNavProps(navigate)} />);
    const formsCard = screen.getByTestId('module-card-forms');
    fireEvent.press(formsCard);
    expect(navigate).toHaveBeenCalledWith('AsteroidSearch');
  });

  it('no debería navegar al pulsar un módulo no implementado', () => {
    const navigate = jest.fn();
    render(<HomeScreen {...buildNavProps(navigate)} />);
    const animCard = screen.getByTestId('module-card-animations');
    fireEvent.press(animCard);
    expect(navigate).not.toHaveBeenCalled();
  });
});
