/**
 * Punto de entrada de CosmosRN.
 *
 * @what Monta el `NavigationContainer` con la configuración de deep linking
 *   y el navegador raíz (Drawer > Tabs > Stacks).
 * @why `NavigationContainer` debe ser el componente más externo que requiere
 *   contexto de navegación; aquí se inicializa una sola vez.
 * @impact Todos los módulos que usen `useNavigation` dependen de este provider.
 *   Cambios en `linking` o en el navegador raíz se reflejan aquí.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { RootDrawerNavigator, linking } from '@/modules/navigation';

export default function App() {
  return (
    // GestureHandlerRootView es requerido por react-native-gesture-handler
    // para que los gestos del Drawer funcionen correctamente en Android
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer linking={linking}>
        <StatusBar style="light" />
        <RootDrawerNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
