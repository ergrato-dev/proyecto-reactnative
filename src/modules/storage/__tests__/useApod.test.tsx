/**
 * Tests del hook `useApod` y las utilidades de caché APOD.
 *
 * @what Verifica la carga de la APOD mediante TanStack Query, la persistencia en
 *   AsyncStorage y las funciones auxiliares `persistApod`, `readPersistedApod`,
 *   `listApodCacheKeys` y `clearApodCache`.
 * @why `useApod` es el núcleo del módulo `storage/`; si la integración con
 *   TanStack Query o AsyncStorage falla, la caché offline no funciona.
 * @impact Cubre `useApod.ts`. Cambios en `ApodResponse` o en la clave de
 *   almacenamiento requieren actualizar estos tests.
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
  multiRemove: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('@/shared/lib/nasaClient', () => ({
  fetchApod: jest.fn(),
}));

import { fetchApod } from '@/shared/lib/nasaClient';
import {
  useApod,
  persistApod,
  readPersistedApod,
  listApodCacheKeys,
  clearApodCache,
} from '../hooks/useApod';
import type { ApodResponse } from '@/shared/lib/nasaClient';

// ─── Fixtures ────────────────────────────────────────────────────────────────

/** APOD de imagen de ejemplo para los tests */
const MOCK_APOD_IMAGE: ApodResponse = {
  date: '2025-01-01',
  title: 'Nebulosa de prueba',
  explanation: 'Descripción de la nebulosa',
  media_type: 'image',
  url: 'https://apod.nasa.gov/apod/image/test.jpg',
  hdurl: 'https://apod.nasa.gov/apod/image/test_hd.jpg',
  service_version: 'v1',
};

/** APOD de vídeo de ejemplo */
const MOCK_APOD_VIDEO: ApodResponse = {
  date: '2025-01-02',
  title: 'Vídeo del universo',
  explanation: 'Descripción del vídeo',
  media_type: 'video',
  url: 'https://youtube.com/watch?v=abc123',
  service_version: 'v1',
};

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Crea un `QueryClientProvider` con una instancia nueva de `QueryClient` para aislar tests.
 *
 * @what Envuelve el `children` en un `QueryClientProvider` con `retry: 0`.
 * @why Cada test necesita su propio cliente para evitar contaminación de caché
 *   entre tests.
 * @impact Obligatorio para todos los tests que usen hooks de TanStack Query.
 *
 * @param children - Nodo React a envolver
 * @returns Componente envolvente con QueryClient limpio
 */
function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: 0 } } });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'TestQueryWrapper';
  return Wrapper;
}

// ─── Suites ───────────────────────────────────────────────────────────────────

