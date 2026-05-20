/**
 * Tests de BodyDetailScreen.
 *
 * @what Verifica los estados de carga, error y datos de la pantalla de detalle
 *   de un cuerpo celeste: todos los campos físicos, orbitales y de descubrimiento.
 * @why `BodyDetailScreen` implementa RF-LIST-04; testear que todos los campos
 *   se renderizan garantiza que el usuario vea la información científica completa.
 * @impact Cubre `BodyDetailScreen`, `formatMass` y `kelvinToCelsius`.
 *   Si `SolarBody` agrega campos nuevos, estos tests deben actualizarse.
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { BodyDetailScreen } from '../screens/BodyDetailScreen';
import { formatMass, kelvinToCelsius } from '../screens/BodyDetailScreen';
import { useBodyDetail } from '../hooks/useBodyDetail';
import type { SolarBody } from '@/shared/lib/solarSystemClient';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../hooks/useBodyDetail');
const mockUseBodyDetail = useBodyDetail as jest.MockedFunction<typeof useBodyDetail>;

// ─── Datos de prueba ──────────────────────────────────────────────────────────

const MOCK_EARTH: SolarBody = {
  id: 'terre',
  name: 'La Terre',
  englishName: 'Earth',
  isPlanet: true,
  bodyType: 'Planet',
  mass: { massValue: 5.972, massExponent: 24 },
  vol: { volValue: 1.0832, volExponent: 12 },
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
  discoveredBy: 'Antiquity',
  discoveryDate: '1543-01-01',
  aroundPlanet: null,
};

/** Props mínimas de navegación para BodyDetailScreen */
function buildNavProps(bodyId = 'terre', bodyName = 'Earth') {
  return {
    navigation: {} as never,
    route: { params: { bodyId, bodyName } } as unknown as Parameters<
      typeof BodyDetailScreen
    >[0]['route'],
  };
}

// ─── Suite principal ──────────────────────────────────────────────────────────

