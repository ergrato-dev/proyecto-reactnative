/**
 * Drawer Navigator — menú lateral de CosmosRN.
 *
 * @what Define el menú lateral que envuelve toda la app. Contiene las tabs
 *   principales y acceso directo a módulos de demostración (sensores, cámara,
 *   animaciones, diferencias de plataforma).
 * @why El Drawer permite acceder a módulos que no encajan en las tabs (ej.:
 *   sensores, cámara AR) sin sobrecargar la barra inferior.
 * @impact Es el navegador raíz de la app; su `linking` config define el
 *   deep linking con el scheme `cosmosrn://`.
 */

import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, StyleSheet } from 'react-native';
import type { DrawerParamList } from '../types';
import { MainTabNavigator } from './MainTabNavigator';
import { ArtemisStack } from './ArtemisStack';
import { NotificationsStack } from './NotificationsStack';

const Drawer = createDrawerNavigator<DrawerParamList>();

// ─── Pantallas placeholder del Drawer ────────────────────────────────────────

/** Pantalla temporal para el módulo de sensores */
function SensorsScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.icon}>🔄</Text>
      <Text style={styles.title}>Sensores</Text>
      <Text style={styles.subtitle}>Giroscopio + Star Map — Fase 9</Text>
    </View>
  );
}

/** Pantalla temporal para el módulo de cámara */
function CameraScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.icon}>📷</Text>
      <Text style={styles.title}>Cámara AR</Text>
      <Text style={styles.subtitle}>Constelaciones en AR — Fase 5</Text>
    </View>
  );
}

/** Pantalla temporal para el módulo de animaciones */
function AnimationsScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.icon}>🌀</Text>
      <Text style={styles.title}>Animaciones</Text>
      <Text style={styles.subtitle}>Órbitas Planetarias — Fase 4</Text>
    </View>
  );
}

/** Pantalla temporal para diferencias de plataforma */
function PlatformScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.icon}>📱</Text>
      <Text style={styles.title}>Plataforma</Text>
      <Text style={styles.subtitle}>Android / Web / iOS — Fase 12</Text>
    </View>
  );
}

// ─── Navegador raíz ───────────────────────────────────────────────────────────

/**
 * Navegador Drawer raíz de CosmosRN.
 * Envuelve el MainTabNavigator y añade acceso a módulos adicionales.
 */
export function RootDrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#050d24' },
        headerTintColor: '#4fc3f7',
        headerTitleStyle: { fontWeight: '700' },
        drawerStyle: { backgroundColor: '#0d1b3e' },
        drawerActiveTintColor: '#4fc3f7',
        drawerInactiveTintColor: '#90a4ae',
        drawerLabelStyle: { fontWeight: '600' },
        sceneStyle: { backgroundColor: '#050d24' },
      }}
    >
      {/* Tabs principales — sin cabecera propia (la gestionan los stacks) */}
      <Drawer.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ title: 'CosmosRN', headerShown: false }}
      />
      {/* Módulo Artemis: misiones y galería de imágenes NASA */}
      <Drawer.Screen
        name="Artemis"
        component={ArtemisStack}
        options={{ title: '🌙 Programa Artemis', headerShown: false }}
      />
      {/* Módulos adicionales accesibles desde el drawer */}
      <Drawer.Screen
        name="Animations"
        component={AnimationsScreen}
        options={{ title: '🌀 Animaciones' }}
      />
      <Drawer.Screen
        name="Sensors"
        component={SensorsScreen}
        options={{ title: '🔄 Sensores' }}
      />
      <Drawer.Screen
        name="Camera"
        component={CameraScreen}
        options={{ title: '📷 Cámara AR' }}
      />
      <Drawer.Screen
        name="Platform"
        component={PlatformScreen}
        options={{ title: '📱 Plataforma' }}
      />
      {/* Módulo Notificaciones: alertas solares y scheduling local */}
      <Drawer.Screen
        name="Notifications"
        component={NotificationsStack}
        options={{ title: '⚡ Alertas Astronómicas', headerShown: false }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholder: {
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
