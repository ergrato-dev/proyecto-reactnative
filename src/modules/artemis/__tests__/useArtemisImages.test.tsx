/**
 * Tests del hook useArtemisImages.
 *
 * @what Verifica el estado de carga, datos mapeados, manejo de error
 *   y comportamiento con array vacío.
 * @why `useArtemisImages` alimenta la galería de `ArtemisGalleryScreen`;
 *   si los items no se mapean correctamente la UI renderiza datos erróneos.
 * @impact Cubre `hooks/useArtemisImages.ts`. Usa mock de `nasaClient`
 *   para aislar completamente de la red.
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useArtemisImages } from '../hooks/useArtemisImages';
import type { NasaImageItem } from '@/shared/lib/nasaClient';

// ─── Mock ────────────────────────────────────────────────────────────────────
jest.mock('@/shared/lib/nasaClient', () => ({
  fetchArtemisImages: jest.fn(),
  fetchApod: jest.fn(),
  fetchNeoWsFeed: jest.fn(),
  fetchSolarFlares: jest.fn(),
}));

import { fetchArtemisImages } from '@/shared/lib/nasaClient';
const mockFetchArtemisImages = fetchArtemisImages as jest.Mock;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Construye un NasaImageItem sintético para tests.
 */
function buildImageItem(nasaId: string, title: string): NasaImageItem {
  return {
    href: `https://images-assets.nasa.gov/image/${nasaId}/`,
    data: [
      {
        nasa_id: nasaId,
        title,
        description: `Descripción de ${title}`,
        date_created: '2024-01-15T00:00:00Z',
        center: 'JSC',
      },
    ],
    links: [{ href: `https://images-assets.nasa.gov/image/${nasaId}/thumb.jpg`, rel: 'preview' }],
  };
}

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: 0 } },
  });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('useArtemisImages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería iniciar en estado de carga con array vacío', () => {
    mockFetchArtemisImages.mockImplementation(() => new Promise(() => {}));
    const { result } = renderHook(() => useArtemisImages(), { wrapper });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.images).toEqual([]);
    expect(result.current.isError).toBe(false);
  });

  it('debería devolver la lista de imágenes tras respuesta exitosa', async () => {
    const mockItems = [
      buildImageItem('artemis-1-launch', 'Artemis I Launch'),
      buildImageItem('artemis-crew', 'Artemis Crew Training'),
    ];
    mockFetchArtemisImages.mockResolvedValue(mockItems);

    const { result } = renderHook(() => useArtemisImages(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.images).toHaveLength(2);
    expect(result.current.images[0].data[0].title).toBe('Artemis I Launch');
    expect(result.current.images[1].data[0].nasa_id).toBe('artemis-crew');
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('debería devolver array vacío si la API responde con lista vacía', async () => {
    mockFetchArtemisImages.mockResolvedValue([]);

    const { result } = renderHook(() => useArtemisImages(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.images).toEqual([]);
    expect(result.current.isError).toBe(false);
  });

  it('debería exponer isError y error con mensaje en caso de fallo de red', async () => {
    mockFetchArtemisImages.mockRejectedValue(
      new Error('Error al obtener imágenes de Artemis: 500 Internal Server Error'),
    );

    const { result } = renderHook(() => useArtemisImages(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(true);
    expect(result.current.error?.message).toContain('Error al obtener imágenes');
    expect(result.current.images).toEqual([]);
  });

  it('debería pasar el límite personalizado a fetchArtemisImages', async () => {
    mockFetchArtemisImages.mockResolvedValue([]);

    const { result } = renderHook(() => useArtemisImages(5), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockFetchArtemisImages).toHaveBeenCalledWith(5);
  });
});
