/**
 * Pantalla principal del showcase CosmosRN.
 *
 * @what Muestra el catálogo de los 12 módulos del showcase con nombre,
 *   caso de uso astronómico y estado por plataforma (Android/Web/iOS).
 * @why Es el punto de entrada de la app y referencia del estado de avance
 *   del proyecto; cada ítem guía al usuario hacia la funcionalidad relevante.
 * @impact Consume `MODULE_CATALOG`; cualquier módulo nuevo debe registrarse
 *   allí para aparecer aquí. Esta pantalla no tiene dependencias de red.
 */

import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import type { HomeScreenProps } from '../types';
import { MODULE_CATALOG, type ModuleCatalogItem, type PlatformStatus } from '../moduleCatalog';

// ─── Helpers de presentación ─────────────────────────────────────────────────

/**
 * Convierte el estado de una plataforma a un emoji indicador.
 *
 * @what Mapea `PlatformStatus` a un símbolo visual.
 * @why Permite mostrar de un vistazo el estado de soporte sin texto extenso.
 * @impact Usado en `ModuleCard`; cambios aquí afectan todos los ítems del catálogo.
 *
 * @param status - Estado de la plataforma.
 * @returns Carácter emoji representativo.
 */
function platformBadge(status: PlatformStatus): string {
  switch (status) {
    case 'ready':
      return '✓';
    case 'pending':
      return '○';
    case 'not-applicable':
      return '—';
  }
}

// ─── Componente de tarjeta de módulo ─────────────────────────────────────────

interface ModuleCardProps {
  item: ModuleCatalogItem;
  onPress: (id: string) => void;
}

/**
 * Tarjeta visual para un módulo del catálogo.
 *
 * @what Renderiza el nombre, caso de uso astronómico y estado por plataforma
 *   de un módulo. Si está listo (fase completada), es interactiva.
 * @why Componente atómico que mantiene la lógica de presentación separada
 *   de la lógica de lista en `HomeScreen`.
 * @impact Usado exclusivamente en `HomeScreen` via `FlatList.renderItem`.
 */
function ModuleCard({ item, onPress }: ModuleCardProps) {
  const isReady =
    item.platforms.android === 'ready' ||
    item.platforms.web === 'ready' ||
    item.platforms.ios === 'ready';

  return (
    <TouchableOpacity
      style={[styles.card, isReady && styles.cardReady]}
      onPress={() => onPress(item.id)}
      testID={`module-card-${item.id}`}
      accessibilityRole="button"
      accessibilityLabel={`Módulo ${item.name}, fase ${item.phase}`}
    >
      {/* Indicador de fase */}
      <View style={styles.phaseTag}>
        <Text style={styles.phaseText}>F{item.phase}</Text>
      </View>

      {/* Nombre y descripción */}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardDescription}>{item.astronomicalUseCase}</Text>
      </View>

      {/* Estado por plataforma */}
      <View style={styles.platformRow}>
        <Text style={[styles.platformBadge, item.platforms.android === 'ready' && styles.badgeReady]}>
          {platformBadge(item.platforms.android)} Android
        </Text>
        <Text style={[styles.platformBadge, item.platforms.web === 'ready' && styles.badgeReady]}>
          {platformBadge(item.platforms.web)} Web
        </Text>
        <Text style={[styles.platformBadge, item.platforms.ios === 'ready' && styles.badgeReady]}>
          {platformBadge(item.platforms.ios)} iOS
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────

/**
 * Pantalla Home — catálogo de módulos del showcase CosmosRN.
 *
 * @what Lista todos los módulos del showcase con estado de plataforma.
 *   Permite navegar a los módulos ya implementados.
 * @why Sirve como índice del proyecto y referencia de progreso académico;
 *   el usuario puede explorar qué funcionalidades están disponibles.
 * @impact Pantalla raíz del stack Explorar; es la primera en renderizarse
 *   después del splash screen.
 */
export function HomeScreen({ navigation }: HomeScreenProps) {
  /**
   * Maneja el tap en un ítem del catálogo.
   * Solo navega si el módulo tiene alguna plataforma en estado `ready`.
   *
   * @param moduleId - ID del módulo seleccionado.
   */
  function handleModulePress(moduleId: string) {
    switch (moduleId) {
      // ── Stack Explorar (mismo stack que Home) ─────────────────────────────
      case 'lists':
        navigation.navigate('SolarCatalog');
        break;
      case 'forms':
        navigation.navigate('AsteroidSearch');
        break;
      // ── Tabs inferiores ───────────────────────────────────────────────────
      case 'maps':
        // NavigatorScreenParams requiere la forma objeto en navigate cross-tab
        navigation.navigate({ name: 'ISS', params: { screen: 'ISSMap' } });
        break;
      case 'storage':
        navigation.navigate({ name: 'APOD', params: { screen: 'APODDetail' } });
        break;
      case 'auth':
        navigation.navigate({ name: 'Profile', params: { screen: 'Auth' } });
        break;
      // ── Drawer lateral ────────────────────────────────────────────────────
      case 'animations':
        navigation.navigate('Animations');
        break;
      case 'sensors':
        navigation.navigate('Sensors');
        break;
      case 'camera':
        navigation.navigate('Camera');
        break;
      case 'platform':
        navigation.navigate('Platform');
        break;
      case 'notifications':
        // NavigatorScreenParams requiere la forma objeto en navigate cross-drawer
        navigation.navigate({ name: 'Notifications', params: { screen: 'NotificationSettings' } });
        break;
      case 'artemis':
        navigation.navigate({ name: 'Artemis', params: { screen: 'MissionStatus' } });
        break;
      // ── Módulos pendientes o sin pantalla propia ───────────────────────────
      default:
        break;
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Cabecera */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CosmosRN</Text>
        <Text style={styles.headerSubtitle}>Showcase de React Native con astronomía</Text>
      </View>

      {/* Catálogo de módulos */}
      <FlatList
        data={MODULE_CATALOG}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ModuleCard item={item} onPress={handleModulePress} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={MODULE_CATALOG.length}
      />
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

/** Paleta cromática inspirada en el cosmos oscuro */
const colors = {
  background: '#050d24',
  surface: '#0d1b3e',
  surfaceReady: '#0d2a1e',
  primary: '#4fc3f7',
  success: '#66bb6a',
  textPrimary: '#e8eaf6',
  textSecondary: '#90a4ae',
  phase: '#37474f',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 195, 247, 0.15)',
  },
  cardReady: {
    backgroundColor: colors.surfaceReady,
    borderColor: 'rgba(102, 187, 106, 0.35)',
  },
  phaseTag: {
    position: 'absolute',
    top: 10,
    right: 12,
    backgroundColor: colors.phase,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  phaseText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  cardContent: {
    marginRight: 48,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  platformRow: {
    flexDirection: 'row',
    gap: 12,
  },
  platformBadge: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  badgeReady: {
    color: colors.success,
  },
});
