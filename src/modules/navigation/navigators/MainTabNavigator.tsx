/**
 * Bottom Tab Navigator — barra de tabs inferior de CosmosRN.
 *
 * @what Define las 4 tabs principales: Explorar, ISS, APOD y Perfil.
 *   Cada tab contiene su propio Stack Navigator anidado.
 * @why Las tabs permiten al usuario cambiar de contexto (sistema solar,
 *   ISS, imagen del día, perfil) sin perder el estado de cada sección.
 * @impact Envuelto por el DrawerNavigator; cualquier tab nueva requiere
 *   agregar la ruta en `TabParamList` y registrarla aquí.
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import type { TabParamList } from '../types';
import { ExploreStack } from './ExploreStack';
import { ISSStack } from './ISSStack';
import { APODStack } from './APODStack';
import { ProfileStack } from './ProfileStack';

const Tab = createBottomTabNavigator<TabParamList>();

/** Mapa de iconos por tab — texto Unicode hasta que se integre expo-vector-icons en Fase posterior */
const TAB_ICONS: Record<keyof TabParamList, string> = {
  Explore: '🔭',
  ISS: '🛰️',
  APOD: '🌌',
  Profile: '👤',
};

/**
 * Renderiza el icono de una tab como emoji.
 *
 * @param name - Nombre de la tab.
 * @param focused - Si la tab está activa.
 * @returns Elemento Text con el emoji correspondiente.
 */
function TabIcon({ name, focused }: { name: keyof TabParamList; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
      {TAB_ICONS[name]}
    </Text>
  );
}

/**
 * Navegador de tabs inferiores de CosmosRN.
 */
export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0d1b3e',
          borderTopColor: 'rgba(79, 195, 247, 0.2)',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#4fc3f7',
        tabBarInactiveTintColor: '#546e7a',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Explore"
        component={ExploreStack}
        options={{
          title: 'Explorar',
          tabBarIcon: ({ focused }) => <TabIcon name="Explore" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ISS"
        component={ISSStack}
        options={{
          title: 'ISS',
          tabBarIcon: ({ focused }) => <TabIcon name="ISS" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="APOD"
        component={APODStack}
        options={{
          title: 'APOD',
          tabBarIcon: ({ focused }) => <TabIcon name="APOD" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => <TabIcon name="Profile" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}
