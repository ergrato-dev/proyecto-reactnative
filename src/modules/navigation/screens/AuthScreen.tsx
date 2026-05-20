/**
 * Pantalla placeholder: Perfil / Autenticación.
 *
 * @what Pantalla provisional para la tab Perfil hasta que se implemente
 *   el módulo de autenticación con Supabase en Fase 10.
 * @why React Navigation requiere un componente registrado por ruta.
 * @impact Será reemplazada por el flujo de auth en Fase 10.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Pantalla temporal de autenticación.
 */
export function AuthScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>👤</Text>
      <Text style={styles.title}>Perfil de Observador</Text>
      <Text style={styles.subtitle}>Disponible en Fase 10 — Autenticación</Text>
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
