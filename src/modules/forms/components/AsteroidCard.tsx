/**
 * Componente `AsteroidCard` — tarjeta de resultado para un asteroide NeoWs.
 *
 * @what Renderiza los datos relevantes de un `FlatAsteroid`: nombre, fecha de
 *   aproximación, velocidad de acercamiento, distancia mínima y badge PHA
 *   (Potentially Hazardous Asteroid) con color de alerta cuando aplica.
 * @why La pantalla `AsteroidSearchScreen` usa FlatList; necesita un componente
 *   de ítem reutilizable que muestre los datos científicos de forma clara.
 * @impact Cualquier cambio en `FlatAsteroid` (de `useNeoWs`) puede requerir
 *   actualizar el renderizado de este componente y sus snapshots.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import type { FlatAsteroid } from '../hooks/useNeoWs';

// ─── Props ────────────────────────────────────────────────────────────────────

interface AsteroidCardProps {
  /** Datos del asteroide a renderizar */
  asteroid: FlatAsteroid;
  /** testID opcional para tests de integración */
  testID?: string;
}

// ─── Helpers exportados ────────────────────────────────────────────────────────

/**
 * Formatea una velocidad en km/h a texto legible con separador de miles.
 *
 * @what Convierte el string de velocidad de la API a número formateado.
 * @why La API devuelve velocidades como string con decimales; el usuario
 *   necesita verlo como número entero con separador de miles.
 * @impact Usado en `AsteroidCard` y exportado para tests unitarios.
 *
 * @param kph - Velocidad en km/h como string (formato de la API)
 * @returns String formateado, ej. "45.230 km/h"
 */
export function formatVelocity(kph: string): string {
  const num = parseFloat(kph);
  return `${Math.round(num).toLocaleString('es-ES')} km/h`;
}

/**
 * Formatea una distancia en kilómetros a texto legible.
 *
 * @what Convierte el string de distancia de la API a número formateado.
 * @why Presentar distancias con separadores de miles facilita la lectura.
 * @impact Usado en `AsteroidCard` y exportado para tests unitarios.
 *
 * @param km - Distancia en km como string (formato de la API)
 * @returns String formateado, ej. "1.234.567 km"
 */
export function formatDistance(km: string): string {
  const num = parseFloat(km);
  return `${Math.round(num).toLocaleString('es-ES')} km`;
}

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Tarjeta de información de un asteroide cercano a la Tierra.
 */
export function AsteroidCard({ asteroid, testID }: AsteroidCardProps) {
  const approach = asteroid.close_approach_data[0];
  const isPHA = asteroid.is_potentially_hazardous_asteroid;

  /** Abre la ficha del asteroide en la web de NASA JPL */
  function handleOpenJPL() {
    Linking.openURL(asteroid.nasa_jpl_url).catch(() => {
      // URL inaccesible — se ignora silenciosamente en el componente
    });
  }

  return (
    <TouchableOpacity
      testID={testID ?? `asteroid-card-${asteroid.id}`}
      style={[styles.card, isPHA && styles.cardPHA]}
      onPress={handleOpenJPL}
      accessibilityRole="button"
      accessibilityLabel={`${asteroid.name}, asteroide ${isPHA ? 'potencialmente peligroso' : 'no peligroso'}`}
    >
      {/* Cabecera: nombre + badge PHA */}
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1} testID="asteroid-name">
          {asteroid.name}
        </Text>
        {isPHA && (
          <View style={styles.phaBadge} testID="pha-badge">
            <Text style={styles.phaText}>⚠ PHA</Text>
          </View>
        )}
      </View>

      {/* Fecha de aproximación */}
      <Text style={styles.date} testID="asteroid-date">
        {asteroid.approachDate}
      </Text>

      {/* Datos orbitales */}
      {approach && (
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Velocidad</Text>
            <Text style={styles.statValue} testID="asteroid-velocity">
              {formatVelocity(approach.relative_velocity.kilometers_per_hour)}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Distancia mínima</Text>
            <Text style={styles.statValue} testID="asteroid-distance">
              {formatDistance(approach.miss_distance.kilometers)}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Magnitud</Text>
            <Text style={styles.statValue} testID="asteroid-magnitude">
              {asteroid.absolute_magnitude_h.toFixed(1)} H
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4a9eff',
  },
  cardPHA: {
    borderLeftColor: '#ff6b6b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    marginRight: 8,
  },
  phaBadge: {
    backgroundColor: '#ff6b6b',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  phaText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  date: {
    fontSize: 12,
    color: '#8888aa',
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#8888aa',
    marginBottom: 2,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e0e0f0',
    textAlign: 'center',
  },
});
