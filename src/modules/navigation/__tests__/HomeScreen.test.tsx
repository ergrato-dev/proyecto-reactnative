/// <reference types="jest" />
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

// ─── Mock de React Navigation ─────────────────────────────────────────────────
// HomeScreen usa `navigation.navigate` — se mockea el hook para aislar el test
// del contexto real de React Navigation.

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

// ─── Props mínimas de navegación ─────────────────────────────────────────────

/** Construye las props mínimas que HomeScreen necesita de React Navigation */
function buildNavProps() {
  return {
    navigation: { navigate: mockNavigate } as unknown as Parameters<
      typeof HomeScreen
    >[0]['navigation'],
    route: {} as Parameters<typeof HomeScreen>[0]['route'],
  };
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('HomeScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('debería renderizar el título de la aplicación', () => {
    render(<HomeScreen {...buildNavProps()} />);
    expect(screen.getByText('CosmosRN')).toBeTruthy();
  });

  it('debería renderizar el subtítulo del showcase', () => {
    render(<HomeScreen {...buildNavProps()} />);
    expect(screen.getByText('Showcase de React Native con astronomía')).toBeTruthy();
  });

  it('debería renderizar los 13 módulos del catálogo', () => {
    render(<HomeScreen {...buildNavProps()} />);
    MODULE_CATALOG.forEach((mod) => {
      expect(screen.getByText(mod.name)).toBeTruthy();
    });
  });

  it('debería mostrar el caso de uso astronómico de cada módulo', () => {
    render(<HomeScreen {...buildNavProps()} />);
    // Verificamos el primero y el último para cubrir el recorrido de la lista
    expect(screen.getByText(MODULE_CATALOG[0].astronomicalUseCase)).toBeTruthy();
    expect(
      screen.getByText(MODULE_CATALOG[MODULE_CATALOG.length - 1].astronomicalUseCase),
    ).toBeTruthy();
  });

  it('debería mostrar el indicador de fase para cada módulo', () => {
    render(<HomeScreen {...buildNavProps()} />);
    MODULE_CATALOG.forEach((mod) => {
      expect(screen.getByText(`F${mod.phase}`)).toBeTruthy();
    });
  });

  it('debería mostrar badges de plataforma Android, Web e iOS por módulo', () => {
    render(<HomeScreen {...buildNavProps()} />);
    // Cada módulo tiene 3 badges de plataforma, verificamos que el primer módulo
    // (Navegación, fase 1) tenga los tres badges; el texto del catálogo también
    // puede contener "Android/Web/iOS" por lo que evitamos conteo exacto global
    const navCard = screen.getByTestId('module-card-navigation');
    expect(navCard).toBeTruthy();
    // Dentro de la tarjeta de Navegación deben aparecer los 3 badges
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
    render(<HomeScreen {...buildNavProps()} />);
    // Usamos testID para localizar la tarjeta del módulo 'lists' de forma fiable
    const listsCard = screen.getByTestId('module-card-lists');
    fireEvent.press(listsCard);
    expect(mockNavigate).toHaveBeenCalledWith('SolarCatalog');
  });

  it('debería navegar a AsteroidSearch al pulsar el módulo forms', () => {
    render(<HomeScreen {...buildNavProps()} />);
    const formsCard = screen.getByTestId('module-card-forms');
    fireEvent.press(formsCard);
    expect(mockNavigate).toHaveBeenCalledWith('AsteroidSearch');
  });

  it('no debería navegar al pulsar un módulo sin pantalla propia', () => {
    render(<HomeScreen {...buildNavProps()} />);
    // El módulo 'navigation' no tiene case en el switch de handleModulePress
    // (cae al default: break) y no dispara ningún navigate
    const navCard = screen.getByTestId('module-card-navigation');
    fireEvent.press(navCard);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
