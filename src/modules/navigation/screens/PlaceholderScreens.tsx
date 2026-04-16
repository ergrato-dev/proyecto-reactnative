/**
 * Pantallas placeholder: Catálogo Solar y Búsqueda de Asteroides.
 *
 * @what Pantallas provisionales para los stacks de la tab Explorar que se
 *   implementarán en las Fases 2 (lists) y 3 (forms).
 * @why React Navigation requiere un componente por cada ruta declarada en
 *   los ParamList; estos placeholders evitan errores de tipo en tiempo de build.
 * @impact Serán reemplazados en Fases 2 y 3 respectivamente.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Pantalla temporal del catálogo del sistema solar.
 */
export function SolarCatalogScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🪐</Text>
      <Text style={styles.title}>Catálogo Solar</Text>
      <Text style={styles.subtitle}>Disponible en Fase 2 — Listas</Text>
    </View>
  );
}

/**
 * Pantalla temporal de búsqueda de asteroides.
 */
export function AsteroidSearchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>☄️</Text>
      <Text style={styles.title}>Búsqueda de Asteroides</Text>
      <Text style={styles.subtitle}>Disponible en Fase 3 — Formularios</Text>
    </View>
  );
}

/**
 * Pantalla temporal de detalle de cuerpo celeste.
 */
export function BodyDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🌍</Text>
      <Text style={styles.title}>Detalle de Cuerpo Celeste</Text>
      <Text style={styles.subtitle}>Disponible en Fase 2 — Listas</Text>
    </View>
  );
}

/**
 * Pantalla temporal de diario de observaciones.
 */
export function ObservationLogScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📓</Text>
      <Text style={styles.title}>Diario de Observaciones</Text>
      <Text style={styles.subtitle}>Disponible en Fase 10 — Autenticación</Text>
    </View>
  );
}

/**
 * Pantalla temporal de galería APOD.
 */
export function APODGalleryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🖼️</Text>
      <Text style={styles.title}>Galería APOD</Text>
      <Text style={styles.subtitle}>Disponible en Fase 7 — Storage</Text>
    </View>
  );
}

/**
 * Pantalla temporal de astronautas en el espacio.
 */
export function AstronautsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>👨‍🚀</Text>
      <Text style={styles.title}>Astronautas en el Espacio</Text>
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
  subtitle: { fontSize: 14, color: '#90a4ae', textAlign: 'center', paddingHorizontal: 32 },
});
