/**
 * Módulo `maps/` — Rastreo ISS en tiempo real.
 *
 * @what Pantalla con mapa interactivo que muestra la posición de la ISS en
 *   tiempo real (polling cada 5 s), traza su trayectoria orbital, lista la
 *   tripulación actual en el espacio y difunde la posición a todos los
 *   clientes conectados vía Supabase Realtime.
 * @why Demuestra `react-native-maps`, polling con TanStack Query, Supabase
 *   Realtime WebSocket y reconexión automática ante pérdidas de red.
 * @impact Requiere `android:usesCleartextTraffic` en app.json (ya configurado)
 *   porque la API Open-Notify sirve HTTP. En Web se muestra un fallback con
 *   coordenadas numéricas ya que `react-native-maps` no soporta react-native-web.
 */

import React, { useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import type { ISSMapScreenProps } from '@/modules/navigation/types';
import { useIssPosition } from '../hooks/useIssPosition';
import type { IssCoordinates } from '../hooks/useIssPosition';
import { useIssRealtime } from '@/modules/realtime/hooks/useIssRealtime';
import { useNetworkReconnect } from '@/modules/realtime/hooks/useNetworkReconnect';

// react-native-maps no tiene soporte web; se importa condicionalmente
// para evitar errores de compilación en la plataforma web.
const MapView =
  Platform.OS !== 'web'
    ? // eslint-disable-next-line @typescript-eslint/no-var-requires
      (require('react-native-maps').default as React.ComponentType<MapViewProps>)
    : null;

const Marker =
  Platform.OS !== 'web'
    ? // eslint-disable-next-line @typescript-eslint/no-var-requires
      (require('react-native-maps').Marker as React.ComponentType<MarkerProps>)
    : null;

const Polyline =
  Platform.OS !== 'web'
    ? // eslint-disable-next-line @typescript-eslint/no-var-requires
      (require('react-native-maps').Polyline as React.ComponentType<PolylineProps>)
    : null;

// ─── Tipos mínimos de react-native-maps ───────────────────────────────────────

interface LatLng {
  latitude: number;
  longitude: number;
}

interface Region extends LatLng {
  latitudeDelta: number;
  longitudeDelta: number;
}

interface MapViewProps {
  style?: object;
  region?: Region;
  mapType?: string;
  testID?: string;
  children?: React.ReactNode;
}

interface MarkerProps {
  coordinate: LatLng;
  title?: string;
  description?: string;
  testID?: string;
}

interface PolylineProps {
  coordinates: LatLng[];
  strokeColor?: string;
  strokeWidth?: number;
  testID?: string;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

/** Delta de zoom inicial (≈ vista continental) */
const INITIAL_DELTA = 60;

/** Color de la traza orbital */
const TRAIL_COLOR = '#4fc3f7';

// ─── Componente web fallback ──────────────────────────────────────────────────

/**
 * Fallback para Web: muestra las coordenadas en texto ya que
 * react-native-maps no soporta react-native-web.
 *
 * @what Renderiza latitud/longitud actualizadas cada 5 s en texto plano.
 * @why Web no puede usar MapView; este fallback mantiene la funcionalidad
 *   de seguimiento sin romper la build web.
 * @impact Solo se muestra en `Platform.OS === 'web'`.
 */
function WebFallback({ coordinates }: { coordinates: IssCoordinates | null }) {
  return (
    <View style={styles.webFallback} testID="iss-web-fallback">
      <Text style={styles.webFallbackTitle}>ISS en Tiempo Real</Text>
      <Text style={styles.webFallbackNote}>
        El mapa interactivo no está disponible en Web.
      </Text>
      {coordinates ? (
        <View style={styles.coordBox}>
          <Text style={styles.coordLabel}>Latitud</Text>
          <Text style={styles.coordValue} testID="iss-lat">
            {coordinates.latitude.toFixed(4)}°
          </Text>
          <Text style={styles.coordLabel}>Longitud</Text>
          <Text style={styles.coordValue} testID="iss-lng">
            {coordinates.longitude.toFixed(4)}°
          </Text>
          <Text style={styles.coordTimestamp}>
            Actualizado: {new Date(coordinates.timestamp * 1000).toLocaleTimeString()}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────

/**
 * Pantalla del mapa ISS en tiempo real.
 *
 * @what Muestra un `MapView` noche con un marcador que se mueve cada 5 s
 *   siguiendo la posición real de la ISS, traza su trayectoria orbital
 *   (últimos MAX_TRAJECTORY_POINTS puntos) y ofrece un botón para centrar
 *   la vista en la ISS.
 * @why Es el caso de uso principal del módulo `maps/`: demostrar polling
 *   con TanStack Query + react-native-maps en un contexto astronómico real.
 * @impact Requiere react-native-maps@1.27.2. En web muestra un fallback de
 *   texto. La pantalla `AstronautsScreen` es accesible mediante el botón
 *   de navegación.
 *
 * @param props - Props de navegación del ISSStack
 */
export function ISSMapScreen({ navigation }: ISSMapScreenProps) {
  const { coordinates: pollingCoordinates, isLoading, isError } = useIssPosition();
  const { realtimePosition, isSubscribed, publishPosition } = useIssRealtime();

  // Usar la posición Realtime si está disponible; si no, la del polling
  const coordinates = realtimePosition ?? pollingCoordinates;

  // Reconexión automática: cuando se recupera la red el hook de Realtime
  // gestiona la re-suscripción internamente. useNetworkReconnect
  // permite mostrar feedback visual si se necesita en el futuro.
  useNetworkReconnect();

  // Publicar la posición de polling en Supabase para difundirla a todos los clientes
  useEffect(() => {
    if (!pollingCoordinates || !isSubscribed) return;
    // Publicar de forma no bloqueante; errores se suprimen para no interrumpir el mapa
    publishPosition(pollingCoordinates).catch(() => undefined);
  }, [pollingCoordinates, isSubscribed, publishPosition]);

  // Historial de posiciones para trazar la trayectoria
  const trajectoryRef = useRef<LatLng[]>([]);

  // Región actual del mapa (memoizada)
  const regionRef = useRef<Region>({
    latitude: 0,
    longitude: 0,
    latitudeDelta: INITIAL_DELTA,
    longitudeDelta: INITIAL_DELTA,
  });

  // Actualiza la trayectoria cuando llega una nueva posición
  useEffect(() => {
    if (!coordinates) return;

    trajectoryRef.current = [
      ...trajectoryRef.current.slice(-119), // máximo 120 puntos
      { latitude: coordinates.latitude, longitude: coordinates.longitude },
    ];

    regionRef.current = {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      latitudeDelta: INITIAL_DELTA,
      longitudeDelta: INITIAL_DELTA,
    };
  }, [coordinates]);

  /**
   * Navega a la lista de astronautas.
   *
   * @what Llama a `navigation.navigate('Astronauts')`.
   * @why Permite al usuario consultar quién está a bordo sin salir del módulo.
   * @impact Requiere que la ruta `Astronauts` esté registrada en `ISSStackParamList`.
   */
  const handleViewCrew = useCallback(() => {
    navigation.navigate('Astronauts');
  }, [navigation]);

  // ── Fallback web ──────────────────────────────────────────────────────────
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        {isLoading && <ActivityIndicator size="large" color={TRAIL_COLOR} testID="loading-view" />}
        {isError && <Text style={styles.errorText} testID="error-view">Error al obtener la posición de la ISS</Text>}
        <WebFallback coordinates={coordinates} />
        <TouchableOpacity
          style={styles.crewButton}
          onPress={handleViewCrew}
          testID="crew-button"
        >
          <Text style={styles.crewButtonText}>👨‍🚀 Ver tripulación</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Estado de carga inicial ───────────────────────────────────────────────
  if (isLoading && !coordinates) {
    return (
      <View style={[styles.container, styles.centered]} testID="loading-view">
        <ActivityIndicator size="large" color={TRAIL_COLOR} />
        <Text style={styles.loadingText}>Localizando la ISS…</Text>
      </View>
    );
  }

  // ── Estado de error ───────────────────────────────────────────────────────
  if (isError && !coordinates) {
    return (
      <View style={[styles.container, styles.centered]} testID="error-view">
        <Text style={styles.errorText}>No se pudo obtener la posición de la ISS</Text>
      </View>
    );
  }

  // ── Mapa nativo ───────────────────────────────────────────────────────────
  const region = coordinates
    ? {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        latitudeDelta: INITIAL_DELTA,
        longitudeDelta: INITIAL_DELTA,
      }
    : undefined;

  return (
    <View style={styles.container} testID="iss-map-container">
      {MapView && (
        <MapView
          style={styles.map}
          region={region}
          mapType="satellite"
          testID="iss-map"
        >
          {coordinates && Marker && (
            <Marker
              coordinate={{
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
              }}
              title="ISS"
              description={`Lat: ${coordinates.latitude.toFixed(2)}° Lon: ${coordinates.longitude.toFixed(2)}°`}
              testID="iss-marker"
            />
          )}
          {Polyline && trajectoryRef.current.length > 1 && (
            <Polyline
              coordinates={trajectoryRef.current}
              strokeColor={TRAIL_COLOR}
              strokeWidth={2}
              testID="iss-trajectory"
            />
          )}
        </MapView>
      )}

      {/* Panel de coordenadas superpuesto */}
      <View style={styles.coordPanel} testID="coord-panel">
        <Text style={styles.coordPanelTitle}>🛰️ ISS</Text>
        {coordinates ? (
          <>
            <Text style={styles.coordText} testID="iss-lat">
              {coordinates.latitude.toFixed(4)}° Lat
            </Text>
            <Text style={styles.coordText} testID="iss-lng">
              {coordinates.longitude.toFixed(4)}° Lon
            </Text>
          </>
        ) : (
          <Text style={styles.coordText}>Calculando…</Text>
        )}
        <Text
          style={[styles.realtimeBadge, isSubscribed && styles.realtimeBadgeActive]}
          testID="realtime-badge"
        >
          {isSubscribed ? '● Realtime' : '○ Polling'}
        </Text>
      </View>

      {/* Botón "ver tripulación" */}
      <TouchableOpacity
        style={styles.crewButton}
        onPress={handleViewCrew}
        testID="crew-button"
      >
        <Text style={styles.crewButtonText}>👨‍🚀 Ver tripulación</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050d24',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  map: {
    flex: 1,
  },
  loadingText: {
    color: '#90a4ae',
    fontSize: 14,
  },
  errorText: {
    color: '#ef9a9a',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  coordPanel: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(5,13,36,0.85)',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#4fc3f740',
  },
  coordPanelTitle: {
    color: '#4fc3f7',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 4,
  },
  coordText: {
    color: '#e8eaf6',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  realtimeBadge: {
    color: '#90a4ae',
    fontSize: 10,
    marginTop: 4,
  },
  realtimeBadgeActive: {
    color: '#4fc3f7',
  },
  crewButton: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    backgroundColor: '#1a237e',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#4fc3f7',
  },
  crewButtonText: {
    color: '#e8eaf6',
    fontWeight: '700',
    fontSize: 15,
  },
  // ── Web fallback ─────────────────────────────────────────────────────────
  webFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  webFallbackTitle: {
    color: '#4fc3f7',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  webFallbackNote: {
    color: '#90a4ae',
    fontSize: 13,
    marginBottom: 20,
    textAlign: 'center',
  },
  coordBox: {
    alignItems: 'center',
    gap: 4,
  },
  coordLabel: {
    color: '#90a4ae',
    fontSize: 12,
  },
  coordValue: {
    color: '#e8eaf6',
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  coordTimestamp: {
    color: '#546e7a',
    fontSize: 11,
    marginTop: 8,
  },
});
