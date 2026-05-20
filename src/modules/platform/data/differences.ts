/**
 * @what Definición de diferencias de plataforma para el showcase comparativo.
 * @why Centraliza los datos que la pantalla necesita para mostrar las diferencias
 *   entre Android, Web e iOS sin hardcodearlos en el componente.
 * @impact Cambiar este archivo actualiza automáticamente el catálogo de
 *   diferencias en PlatformShowcaseScreen.
 */

import { Platform } from 'react-native';

/** Plataformas soportadas en el showcase */
export type SupportedPlatform = 'android' | 'web' | 'ios';

/** Estado de soporte de una feature por plataforma */
export type SupportLevel = 'full' | 'partial' | 'unavailable';

/** Descripción de una diferencia de plataforma */
export interface PlatformDifference {
  /** Identificador único de la diferencia */
  id: string;
  /** Título descriptivo */
  title: string;
  /** Descripción breve del aspecto que varía */
  description: string;
  /** Categoría para agrupar en la pantalla */
  category: 'permissions' | 'ui' | 'sensors' | 'storage' | 'navigation' | 'network';
  /** Estado de soporte por plataforma */
  support: Record<SupportedPlatform, SupportLevel>;
  /** Snippet de código representativo (TypeScript) */
  codeSnippet: string;
  /** Nota específica por plataforma cuando aplica */
  notes?: Partial<Record<SupportedPlatform, string>>;
}

/** Etiquetas legibles para las categorías */
export const CATEGORY_LABELS: Record<PlatformDifference['category'], string> = {
  permissions: 'Permisos',
  ui: 'Interfaz de usuario',
  sensors: 'Sensores',
  storage: 'Almacenamiento',
  navigation: 'Navegación',
  network: 'Red',
};

/** Emoji por nivel de soporte */
export const SUPPORT_ICON: Record<SupportLevel, string> = {
  full: '✅',
  partial: '🟡',
  unavailable: '❌',
};

/**
 * Catálogo de diferencias de plataforma documentadas en el showcase.
 * Ordenadas por categoría y relevancia pedagógica.
 */
