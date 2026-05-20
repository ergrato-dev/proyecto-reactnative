/**
 * Stack Navigator de la tab "APOD".
 *
 * @what Define el flujo de navegación dentro de la tab APOD:
 *   APODDetail → APODGallery.
 * @why Encapsula el stack de APOD; en Fases 2/7 se reemplazarán las pantallas
 *   placeholder por la implementación real.
 * @impact Rutas corresponden a `APODStackParamList`.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { APODStackParamList } from '../types';
import { APODDetailScreen, APODGalleryScreen } from '@/modules/storage';

const Stack = createNativeStackNavigator<APODStackParamList>();

const screenOptions = {
  headerStyle: { backgroundColor: '#050d24' },
  headerTintColor: '#4fc3f7',
  headerTitleStyle: { fontWeight: '700' as const },
  contentStyle: { backgroundColor: '#050d24' },
};

/**
 * Navegador de pila para la sección "APOD".
 */
export function APODStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="APODDetail"
        component={APODDetailScreen}
        options={{ title: 'Imagen del Día' }}
      />
      <Stack.Screen
        name="APODGallery"
        component={APODGalleryScreen}
        options={{ title: 'Galería APOD' }}
      />
    </Stack.Navigator>
  );
}
