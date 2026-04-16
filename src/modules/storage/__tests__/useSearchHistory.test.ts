/**
 * Tests del hook `useSearchHistory` — historial de búsquedas de asteroides.
 *
 * @what Verifica la carga inicial, la adición de entradas con deduplicación,
 *   el límite máximo de 10 elementos y el borrado completo del historial.
 * @why `useSearchHistory` persiste el historial de búsquedas; si la
 *   deduplicación o el truncado fallan, el usuario ve entradas repetidas
 *   o el almacenamiento crece sin límite.
 * @impact Cubre `useSearchHistory.ts` y la constante `MAX_HISTORY_ITEMS`.
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSearchHistory, MAX_HISTORY_ITEMS } from '../hooks/useSearchHistory';
import type { SearchHistoryEntry } from '../hooks/useSearchHistory';

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
  removeMany: jest.fn(),
  clear: jest.fn(),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Genera N entradas de historial con fechas incrementales.
 *
 * @what Crea un array de `SearchHistoryEntry` con startDate y endDate generados
 *   a partir del índice para garantizar unicidad.
 * @why Permite poblar el historial con datos de prueba sin hardcodear fechas.
 * @impact Solo se usa en los tests de `useSearchHistory`.
 *
 * @param n - Número de entradas a generar
 * @returns Array de `SearchHistoryEntry` con timestamps incrementales
 */
function makeEntries(n: number): SearchHistoryEntry[] {
  return Array.from({ length: n }, (_, i) => ({
    startDate: `2025-0${(i % 9) + 1}-01`,
    endDate: `2025-0${(i % 9) + 1}-07`,
    timestamp: 1000 + i,
  }));
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('useSearchHistory', () => {
  const mockGetItem = AsyncStorage.getItem as jest.Mock;
  const mockSetItem = AsyncStorage.setItem as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetItem.mockResolvedValue(undefined);
  });

  it('debería comenzar con isLoading en true', () => {
    mockGetItem.mockResolvedValue(null);
    const { result } = renderHook(() => useSearchHistory());
    expect(result.current.isLoading).toBe(true);
  });

  it('debería cargar lista vacía si no hay historial almacenado', async () => {
    mockGetItem.mockResolvedValue(null);
    const { result } = renderHook(() => useSearchHistory());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.history).toEqual([]);
  });

  it('debería cargar el historial persistido desde AsyncStorage', async () => {
    const stored = makeEntries(2);
    mockGetItem.mockResolvedValue(JSON.stringify(stored));
    const { result } = renderHook(() => useSearchHistory());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.history).toHaveLength(2);
  });

  it('addEntry debería insertar una nueva búsqueda al inicio', async () => {
    mockGetItem.mockResolvedValue(null);
    const { result } = renderHook(() => useSearchHistory());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.addEntry('2025-02-01', '2025-02-07');
    });

    expect(result.current.history[0].startDate).toBe('2025-02-01');
    expect(result.current.history[0].endDate).toBe('2025-02-07');
  });

  it('addEntry debería deduplicar entradas con las mismas fechas', async () => {
    const stored: SearchHistoryEntry[] = [
      { startDate: '2025-02-01', endDate: '2025-02-07', timestamp: 1000 },
    ];
    mockGetItem.mockResolvedValue(JSON.stringify(stored));
    const { result } = renderHook(() => useSearchHistory());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.addEntry('2025-02-01', '2025-02-07');
    });

    // Solo debe haber una entrada con esas fechas
    const matching = result.current.history.filter(
      (h) => h.startDate === '2025-02-01' && h.endDate === '2025-02-07',
    );
    expect(matching).toHaveLength(1);
    // Y debe ser la más reciente (al inicio)
    expect(result.current.history[0].startDate).toBe('2025-02-01');
  });

  it(`debería mantener máximo ${MAX_HISTORY_ITEMS} entradas`, async () => {
    const stored = makeEntries(MAX_HISTORY_ITEMS);
    mockGetItem.mockResolvedValue(JSON.stringify(stored));
    const { result } = renderHook(() => useSearchHistory());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.addEntry('2099-12-01', '2099-12-07');
    });

    expect(result.current.history).toHaveLength(MAX_HISTORY_ITEMS);
    expect(result.current.history[0].startDate).toBe('2099-12-01');
  });

  it('clearHistory debería dejar el historial vacío', async () => {
    const stored = makeEntries(3);
    mockGetItem.mockResolvedValue(JSON.stringify(stored));
    const { result } = renderHook(() => useSearchHistory());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.clearHistory();
    });

    expect(result.current.history).toEqual([]);
    expect(mockSetItem).toHaveBeenCalledWith(
      'search-history:asteroids',
      JSON.stringify([]),
    );
  });

  it('debería continuar con historial vacío si AsyncStorage falla al cargar', async () => {
    mockGetItem.mockRejectedValue(new Error('Error'));
    const { result } = renderHook(() => useSearchHistory());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.history).toEqual([]);
  });
});
