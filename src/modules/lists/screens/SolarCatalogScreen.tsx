/**
 * Pantalla de catálogo del sistema solar.
 *
 * @what Muestra todos los cuerpos del sistema solar en dos modos alternables:
 *   FlatList (lista plana virtualizada) y SectionList (agrupado por tipo).
 * @why Demuestra las capacidades de virtualización de React Native con un
 *   dataset real de cuerpos celestes (> 300 entradas), incluyendo FlatList
 *   para rendimiento y SectionList para organización por categoría.
 * @impact Consume `useBodyList`; navega a `BodyDetailScreen` al pulsar un cuerpo.
 *   Cambios en `BodyCard` o en la agrupación por tipo se reflejan aquí directamente.
 */

import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ExploreStackParamList } from '@/modules/navigation/types';
import type { SolarBody } from '@/shared/lib/solarSystemClient';
import { useBodyList } from '../hooks/useBodyList';
import { BodyCard } from '../components/BodyCard';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<ExploreStackParamList, 'SolarCatalog'>;

/** Modos de visualización de la lista */
type ViewMode = 'flat' | 'sectioned';

/** Sección para el SectionList */
interface BodySection {
  title: string;
  data: SolarBody[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normaliza el tipo de cuerpo celeste a una categoría en español.
 *
 * @what Convierte el `bodyType` de la API (en inglés) a una de las 5 categorías
 *   usadas para las secciones del SectionList.
 * @why La API devuelve valores inconsistentes (e.g., "Moon", "Natural Satellite");
 *   normalizar garantiza secciones limpias y predecibles.
 * @impact Afecta a la agrupación del SectionList en `SolarCatalogScreen`.
 */
export function normalizeBodyType(body: SolarBody): string {
  if (body.isPlanet) return 'Planeta';
  const type = (body.bodyType ?? '').toLowerCase();
  if (type.includes('dwarf')) return 'Planeta enano';
  if (type === 'moon' || type.includes('satellite') || type.includes('natural')) {
    return 'Satélite';
  }
  if (type === 'asteroid' || type.includes('asteroid')) return 'Asteroide';
  if (type === 'comet' || type.includes('comet')) return 'Cometa';
  return 'Otro';
}

/** Orden de visualización de las secciones */
const SECTION_ORDER = ['Planeta', 'Planeta enano', 'Satélite', 'Asteroide', 'Cometa', 'Otro'];

/**
 * Agrupa los cuerpos celestes en secciones ordenadas por tipo.
 *
 * @what Convierte un array plano de `SolarBody` en secciones para `SectionList`.
 * @why `SectionList` requiere el formato `{ title, data }[]`; esta función
 *   encapsula la lógica de agrupación para mantener `SolarCatalogScreen` limpia.
 * @impact Cambios en el orden o los nombres de secciones afectan a la UI y a los tests.
 *
 * @param bodies - Lista de cuerpos del sistema solar
 */
export function buildSections(bodies: SolarBody[]): BodySection[] {
  const groups: Record<string, SolarBody[]> = {};
  for (const body of bodies) {
    const key = normalizeBodyType(body);
    if (!groups[key]) groups[key] = [];
    groups[key].push(body);
  }
  return SECTION_ORDER.filter((k) => groups[k] && groups[k].length > 0).map((k) => ({
    title: `${k} (${groups[k].length})`,
    data: groups[k],
  }));
}

// ─── Componentes internos ─────────────────────────────────────────────────────

/** Indicador de carga inicial */
function LoadingView() {
  return (
    <View style={styles.centered} testID="loading-view">
      <ActivityIndicator size="large" color="#4fc3f7" />
      <Text style={styles.loadingText}>Cargando catálogo...</Text>
    </View>
  );
}

/** Vista de error con botón de reintento */
function ErrorView({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.centered} testID="error-view">
      <Text style={styles.errorText}>No se pudo cargar el catálogo solar.</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={onRetry}
        testID="retry-button"
        accessibilityLabel="Reintentar carga del catálogo"
        accessibilityRole="button"
      >
        <Text style={styles.retryText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );
}

/** Encabezado de sección para el SectionList */
function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );
}

