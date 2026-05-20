/**
 * Tests del componente `ApodMedia`.
 *
 * @what Verifica las dos ramas del componente: imagen (expo-image) y
 *   vídeo (tarjeta con enlace externo), además del placeholder de carga.
 * @why `ApodMedia` encapsula la lógica de tipo de medio; si las ramas
 *   imagen/vídeo no se ejercitan, un cambio en `media_type` puede quedar
 *   sin detección en código de producción.
 * @impact Mock de `expo-image` y `react-native.Linking` para aislar el
 *   componente de dependencias nativas.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';

// ─── Mock de expo-image ───────────────────────────────────────────────────────
// expo-image usa una implementación nativa que no está disponible en Jest.
// Se reemplaza por el componente Image de React Native para que el testID
// sea accesible en el árbol de componentes.

jest.mock('expo-image', () => {
  const { Image } = require('react-native');
  return { Image };
});

import { ApodMedia, ApodLoadingPlaceholder } from '../components/ApodMedia';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const APOD_IMAGE = {
  media_type: 'image' as const,
  url: 'https://apod.nasa.gov/apod/image/test.jpg',
  hdurl: 'https://apod.nasa.gov/apod/image/test_hd.jpg',
  title: 'Nebulosa del Cangrejo',
};

const APOD_VIDEO = {
  media_type: 'video' as const,
  url: 'https://www.youtube.com/watch?v=abc123',
  hdurl: undefined,
  title: 'Viaje al universo',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ApodMedia — rama imagen', () => {
  it('renderiza el testID "apod-image" para media_type image', () => {
    render(<ApodMedia apod={APOD_IMAGE} />);
    expect(screen.getByTestId('apod-image')).toBeTruthy();
  });

  it('no renderiza la tarjeta de vídeo cuando es imagen', () => {
    render(<ApodMedia apod={APOD_IMAGE} />);
    expect(screen.queryByTestId('apod-video-card')).toBeNull();
  });

  it('acepta altura personalizada por prop', () => {
    const { toJSON } = render(<ApodMedia apod={APOD_IMAGE} height={400} />);
    expect(toJSON()).not.toBeNull();
  });
});

describe('ApodMedia — rama vídeo', () => {
  beforeEach(() => {
    jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renderiza el testID "apod-video-card" para media_type video', () => {
    render(<ApodMedia apod={APOD_VIDEO} />);
    expect(screen.getByTestId('apod-video-card')).toBeTruthy();
  });

  it('no renderiza la imagen cuando es vídeo', () => {
    render(<ApodMedia apod={APOD_VIDEO} />);
    expect(screen.queryByTestId('apod-image')).toBeNull();
  });

  it('muestra el texto "Ver vídeo en navegador"', () => {
    render(<ApodMedia apod={APOD_VIDEO} />);
    expect(screen.getByText('Ver vídeo en navegador')).toBeTruthy();
  });

  it('muestra la URL del vídeo en la tarjeta', () => {
    render(<ApodMedia apod={APOD_VIDEO} />);
    expect(screen.getByText('https://www.youtube.com/watch?v=abc123')).toBeTruthy();
  });

  it('llama a Linking.openURL con la URL al pulsar la tarjeta', () => {
    render(<ApodMedia apod={APOD_VIDEO} />);
    fireEvent.press(screen.getByTestId('apod-video-card'));
    expect(Linking.openURL).toHaveBeenCalledWith('https://www.youtube.com/watch?v=abc123');
  });
});

describe('ApodLoadingPlaceholder', () => {
  it('renderiza el testID "apod-loading-placeholder"', () => {
    render(<ApodLoadingPlaceholder />);
    expect(screen.getByTestId('apod-loading-placeholder')).toBeTruthy();
  });

  it('acepta altura personalizada por prop', () => {
    const { toJSON } = render(<ApodLoadingPlaceholder height={200} />);
    expect(toJSON()).not.toBeNull();
  });
});
