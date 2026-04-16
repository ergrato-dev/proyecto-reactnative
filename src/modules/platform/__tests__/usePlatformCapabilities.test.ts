import { renderHook } from '@testing-library/react-native';
import { Dimensions, Platform } from 'react-native';

import { PLATFORM_DIFFERENCES } from '../data/differences';
import { usePlatformCapabilities } from '../hooks/usePlatformCapabilities';

/** Helper: mockea Dimensions.get antes de que el hook monte */
function mockWindowWidth(width: number, height = 900) {
  jest.spyOn(Dimensions, 'get').mockReturnValue({ width, height, scale: 2, fontScale: 1 });
}

/**
 * Tests del hook usePlatformCapabilities.
 * Verifica breakpoints, columns, isNative y filtrado de diferencias.
 */

describe('usePlatformCapabilities — breakpoints', () => {
  afterEach(() => jest.restoreAllMocks());

  it('mobile cuando width < 600', () => {
    mockWindowWidth(390);
    const { result } = renderHook(() => usePlatformCapabilities());
    expect(result.current.breakpoint).toBe('mobile');
    expect(result.current.columns).toBe(1);
    expect(result.current.windowWidth).toBe(390);
  });

  it('tablet cuando 600 ≤ width < 1024', () => {
    mockWindowWidth(768);
    const { result } = renderHook(() => usePlatformCapabilities());
    expect(result.current.breakpoint).toBe('tablet');
    expect(result.current.columns).toBe(2);
  });

  it('desktop cuando width ≥ 1024', () => {
    mockWindowWidth(1440);
    const { result } = renderHook(() => usePlatformCapabilities());
    expect(result.current.breakpoint).toBe('desktop');
    expect(result.current.columns).toBe(3);
  });

  it('límite inferior de tablet: width === 600 es tablet', () => {
    mockWindowWidth(600);
    const { result } = renderHook(() => usePlatformCapabilities());
    expect(result.current.breakpoint).toBe('tablet');
  });

  it('límite inferior de desktop: width === 1024 es desktop', () => {
    mockWindowWidth(1024);
    const { result } = renderHook(() => usePlatformCapabilities());
    expect(result.current.breakpoint).toBe('desktop');
  });
});

describe('usePlatformCapabilities — plataforma', () => {
  const originalOS = Platform.OS;

  beforeEach(() => {
    mockWindowWidth(390);
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { get: () => originalOS });
    jest.restoreAllMocks();
  });

  it('isNative es true en android', () => {
    Object.defineProperty(Platform, 'OS', { get: () => 'android' });
    const { result } = renderHook(() => usePlatformCapabilities());
    expect(result.current.isNative).toBe(true);
    expect(result.current.currentPlatform).toBe('android');
  });

  it('isNative es true en ios', () => {
    Object.defineProperty(Platform, 'OS', { get: () => 'ios' });
    const { result } = renderHook(() => usePlatformCapabilities());
    expect(result.current.isNative).toBe(true);
    expect(result.current.currentPlatform).toBe('ios');
  });

  it('isNative es false en web', () => {
    Object.defineProperty(Platform, 'OS', { get: () => 'web' });
    const { result } = renderHook(() => usePlatformCapabilities());
    expect(result.current.isNative).toBe(false);
    expect(result.current.currentPlatform).toBe('web');
  });
});

describe('usePlatformCapabilities — getDifferencesByCategory', () => {
  const originalOS = Platform.OS;

  beforeEach(() => {
    mockWindowWidth(390);
    Object.defineProperty(Platform, 'OS', { get: () => 'android' });
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { get: () => originalOS });
    jest.restoreAllMocks();
  });

  it('sin categoría retorna todas las diferencias', () => {
    const { result } = renderHook(() => usePlatformCapabilities());
    const all = result.current.getDifferencesByCategory();
    expect(all).toHaveLength(PLATFORM_DIFFERENCES.length);
  });

  it('filtra por categoría permissions', () => {
    const { result } = renderHook(() => usePlatformCapabilities());
    const perms = result.current.getDifferencesByCategory('permissions');
    expect(perms.length).toBeGreaterThan(0);
    perms.forEach((d) => expect(d.category).toBe('permissions'));
  });

  it('filtra por categoría ui', () => {
    const { result } = renderHook(() => usePlatformCapabilities());
    const ui = result.current.getDifferencesByCategory('ui');
    expect(ui.length).toBeGreaterThan(0);
    ui.forEach((d) => expect(d.category).toBe('ui'));
  });

  it('retorna array vacío para categoría sin entradas', () => {
    const { result } = renderHook(() => usePlatformCapabilities());
    const net = result.current.getDifferencesByCategory('network');
    expect(net).toHaveLength(0);
  });
});