/** Banner de actualización en segundo plano */
function RefreshBanner() {
  return (
    <View style={styles.refreshBanner} testID="refresh-banner">
      <Text style={styles.refreshText}>Actualizando catálogo...</Text>
    </View>
  );
}

/** Toggle entre modo plano y modo por sección */
function ModeToggle({ mode, onToggle }: { mode: ViewMode; onToggle: (m: ViewMode) => void }) {
  return (
    <View style={styles.modeToggle}>
      <TouchableOpacity
        style={[styles.modeButton, mode === 'sectioned' && styles.modeButtonActive]}
        onPress={() => onToggle('sectioned')}
        testID="toggle-sectioned"
        accessibilityLabel="Vista por tipo"
        accessibilityRole="button"
      >
        <Text style={[styles.modeButtonText, mode === 'sectioned' && styles.modeButtonTextActive]}>
          Por tipo
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.modeButton, mode === 'flat' && styles.modeButtonActive]}
        onPress={() => onToggle('flat')}
        testID="toggle-flat"
        accessibilityLabel="Vista lista plana"
        accessibilityRole="button"
      >
        <Text style={[styles.modeButtonText, mode === 'flat' && styles.modeButtonTextActive]}>
          Lista plana
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Pantalla ─────────────────────────────────────────────────────────────────

/**
 * Pantalla principal del catálogo del sistema solar.
 *
 * @what Muestra todos los cuerpos del sistema solar en FlatList o SectionList
 *   con toggle de modo, indicador de caché y navegación al detalle.
 * @why Demuestra virtualización de listas largas (FlatList) y agrupación por
 *   tipo (SectionList) con datos astronómicos reales.
 * @impact Navega a `BodyDetailScreen` con `bodyId` y `bodyName` al pulsar un cuerpo.
 */
export function SolarCatalogScreen({ navigation }: Props) {
  const { data, isLoading, isError, isFetching, refetch } = useBodyList();
  const [mode, setMode] = useState<ViewMode>('sectioned');

  // Precalcula las secciones solo cuando los datos cambian
  const sections = useMemo(() => (data ? buildSections(data) : []), [data]);

  const handleBodyPress = (body: SolarBody) => {
    navigation.navigate('BodyDetail', {
      bodyId: body.id,
      bodyName: body.englishName || body.name,
    });
  };

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView onRetry={refetch} />;

  const header = (
    <>
      {isFetching && <RefreshBanner />}
      <ModeToggle mode={mode} onToggle={setMode} />
    </>
  );

  if (mode === 'flat') {
    return (
      <FlatList<SolarBody>
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BodyCard body={item} onPress={() => handleBodyPress(item)} />
        )}
        ListHeaderComponent={header}
        // Virtualización: renderiza 20 elementos por lote para listas de > 300 cuerpos
        maxToRenderPerBatch={20}
        windowSize={10}
        removeClippedSubviews
        contentContainerStyle={styles.listContent}
        testID="flat-list"
      />
    );
  }

  return (
    <SectionList<SolarBody, BodySection>
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <BodyCard body={item} onPress={() => handleBodyPress(item)} />
      )}
      renderSectionHeader={({ section }) => <SectionHeader title={section.title} />}
      ListHeaderComponent={header}
      maxToRenderPerBatch={20}
      windowSize={10}
      removeClippedSubviews
      stickySectionHeadersEnabled
      contentContainerStyle={styles.listContent}
      testID="section-list"
    />
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: '#050d24',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#78909c',
    marginTop: 12,
    fontSize: 15,
  },
  errorText: {
    color: '#ef9a9a',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#1565c0',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#e3f2fd',
    fontWeight: '600',
  },
  refreshBanner: {
    backgroundColor: '#1a237e',
    padding: 8,
    alignItems: 'center',
  },
  refreshText: {
    color: '#90caf9',
    fontSize: 12,
  },
  modeToggle: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#0d1f3c',
    borderRadius: 8,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  modeButtonActive: {
    backgroundColor: '#1565c0',
  },
  modeButtonText: {
    color: '#78909c',
    fontSize: 13,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: '#e3f2fd',
  },
  sectionHeader: {
    backgroundColor: '#050d24',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a237e',
  },
  sectionHeaderText: {
    color: '#4fc3f7',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  listContent: {
    paddingBottom: 24,
    backgroundColor: '#050d24',
  },
});
