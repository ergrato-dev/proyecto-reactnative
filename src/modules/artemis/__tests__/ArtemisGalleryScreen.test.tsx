/**
 * Tests de ArtemisGalleryScreen.
 *
 * @what Verifica los tres estados de la galería: carga, error y datos
 *   renderizados. Comprueba que el botón de reintento llama a `refetch`.
 * @why `ArtemisGalleryScreen` es el componente de mayor riesgo del módulo:
 *   tiene tres ramas de renderizado condicional que deben cubrirse.
 * @impact Cubre `screens/ArtemisGalleryScreen.tsx` y `hooks/useArtemisImages`.
 *   Usa mocks de `useArtemisImages` y navegación.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ArtemisGalleryScreen } from '../screens/ArtemisGalleryScreen';
import type { NasaImageItem } from '@/shared/lib/nasaClient';

// ─── Mock del hook ─────────────────────────────────────────────────────────────
jest.mock('../hooks/useArtemisImages');
import { useArtemisImages } from '../hooks/useArtemisImages';
const mockUseArtemisImages = useArtemisImages as jest.MockedFunction<typeof useArtemisImages>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
    links: [
      { href: `https://images-assets.nasa.gov/image/${nasaId}/thumb.jpg`, rel: 'preview' },
    ],
  };
}

const mockRefetch = jest.fn();
const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

function buildProps() {
  return {
    navigation: { navigate: mockNavigate, goBack: mockGoBack } as never,
    route: {} as never,
  };
}

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('ArtemisGalleryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('estado de carga', () => {
    it('debería mostrar el indicador de actividad mientras carga', () => {
      mockUseArtemisImages.mockReturnValue({
        images: [],
        isLoading: true,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<ArtemisGalleryScreen {...buildProps()} />);
      expect(screen.getByTestId('loading-indicator')).toBeTruthy();
    });
  });

  describe('estado de error', () => {
    it('debería mostrar el mensaje de error y el botón de reintento', () => {
      mockUseArtemisImages.mockReturnValue({
        images: [],
        isLoading: false,
        isError: true,
        error: new Error('Error al obtener imágenes de Artemis: 500'),
        refetch: mockRefetch,
      });

      render(<ArtemisGalleryScreen {...buildProps()} />);
      expect(screen.getByTestId('error-container')).toBeTruthy();
      expect(screen.getByText(/Error al obtener imágenes/)).toBeTruthy();
    });

    it('debería llamar a refetch al pulsar el botón de reintento', () => {
      mockUseArtemisImages.mockReturnValue({
        images: [],
        isLoading: false,
        isError: true,
        error: new Error('Error de red'),
        refetch: mockRefetch,
      });

      render(<ArtemisGalleryScreen {...buildProps()} />);
      fireEvent.press(screen.getByTestId('retry-button'));
      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('estado con datos', () => {
    const mockImages = [
      buildImageItem('artemis-1-launch', 'Artemis I Launch'),
      buildImageItem('artemis-crew', 'Artemis Crew Training'),
    ];

    beforeEach(() => {
      mockUseArtemisImages.mockReturnValue({
        images: mockImages,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });
    });

    it('debería renderizar el título de la galería', () => {
      render(<ArtemisGalleryScreen {...buildProps()} />);
      expect(screen.getByText('Galería Artemis')).toBeTruthy();
    });

    it('debería mostrar el conteo de imágenes', () => {
      render(<ArtemisGalleryScreen {...buildProps()} />);
      expect(screen.getByText('2 imágenes oficiales NASA')).toBeTruthy();
    });

    it('debería renderizar los ítems de imagen con testID correcto', () => {
      render(<ArtemisGalleryScreen {...buildProps()} />);
      expect(screen.getByTestId('gallery-item-artemis-1-launch')).toBeTruthy();
      expect(screen.getByTestId('gallery-item-artemis-crew')).toBeTruthy();
    });

    it('debería navegar hacia atrás al pulsar el botón', () => {
      render(<ArtemisGalleryScreen {...buildProps()} />);
      fireEvent.press(screen.getByTestId('back-button'));
      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('estado vacío', () => {
    it('debería mostrar el estado vacío si no hay imágenes', () => {
      mockUseArtemisImages.mockReturnValue({
        images: [],
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<ArtemisGalleryScreen {...buildProps()} />);
      expect(screen.getByTestId('empty-state')).toBeTruthy();
      expect(screen.getByText('No se encontraron imágenes')).toBeTruthy();
    });
  });
});
