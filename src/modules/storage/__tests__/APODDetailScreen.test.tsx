/**
 * Tests de la pantalla `APODDetailScreen`.
 *
 * @what Verifica los estados de carga, error y datos, la navegación temporal
 *   con botones ‹/›, la visualización del copyright y el botón de compartir.
 * @why `APODDetailScreen` es la pantalla raíz de `APODStack`; si los estados
 *   de UI no se renderizan correctamente, el usuario ve una pantalla en blanco
 *   o sin acceso a los controles de fecha.
 * @impact Cubre `APODDetailScreen.tsx`. Cambios en los `testID` o en la
 *   lógica de fechas requieren actualizar este archivo de test.
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { APODDetailScreen } from '../screens/APODDetailScreen';

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
  removeMany: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(false),
  shareAsync: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
  File: jest.fn().mockImplementation(() => ({})),
  Paths: { cache: {} },
}));

jest.mock('../hooks/useApod', () => ({
  useApod: jest.fn(),
}));

import { useApod } from '../hooks/useApod';
import type { ApodResponse } from '@/shared/lib/nasaClient';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const MOCK_APOD_IMAGE: ApodResponse = {
  date: '2025-01-01',
  title: 'Nebulosa del Cangrejo',
  explanation: 'Una hermosa nebulosa en la constelación de Tauro.',
  media_type: 'image',
  url: 'https://apod.nasa.gov/apod/image/test.jpg',
  hdurl: 'https://apod.nasa.gov/apod/image/test_hd.jpg',
  copyright: 'NASA/ESA',
  service_version: 'v1',
};

const MOCK_APOD_VIDEO: ApodResponse = {
  date: '2025-01-02',
  title: 'Viaje al universo',
  explanation: 'Documental sobre la expansión del universo.',
  media_type: 'video',
  url: 'https://youtube.com/watch?v=abc123',
  service_version: 'v1',
};

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Props mínimas de navegación para `APODDetailScreen`.
 *
 * @what Crea un objeto de props compatible con `APODDetailScreenProps`.
 * @why Evita montar el navegador completo en tests unitarios.
 * @impact No probamos la navegación real, solo el renderizado interno.
 */
const navProps = {
  navigation: {} as never,
  route: {} as never,
};

/**
 * Envuelve el componente en un `QueryClientProvider` con cliente limpio.
 *
 * @what Crea un `QueryClient` con `retry: 0` para aislar tests.
 * @why `APODDetailScreen` usa `useApod` que requiere el contexto de TanStack Query.
 * @impact Obligatorio para evitar advertencias de React Query en cada test.
 *
 * @param ui - Elemento React a envolver
 * @returns Resultado del render con el proveedor incluido
 */