describe('useApod', () => {
  const mockFetchApod = fetchApod as jest.MockedFunction<typeof fetchApod>;
  const mockSetItem = AsyncStorage.setItem as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchApod.mockResolvedValue(MOCK_APOD_IMAGE);
    mockSetItem.mockResolvedValue(undefined);
  });

  it('debería estar en estado de carga inicialmente', () => {
    const { result } = renderHook(() => useApod(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
  });

  it('debería devolver los datos tras una carga exitosa', async () => {
    const { result } = renderHook(() => useApod(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual(MOCK_APOD_IMAGE);
    expect(result.current.isError).toBe(false);
  });

  it('debería llamar a fetchApod sin argumento cuando no se pasa fecha', async () => {
    const { result } = renderHook(() => useApod(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockFetchApod).toHaveBeenCalledWith(undefined);
  });

  it('debería llamar a fetchApod con la fecha cuando se proporciona', async () => {
    const { result } = renderHook(() => useApod('2025-01-01'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockFetchApod).toHaveBeenCalledWith('2025-01-01');
  });

  it('debería persistir los datos en AsyncStorage tras la carga', async () => {
    const { result } = renderHook(() => useApod('2025-01-01'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockSetItem).toHaveBeenCalledWith(
      'apod:2025-01-01',
      JSON.stringify(MOCK_APOD_IMAGE),
    );
  });

  it('debería establecer isError en true cuando fetchApod rechaza', async () => {
    mockFetchApod.mockRejectedValue(new Error('Red no disponible'));
    const { result } = renderHook(() => useApod(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isError).toBe(true);
    expect(result.current.data).toBeUndefined();
  });
});

describe('persistApod y readPersistedApod', () => {
  const mockSetItem = AsyncStorage.setItem as jest.Mock;
  const mockGetItem = AsyncStorage.getItem as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería escribir la APOD serializada en AsyncStorage', async () => {
    mockSetItem.mockResolvedValue(undefined);
    await persistApod('2025-01-01', MOCK_APOD_IMAGE);
    expect(mockSetItem).toHaveBeenCalledWith(
      'apod:2025-01-01',
      JSON.stringify(MOCK_APOD_IMAGE),
    );
  });

  it('debería silenciar errores de escritura sin lanzar', async () => {
    mockSetItem.mockRejectedValue(new Error('Disco lleno'));
    await expect(persistApod('2025-01-01', MOCK_APOD_IMAGE)).resolves.toBeUndefined();
  });

  it('debería devolver la APOD almacenada cuando existe', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify(MOCK_APOD_IMAGE));
    const result = await readPersistedApod('2025-01-01');
    expect(result).toEqual(MOCK_APOD_IMAGE);
  });

  it('debería devolver null cuando la clave no existe', async () => {
    mockGetItem.mockResolvedValue(null);
    const result = await readPersistedApod('2025-01-01');
    expect(result).toBeNull();
  });

  it('debería devolver null cuando falla la lectura', async () => {
    mockGetItem.mockRejectedValue(new Error('Error de lectura'));
    const result = await readPersistedApod('2025-01-01');
    expect(result).toBeNull();
  });
});

describe('listApodCacheKeys y clearApodCache', () => {
  const mockGetAllKeys = AsyncStorage.getAllKeys as jest.Mock;
  const mockRemoveMany = AsyncStorage.multiRemove as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería devolver solo las claves con prefijo apod:', async () => {
    mockGetAllKeys.mockResolvedValue([
      'apod:2025-01-01',
      'apod:2025-01-02',
      'favorites:planets',
    ]);
    const keys = await listApodCacheKeys();
    expect(keys).toEqual(['apod:2025-01-01', 'apod:2025-01-02']);
  });

  it('debería devolver array vacío si no hay claves APOD', async () => {
    mockGetAllKeys.mockResolvedValue(['favorites:planets']);
    const keys = await listApodCacheKeys();
    expect(keys).toEqual([]);
  });

  it('debería devolver array vacío si getAllKeys falla', async () => {
    mockGetAllKeys.mockRejectedValue(new Error('Error'));
    const keys = await listApodCacheKeys();
    expect(keys).toEqual([]);
  });

  it('debería llamar a multiRemove con las claves APOD al limpiar', async () => {
    mockGetAllKeys.mockResolvedValue(['apod:2025-01-01', 'apod:2025-01-02']);
    mockRemoveMany.mockResolvedValue(undefined);
    await clearApodCache();
    expect(mockRemoveMany).toHaveBeenCalledWith(['apod:2025-01-01', 'apod:2025-01-02']);
  });

  it('debería no llamar a multiRemove si no hay claves APOD', async () => {
    mockGetAllKeys.mockResolvedValue(['favorites:planets']);
    await clearApodCache();
    expect(mockRemoveMany).not.toHaveBeenCalled();
  });

  it('debería silenciar errores de borrado — vídeo de ejemplo incluido', async () => {
    // El fixture de vídeo se puede usar también en tests de caché
    await persistApod('2025-01-02', MOCK_APOD_VIDEO);
    mockGetAllKeys.mockRejectedValue(new Error('Error de borrado'));
    await expect(clearApodCache()).resolves.toBeUndefined();
  });
});
