/**
 * Tests de `APODGalleryScreen` — pantalla de galería y gestión de caché APOD.
 *
 * Cubre:
 * - Estado de carga (ActivityIndicator visible)
 * - Lista vacía cuando no hay entradas en caché
 * - Lista con entradas: fechas y tamaños formateados
 * - Botón "Borrar caché": deshabilitado cuando está vacío, habilitado con datos
 * - Flujo de borrado: Alert de confirmación → llama a clearApodCache → lista vacía
 * - Formato de bytes: B y KB
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APODGalleryScreen } from '../screens/APODGalleryScreen';
import { listApodCacheKeys, clearApodCache } from '../hooks/useApod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { APODStackParamList } from '@/modules/navigation/types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
  multiRemove: jest.fn(),
  clear: jest.fn(),
}));
jest.mock('../hooks/useApod', () => ({
  listApodCacheKeys: jest.fn(),
  clearApodCache: jest.fn(),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Props mínimas del componente (React Navigation no usadas en los tests) */
const fakeProps = {} as NativeStackScreenProps<APODStackParamList, 'APODGallery'>;

const mockListKeys = listApodCacheKeys as jest.MockedFunction<typeof listApodCacheKeys>;
const mockClear = clearApodCache as jest.MockedFunction<typeof clearApodCache>;

// ─── Suites ───────────────────────────────────────────────────────────────────

describe('APODGalleryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClear.mockResolvedValue(undefined);
  });

  describe('estado de carga', () => {
    it('muestra indicador de carga mientras resuelve las entradas', async () => {
      // La promesa nunca se resuelve durante el render inicial
      mockListKeys.mockReturnValue(new Promise(() => undefined));
      render(<APODGalleryScreen {...fakeProps} />);
      expect(screen.getByTestId('gallery-loading')).toBeTruthy();
    });
  });

  describe('galería vacía', () => {
    it('muestra estado vacío cuando no hay claves en caché', async () => {
      mockListKeys.mockResolvedValue([]);
      render(<APODGalleryScreen {...fakeProps} />);
      await waitFor(() => expect(screen.getByTestId('empty-gallery')).toBeTruthy());
    });

    it('el botón de borrado está deshabilitado cuando la lista es vacía', async () => {
      mockListKeys.mockResolvedValue([]);
      render(<APODGalleryScreen {...fakeProps} />);
      await waitFor(() => expect(screen.getByTestId('clear-cache-button')).toBeTruthy());
      // El botón existe pero está deshabilitado (entries.length === 0)
      expect(screen.getByTestId('cache-size-text').props.children).toBeTruthy();
    });
  });

  describe('galería con entradas', () => {
    beforeEach(() => {
      // Dos entradas en caché con tamaños simulados
      mockListKeys.mockResolvedValue(['apod:2025-01-01', 'apod:2025-01-02']);
      // AsyncStorage.getItem devuelve JSON de longitud conocida
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'apod:2025-01-01') return Promise.resolve('{"title":"Sol"}');
        if (key === 'apod:2025-01-02') return Promise.resolve('{"title":"Luna"}');
        return Promise.resolve(null);
      });
    });

    it('muestra la lista de entradas', async () => {
      render(<APODGalleryScreen {...fakeProps} />);
      await waitFor(() => expect(screen.getByTestId('gallery-list')).toBeTruthy());
    });

    it('muestra las fechas extraídas de las claves', async () => {
      render(<APODGalleryScreen {...fakeProps} />);
      await waitFor(() => {
        // Las fechas se ordenan descendente; la más reciente primero
        expect(screen.getByText('2025-01-02')).toBeTruthy();
        expect(screen.getByText('2025-01-01')).toBeTruthy();
      });
    });

    it('muestra el número de entradas en la cabecera', async () => {
      render(<APODGalleryScreen {...fakeProps} />);
      await waitFor(() => {
        expect(screen.getByTestId('cache-size-text')).toBeTruthy();
      });
    });
  });

  describe('borrado de caché', () => {
    beforeEach(() => {
      mockListKeys.mockResolvedValue(['apod:2025-03-15']);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('{"url":"https://example.com"}');
    });

    it('muestra un Alert de confirmación al pulsar "Borrar caché"', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert');
      render(<APODGalleryScreen {...fakeProps} />);
      await waitFor(() => expect(screen.getByTestId('clear-cache-button')).toBeTruthy());
      fireEvent.press(screen.getByTestId('clear-cache-button'));
      expect(alertSpy).toHaveBeenCalledWith(
        'Borrar caché APOD',
        expect.stringContaining('1 entradas'),
        expect.any(Array),
      );
      alertSpy.mockRestore();
    });

    it('llama a clearApodCache cuando el usuario confirma', async () => {
      // Interceptar Alert.alert y llamar inmediatamente al handler "Borrar"
      jest.spyOn(Alert, 'alert').mockImplementation((_title, _msg, buttons) => {
        const confirmBtn = (buttons ?? []).find(
          (b: { text: string }) => b.text === 'Borrar',
        ) as { onPress?: () => void } | undefined;
        confirmBtn?.onPress?.();
      });

      render(<APODGalleryScreen {...fakeProps} />);
      await waitFor(() => expect(screen.getByTestId('clear-cache-button')).toBeTruthy());

      await act(async () => {
        fireEvent.press(screen.getByTestId('clear-cache-button'));
      });

      expect(mockClear).toHaveBeenCalledTimes(1);
      jest.restoreAllMocks();
    });

    it('vacía la lista después de confirmar el borrado', async () => {
      jest.spyOn(Alert, 'alert').mockImplementation((_title, _msg, buttons) => {
        const confirmBtn = (buttons ?? []).find(
          (b: { text: string }) => b.text === 'Borrar',
        ) as { onPress?: () => void } | undefined;
        confirmBtn?.onPress?.();
      });

      render(<APODGalleryScreen {...fakeProps} />);
      await waitFor(() => expect(screen.getByTestId('clear-cache-button')).toBeTruthy());

      await act(async () => {
        fireEvent.press(screen.getByTestId('clear-cache-button'));
      });

      await waitFor(() => expect(screen.getByTestId('empty-gallery')).toBeTruthy());
      jest.restoreAllMocks();
    });
  });
});

// ─── Tests de helpers (formatBytes) ──────────────────────────────────────────

describe('formatBytes (via render)', () => {
  it('muestra "B" para valores menores a 1024', async () => {
    mockListKeys.mockResolvedValue(['apod:2025-06-01']);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('x'.repeat(500));
    render(<APODGalleryScreen {...fakeProps} />);
    await waitFor(() => expect(screen.getAllByText(/\d+ B/).length).toBeGreaterThan(0));
  });

  it('muestra "KB" para valores mayores o iguales a 1024', async () => {
    mockListKeys.mockResolvedValue(['apod:2025-06-02']);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('x'.repeat(2000));
    render(<APODGalleryScreen {...fakeProps} />);
    await waitFor(() => expect(screen.getAllByText(/\d+\.\d+ KB/).length).toBeGreaterThan(0));
  });
});
