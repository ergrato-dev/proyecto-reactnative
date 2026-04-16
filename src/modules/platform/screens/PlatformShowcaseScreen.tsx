import React, { useState } from 'react';
import {
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { DrawerScreenProps } from '@react-navigation/drawer';

import { CATEGORY_LABELS, PlatformDifference } from '../data/differences';
import { DifferenceCard } from '../components/DifferenceCard';
import { usePlatformCapabilities } from '../hooks/usePlatformCapabilities';
import type { DrawerParamList } from '@/modules/navigation/types';

/**
 * @what Pantalla de showcase de diferencias entre plataformas Android, Web e iOS.
 * @why Demuestra cómo React Native trata de forma diferente APIs nativas según
 *   el sistema operativo y cómo el código debe adaptarse (Platform.OS,
 *   archivos .android/.ios.tsx, etc.).
 * @impact Consume `usePlatformCapabilities` para breakpoints responsivos.
 *   La pantalla es standalone: no requiere APIs externas ni Supabase.
 */

type Props = DrawerScreenProps<DrawerParamList, 'Platform'>;

/** Categorías disponibles como filtros (undefined = todas) */
type CategoryFilter = PlatformDifference['category'] | undefined;

/** Plataforma activa con ícono */
const PLATFORM_DISPLAY: Record<string, { label: string; icon: string }> = {
  android: { label: 'Android', icon: '🤖' },
  web: { label: 'Web', icon: '🌐' },
  ios: { label: 'iOS', icon: '🍎' },
};

export function PlatformShowcaseScreen(_props: Props) {
  const { currentPlatform, breakpoint, windowWidth, getDifferencesByCategory } =
    usePlatformCapabilities();

  const [activeFilter, setActiveFilter] = useState<CategoryFilter>(undefined);

  const categories = Object.keys(CATEGORY_LABELS) as PlatformDifference['category'][];
  const filteredDifferences = getDifferencesByCategory(activeFilter);
  const platformDisplay = PLATFORM_DISPLAY[currentPlatform];

  return (
    <SafeAreaView style={styles.safeArea} testID="platform-screen">
      <FlatList
        data={filteredDifferences}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.content,
          breakpoint === 'desktop' && styles.contentWide,
        ]}
        ListHeaderComponent={
          <View>
            {/* Encabezado */}
            <Text style={styles.title}>Diferencias de Plataforma</Text>
            <Text style={styles.subtitle}>
              Comparativa Android · Web · iOS en React Native
            </Text>

            {/* Plataforma activa */}
            <View style={styles.activePlatformBadge} testID="active-platform-badge">
              <Text style={styles.activePlatformText}>
                {platformDisplay.icon} Ejecutando en:{' '}
                <Text style={styles.activePlatformName}>{platformDisplay.label}</Text>
              </Text>
              <Text style={styles.breakpointText}>
                Breakpoint: {breakpoint} ({Math.round(windowWidth)}px)
              </Text>
            </View>

            {/* Info de Platform.OS */}
            <View style={styles.platformOsBox} testID="platform-os-info">
              <Text style={styles.platformOsLabel}>Platform.OS en tiempo real:</Text>
              <Text style={styles.platformOsValue}>
                {`Platform.OS === '${Platform.OS}'`}
              </Text>
              {Platform.OS === 'android' && (
                <Text style={styles.platformOsDetail}>
                  API Level: {Platform.Version}
                </Text>
              )}
              {Platform.OS === 'ios' && (
                <Text style={styles.platformOsDetail}>
                  iOS {Platform.Version}
                </Text>
              )}
            </View>

            {/* Filtros por categoría */}
            <Text style={styles.filterLabel}>Filtrar por categoría:</Text>
            <View style={styles.filters}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  activeFilter === undefined && styles.filterChipActive,
                ]}
                onPress={() => setActiveFilter(undefined)}
                testID="filter-all"
              >
                <Text
                  style={[
                    styles.filterChipText,
                    activeFilter === undefined && styles.filterChipTextActive,
                  ]}
                >
                  Todas
                </Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.filterChip,
                    activeFilter === cat && styles.filterChipActive,
                  ]}
                  onPress={() => setActiveFilter((prev) => (prev === cat ? undefined : cat))}
                  testID={`filter-${cat}`}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      activeFilter === cat && styles.filterChipTextActive,
                    ]}
                  >
                    {CATEGORY_LABELS[cat]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.countLabel}>
              {filteredDifferences.length} diferencia
              {filteredDifferences.length !== 1 ? 's' : ''}
              {activeFilter ? ` en "${CATEGORY_LABELS[activeFilter]}"` : ' en total'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <DifferenceCard difference={item} activePlatform={currentPlatform} />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A1A',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  contentWide: {
    // En desktop/tablet ampliar el padding para mejor lectura
    paddingHorizontal: 40,
    maxWidth: 960,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E8E8FF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8888AA',
    marginBottom: 16,
  },
  activePlatformBadge: {
    backgroundColor: '#0D2A3A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4FC3F7',
  },
  activePlatformText: {
    fontSize: 15,
    color: '#C8E8FF',
    marginBottom: 4,
  },
  activePlatformName: {
    fontWeight: '700',
    color: '#4FC3F7',
  },
  breakpointText: {
    fontSize: 12,
    color: '#7799AA',
  },
  platformOsBox: {
    backgroundColor: '#0A0A18',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  platformOsLabel: {
    fontSize: 12,
    color: '#7777AA',
    marginBottom: 4,
  },
  platformOsValue: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#88DDAA',
  },
  platformOsDetail: {
    fontSize: 12,
    color: '#7799AA',
    marginTop: 4,
  },
  filterLabel: {
    fontSize: 13,
    color: '#7777AA',
    marginBottom: 8,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  filterChipActive: {
    backgroundColor: '#0D2A3A',
    borderColor: '#4FC3F7',
  },
  filterChipText: {
    fontSize: 13,
    color: '#7777AA',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#4FC3F7',
    fontWeight: '700',
  },
  countLabel: {
    fontSize: 13,
    color: '#555577',
    marginBottom: 16,
  },
});
