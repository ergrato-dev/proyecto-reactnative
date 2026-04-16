/**
 * Módulo: Navegación (`src/modules/navigation/`)
 *
 * @what Demuestra React Navigation v7 con Stack, Bottom Tabs y Drawer
 *   anidados. Implementa deep linking con el scheme `cosmosrn://`.
 * @why La navegación es el esqueleto de toda app React Native; este módulo
 *   establece la estructura que conecta los 12 módulos del showcase.
 * @impact Todos los demás módulos dependen de este para registrar sus
 *   pantallas. El deep linking permite lanzar secciones directamente.
 *
 * Exporta:
 * - `RootDrawerNavigator` — navegador raíz (Drawer > Tabs > Stacks)
 * - `linking` — configuración de deep linking para NavigationContainer
 * - Tipos: todos los ParamList y props de pantalla
 */

export { RootDrawerNavigator } from './navigators/RootDrawerNavigator';
export { linking } from './linking';
export type {
  DrawerParamList,
  TabParamList,
  ExploreStackParamList,
  ISSStackParamList,
  APODStackParamList,
  ProfileStackParamList,
  HomeScreenProps,
  BodyDetailScreenProps,
  ISSMapScreenProps,
  APODDetailScreenProps,
} from './types';