function renderWithQuery(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: 0 } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('APODDetailScreen', () => {
  const mockUseApod = useApod as jest.MockedFunction<typeof useApod>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería mostrar el indicador de carga cuando isLoading es true', () => {
    mockUseApod.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      isFetching: true,
      error: null,
    } as ReturnType<typeof useApod>);

    renderWithQuery(<APODDetailScreen {...navProps} />);
    expect(screen.getByTestId('loading-view')).toBeTruthy();
  });

  it('debería mostrar la vista de error cuando isError es true', () => {
    mockUseApod.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      isFetching: false,
      error: new Error('Error de red'),
    } as ReturnType<typeof useApod>);

    renderWithQuery(<APODDetailScreen {...navProps} />);
    expect(screen.getByTestId('error-view')).toBeTruthy();
  });

  it('debería mostrar el título cuando los datos están disponibles', () => {
    mockUseApod.mockReturnValue({
      data: MOCK_APOD_IMAGE,
      isLoading: false,
      isError: false,
      isFetching: false,
      error: null,
    } as ReturnType<typeof useApod>);

    renderWithQuery(<APODDetailScreen {...navProps} />);
    expect(screen.getByTestId('apod-title')).toBeTruthy();
    expect(screen.getByText('Nebulosa del Cangrejo')).toBeTruthy();
  });

  it('debería mostrar la explicación de la APOD', () => {
    mockUseApod.mockReturnValue({
      data: MOCK_APOD_IMAGE,
      isLoading: false,
      isError: false,
      isFetching: false,
      error: null,
    } as ReturnType<typeof useApod>);

    renderWithQuery(<APODDetailScreen {...navProps} />);
    expect(screen.getByTestId('apod-explanation')).toBeTruthy();
    expect(screen.getByText('Una hermosa nebulosa en la constelación de Tauro.')).toBeTruthy();
  });

  it('debería mostrar el copyright cuando está disponible', () => {
    mockUseApod.mockReturnValue({
      data: MOCK_APOD_IMAGE,
      isLoading: false,
      isError: false,
      isFetching: false,
      error: null,
    } as ReturnType<typeof useApod>);

    renderWithQuery(<APODDetailScreen {...navProps} />);
    expect(screen.getByTestId('apod-copyright')).toBeTruthy();
    expect(screen.getByText('© NASA/ESA')).toBeTruthy();
  });

  it('no debería mostrar el copyright cuando no está disponible', () => {
    const apodSinCopyright = { ...MOCK_APOD_IMAGE, copyright: undefined };
    mockUseApod.mockReturnValue({
      data: apodSinCopyright,
      isLoading: false,
      isError: false,
      isFetching: false,
      error: null,
    } as ReturnType<typeof useApod>);

    renderWithQuery(<APODDetailScreen {...navProps} />);
    expect(screen.queryByTestId('apod-copyright')).toBeNull();
  });

  it('debería renderizar la imagen cuando media_type es image', () => {
    mockUseApod.mockReturnValue({
      data: MOCK_APOD_IMAGE,
      isLoading: false,
      isError: false,
      isFetching: false,
      error: null,
    } as ReturnType<typeof useApod>);

    renderWithQuery(<APODDetailScreen {...navProps} />);
    expect(screen.getByTestId('apod-image')).toBeTruthy();
  });

  it('debería renderizar la tarjeta de vídeo cuando media_type es video', () => {
    mockUseApod.mockReturnValue({
      data: MOCK_APOD_VIDEO,
      isLoading: false,
      isError: false,
      isFetching: false,
      error: null,
    } as ReturnType<typeof useApod>);

    renderWithQuery(<APODDetailScreen {...navProps} />);
    expect(screen.getByTestId('apod-video-card')).toBeTruthy();
  });

  it('debería mostrar el botón de compartir', () => {
    mockUseApod.mockReturnValue({
      data: MOCK_APOD_IMAGE,
      isLoading: false,
      isError: false,
      isFetching: false,
      error: null,
    } as ReturnType<typeof useApod>);

    renderWithQuery(<APODDetailScreen {...navProps} />);
    expect(screen.getByTestId('share-button')).toBeTruthy();
  });

  it('debería mostrar los botones de navegación de fecha', () => {
    mockUseApod.mockReturnValue({
      data: MOCK_APOD_IMAGE,
      isLoading: false,
      isError: false,
      isFetching: false,
      error: null,
    } as ReturnType<typeof useApod>);

    renderWithQuery(<APODDetailScreen {...navProps} />);
    expect(screen.getByTestId('apod-prev-button')).toBeTruthy();
    expect(screen.getByTestId('apod-next-button')).toBeTruthy();
  });

  it('debería cambiar la fecha al pulsar el botón anterior', () => {
    mockUseApod.mockReturnValue({
      data: MOCK_APOD_IMAGE,
      isLoading: false,
      isError: false,
      isFetching: false,
      error: null,
    } as ReturnType<typeof useApod>);

    renderWithQuery(<APODDetailScreen {...navProps} />);
    const labelAntes = screen.getByTestId('apod-date-label').props.children as string;
    fireEvent.press(screen.getByTestId('apod-prev-button'));
    const labelDespues = screen.getByTestId('apod-date-label').props.children as string;
    expect(labelDespues).not.toBe(labelAntes);
  });

  // ── handleShare ────────────────────────────────────────────────────────────

  it('debería compartir usando Share.share cuando media_type es video', async () => {
    const { Share } = require('react-native');
    jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });

    mockUseApod.mockReturnValue({
      data: MOCK_APOD_VIDEO,
      isLoading: false,
      isError: false,
      isFetching: false,
      error: null,
    } as ReturnType<typeof useApod>);

    renderWithQuery(<APODDetailScreen {...navProps} />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('share-button'));
    });
    expect(Share.share).toHaveBeenCalledWith({
      message: `${MOCK_APOD_VIDEO.title}\n${MOCK_APOD_VIDEO.url}`,
    });

    jest.restoreAllMocks();
  });

  it('debería compartir con Share.share cuando expo-sharing no está disponible', async () => {
    const { Share } = require('react-native');
    const Sharing = require('expo-sharing');
    jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });
    Sharing.isAvailableAsync.mockResolvedValue(false);

    mockUseApod.mockReturnValue({
      data: MOCK_APOD_IMAGE,
      isLoading: false,
      isError: false,
      isFetching: false,
      error: null,
    } as ReturnType<typeof useApod>);

    renderWithQuery(<APODDetailScreen {...navProps} />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('share-button'));
    });
    expect(Share.share).toHaveBeenCalledWith({
      message: `${MOCK_APOD_IMAGE.title}\n${MOCK_APOD_IMAGE.url}`,
    });

    jest.restoreAllMocks();
  });

  it('debería usar fallback Share.share cuando la descarga de imagen falla', async () => {
    const { Share } = require('react-native');
    const Sharing = require('expo-sharing');
    const FileSystem = require('expo-file-system');

    jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });
    Sharing.isAvailableAsync.mockResolvedValue(true);
    // Simula error en la descarga del archivo
    FileSystem.File.mockImplementation(() => { throw new Error('descarga fallida'); });

    mockUseApod.mockReturnValue({
      data: MOCK_APOD_IMAGE,
      isLoading: false,
      isError: false,
      isFetching: false,
      error: null,
    } as ReturnType<typeof useApod>);

    renderWithQuery(<APODDetailScreen {...navProps} />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('share-button'));
    });
    // El catch silencioso hace fallback a Share nativo
    expect(Share.share).toHaveBeenCalledWith({
      message: `${MOCK_APOD_IMAGE.title}\n${MOCK_APOD_IMAGE.url}`,
    });

    jest.restoreAllMocks();
  });

  it('no debe llamar a Share si no hay datos', async () => {
    const { Share } = require('react-native');
    jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });

    mockUseApod.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      isFetching: true,
      error: null,
    } as ReturnType<typeof useApod>);

    renderWithQuery(<APODDetailScreen {...navProps} />);
    // El botón compartir no se renderiza cuando no hay datos (sección {data && (...)})
    expect(screen.queryByTestId('share-button')).toBeNull();
    expect(Share.share).not.toHaveBeenCalled();

    jest.restoreAllMocks();
  });
});
