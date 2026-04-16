/**
 * Tests del hook useBodyList.
 *
 * @what Verifica el estado de carga, los datos y el error del hook que obtiene
 *   la lista de cuerpos del sistema solar via TanStack Query.
 * @why `useBodyList` es el punto de entrada de datos del catálogo solar;
 *   testear sus estados garantiza que `SolarCatalogScreen` reaccione correctamente.
 * @impact Cubre `useBodyList` al 100%. Si `fetchAllBodies` cambia su interfaz,
 *   estos tests fallarán primero.
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBodyList } from '../hooks/useBodyList';
import { fetchAllBodies } from '@/shared/lib/solarSystemClient';
import type { SolarBody } from '@/shared/lib/solarSystemClient';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@/shared/lib/solarSystemClient');
const mockFetchAllBodies = fetchAllBodies as jest.MockedFunction<typeof fetchAllBodies>;

// ─── Datos de prueba ──────────────────────────────────────────────────────────

const MOCK_BODIES: SolarBody[] = [
  {
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
  },
  {
    id: 'mars',
    name: 'Mars',
    englishName: 'Mars',
    isPlanet: true,
    bodyType: 'Planet',
    mass: { massValue: 6.417, massExponent: 23 },
    vol: null,
    density: 3.93,
    gravity: 3.72,
    meanRadius: 3389.5,
    equaRadius: 3396.2,
    polarRadius: 3376.2,
    sideralOrbit: 686.97,
    sideralRotation: 24.6229,
    axialTilt: 25.19,
    avgTemp: 210,
    moons: null,
    discoveredBy: '',
    discoveryDate: '',
    aroundPlanet: null,
  },
];

// ─── Helper: wrapper con QueryClientProvider ──────────────────────────────────

function createWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('useBodyList', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('debería devolver isLoading=true inicialmente', () => {
    // Fetch que nunca resuelve para observar el estado de carga
    mockFetchAllBodies.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useBodyList(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('debería devolver los datos cuando fetchAllBodies resuelve correctamente', async () => {
    mockFetchAllBodies.mockResolvedValueOnce(MOCK_BODIES);

    const { result } = renderHook(() => useBodyList(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(MOCK_BODIES);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(mockFetchAllBodies).toHaveBeenCalledTimes(1);
  });

  it('debería devolver isError=true cuando fetchAllBodies lanza un error', async () => {
    const testError = new Error('Error al obtener el catálogo del sistema solar: 500');
    mockFetchAllBodies.mockRejectedValueOnce(testError);

    const { result } = renderHook(() => useBodyList(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toEqual(testError);
  });

  it('debería usar la query key ["solar-system", "bodies"]', async () => {
    mockFetchAllBodies.mockResolvedValueOnce(MOCK_BODIES);

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useBodyList(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verifica que los datos están en caché con la query key correcta
    const cached = client.getQueryData(['solar-system', 'bodies']);
    expect(cached).toEqual(MOCK_BODIES);
  });
});