export const PLATFORM_DIFFERENCES: PlatformDifference[] = [
  // ─── Permisos ────────────────────────────────────────────────────────────
  {
    id: 'camera-permission',
    title: 'Permiso de cámara',
    description: 'Flujo de solicitud de permisos difiere entre plataformas.',
    category: 'permissions',
    support: { android: 'full', web: 'partial', ios: 'full' },
    codeSnippet: `import { Camera } from 'expo-camera';

const { status } = await Camera.requestCameraPermissionsAsync();
// Android: aparece dialog del sistema en primer uso
// iOS: dialog + requiere entrada en Info.plist
// Web: browser prompt nativo (no expo-camera)`,
    notes: {
      web: 'Solo disponible en navegadores con HTTPS',
      ios: 'Requiere NSCameraUsageDescription en Info.plist',
    },
  },
  {
    id: 'location-permission',
    title: 'Permiso de localización',
    description: 'Niveles de precisión y granularidad de permisos varían.',
    category: 'permissions',
    support: { android: 'full', web: 'partial', ios: 'full' },
    codeSnippet: `import * as Location from 'expo-location';

// Android distingue FINE vs COARSE location
// iOS: whenInUse vs always
const { status } = await Location.requestForegroundPermissionsAsync();`,
    notes: {
      android: 'Android 12+ requiere permisos granulares adicionales',
      web: 'Geolocation API estándar, sin foreground/background',
    },
  },
  // ─── Interfaz de usuario ─────────────────────────────────────────────────
  {
    id: 'action-sheet',
    title: 'ActionSheet / BottomSheet',
    description: 'Menú de opciones contextual: nativo en iOS, custom en Android y Web.',
    category: 'ui',
    support: { android: 'partial', web: 'partial', ios: 'full' },
    codeSnippet: `import { Platform, ActionSheetIOS, Alert } from 'react-native';

if (Platform.OS === 'ios') {
  ActionSheetIOS.showActionSheetWithOptions(
    { options: ['Cancelar', 'Eliminar'], cancelButtonIndex: 0 },
    (idx) => { if (idx === 1) deleteItem(); }
  );
} else {
  // Android/Web: Alert o librería custom (BottomSheet)
  Alert.alert('Opciones', '', [{ text: 'Eliminar', onPress: deleteItem }]);
}`,
    notes: {
      ios: 'ActionSheetIOS: nativo del sistema, animación incluida',
      android: 'No existe ActionSheet nativo; se usa Alert o @gorhom/bottom-sheet',
      web: 'Solo Alert de browser; no hay hoja modal nativa',
    },
  },
  {
    id: 'haptics',
    title: 'Retroalimentación háptica',
    description: 'Vibración y haptics disponibles solo en dispositivos físicos.',
    category: 'ui',
    support: { android: 'full', web: 'unavailable', ios: 'full' },
    codeSnippet: `import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

if (Platform.OS !== 'web') {
  // ImpactFeedback solo en iOS; en Android usa vibración
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}`,
    notes: {
      web: 'Vibration API experimental, soporte muy limitado en navegadores',
    },
  },
  {
    id: 'safe-area',
    title: 'Safe Area / Notch',
    description: 'Gestión del espacio alrededor de notch y barras del sistema.',
    category: 'ui',
    support: { android: 'full', web: 'partial', ios: 'full' },
    codeSnippet: `import { SafeAreaView } from 'react-native-safe-area-context';

// SafeAreaView aplica insets automáticamente en iOS y Android
// En Web el comportamiento depende del navegador/dispositivo
export function MyScreen() {
  return <SafeAreaView edges={['top', 'bottom']}>...</SafeAreaView>;
}`,
    notes: {
      ios: 'Esencial para iPhone X+ (Dynamic Island, notch)',
      android: 'Necesario desde Android 10 con display cutout',
      web: 'env(safe-area-inset-*) para PWA en móvil',
    },
  },
  {
    id: 'responsive-layout',
    title: 'Layout responsivo',
    description: 'Adaptación de layout de 320px (móvil) a 1440px (escritorio).',
    category: 'ui',
    support: { android: 'full', web: 'full', ios: 'full' },
    codeSnippet: `import { useWindowDimensions } from 'react-native';

function useBreakpoint() {
  const { width } = useWindowDimensions();
  if (width < 600) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}`,
    notes: {
      web: 'En web también aplican media queries CSS vía StyleSheet',
    },
  },
  // ─── Sensores ─────────────────────────────────────────────────────────────
  {
    id: 'gyroscope',
    title: 'Giroscopio',
    description: 'Sensor de orientación 3D: disponible en nativo, no en web.',
    category: 'sensors',
    support: { android: 'full', web: 'unavailable', ios: 'full' },
    codeSnippet: `import { Gyroscope } from 'expo-sensors';

const available = await Gyroscope.isAvailableAsync();
if (available) {
  Gyroscope.addListener(({ x, y, z }) => {
    // Rotar star map con datos del sensor
  });
}`,
    notes: {
      web: 'DeviceOrientationEvent disponible pero requiere permiso iOS Safari',
    },
  },
  // ─── Almacenamiento ────────────────────────────────────────────────────────
  {
    id: 'secure-storage',
    title: 'Almacenamiento seguro',
    description: 'Cifrado de datos sensibles (tokens de sesión) varía por plataforma.',
    category: 'storage',
    support: { android: 'full', web: 'partial', ios: 'full' },
    codeSnippet: `import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// En web, SecureStore usa localStorage (sin cifrado real)
if (Platform.OS !== 'web') {
  await SecureStore.setItemAsync('token', userToken);
} else {
  // Web: usar sessionStorage o cookie httpOnly en el servidor
  sessionStorage.setItem('token', userToken);
}`,
    notes: {
      android: 'Usa Android Keystore System',
      ios: 'Usa iOS Keychain Services',
      web: 'SecureStore en web = localStorage; NO usar para datos críticos',
    },
  },
];

/**
 * Devuelve la plataforma actual detectada en tiempo de ejecución.
 * @what Wrapper tipado sobre `Platform.OS` para el showcase.
 * @why Permite mostrar qué plataforma está activa al usuario.
 * @impact Solo informativo; no afecta funcionalidad.
 */
export function getCurrentPlatform(): SupportedPlatform {
  switch (Platform.OS) {
    case 'android':
      return 'android';
    case 'ios':
      return 'ios';
    default:
      return 'web';
  }
}
