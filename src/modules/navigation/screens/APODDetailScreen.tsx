/**
 * Pantalla placeholder: Imagen Astronómica del Día (APOD).
 *
 * @what Pantalla provisional para la tab APOD hasta que se implemente
 *   el módulo completo de almacenamiento + APOD en Fases 2/7.
 * @why React Navigation requiere un componente registrado por ruta.
 * @impact Será reemplazada por la pantalla real de APOD en Fase 2/7.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { APODDetailScreenProps } from '../types';

/**
 * Pantalla temporal de APOD.
 */
export function APODDetailScreen(_props: APODDetailScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🌌</Text>
      <Text style={styles.title}>Imagen del Día</Text>
      <Text style={styles.subtitle}>Disponible en Fase 2 — Listas / Fase 7 — Storage</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050d24',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  icon: { fontSize: 48 },
  title: { fontSize: 20, fontWeight: '700', color: '#e8eaf6' },
  subtitle: { fontSize: 14, color: '#90a4ae', textAlign: 'center', paddingHorizontal: 32 },
});
