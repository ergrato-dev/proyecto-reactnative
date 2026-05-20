/**
 * Configuración de deep linking para CosmosRN.
 *
 * @what Mapea URLs con el scheme `cosmosrn://` a rutas del navegador.
 *   También soporta URLs HTTPS para futuros Universal Links (Android App Links).
 * @why El deep linking permite lanzar secciones específicas desde notificaciones,
 *   widgets o URLs externas sin pasar por la pantalla de inicio.
 * @impact Cualquier ruta nueva en los ParamList debe registrarse aquí para
 *   ser accesible via deep link. El `NavigationContainer` lo consume directamente.
 *
 * @example
 * ```
 * cosmosrn://home              → Home (catálogo)
 * cosmosrn://iss               → Mapa ISS
 * cosmosrn://apod              → Imagen del Día
 * cosmosrn://body/mars         → Detalle de cuerpo celeste
 * cosmosrn://asteroids         → Búsqueda de asteroides
 * ```
 */

import type { LinkingOptions } from '@react-navigation/native';
import type { DrawerParamList } from './types';

export const linking: LinkingOptions<DrawerParamList> = {
  prefixes: [
    'cosmosrn://',
    // Preparado para Android App Links / Universal Links en fases posteriores
    'https://cosmosrn.ergrato.dev',
  ],
  config: {
    screens: {
      MainTabs: {
        screens: {
          Explore: {
            screens: {
              Home: 'home',
              SolarCatalog: 'solar',
              BodyDetail: 'body/:bodyId',
              AsteroidSearch: 'asteroids',
            },
          },
          ISS: {
            screens: {
              ISSMap: 'iss',
              Astronauts: 'astronauts',
            },
          },
          APOD: {
            screens: {
              APODDetail: 'apod',
              APODGallery: 'apod/gallery',
            },
          },
          Profile: {
            screens: {
              Auth: 'profile',
              ObservationLog: 'observations',
            },
          },
        },
      },
      Animations: 'animations',
      Sensors: 'sensors',
      Camera: 'camera',
      Platform: 'platform',
    },
  },
};
