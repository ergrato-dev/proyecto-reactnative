/**
 * Pantalla placeholder: Mapa de la ISS.
 *
 * @what Pantalla provisional que ocupará la tab ISS hasta que se implemente
 *   el módulo completo en Fase 6 (maps/).
 * @why React Navigation requiere al menos un componente registrado por ruta;
 *   esta pantalla previene errores hasta que la Fase 6 esté completa.
 * @impact Será reemplazada por el mapa real en Fase 6.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ISSMapScreenProps } from '../types';

/**
 * Pantalla temporal del mapa ISS.
 */
export function ISSMapScreen(_props: ISSMapScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🛰️</Text>
      <Text style={styles.title}>ISS en Tiempo Real</Text>
      <Text style={styles.subtitle}>Disponible en Fase 6 — Mapas</Text>
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
  subtitle: { fontSize: 14, color: '#90a4ae' },
});
