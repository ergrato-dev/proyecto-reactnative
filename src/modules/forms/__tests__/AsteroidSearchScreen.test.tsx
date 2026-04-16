/**
 * Tests de `AsteroidSearchScreen` y helpers de `AsteroidCard`.
 *
 * @what Verifica el estado inicial (sin búsqueda), estados de carga y error,
 *   renderizado de resultados con badge PHA, y el comportamiento del formulario
 *   (validación Zod a través de react-hook-form).
 * @why La pantalla coordina formulario + query; testear los estados garantiza
 *   que el usuario ve la UI correcta en cada fase de la interacción.
 * @impact Mockea `useNeoWs`; cambios en la interfaz del hook requieren
 *   actualizar los mocks de este archivo.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { AsteroidSearchScreen } from '../screens/AsteroidSearchScreen';
import { useNeoWs } from '../hooks/useNeoWs';
import { formatVelocity, formatDistance } from '../components/AsteroidCard';
import type { FlatAsteroid } from '../hooks/useNeoWs';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../hooks/useNeoWs');
const mockUseNeoWs = useNeoWs as jest.MockedFunction<typeof useNeoWs>;

// ─── Datos de prueba ──────────────────────────────────────────────────────────

const MOCK_ASTEROID_SAFE: FlatAsteroid = {
  id: 'ast-001',
  name: '(2026 AA)',
  nasa_jpl_url: 'https://ssd.jpl.nasa.gov',
  absolute_magnitude_h: 22.1,
  is_potentially_hazardous_asteroid: false,
  approachDate: '2026-04-01',
  estimated_diameter: {
    kilometers: { estimated_diameter_min: 0.05, estimated_diameter_max: 0.11 },
  },
  close_approach_data: [
    {
      close_approach_date: '2026-04-01',
      relative_velocity: { kilometers_per_hour: '45000' },
      miss_distance: { kilometers: '1500000' },
    },
  ],
};

const MOCK_ASTEROID_PHA: FlatAsteroid = {
  ...MOCK_ASTEROID_SAFE,
  id: 'ast-pha',
  name: '(2026 PHA)',
  is_potentially_hazardous_asteroid: true,
};

// ─── Suite principal ──────────────────────────────────────────────────────────

describe('AsteroidSearchScreen', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  // ── Estado sin búsqueda ────────────────────────────────────────────────────

  it('debería mostrar el estado vacío inicial antes de cualquier búsqueda', () => {
    // Sin búsqueda: useNeoWs deshabilitado → isLoading=false, data=undefined
    mockUseNeoWs.mockReturnValue({
      isLoading: false,
      isError: false,
      isFetching: false,
      data: undefined,
      error: null,
    } as unknown as ReturnType<typeof useNeoWs>);

    render(<AsteroidSearchScreen />);

    expect(screen.getByTestId('empty-state')).toBeTruthy();
    // El empty-state contiene texto descriptivo para el usuario
    expect(screen.getByText(/pulsa "Buscar"/)).toBeTruthy();
  });

  it('debería renderizar el formulario con los campos de fecha', () => {
    mockUseNeoWs.mockReturnValue({
      isLoading: false,
      isError: false,
      isFetching: false,
      data: undefined,
      error: null,
    } as unknown as ReturnType<typeof useNeoWs>);

    render(<AsteroidSearchScreen />);

    expect(screen.getByTestId('input-start-date')).toBeTruthy();
    expect(screen.getByTestId('input-end-date')).toBeTruthy();
    expect(screen.getByTestId('submit-button')).toBeTruthy();
  });

  // ── Estado de carga ────────────────────────────────────────────────────────

  it('debería mostrar el indicador de carga cuando isLoading es true', async () => {
    mockUseNeoWs.mockReturnValue({
      isLoading: true,
      isError: false,
      isFetching: true,
      data: undefined,
      error: null,
    } as unknown as ReturnType<typeof useNeoWs>);

    render(<AsteroidSearchScreen />);

    // Pulsar submit — react-hook-form valida async → esperar el re-render
    fireEvent.press(screen.getByTestId('submit-button'));
    await waitFor(() =>
      expect(screen.getByTestId('loading-view')).toBeTruthy()
    );
    expect(screen.getByText('Consultando NASA NeoWs…')).toBeTruthy();
  });

  // ── Estado de error ────────────────────────────────────────────────────────

  it('debería mostrar el mensaje de error cuando isError es true', async () => {
    mockUseNeoWs.mockReturnValue({
      isLoading: false,
      isError: true,
      isFetching: false,
      data: undefined,
      error: new Error('500'),
    } as unknown as ReturnType<typeof useNeoWs>);

    render(<AsteroidSearchScreen />);
    fireEvent.press(screen.getByTestId('submit-button'));

    await waitFor(() =>
      expect(screen.getByTestId('error-view')).toBeTruthy()
    );
    expect(screen.getByText('Error al cargar asteroides')).toBeTruthy();
  });

  // ── Resultados ─────────────────────────────────────────────────────────────

  it('debería mostrar los resultados con el contador correcto', async () => {
    mockUseNeoWs.mockReturnValue({
      isLoading: false,
      isError: false,
      isFetching: false,
      data: [MOCK_ASTEROID_SAFE, MOCK_ASTEROID_PHA],
      error: null,
    } as unknown as ReturnType<typeof useNeoWs>);

    render(<AsteroidSearchScreen />);
    fireEvent.press(screen.getByTestId('submit-button'));

    await waitFor(() =>
      expect(screen.getByTestId('result-count')).toBeTruthy()
    );
    expect(screen.getByText('2 asteroides encontrados')).toBeTruthy();
    expect(screen.getByTestId('asteroid-list')).toBeTruthy();
  });

  it('debería mostrar el badge PHA solo en asteroides potencialmente peligrosos', async () => {
    mockUseNeoWs.mockReturnValue({
      isLoading: false,
      isError: false,
      isFetching: false,
      data: [MOCK_ASTEROID_SAFE, MOCK_ASTEROID_PHA],
      error: null,
    } as unknown as ReturnType<typeof useNeoWs>);

    render(<AsteroidSearchScreen />);
    fireEvent.press(screen.getByTestId('submit-button'));

    // Solo debe haber 1 badge PHA (solo el segundo asteroide)
    await waitFor(() => {
      const phaBadges = screen.getAllByTestId('pha-badge');
      expect(phaBadges).toHaveLength(1);
    });
  });

  it('debería mostrar el mensaje "Sin resultados" cuando data está vacío', async () => {
    mockUseNeoWs.mockReturnValue({
      isLoading: false,
      isError: false,
      isFetching: false,
      data: [],
      error: null,
    } as unknown as ReturnType<typeof useNeoWs>);

    render(<AsteroidSearchScreen />);
    fireEvent.press(screen.getByTestId('submit-button'));

    await waitFor(() =>
      expect(screen.getByText('Sin resultados para este rango')).toBeTruthy()
    );
  });

  // ── Validación del formulario ──────────────────────────────────────────────

  it('debería mostrar error de validación cuando la fecha de inicio tiene formato incorrecto', async () => {
    mockUseNeoWs.mockReturnValue({
      isLoading: false,
      isError: false,
      isFetching: false,
      data: undefined,
      error: null,
    } as unknown as ReturnType<typeof useNeoWs>);

    render(<AsteroidSearchScreen />);

    fireEvent.changeText(screen.getByTestId('input-start-date'), '01/04/2026');
    fireEvent.press(screen.getByTestId('submit-button'));

    // Zod rechaza el formato incorrecto → error visible
    expect(await screen.findByTestId('error-start-date')).toBeTruthy();
  });
});

// ─── Tests de helpers de AsteroidCard ────────────────────────────────────────

describe('formatVelocity', () => {
  it('debería formatear 45000 km/h con separador de miles', () => {
    expect(formatVelocity('45000')).toBe('45.000 km/h');
  });

  it('debería redondear decimales', () => {
    expect(formatVelocity('45000.9')).toBe('45.001 km/h');
  });
});

describe('formatDistance', () => {
  it('debería formatear 1500000 km con separadores de miles', () => {
    expect(formatDistance('1500000')).toBe('1.500.000 km');
  });

  it('debería redondear distancias con decimales', () => {
    expect(formatDistance('750000.4')).toBe('750.000 km');
  });
});
