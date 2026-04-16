/**
 * Tests del hook `useFavorites` — planetas favoritos persistidos.
 *
 * @what Verifica la carga inicial desde AsyncStorage, la adición/eliminación
 *   de favoritos y el borrado completo de la lista.
 * @why `useFavorites` es el único punto de verdad de favoritos; si falla,
 *   los botones de favorito en el catálogo mostrarían estados incorrectos.
 * @impact Cubre `useFavorites.ts`. Cambios en `FAVORITES_KEY` o en la
 *   estructura del array requieren actualizar este archivo de test.
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFavorites } from '../hooks/useFavorites';

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
  removeMany: jest.fn(),
  clear: jest.fn(),
}));

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('useFavorites', () => {
  const mockGetItem = AsyncStorage.getItem as jest.Mock;
  const mockSetItem = AsyncStorage.setItem as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetItem.mockResolvedValue(undefined);
  });

  it('debería comenzar con isLoading en true', () => {
    mockGetItem.mockResolvedValue(null);
    const { result } = renderHook(() => useFavorites());
    expect(result.current.isLoading).toBe(true);
  });

  it('debería cargar la lista vacía si no hay favoritos almacenados', async () => {
    mockGetItem.mockResolvedValue(null);
    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.favorites).toEqual([]);
  });

  it('debería cargar los favoritos persistidos desde AsyncStorage', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify(['terre', 'mars']));
    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.favorites).toEqual(['terre', 'mars']);
  });

  it('isFavorite debería devolver true para un ID en la lista', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify(['terre']));
    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isFavorite('terre')).toBe(true);
    expect(result.current.isFavorite('mars')).toBe(false);
  });

  it('toggleFavorite debería añadir un planeta que no está en favoritos', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify(['terre']));
    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.toggleFavorite('mars');
    });

    expect(result.current.favorites).toContain('mars');
    expect(result.current.favorites).toContain('terre');
    expect(mockSetItem).toHaveBeenCalledWith(
      'favorites:planets',
      JSON.stringify(['terre', 'mars']),
    );
  });

  it('toggleFavorite debería eliminar un planeta que ya está en favoritos', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify(['terre', 'mars']));
    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.toggleFavorite('mars');
    });

    expect(result.current.favorites).not.toContain('mars');
    expect(result.current.favorites).toContain('terre');
  });

  it('clearFavorites debería dejar la lista vacía', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify(['terre', 'mars', 'jupiter']));
    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.clearFavorites();
    });

    expect(result.current.favorites).toEqual([]);
    expect(mockSetItem).toHaveBeenCalledWith('favorites:planets', JSON.stringify([]));
  });

  it('debería continuar con lista vacía si AsyncStorage falla al cargar', async () => {
    mockGetItem.mockRejectedValue(new Error('Error de lectura'));
    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.favorites).toEqual([]);
  });
});
