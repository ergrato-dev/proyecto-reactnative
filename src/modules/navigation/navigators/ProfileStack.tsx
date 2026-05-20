/**
 * Stack Navigator de la tab "Perfil".
 *
 * @what Define el flujo de navegación dentro de la tab Perfil:
 *   Auth → Register | Auth → ObservationLog.
 * @why Encapsula el stack de autenticación con las pantallas reales
 *   del módulo auth (Supabase + biometría + diario de observaciones).
 * @impact Rutas corresponden a `ProfileStackParamList`.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../types';
import { LoginScreen } from '@/modules/auth/screens/LoginScreen';
import { RegisterScreen } from '@/modules/auth/screens/RegisterScreen';
import { ObservationsScreen } from '@/modules/auth/screens/ObservationsScreen';

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
        component={LoginScreen}
        options={{ title: 'Mi Perfil' }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: 'Crear cuenta' }}
      />
      <Stack.Screen
        name="ObservationLog"
        component={ObservationsScreen}
        options={{ title: 'Diario de Observaciones' }}
      />
    </Stack.Navigator>
  );
}
