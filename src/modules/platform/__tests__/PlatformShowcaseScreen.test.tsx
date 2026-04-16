import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';

import { PLATFORM_DIFFERENCES } from '../data/differences';
import { PlatformShowcaseScreen } from '../screens/PlatformShowcaseScreen';

// Mockear usePlatformCapabilities para aislar la pantalla de implementación del hook
jest.mock('../hooks/usePlatformCapabilities');

import { usePlatformCapabilities } from '../hooks/usePlatformCapabilities';
const mockUsePlatformCapabilities = usePlatformCapabilities as jest.Mock;

/** Capacidades móvil por defecto para Android */
const defaultCapabilities = {
  currentPlatform: 'android' as const,
  breakpoint: 'mobile' as const,
  windowWidth: 390,
  isNative: true,
  columns: 1,
  getDifferencesByCategory: (category?: string) =>
    category ? PLATFORM_DIFFERENCES.filter((d) => d.category === category) : PLATFORM_DIFFERENCES,
};

/** Prop mínima requerida por DrawerScreenProps */
const screenProps = {
  navigation: { navigate: jest.fn(), goBack: jest.fn() } as never,
  route: { key: 'Platform', name: 'Platform', params: undefined } as never,
};

/**
 * Tests de integración de PlatformShowcaseScreen.
 * Verifica render, filtrado por categoría y badges de plataforma activa.
 */

describe('PlatformShowcaseScreen', () => {
  const originalOS = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePlatformCapabilities.mockReturnValue(defaultCapabilities);
    Object.defineProperty(Platform, 'OS', { get: () => 'android' });
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { get: () => originalOS });
  });

  it('renderiza el contenedor principal con testID', () => {
    render(<PlatformShowcaseScreen {...screenProps} />);
    expect(screen.getByTestId('platform-screen')).toBeTruthy();
  });

  it('muestra el título "Diferencias de Plataforma"', () => {
    render(<PlatformShowcaseScreen {...screenProps} />);
    expect(screen.getByText('Diferencias de Plataforma')).toBeTruthy();
  });

  it('muestra el badge de plataforma activa con "Android"', () => {
    render(<PlatformShowcaseScreen {...screenProps} />);
    const badge = screen.getByTestId('active-platform-badge');
    expect(badge).toBeTruthy();
    // Hay múltiples elementos con "Android" (badges de diferencias + banner)
    expect(screen.getAllByText(/Android/i).length).toBeGreaterThan(0);
  });

  it('muestra el info de Platform.OS con valor android', () => {
    render(<PlatformShowcaseScreen {...screenProps} />);
    expect(screen.getByTestId('platform-os-info')).toBeTruthy();
    expect(screen.getByText(/platform\.os === 'android'/i)).toBeTruthy();
  });

  it('renderiza todas las tarjetas de diferencias', () => {
    render(<PlatformShowcaseScreen {...screenProps} />);
    for (const diff of PLATFORM_DIFFERENCES) {
      expect(screen.getByTestId(`difference-card-${diff.id}`)).toBeTruthy();
    }
  });

  it('muestra el chip de filtro "Todas"', () => {
    render(<PlatformShowcaseScreen {...screenProps} />);
    expect(screen.getByTestId('filter-all')).toBeTruthy();
  });

  it('muestra chips de filtro por categoría', () => {
    render(<PlatformShowcaseScreen {...screenProps} />);
    // Hay diferencias en permissions y ui al menos
    expect(screen.getByTestId('filter-permissions')).toBeTruthy();
    expect(screen.getByTestId('filter-ui')).toBeTruthy();
  });

  it('al presionar "filter-permissions" muestra solo diferencias de esa categoría', () => {
    render(<PlatformShowcaseScreen {...screenProps} />);
    const permChip = screen.getByTestId('filter-permissions');
    fireEvent.press(permChip);

    const permDiffs = PLATFORM_DIFFERENCES.filter((d) => d.category === 'permissions');
    const otherDiffs = PLATFORM_DIFFERENCES.filter((d) => d.category !== 'permissions');

    for (const d of permDiffs) {
      expect(screen.getByTestId(`difference-card-${d.id}`)).toBeTruthy();
    }
    for (const d of otherDiffs) {
      expect(screen.queryByTestId(`difference-card-${d.id}`)).toBeNull();
    }
  });

  it('al presionar de nuevo el filtro activo vuelve a mostrar todas', () => {
    render(<PlatformShowcaseScreen {...screenProps} />);
    const permChip = screen.getByTestId('filter-permissions');
    fireEvent.press(permChip); // activar
    fireEvent.press(permChip); // desactivar (toggle)
    // Ahora todas deben estar visibles
    for (const diff of PLATFORM_DIFFERENCES) {
      expect(screen.getByTestId(`difference-card-${diff.id}`)).toBeTruthy();
    }
  });

  it('al presionar "filter-all" se muestran todas las diferencias', () => {
    render(<PlatformShowcaseScreen {...screenProps} />);
    // Primero activa un filtro
    fireEvent.press(screen.getByTestId('filter-permissions'));
    // Luego presiona "Todas"
    fireEvent.press(screen.getByTestId('filter-all'));
    for (const diff of PLATFORM_DIFFERENCES) {
      expect(screen.getByTestId(`difference-card-${diff.id}`)).toBeTruthy();
    }
  });
});

describe('PlatformShowcaseScreen — snippet expandible', () => {
  beforeEach(() => {
    mockUsePlatformCapabilities.mockReturnValue(defaultCapabilities);
  });
  it('el snippet de código está oculto por defecto', () => {
    render(<PlatformShowcaseScreen {...screenProps} />);
    const firstId = PLATFORM_DIFFERENCES[0]!.id;
    expect(screen.queryByTestId(`snippet-${firstId}`)).toBeNull();
  });

  it('al presionar el toggle se muestra el snippet', () => {
    render(<PlatformShowcaseScreen {...screenProps} />);
    const firstId = PLATFORM_DIFFERENCES[0]!.id;
    fireEvent.press(screen.getByTestId(`snippet-toggle-${firstId}`));
    expect(screen.getByTestId(`snippet-${firstId}`)).toBeTruthy();
  });

  it('al presionar de nuevo se oculta el snippet', () => {
    render(<PlatformShowcaseScreen {...screenProps} />);
    const firstId = PLATFORM_DIFFERENCES[0]!.id;
    const toggle = screen.getByTestId(`snippet-toggle-${firstId}`);
    fireEvent.press(toggle); // mostrar
    fireEvent.press(toggle); // ocultar
    expect(screen.queryByTestId(`snippet-${firstId}`)).toBeNull();
  });
});
