/**
 * Pantallas placeholder pendientes de implementación.
 *
 * @what Pantallas provisionales para las rutas del stack Explorar y del stack
 *   Perfil/ISS que se implementarán en fases posteriores.
 * @why React Navigation requiere un componente por cada ruta declarada en
 *   los ParamList; estos placeholders evitan errores de tipo en tiempo de build.
 * @impact `SolarCatalogScreen` y `BodyDetailScreen` fueron movidas al módulo
 *   `lists/` en Fase 2; `AsteroidSearchScreen` fue movida al módulo `forms/`
 *   en Fase 3; `APODGalleryScreen` fue movida al módulo `storage/` en Fase 4.
 *   Las pantallas restantes se implementarán en fases posteriores.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
