/**
 * Tests de SolarCatalogScreen.
 *
 * @what Verifica los estados de carga, error y datos de la pantalla de catálogo
 *   solar: FlatList, SectionList, navegación al detalle y toggle de modo.
 * @why `SolarCatalogScreen` es la pantalla principal del módulo `lists/`;
 *   testear sus tres estados y ambos modos de lista garantiza que el usuario
 *   siempre tenga feedback visual correcto.
 * @impact Cubre `SolarCatalogScreen`, `BodyCard`, `buildSections` y
 *   `normalizeBodyType`. Si `useBodyList` cambia su interfaz, estos tests fallarán.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { SolarCatalogScreen } from '../screens/SolarCatalogScreen';
import { normalizeBodyType, buildSections } from '../screens/SolarCatalogScreen';
import { useBodyList } from '../hooks/useBodyList';
import type { SolarBody } from '@/shared/lib/solarSystemClient';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../hooks/useBodyList');
const mockUseBodyList = useBodyList as jest.MockedFunction<typeof useBodyList>;

// ─── Datos de prueba ──────────────────────────────────────────────────────────

const MOCK_PLANET: SolarBody = {
  id: 'terre',
  name: 'La Terre',
  englishName: 'Earth',
  isPlanet: true,
  bodyType: 'Planet',
  mass: { massValue: 5.972, massExponent: 24 },
  vol: null,
  density: 5.514,
  gravity: 9.8,
  meanRadius: 6371.0,
  equaRadius: 6378.1,
  polarRadius: 6356.8,
  sideralOrbit: 365.25,
  sideralRotation: 23.9345,
  axialTilt: 23.44,
  avgTemp: 288,
  moons: [{ moon: 'La Lune', rel: '' }],
  discoveredBy: '',
  discoveryDate: '',
  aroundPlanet: null,
};

const MOCK_MOON: SolarBody = {
  id: 'lune',
  name: 'La Lune',
  englishName: 'Moon',
  isPlanet: false,
  bodyType: 'Moon',
  mass: null,
  vol: null,
  density: 3.34,
  gravity: 1.62,
  meanRadius: 1737.4,
  equaRadius: null,
  polarRadius: null,
  sideralOrbit: 27.32,
  sideralRotation: 655.72,
  axialTilt: null,
  avgTemp: null,
  moons: null,
  discoveredBy: '',
  discoveryDate: '',
  aroundPlanet: { planet: 'terre', rel: '' },
};

const MOCK_ASTEROID: SolarBody = {
  id: 'ceres',
  name: 'Ceres',
  englishName: 'Ceres',
  isPlanet: false,
  bodyType: 'Asteroid',
  mass: null,
  vol: null,
  density: 2.16,
  gravity: 0.27,
  meanRadius: 476.2,
  equaRadius: null,
  polarRadius: null,
  sideralOrbit: 1680.5,
  sideralRotation: 9.07,
  axialTilt: null,
  avgTemp: null,
  moons: null,
  discoveredBy: 'G. Piazzi',
  discoveryDate: '1801-01-01',
  aroundPlanet: null,
};

const MOCK_BODIES = [MOCK_PLANET, MOCK_MOON, MOCK_ASTEROID];

/** Props mínimas de navegación para SolarCatalogScreen */
function buildNavProps(navigateMock = jest.fn()) {
  return {
    navigation: { navigate: navigateMock } as unknown as Parameters<
      typeof SolarCatalogScreen
    >[0]['navigation'],
    route: {} as Parameters<typeof SolarCatalogScreen>[0]['route'],
  };
}

// ─── Suite principal ──────────────────────────────────────────────────────────

