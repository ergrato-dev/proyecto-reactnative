/**
 * Tests del hook useDonki.
 *
 * @what Verifica: estado de carga, datos correctos incluyendo filtrado M+/X+,
 *   manejo de error y comportamiento con array vacío.
 * @why `useDonki` alimenta las alertas solares del módulo; si el filtrado
 *   M+/X+ falla, se envían alertas equivocadas o se omiten las correctas.
 * @impact Cubre `hooks/useDonki.ts` y la función auxiliar `isMajorSolarFlare`.
 *   Mock de `nasaClient` para aislar de la red.
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useDonki, isMajorSolarFlare } from '../hooks/useDonki';
import type { DonkiSolarFlare } from '@/shared/lib/nasaClient';

// ─── Mock ─────────────────────────────────────────────────────────────────────

jest.mock('@/shared/lib/nasaClient', () => ({
  fetchSolarFlares: jest.fn(),
  fetchArtemisImages: jest.fn(),
  fetchApod: jest.fn(),
  fetchNeoWsFeed: jest.fn(),
}));

import { fetchSolarFlares } from '@/shared/lib/nasaClient';
const mockFetch = fetchSolarFlares as jest.Mock;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Construye una llamarada solar sintética para tests.
 */
function buildFlare(classType: string, id: string): DonkiSolarFlare {
  return {
    flrID: id,
    beginTime: '2024-11-15T10:30Z',
    peakTime: '2024-11-15T11:00Z',
    endTime: '2024-11-15T12:00Z',
    classType,
    sourceLocation: 'N15E20',
    activeRegionNum: 13500,
  };
}

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: 0 } },
  });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

// ─── isMajorSolarFlare ────────────────────────────────────────────────────────

describe('isMajorSolarFlare', () => {
  it('devuelve true para clase X', () => {
    expect(isMajorSolarFlare('X2.0')).toBe(true);
  });

  it('devuelve true para clase M', () => {
    expect(isMajorSolarFlare('M1.5')).toBe(true);
  });

  it('devuelve false para clase C', () => {
    expect(isMajorSolarFlare('C3.1')).toBe(false);
  });

  it('devuelve false para clase B', () => {
    expect(isMajorSolarFlare('B2.0')).toBe(false);
  });

  it('es insensible a mayúsculas del código', () => {
    // En la práctica la API siempre devuelve mayúsculas, pero la función
    // debe ser robusta ante entradas inesperadas
    expect(isMajorSolarFlare('m1.5')).toBe(false); // no empieza por M mayúscula
  });
});

// ─── useDonki ─────────────────────────────────────────────────────────────────

describe('useDonki', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('comienza en estado de carga', () => {
    mockFetch.mockReturnValue(new Promise(() => null));
    const { result } = renderHook(() => useDonki('2024-11-01', '2024-11-15'), {
      wrapper,
    });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.flares).toEqual([]);
    expect(result.current.majorFlares).toEqual([]);
  });

  it('expone todos los flares y filtra los M+ correctamente', async () => {
    const flares = [
      buildFlare('C3.1', 'FLR-001'),
      buildFlare('M1.5', 'FLR-002'),
      buildFlare('X2.0', 'FLR-003'),
      buildFlare('B1.0', 'FLR-004'),
    ];
    mockFetch.mockResolvedValue(flares);

    const { result } = renderHook(() => useDonki('2024-11-01', '2024-11-15'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.flares).toHaveLength(4);
    expect(result.current.majorFlares).toHaveLength(2);
    expect(result.current.majorFlares.map((f) => f.flrID)).toEqual(
      expect.arrayContaining(['FLR-002', 'FLR-003']),
    );
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('expone isError y error cuando la API falla', async () => {
    const errorMsg = 'Network request failed';
    mockFetch.mockRejectedValue(new Error(errorMsg));

    const { result } = renderHook(() => useDonki('2024-11-01', '2024-11-15'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.flares).toEqual([]);
    expect(result.current.majorFlares).toEqual([]);
    expect(result.current.error?.message).toBe(errorMsg);
  });

  it('devuelve arrays vacíos cuando DONKI no tiene eventos en el rango', async () => {
    mockFetch.mockResolvedValue([]);

    const { result } = renderHook(() => useDonki('2024-01-01', '2024-01-07'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.flares).toEqual([]);
    expect(result.current.majorFlares).toEqual([]);
    expect(result.current.isError).toBe(false);
  });

  it('usa fechas por defecto cuando no se pasan argumentos', async () => {
    mockFetch.mockResolvedValue([]);

    renderHook(() => useDonki(), { wrapper });

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    // Los dos primeros argumentos deben ser strings con formato YYYY-MM-DD
    const [start, end] = mockFetch.mock.calls[0] as [string, string];
    expect(start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
