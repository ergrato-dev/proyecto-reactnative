/**
 * Stack Navigator de la tab "Explorar".
 *
 * @what Define el flujo de navegación jerárquica dentro de la tab Explorar:
 *   Home → SolarCatalog → BodyDetail / AsteroidSearch.
 * @why Encapsula el stack de Explorar para que el BottomTabNavigator no tenga
 *   que conocer los detalles internos de esta sección.
 * @impact Rutas registradas aquí corresponden a `ExploreStackParamList`.
 *   Agregar pantallas en Fase 2 y 3 requiere extender ese ParamList.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ExploreStackParamList } from '../types';
import { HomeScreen } from '../screens/HomeScreen';
import { SolarCatalogScreen, BodyDetailScreen } from '@/modules/lists';
import { AsteroidSearchScreen } from '@/modules/forms';

const Stack = createNativeStackNavigator<ExploreStackParamList>();

/** Opciones de cabecera compartidas para el stack Explorar */
const screenOptions = {
  headerStyle: { backgroundColor: '#050d24' },
  headerTintColor: '#4fc3f7',
  headerTitleStyle: { fontWeight: '700' as const },
  contentStyle: { backgroundColor: '#050d24' },
};

/**
 * Navegador de pila para la sección "Explorar".
 */
export function ExploreStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'CosmosRN' }}
      />
      <Stack.Screen
        name="SolarCatalog"
        component={SolarCatalogScreen}
        options={{ title: 'Sistema Solar' }}
      />
      <Stack.Screen
        name="BodyDetail"
        component={BodyDetailScreen}
        options={({ route }) => ({ title: route.params.bodyName })}
      />
      <Stack.Screen
        name="AsteroidSearch"
        component={AsteroidSearchScreen}
        options={{ title: 'Asteroides' }}
      />
    </Stack.Navigator>
  );
}
