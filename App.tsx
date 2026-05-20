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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootDrawerNavigator, linking } from '@/modules/navigation';

/**
 * Cliente de TanStack Query compartido por toda la aplicación.
 *
 * @what Instancia única de QueryClient con configuración global de staleTime y retry.
 * @why Un único QueryClient garantiza una caché compartida entre todos los módulos;
 *   instanciarlo fuera del componente evita recrearlo en cada render.
 * @impact Todos los hooks que usen `useQuery`/`useMutation` dependen de este cliente.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Sin reintentos automáticos — los errores se muestran inmediatamente al usuario
      retry: 0,
    },
  },
});

export default function App() {
  return (
    // QueryClientProvider provee la caché de TanStack Query a toda la app
    <QueryClientProvider client={queryClient}>
      {/* GestureHandlerRootView es requerido por react-native-gesture-handler
          para que los gestos del Drawer funcionen correctamente en Android */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer linking={linking}>
          <StatusBar style="light" />
          <RootDrawerNavigator />
        </NavigationContainer>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