describe('SolarCatalogScreen', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  // ── Estado de carga ────────────────────────────────────────────────────────

  it('debería mostrar el indicador de carga cuando isLoading es true', () => {
    mockUseBodyList.mockReturnValue({
      isLoading: true,
      isError: false,
      isFetching: false,
      data: undefined,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useBodyList>);

    render(<SolarCatalogScreen {...buildNavProps()} />);

    expect(screen.getByTestId('loading-view')).toBeTruthy();
    expect(screen.getByText('Cargando catálogo...')).toBeTruthy();
  });

  // ── Estado de error ────────────────────────────────────────────────────────

  it('debería mostrar el mensaje de error y el botón de reintento cuando isError es true', () => {
    const refetch = jest.fn();
    mockUseBodyList.mockReturnValue({
      isLoading: false,
      isError: true,
      isFetching: false,
      data: undefined,
      error: new Error('fallo de red'),
      refetch,
    } as unknown as ReturnType<typeof useBodyList>);

    render(<SolarCatalogScreen {...buildNavProps()} />);

    expect(screen.getByTestId('error-view')).toBeTruthy();
    expect(screen.getByText('No se pudo cargar el catálogo solar.')).toBeTruthy();

    // Pulsar "Reintentar" debe llamar a refetch
    fireEvent.press(screen.getByTestId('retry-button'));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  // ── Estado con datos — modo SectionList (por defecto) ─────────────────────

  it('debería mostrar el SectionList con secciones por tipo en el modo por defecto', () => {
    mockUseBodyList.mockReturnValue({
      isLoading: false,
      isError: false,
      isFetching: false,
      data: MOCK_BODIES,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useBodyList>);

    render(<SolarCatalogScreen {...buildNavProps()} />);

    // SectionList es el modo por defecto
    expect(screen.getByTestId('section-list')).toBeTruthy();
    // La sección de planetas debe aparecer
    expect(screen.getByText('Planeta (1)')).toBeTruthy();
    // Los cuerpos deben aparecer por testID para evitar colisión con el badge de tipo
    expect(screen.getByTestId('body-card-terre')).toBeTruthy();
    expect(screen.getByTestId('body-card-lune')).toBeTruthy();
    expect(screen.getByTestId('body-card-ceres')).toBeTruthy();
  });

  // ── Toggle a modo plano ───────────────────────────────────────────────────

  it('debería mostrar la FlatList al pulsar el toggle "Lista plana"', () => {
    mockUseBodyList.mockReturnValue({
      isLoading: false,
      isError: false,
      isFetching: false,
      data: MOCK_BODIES,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useBodyList>);

    render(<SolarCatalogScreen {...buildNavProps()} />);

    fireEvent.press(screen.getByTestId('toggle-flat'));

    expect(screen.getByTestId('flat-list')).toBeTruthy();
    // Los mismos cuerpos deben seguir visibles
    expect(screen.getByText('Earth')).toBeTruthy();
  });

  // ── Navegación al detalle ─────────────────────────────────────────────────

  it('debería navegar a BodyDetail al pulsar una tarjeta de cuerpo celeste', () => {
    const navigate = jest.fn();
    mockUseBodyList.mockReturnValue({
      isLoading: false,
      isError: false,
      isFetching: false,
      data: [MOCK_PLANET],
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useBodyList>);

    render(<SolarCatalogScreen {...buildNavProps(navigate)} />);

    fireEvent.press(screen.getByTestId('body-card-terre'));

    expect(navigate).toHaveBeenCalledWith('BodyDetail', {
      bodyId: 'terre',
      bodyName: 'Earth',
    });
  });

  // ── Banner de actualización en segundo plano ──────────────────────────────

  it('debería mostrar el banner de actualización cuando isFetching es true con datos', () => {
    mockUseBodyList.mockReturnValue({
      isLoading: false,
      isError: false,
      isFetching: true,
      data: MOCK_BODIES,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useBodyList>);

    render(<SolarCatalogScreen {...buildNavProps()} />);

    expect(screen.getByTestId('refresh-banner')).toBeTruthy();
    expect(screen.getByText('Actualizando catálogo...')).toBeTruthy();
  });
});

// ─── Tests de funciones helper ────────────────────────────────────────────────

describe('normalizeBodyType', () => {
  it('debería clasificar un planeta (isPlanet=true) como "Planeta"', () => {
    expect(normalizeBodyType(MOCK_PLANET)).toBe('Planeta');
  });

  it('debería clasificar un Moon como "Satélite"', () => {
    expect(normalizeBodyType(MOCK_MOON)).toBe('Satélite');
  });

  it('debería clasificar un Asteroid como "Asteroide"', () => {
    expect(normalizeBodyType(MOCK_ASTEROID)).toBe('Asteroide');
  });

  it('debería clasificar un Comet como "Cometa"', () => {
    const comet = { ...MOCK_ASTEROID, isPlanet: false, bodyType: 'Comet', id: 'halley' };
    expect(normalizeBodyType(comet)).toBe('Cometa');
  });

  it('debería clasificar un Dwarf Planet como "Planeta enano"', () => {
    const dwarf = { ...MOCK_ASTEROID, isPlanet: false, bodyType: 'Dwarf Planet', id: 'pluto' };
    expect(normalizeBodyType(dwarf)).toBe('Planeta enano');
  });

  it('debería clasificar un tipo desconocido como "Otro"', () => {
    const unknown = { ...MOCK_ASTEROID, isPlanet: false, bodyType: 'Unknown', id: 'x' };
    expect(normalizeBodyType(unknown)).toBe('Otro');
  });
});

describe('buildSections', () => {
  it('debería agrupar cuerpos en las secciones correctas', () => {
    const sections = buildSections(MOCK_BODIES);

    const planetSection = sections.find((s) => s.title.startsWith('Planeta ('));
    const moonSection = sections.find((s) => s.title.startsWith('Satélite ('));
    const asteroidSection = sections.find((s) => s.title.startsWith('Asteroide ('));

    expect(planetSection?.data).toHaveLength(1);
    expect(moonSection?.data).toHaveLength(1);
    expect(asteroidSection?.data).toHaveLength(1);
  });

  it('debería omitir secciones vacías', () => {
    // Solo planetas — no debe aparecer sección Cometa ni Satélite
    const sections = buildSections([MOCK_PLANET]);
    expect(sections).toHaveLength(1);
    expect(sections[0].title).toMatch(/^Planeta/);
  });
});
