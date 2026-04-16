/**
 * Stack Navigator de la tab "ISS".
 *
 * @what Define el flujo de navegación dentro de la tab ISS:
 *   ISSMapScreen → AstronautsScreen.
 * @why Encapsula el stack de ISS con las pantallas reales implementadas
 *   en el módulo `maps/` (Fase 5).
 * @impact Rutas corresponden a `ISSStackParamList`. Cambiar los nombres
 *   de pantalla requiere actualizar `ISSStackParamList` en `types.ts`.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ISSStackParamList } from '../types';
import { ISSMapScreen } from '@/modules/maps';
import { AstronautsScreen } from '@/modules/maps';

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
