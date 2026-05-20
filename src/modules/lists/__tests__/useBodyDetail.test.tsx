/**
 * Tests del hook useBodyDetail.
 *
 * @what Verifica el estado de carga, los datos, el error y la condición `enabled`
 *   del hook que obtiene los detalles de un cuerpo celeste por ID.
 * @why `useBodyDetail` es el hook de datos de `BodyDetailScreen`; testear el
 *   parámetro `enabled` previene peticiones inválidas por ID vacío.
 * @impact Cubre `useBodyDetail` al 100%. Si `fetchBodyById` cambia su interfaz,
 *   estos tests fallarán primero.
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBodyDetail } from '../hooks/useBodyDetail';
import { fetchBodyById } from '@/shared/lib/solarSystemClient';
import type { SolarBody } from '@/shared/lib/solarSystemClient';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@/shared/lib/solarSystemClient');
const mockFetchBodyById = fetchBodyById as jest.MockedFunction<typeof fetchBodyById>;

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
  moons: [{ moon: 'La Lune', rel: 'https://api.le-systeme-solaire.net/rest/bodies/lune' }],
  discoveredBy: '',
  discoveryDate: '',
  aroundPlanet: null,
};

// ─── Helper: wrapper con QueryClientProvider ──────────────────────────────────

function createWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('useBodyDetail', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('debería devolver isLoading=true inicialmente cuando id es válido', () => {
    mockFetchBodyById.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useBodyDetail('terre'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('debería devolver los datos cuando fetchBodyById resuelve correctamente', async () => {
    mockFetchBodyById.mockResolvedValueOnce(MOCK_EARTH);

    const { result } = renderHook(() => useBodyDetail('terre'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(MOCK_EARTH);
    expect(result.current.isError).toBe(false);
    expect(mockFetchBodyById).toHaveBeenCalledWith('terre');
  });

  it('debería devolver isError=true cuando fetchBodyById lanza un error', async () => {
    const testError = new Error('Error al obtener los datos del cuerpo "invalido": 404');
    mockFetchBodyById.mockRejectedValueOnce(testError);

    const { result } = renderHook(() => useBodyDetail('invalido'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toEqual(testError);
  });

  it('NO debería llamar a fetchBodyById cuando el id está vacío', async () => {
    // enabled: id.length > 0 — query deshabilitada para id vacío
    const { result } = renderHook(() => useBodyDetail(''), {
      wrapper: createWrapper(),
    });

    // Con enabled=false la query nunca se ejecuta y queda en 'pending' sin fetch
    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockFetchBodyById).not.toHaveBeenCalled();
  });

  it('debería usar la query key ["solar-system", "body", id]', async () => {
    mockFetchBodyById.mockResolvedValueOnce(MOCK_EARTH);

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useBodyDetail('terre'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verifica que los datos están en caché con la query key correcta
    const cached = client.getQueryData(['solar-system', 'body', 'terre']);
    expect(cached).toEqual(MOCK_EARTH);
  });
});
