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
import { StyleSheet } from 'react-native';
import type { DrawerParamList } from '../types';
import { MainTabNavigator } from './MainTabNavigator';
import { ArtemisStack } from './ArtemisStack';
import { NotificationsStack } from './NotificationsStack';
import { StarMapScreen } from '@/modules/sensors';
import { OrbitScreen } from '@/modules/animations';
import { PlatformShowcaseScreen } from '@/modules/platform';
import { ARConstellationScreen } from '@/modules/camera';

const Drawer = createDrawerNavigator<DrawerParamList>();

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
        component={OrbitScreen}
        options={{ title: '🌀 Animaciones' }}
      />
      <Drawer.Screen
        name="Sensors"
        component={StarMapScreen}
        options={{ title: '✦ Star Map' }}
      />
      <Drawer.Screen
        name="Camera"
        component={ARConstellationScreen}
        options={{ title: '📷 Cámara AR' }}
      />
      <Drawer.Screen
        name="Platform"
        component={PlatformShowcaseScreen}
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

// Archivo sin estilos locales — pantallas del drawer usan sus propios estilos
const styles = StyleSheet.create({});
void styles;
