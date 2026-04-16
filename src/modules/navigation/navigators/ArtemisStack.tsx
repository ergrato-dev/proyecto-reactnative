/**
 * Stack Navigator del módulo "Artemis".
 *
 * @what Define el flujo de navegación dentro del drawer de Artemis:
 *   MissionStatusScreen → ArtemisGalleryScreen.
 * @why Encapsula el stack de Artemis separando su navegación del resto
 *   del Drawer y del stack de tabs principales.
 * @impact Rutas corresponden a `ArtemisStackParamList`. Cambiar nombres
 *   de pantalla requiere actualizar `ArtemisStackParamList` en `types.ts`.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ArtemisStackParamList } from '../types';
import { MissionStatusScreen } from '@/modules/artemis';
import { ArtemisGalleryScreen } from '@/modules/artemis';

const Stack = createNativeStackNavigator<ArtemisStackParamList>();

const screenOptions = {
  headerStyle: { backgroundColor: '#050d1a' },
  headerTintColor: '#7986cb',
  headerTitleStyle: { fontWeight: '700' as const },
  contentStyle: { backgroundColor: '#050d1a' },
};

/**
 * Navegador de pila para la sección "Artemis".
 */
export function ArtemisStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="MissionStatus"
        component={MissionStatusScreen}
        options={{ title: '🌙 Programa Artemis' }}
      />
      <Stack.Screen
        name="ArtemisGallery"
        component={ArtemisGalleryScreen}
        options={{ title: 'Galería Artemis' }}
      />
    </Stack.Navigator>
  );
}
