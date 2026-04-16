/**
 * Pantalla de tripulantes actuales en el espacio.
 *
 * @what Lista el nombre y la nave de cada persona actualmente a bordo
 *   de la ISS u otras plataformas espaciales, usando datos de Open-Notify.
 * @why Complementa el mapa ISS del módulo `maps/` con información humana:
 *   quién está en el espacio ahora mismo y en qué nave viaja.
 * @impact Depende de `useAstronauts`. Cambios en `Astronaut` de `issClient`
 *   rompen la pantalla. No requiere permisos especiales.
 */

import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import type { AstronautsScreenProps } from '@/modules/navigation/types';
import { useAstronauts } from '../hooks/useAstronauts';
import type { Astronaut } from '../hooks/useAstronauts';

// ─── Componente de elemento de lista ─────────────────────────────────────────

/**
 * Tarjeta de un tripulante individual.
 *
 * @what Renderiza nombre, nave y un ícono según el tipo de nave.
 * @why Separa la presentación de cada tripulante del layout de la lista
 *   para facilitar el test unitario del componente de ítem.
 * @impact Solo se usa en `AstronautsScreen`. Cambiar `Astronaut.craft`
 *   puede requerir actualizar la lógica de ícono.
 *
 * @param props - Datos del tripulante
 */
function AstronautCard({ item }: { item: Astronaut }) {
  /**
   * Elige un ícono según el nombre de la nave.
   *
   * @what Devuelve un emoji representativo para ISS, Shenzhou o nave genérica.
   * @why Añade contexto visual rápido sin necesidad de imágenes externas.
   * @impact Puramente cosmético; no afecta funcionalidad ni tests de lógica.
   *
   * @param craft - Nombre de la nave espacial
   * @returns Emoji representativo
   */
  function craftIcon(craft: string): string {
    if (craft.toLowerCase().includes('iss')) return '🛰️';
    if (craft.toLowerCase().includes('shenzhou')) return '🚀';
    return '🛸';
  }

  return (
    <View style={cardStyles.container} testID={`astronaut-card-${item.name.replace(/\s+/g, '-')}`}>
      <Text style={cardStyles.icon}>{craftIcon(item.craft)}</Text>
      <View style={cardStyles.info}>
        <Text style={cardStyles.name}>{item.name}</Text>
        <Text style={cardStyles.craft}>{item.craft}</Text>
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d1b3e',
    borderRadius: 8,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1a237e',
    gap: 12,
  },
  icon: {
    fontSize: 28,
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#e8eaf6',
    fontSize: 16,
    fontWeight: '600',
  },
  craft: {
    color: '#4fc3f7',
    fontSize: 13,
    marginTop: 2,
  },
});

// ─── Pantalla ─────────────────────────────────────────────────────────────────

/**
 * Pantalla que muestra la lista de personas actualmente en el espacio.
 *
 * @what Renderiza un `FlatList` de tripulantes con su nombre y nave,
 *   incluyendo un encabezado con el conteo total.
 * @why Es la pantalla secundaria del módulo ISS; accesible desde `ISSMapScreen`
 *   via el botón "Ver tripulación".
 * @impact Consume `useAstronauts`. El tipo `AstronautsScreenProps` debe estar
 *   definido en `navigation/types.ts`.
 */
export function AstronautsScreen(_props: AstronautsScreenProps) {
  const { astronauts, count, isLoading, isError } = useAstronauts();

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]} testID="loading-view">
        <ActivityIndicator size="large" color="#4fc3f7" />
        <Text style={styles.loadingText}>Consultando la tripulación…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, styles.centered]} testID="error-view">
        <Text style={styles.errorText}>No se pudo obtener la tripulación</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="astronauts-screen">
      <FlatList
        data={astronauts}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => <AstronautCard item={item} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Personas en el Espacio</Text>
            <Text style={styles.headerCount} testID="astronaut-count">
              {count} {count === 1 ? 'persona' : 'personas'} actualmente
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        testID="astronauts-list"
      />
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050d24',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  header: {
    padding: 24,
    paddingBottom: 12,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#4fc3f7',
    fontSize: 20,
    fontWeight: '700',
  },
  headerCount: {
    color: '#90a4ae',
    fontSize: 14,
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 32,
  },
  loadingText: {
    color: '#90a4ae',
    fontSize: 14,
  },
  errorText: {
    color: '#ef9a9a',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
