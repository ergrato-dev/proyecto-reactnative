/**
 * Tests del hook useAstronauts.
 *
 * @what Verifica el estado de carga, datos parseados, conteo de astronautas
 *   y manejo de error de red.
 * @why `useAstronauts` alimenta la lista de tripulantes en `AstronautsScreen`;
 *   si el conteo o los datos se parsean incorrectamente la UI es incorrecta.
 * @impact Cubre `useAstronauts` de `hooks/useAstronauts.ts`.
 *   Usa mock de `issClient` para aislar de la red.
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAstronauts } from '../hooks/useAstronauts';
import type { AstronautsResponse } from '@/shared/lib/issClient';

// ─── Mock ────────────────────────────────────────────────────────────────────
jest.mock('@/shared/lib/issClient', () => ({
  fetchIssPosition: jest.fn(),
  fetchAstronauts: jest.fn(),
}));

import { fetchAstronauts } from '@/shared/lib/issClient';
const mockFetchAstronauts = fetchAstronauts as jest.Mock;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildAstronautsResponse(names: string[], craft = 'ISS'): AstronautsResponse {
  return {
    message: 'success',
    number: names.length,
    people: names.map((name) => ({ name, craft })),
  };
}

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: 0 } },
  });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('useAstronauts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería iniciar en estado de carga con arrays vacíos', () => {
    mockFetchAstronauts.mockImplementation(() => new Promise(() => {}));
    const { result } = renderHook(() => useAstronauts(), { wrapper });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.astronauts).toEqual([]);
    expect(result.current.count).toBe(0);
  });

  it('debería devolver la lista y el conteo correctos tras respuesta exitosa', async () => {
    mockFetchAstronauts.mockResolvedValue(
      buildAstronautsResponse(['Oleg Kononenko', 'Nikolai Chub', 'Loral O\'Hara']),
    );
    const { result } = renderHook(() => useAstronauts(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.count).toBe(3);
    expect(result.current.astronauts).toHaveLength(3);
    expect(result.current.astronauts[0].name).toBe('Oleg Kononenko');
    expect(result.current.astronauts[0].craft).toBe('ISS');
  });

  it('debería devolver lista vacía y count 0 si no hay personas en el espacio', async () => {
    mockFetchAstronauts.mockResolvedValue({ message: 'success', number: 0, people: [] });
    const { result } = renderHook(() => useAstronauts(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.count).toBe(0);
    expect(result.current.astronauts).toHaveLength(0);
  });

  it('debería exponer isError en caso de fallo de red', async () => {
    mockFetchAstronauts.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useAstronauts(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.astronauts).toEqual([]);
  });

  it('debería manejar astronautas en naves distintas a ISS', async () => {
    const response = buildAstronautsResponse(
      ['Tang Hongbo', 'Tang Shengjie'],
      'Shenzhou-18',
    );
    mockFetchAstronauts.mockResolvedValue(response);
    const { result } = renderHook(() => useAstronauts(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.astronauts[0].craft).toBe('Shenzhou-18');
  });
});
