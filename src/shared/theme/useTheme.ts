/**
 * Hook de tema global de CosmosRN.
 *
 * @what Expone la paleta de colores activa y un flag `isDark` según el
 *   esquema de color del sistema operativo del dispositivo.
 * @why Centraliza la lógica de tema para que ningún componente acceda
 *   directamente a `useColorScheme()` ni a constantes de color crudas.
 * @impact Todos los componentes que consuman este hook se re-renderizan
 *   automáticamente cuando el usuario cambia el modo del SO.
 *
 * @returns {{ colors: AppColors, isDark: boolean }}
 */
import { useColorScheme } from 'react-native';
import { COLORS_DARK, COLORS_LIGHT, type AppColors } from './colors';

export function useTheme(): { colors: AppColors; isDark: boolean } {
  // El modo oscuro es el predeterminado de la app (temática espacial).
  // Solo se usa el modo claro cuando el SO lo indica explícitamente.
  const scheme = useColorScheme();
  const isDark = scheme !== 'light';
  return { colors: isDark ? COLORS_DARK : COLORS_LIGHT, isDark };
}
