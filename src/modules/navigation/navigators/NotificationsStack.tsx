/**
 * Stack Navigator del módulo "Notifications".
 *
 * @what Define el flujo de navegación dentro del drawer de Notifications:
 *   actualmente solo `NotificationSettingsScreen`.
 * @why Encapsula el stack de notificaciones separando su navegación del resto
 *   del Drawer, siguiendo el mismo patrón que `ArtemisStack`.
 * @impact Rutas corresponden a `NotificationsStackParamList`. Cambiar nombres
 *   de pantalla requiere actualizar `NotificationsStackParamList` en `types.ts`.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NotificationsStackParamList } from '../types';
import { NotificationSettingsScreen } from '@/modules/notifications';

const Stack = createNativeStackNavigator<NotificationsStackParamList>();

const screenOptions = {
  headerStyle: { backgroundColor: '#050d1a' },
  headerTintColor: '#0288d1',
  headerTitleStyle: { fontWeight: '700' as const },
  contentStyle: { backgroundColor: '#0a0e1a' },
};

/**
 * Navegador de pila para la sección "Notificaciones".
 */
export function NotificationsStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{ title: '⚡ Alertas astronómicas' }}
      />
    </Stack.Navigator>
  );
}