describe('BodyDetailScreen', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  // ── Estado de carga ────────────────────────────────────────────────────────

  it('debería mostrar el indicador de carga cuando isLoading es true', () => {
    mockUseBodyDetail.mockReturnValue({
      isLoading: true,
      isError: false,
      isFetching: true,
      data: undefined,
      error: null,
    } as unknown as ReturnType<typeof useBodyDetail>);

    render(<BodyDetailScreen {...buildNavProps()} />);

    expect(screen.getByTestId('loading-view')).toBeTruthy();
    expect(screen.getByText('Cargando datos...')).toBeTruthy();
  });

  // ── Estado de error ────────────────────────────────────────────────────────

  it('debería mostrar el mensaje de error con el nombre del cuerpo', () => {
    mockUseBodyDetail.mockReturnValue({
      isLoading: false,
      isError: true,
      isFetching: false,
      data: undefined,
      error: new Error('404'),
    } as unknown as ReturnType<typeof useBodyDetail>);

    render(<BodyDetailScreen {...buildNavProps('terre', 'Earth')} />);

    expect(screen.getByTestId('error-view')).toBeTruthy();
    expect(screen.getByText('No se pudo cargar la información de Earth.')).toBeTruthy();
  });

  // ── Estado con datos — campos principales ─────────────────────────────────

  it('debería mostrar el nombre en inglés y el tipo del cuerpo', () => {
    mockUseBodyDetail.mockReturnValue({
      isLoading: false,
      isError: false,
      isFetching: false,
      data: MOCK_EARTH,
      error: null,
    } as unknown as ReturnType<typeof useBodyDetail>);

    render(<BodyDetailScreen {...buildNavProps()} />);

    expect(screen.getByTestId('body-name')).toBeTruthy();
    expect(screen.getByText('Earth')).toBeTruthy();
    expect(screen.getByTestId('body-type')).toBeTruthy();
    expect(screen.getByText('Planet')).toBeTruthy();
  });

  it('debería mostrar los datos físicos de la Tierra', () => {
    mockUseBodyDetail.mockReturnValue({
      isLoading: false,
      isError: false,
      isFetching: false,
      data: MOCK_EARTH,
      error: null,
    } as unknown as ReturnType<typeof useBodyDetail>);

    render(<BodyDetailScreen {...buildNavProps()} />);

    // Masa
    expect(screen.getByTestId('body-mass')).toBeTruthy();
    expect(screen.getByText('5.972 × 10^24 kg')).toBeTruthy();

    // Volumen
    expect(screen.getByTestId('body-volume')).toBeTruthy();

    // Gravedad
    expect(screen.getByTestId('body-gravity')).toBeTruthy();
    expect(screen.getByText('9.8 m/s²')).toBeTruthy();

    // Temperatura en Celsius
    expect(screen.getByTestId('body-temp')).toBeTruthy();
  });

  it('debería mostrar los datos orbitales', () => {
    mockUseBodyDetail.mockReturnValue({
      isLoading: false,
      isError: false,
      isFetching: false,
      data: MOCK_EARTH,
      error: null,
    } as unknown as ReturnType<typeof useBodyDetail>);

    render(<BodyDetailScreen {...buildNavProps()} />);

    expect(screen.getByTestId('body-orbital')).toBeTruthy();
    expect(screen.getByText('365.25 días')).toBeTruthy();

    expect(screen.getByTestId('body-rotation')).toBeTruthy();
    expect(screen.getByTestId('body-axial')).toBeTruthy();
  });

  it('debería mostrar el número de lunas cuando el cuerpo tiene satélites', () => {
    mockUseBodyDetail.mockReturnValue({
      isLoading: false,
      isError: false,
      isFetching: false,
      data: MOCK_EARTH,
      error: null,
    } as unknown as ReturnType<typeof useBodyDetail>);

    render(<BodyDetailScreen {...buildNavProps()} />);

    expect(screen.getByTestId('body-moons-count')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByTestId('body-moons-list')).toBeTruthy();
    expect(screen.getByText('La Lune')).toBeTruthy();
  });

  it('debería mostrar los datos de descubrimiento', () => {
    mockUseBodyDetail.mockReturnValue({
      isLoading: false,
      isError: false,
      isFetching: false,
      data: MOCK_EARTH,
      error: null,
    } as unknown as ReturnType<typeof useBodyDetail>);

    render(<BodyDetailScreen {...buildNavProps()} />);

    expect(screen.getByTestId('body-discovered-by')).toBeTruthy();
    expect(screen.getByText('Antiquity')).toBeTruthy();
    expect(screen.getByTestId('body-discovery-date')).toBeTruthy();
    expect(screen.getByText('1543-01-01')).toBeTruthy();
  });

  it('debería mostrar el nombre alternativo cuando englishName difiere de name', () => {
    mockUseBodyDetail.mockReturnValue({
      isLoading: false,
      isError: false,
      isFetching: false,
      data: MOCK_EARTH, // englishName='Earth', name='La Terre'
      error: null,
    } as unknown as ReturnType<typeof useBodyDetail>);

    render(<BodyDetailScreen {...buildNavProps()} />);

    expect(screen.getByTestId('body-alt-name')).toBeTruthy();
    expect(screen.getByText('La Terre')).toBeTruthy();
  });

  it('debería mostrar el banner de actualización cuando isFetching es true con datos', () => {
    mockUseBodyDetail.mockReturnValue({
      isLoading: false,
      isError: false,
      isFetching: true,
      data: MOCK_EARTH,
      error: null,
    } as unknown as ReturnType<typeof useBodyDetail>);

    render(<BodyDetailScreen {...buildNavProps()} />);

    expect(screen.getByTestId('refresh-banner')).toBeTruthy();
  });
});

// ─── Tests de funciones helper ────────────────────────────────────────────────

describe('formatMass', () => {
  it('debería formatear la masa correctamente', () => {
    expect(formatMass(5.972, 24)).toBe('5.972 × 10^24 kg');
    expect(formatMass(1.899, 27)).toBe('1.899 × 10^27 kg');
  });
});

describe('kelvinToCelsius', () => {
  it('debería convertir 288 K a 14.9 °C', () => {
    expect(kelvinToCelsius(288)).toBe('14.9 °C (288 K)');
  });

  it('debería convertir 0 K a aprox. -273.1 °C (cero absoluto)', () => {
    // toFixed(1) en V8/JSC aplica round-half-to-even para -273.15 → -273.1
    expect(kelvinToCelsius(0)).toBe('-273.1 °C (0 K)');
  });
});
