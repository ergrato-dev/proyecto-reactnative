import { useMemo } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

import type {
  PlatformDifference,
  SupportedPlatform} from '../data/differences';
import {
  getCurrentPlatform,
  PLATFORM_DIFFERENCES
} from '../data/differences';

/** Punto de quiebre de layout */
export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

/** Resultado del hook usePlatformCapabilities */
export interface PlatformCapabilities {
  /** Plataforma activa en tiempo de ejecución */
  currentPlatform: SupportedPlatform;
  /** Breakpoint según el ancho de la ventana */
  breakpoint: Breakpoint;
  /** Ancho actual de la ventana en px */
  windowWidth: number;
  /** Si la plataforma es nativa (android | ios) */
  isNative: boolean;
  /** Número de columnas recomendado para el grid */
  columns: number;
  /** Diferencias filtradas por categoría (undefined = todas) */
  getDifferencesByCategory: (
    category?: PlatformDifference['category'],
  ) => PlatformDifference[];
}

/**
 * @what Hook que expone las capacidades y características de la plataforma activa.
 * @why Centraliza la detección de plataforma, breakpoints y filtrado de diferencias
 *   para que PlatformShowcaseScreen no tenga lógica de entorno inline.
 * @impact Cualquier componente que consuma este hook re-renderizará cuando cambie
 *   el ancho de la ventana (p.ej. rotar pantalla en tablet o redimensionar en web).
 */
export function usePlatformCapabilities(): PlatformCapabilities {
  const { width: windowWidth } = useWindowDimensions();

  const breakpoint: Breakpoint = useMemo(() => {
    if (windowWidth < 600) return 'mobile';
    if (windowWidth < 1024) return 'tablet';
    return 'desktop';
  }, [windowWidth]);

  const columns = useMemo(() => {
    if (breakpoint === 'desktop') return 3;
    if (breakpoint === 'tablet') return 2;
    return 1;
  }, [breakpoint]);

  const currentPlatform = getCurrentPlatform();
  const isNative = Platform.OS === 'android' || Platform.OS === 'ios';

  const getDifferencesByCategory = useMemo(
    () =>
      (category?: PlatformDifference['category']): PlatformDifference[] => {
        if (!category) return PLATFORM_DIFFERENCES;
        return PLATFORM_DIFFERENCES.filter((d) => d.category === category);
      },
    [],
  );

  return {
    currentPlatform,
    breakpoint,
    windowWidth,
    isNative,
    columns,
    getDifferencesByCategory,
  };
}
