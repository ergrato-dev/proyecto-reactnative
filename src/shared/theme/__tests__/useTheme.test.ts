/**
 * Tests del hook `useTheme` y los tokens de color.
 *
 * Cubre:
 * - Modo oscuro (predeterminado cuando no hay esquema o esquema es 'dark')
 * - Modo claro (cuando el SO indica 'light')
 * - Estructura de tokens retornada
 */
import { renderHook } from '@testing-library/react-native';
import * as RN from 'react-native';
import { useTheme } from '../useTheme';
import { COLORS_DARK, COLORS_LIGHT } from '../colors';

describe('useTheme', () => {
  describe('modo oscuro (predeterminado)', () => {
    it('usa paleta dark cuando el esquema es null', () => {
      jest.spyOn(RN, 'useColorScheme').mockReturnValue(null);
      const { result } = renderHook(() => useTheme());
      expect(result.current.isDark).toBe(true);
      expect(result.current.colors).toBe(COLORS_DARK);
    });

    it('usa paleta dark cuando el esquema es "dark"', () => {
      jest.spyOn(RN, 'useColorScheme').mockReturnValue('dark');
      const { result } = renderHook(() => useTheme());
      expect(result.current.isDark).toBe(true);
      expect(result.current.colors).toBe(COLORS_DARK);
    });

    it('expone el color primario cian estelar', () => {
      jest.spyOn(RN, 'useColorScheme').mockReturnValue(null);
      const { result } = renderHook(() => useTheme());
      expect(result.current.colors.primary).toBe('#4fc3f7');
    });

    it('expone el fondo oscuro del espacio', () => {
      jest.spyOn(RN, 'useColorScheme').mockReturnValue(null);
      const { result } = renderHook(() => useTheme());
      expect(result.current.colors.background).toBe('#050d24');
    });
  });

  describe('modo claro', () => {
    it('usa paleta light cuando el esquema es "light"', () => {
      jest.spyOn(RN, 'useColorScheme').mockReturnValue('light');
      const { result } = renderHook(() => useTheme());
      expect(result.current.isDark).toBe(false);
      expect(result.current.colors).toBe(COLORS_LIGHT);
    });

    it('expone el fondo claro al alba', () => {
      jest.spyOn(RN, 'useColorScheme').mockReturnValue('light');
      const { result } = renderHook(() => useTheme());
      expect(result.current.colors.background).toBe('#f0f4ff');
    });
  });

  describe('estructura de tokens', () => {
    it('ambas paletas contienen las mismas claves', () => {
      const darkKeys = Object.keys(COLORS_DARK).sort();
      const lightKeys = Object.keys(COLORS_LIGHT).sort();
      expect(darkKeys).toEqual(lightKeys);
    });

    it('expone el color de error en ambas paletas', () => {
      expect(COLORS_DARK.error).toBe('#ef9a9a');
      expect(COLORS_LIGHT.error).toBe('#ef9a9a');
    });
  });
});
