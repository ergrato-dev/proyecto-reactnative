/**
 * Stack Navigator de la tab "ISS".
 *
 * @what Define el flujo de navegación dentro de la tab ISS:
 *   ISSMap → Astronauts.
 * @why Encapsula el stack de ISS; en Fase 6 se reemplazarán las pantallas
 *   placeholder por la implementación real del mapa.
 * @impact Rutas corresponden a `ISSStackParamList`.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ISSStackParamList } from '../types';
import { ISSMapScreen } from '../screens/ISSMapScreen';
import { AstronautsScreen } from '../screens/PlaceholderScreens';

const Stack = createNativeStackNavigator<ISSStackParamList>();

const screenOptions = {
  headerStyle: { backgroundColor: '#050d24' },
  headerTintColor: '#4fc3f7',
  headerTitleStyle: { fontWeight: '700' as const },
  contentStyle: { backgroundColor: '#050d24' },
};

/**
 * Navegador de pila para la sección "ISS".
 */
export function ISSStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="ISSMap"
        component={ISSMapScreen}
        options={{ title: 'ISS en Vivo' }}
      />
      <Stack.Screen
        name="Astronauts"
        component={AstronautsScreen}
        options={{ title: 'Astronautas' }}
      />
    </Stack.Navigator>
  );
}
