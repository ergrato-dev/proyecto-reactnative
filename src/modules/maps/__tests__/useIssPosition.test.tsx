/**
 * Tests del hook useIssPosition.
 *
 * @what Verifica el polling de posición ISS: estado de carga, datos parseados,
 *   error de red y la función utilitaria `toCoordinates`.
 * @why `useIssPosition` es el motor del mapa ISS; si el parsing de coordenadas
 *   falla, el marcador del mapa se posiciona incorrectamente.
 * @impact Cubre `useIssPosition` y `toCoordinates` de `hooks/useIssPosition.ts`.
 *   Usa mock de `issClient` para aislar de la red.
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useIssPosition, toCoordinates } from '../hooks/useIssPosition';
import type { IssNowResponse } from '@/shared/lib/issClient';

// ─── Mock del cliente ISS ─────────────────────────────────────────────────────
jest.mock('@/shared/lib/issClient', () => ({
  fetchIssPosition: jest.fn(),
  fetchAstronauts: jest.fn(),
}));

import { fetchIssPosition } from '@/shared/lib/issClient';
const mockFetchIssPosition = fetchIssPosition as jest.Mock;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildResponse(lat: string, lng: string, ts = 1700000000): IssNowResponse {
  return {
    message: 'success',
    timestamp: ts,
    iss_position: { latitude: lat, longitude: lng },
  };
}

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: 0 } },
  });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

// ─── Tests unitarios de toCoordinates ────────────────────────────────────────

describe('toCoordinates', () => {
  it('debería convertir strings de coordenadas a números', () => {
    const raw = buildResponse('51.5074', '-0.1278');
    const coords = toCoordinates(raw);
    expect(coords.latitude).toBe(51.5074);
    expect(coords.longitude).toBe(-0.1278);
    expect(coords.timestamp).toBe(1700000000);
  });

  it('debería manejar coordenadas negativas en el hemisferio sur', () => {
    const raw = buildResponse('-33.8688', '151.2093');
    const coords = toCoordinates(raw);
    expect(coords.latitude).toBe(-33.8688);
    expect(coords.longitude).toBe(151.2093);
  });

  it('debería manejar coordenadas en el ecuador (0, 0)', () => {
    const raw = buildResponse('0', '0');
    const coords = toCoordinates(raw);
    expect(coords.latitude).toBe(0);
    expect(coords.longitude).toBe(0);
  });
});

// ─── Tests del hook ───────────────────────────────────────────────────────────

describe('useIssPosition', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería iniciar en estado de carga', () => {
    mockFetchIssPosition.mockImplementation(() => new Promise(() => {}));
    const { result } = renderHook(() => useIssPosition(), { wrapper });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.coordinates).toBeNull();
  });

  it('debería devolver coordenadas numéricas tras una respuesta exitosa', async () => {
    mockFetchIssPosition.mockResolvedValue(buildResponse('28.6139', '77.2090'));
    const { result } = renderHook(() => useIssPosition(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.coordinates?.latitude).toBe(28.6139);
    expect(result.current.coordinates?.longitude).toBe(77.209);
    expect(result.current.isError).toBe(false);
  });

  it('debería exponer isError en caso de fallo de red', async () => {
    mockFetchIssPosition.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useIssPosition(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.coordinates).toBeNull();
  });
});
