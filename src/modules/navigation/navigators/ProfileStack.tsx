/**
 * Stack Navigator de la tab "Perfil".
 *
 * @what Define el flujo de navegación dentro de la tab Perfil:
 *   Auth → ObservationLog.
 * @why Encapsula el stack de autenticación; en Fase 10 se reemplazarán
 *   las pantallas placeholder por el flujo real con Supabase.
 * @impact Rutas corresponden a `ProfileStackParamList`.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../types';
import { AuthScreen } from '../screens/AuthScreen';
import { ObservationLogScreen } from '../screens/PlaceholderScreens';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const screenOptions = {
  headerStyle: { backgroundColor: '#050d24' },
  headerTintColor: '#4fc3f7',
  headerTitleStyle: { fontWeight: '700' as const },
  contentStyle: { backgroundColor: '#050d24' },
};

/**
 * Navegador de pila para la sección "Perfil".
 */
export function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Auth"
        component={AuthScreen}
        options={{ title: 'Mi Perfil' }}
      />
      <Stack.Screen
        name="ObservationLog"
        component={ObservationLogScreen}
        options={{ title: 'Diario de Observaciones' }}
      />
    </Stack.Navigator>
  );
}
