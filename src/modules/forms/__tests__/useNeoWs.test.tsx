/**
 * Tests del hook `useNeoWs`.
 *
 * @what Verifica el estado de carga, éxito y error de la query NeoWs,
 *   la transformación a array plano y la deshabilitación con parámetros vacíos.
 * @why El hook aplana y ordena la respuesta de la API; si la lógica de
 *   transformación falla, la pantalla mostraría datos incorrectos o vacíos.
 * @impact Mockea `fetchNeoWsFeed` de `nasaClient`; cambios en la interfaz
 *   `NeoWsFeedResponse` o `FlatAsteroid` pueden romper estos tests.
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNeoWs } from '../hooks/useNeoWs';
import * as nasaClient from '@/shared/lib/nasaClient';
import type { NeoWsFeedResponse } from '@/shared/lib/nasaClient';

// ─── Mock del cliente NASA ────────────────────────────────────────────────────

jest.mock('@/shared/lib/nasaClient');
const mockFetchNeoWsFeed = nasaClient.fetchNeoWsFeed as jest.MockedFunction<
  typeof nasaClient.fetchNeoWsFeed
>;

// ─── Datos de prueba ──────────────────────────────────────────────────────────

/** Respuesta mínima válida de la API NeoWs con 2 asteroides en días distintos */
const MOCK_FEED: NeoWsFeedResponse = {
  element_count: 2,
  near_earth_objects: {
    '2026-04-01': [
      {
        id: 'ast-001',
        name: '(2026 AA)',
        nasa_jpl_url: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=ast-001',
        absolute_magnitude_h: 22.1,
        is_potentially_hazardous_asteroid: false,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.05,
            estimated_diameter_max: 0.11,
          },
        },
        close_approach_data: [
          {
            close_approach_date: '2026-04-01',
            relative_velocity: { kilometers_per_hour: '45000' },
            miss_distance: { kilometers: '1500000' },
          },
        ],
      },
    ],
    '2026-04-02': [
      {
        id: 'ast-002',
        name: '(2026 AB)',
        nasa_jpl_url: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=ast-002',
        absolute_magnitude_h: 19.8,
        is_potentially_hazardous_asteroid: true,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.2,
            estimated_diameter_max: 0.4,
          },
        },
        close_approach_data: [
          {
            close_approach_date: '2026-04-02',
            relative_velocity: { kilometers_per_hour: '65000' },
            miss_distance: { kilometers: '750000' },
          },
        ],
      },
    ],
  },
};

// ─── Wrapper con QueryClient ──────────────────────────────────────────────────

function createWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: 0 } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useNeoWs', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('debería estar en estado de carga inicialmente con parámetros válidos', async () => {
    mockFetchNeoWsFeed.mockResolvedValue(MOCK_FEED);
    const { result } = renderHook(() => useNeoWs('2026-04-01', '2026-04-07'), {
      wrapper: createWrapper(),
    });
    expect(result.current.isLoading).toBe(true);
  });

  it('debería devolver la lista aplanada y ordenada por fecha', async () => {
    mockFetchNeoWsFeed.mockResolvedValue(MOCK_FEED);
    const { result } = renderHook(() => useNeoWs('2026-04-01', '2026-04-07'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Deben haber 2 asteroides en total
    expect(result.current.data).toHaveLength(2);
    // Ordenados por fecha ascendente
    expect(result.current.data![0].approachDate).toBe('2026-04-01');
    expect(result.current.data![1].approachDate).toBe('2026-04-02');
  });

  it('debería incluir el campo approachDate en cada asteroide', async () => {
    mockFetchNeoWsFeed.mockResolvedValue(MOCK_FEED);
    const { result } = renderHook(() => useNeoWs('2026-04-01', '2026-04-07'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    result.current.data!.forEach((ast) => {
      expect(ast.approachDate).toBeDefined();
      expect(ast.approachDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it('debería entrar en estado de error cuando fetchNeoWsFeed lanza', async () => {
    mockFetchNeoWsFeed.mockRejectedValue(new Error('Error de red'));
    const { result } = renderHook(() => useNeoWs('2026-04-01', '2026-04-07'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });

  it('debería estar deshabilitado cuando startDate está vacío', () => {
    const { result } = renderHook(() => useNeoWs('', '2026-04-07'), {
      wrapper: createWrapper(),
    });
    // Con query deshabilitada, isLoading=false y data=undefined
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(mockFetchNeoWsFeed).not.toHaveBeenCalled();
  });

  it('debería estar deshabilitado cuando endDate está vacío', () => {
    const { result } = renderHook(() => useNeoWs('2026-04-01', ''), {
      wrapper: createWrapper(),
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(mockFetchNeoWsFeed).not.toHaveBeenCalled();
  });

  it('debería usar la query key correcta', async () => {
    mockFetchNeoWsFeed.mockResolvedValue(MOCK_FEED);
    const client = new QueryClient({ defaultOptions: { queries: { retry: 0 } } });
    const { result } = renderHook(() => useNeoWs('2026-04-01', '2026-04-07'), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const cache = client.getQueryCache().findAll();
    expect(cache[0].queryKey).toEqual(['nasa', 'neows', '2026-04-01', '2026-04-07']);
  });
});
