/**
 * Definición centralizada de tipos para todos los navegadores de CosmosRN.
 *
 * @what Declara los ParamList de cada navegador (Root Stack, Bottom Tabs,
 *   Drawer) y los tipos compuestos derivados para los props de pantalla.
 * @why TypeScript requiere tipos explícitos en React Navigation v7 para
 *   garantizar seguridad de tipos en `navigation.navigate()` y `route.params`.
 * @impact Cualquier pantalla nueva debe registrarse aquí antes de poder usarla
 *   en los navegadores. Cambios en params rompen las pantallas que los consumen.
 */

import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { DrawerScreenProps } from '@react-navigation/drawer';

// ─── Drawer (menú lateral) ────────────────────────────────────────────────────

/**
 * Rutas del Drawer lateral.
 * Cada entrada del drawer envuelve el stack de tabs raíz.
 */
export type DrawerParamList = {
  /** Contenedor de las tabs principales */
  MainTabs: NavigatorScreenParams<TabParamList>;
  /** Módulo de misiones y galería del programa Artemis */
  Artemis: NavigatorScreenParams<ArtemisStackParamList>;
  /** Módulo de sensores (giroscopio + star map) */
  Sensors: undefined;
  /** Módulo de cámara (AR constelaciones) */
  Camera: undefined;
  /** Módulo de animaciones (órbitas planetarias) */
  Animations: undefined;
  /** Módulo de plataforma (diferencias Android/Web/iOS) */
  Platform: undefined;
  /** Módulo de notificaciones astronómicas (DONKI + scheduling) */
  Notifications: NavigatorScreenParams<NotificationsStackParamList>;
};

// ─── Bottom Tabs ──────────────────────────────────────────────────────────────

/**
 * Rutas de la barra de tabs inferior.
 * Cada tab contiene su propio Stack Navigator anidado.
 */
export type TabParamList = {
  /** Tab "Explorar": Home + catálogo solar */
  Explore: NavigatorScreenParams<ExploreStackParamList>;
  /** Tab "ISS": mapa y posición en tiempo real */
  ISS: NavigatorScreenParams<ISSStackParamList>;
  /** Tab "APOD": imagen astronómica del día */
  APOD: NavigatorScreenParams<APODStackParamList>;
  /** Tab "Perfil": autenticación y diario de observaciones */
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// ─── Stack "Explorar" ────────────────────────────────────────────────────────

export type ExploreStackParamList = {
  /** Pantalla principal: catálogo de módulos del showcase */
  Home: undefined;
  /** Catálogo de cuerpos del sistema solar (Fase 2) */
  SolarCatalog: undefined;
  /** Detalle de un cuerpo celeste */
  BodyDetail: { bodyId: string; bodyName: string };
  /** Búsqueda de asteroides por fecha (Fase 3) */
  AsteroidSearch: undefined;
};

// ─── Stack "Artemis" ─────────────────────────────────────────────────────────

export type ArtemisStackParamList = {
  /** Estado de misiones Artemis I, II, III */
  MissionStatus: undefined;
  /** Galería de imágenes NASA del programa Artemis */
  ArtemisGallery: undefined;
};

// ─── Stack "ISS" ─────────────────────────────────────────────────────────────

export type ISSStackParamList = {
  /** Mapa con posición actual de la ISS */
  ISSMap: undefined;
  /** Lista de astronautas en el espacio */
  Astronauts: undefined;
};

// ─── Stack "APOD" ────────────────────────────────────────────────────────────

export type APODStackParamList = {
  /** Imagen astronómica del día con descripción */
  APODDetail: undefined;
  /** Galería de imágenes APOD guardadas (Fase 7 - Storage) */
  APODGallery: undefined;
};

// ─── Stack "Perfil" ──────────────────────────────────────────────────────────

export type ProfileStackParamList = {
  /** Pantalla de autenticación con Supabase */
  Auth: undefined;
  /** Pantalla de registro de nuevo usuario */
  Register: undefined;
  /** Diario personal de observaciones */
  ObservationLog: undefined;
};

// ─── Stack "Notifications" ───────────────────────────────────────────────────

export type NotificationsStackParamList = {
  /** Configuración de alertas astronómicas (solar, ISS, APOD) */
  NotificationSettings: undefined;
};

// ─── Props compuestos por pantalla ───────────────────────────────────────────

/** Props para la pantalla Home dentro del stack Explorar anidado en Tabs → Drawer */
export type HomeScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ExploreStackParamList, 'Home'>,
  CompositeScreenProps<
    BottomTabScreenProps<TabParamList, 'Explore'>,
    DrawerScreenProps<DrawerParamList>
  >
>;

/** Props para la pantalla de detalle de cuerpo celeste */
export type BodyDetailScreenProps = NativeStackScreenProps<
  ExploreStackParamList,
  'BodyDetail'
>;

/** Props para la pantalla del mapa ISS */
export type ISSMapScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ISSStackParamList, 'ISSMap'>,
  CompositeScreenProps<
    BottomTabScreenProps<TabParamList, 'ISS'>,
    DrawerScreenProps<DrawerParamList>
  >
>;

/** Props para la pantalla de tripulantes ISS */
export type AstronautsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ISSStackParamList, 'Astronauts'>,
  CompositeScreenProps<
    BottomTabScreenProps<TabParamList, 'ISS'>,
    DrawerScreenProps<DrawerParamList>
  >
>;

/** Props para la pantalla APOD */
export type APODDetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<APODStackParamList, 'APODDetail'>,
  CompositeScreenProps<
    BottomTabScreenProps<TabParamList, 'APOD'>,
    DrawerScreenProps<DrawerParamList>
  >
>;
