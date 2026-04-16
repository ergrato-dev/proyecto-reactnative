/**
 * Pantalla de configuración de notificaciones astronómicas.
 *
 * @what Muestra toggles para activar/desactivar tres tipos de alertas:
 *   tormentas solares clase M+, paso de la ISS (próximamente) y el
 *   recordatorio diario de APOD. Incluye banner de permisos si no se
 *   han concedido y lista las últimas llamaradas activas del período.
 * @why Demuestra el uso de `expo-notifications` con solicitud de permiso
 *   en Android 13+, scheduling de notificaciones locales repetitivas
 *   e inmediatas, y degradación en plataformas sin soporte push.
 * @impact Depende de `useDonki`, `useNotificationPermission` y
 *   `notificationScheduler`. Requiere permiso POST_NOTIFICATIONS en
 *   Android 13+. En Web, los toggles de ISS y APOD están deshabilitados.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useDonki } from '../hooks/useDonki';
import { useNotificationPermission } from '../hooks/useNotificationPermission';
import {
  scheduleSolarStormAlert,
  scheduleApodDailyReminder,
  cancelApodDailyReminder,
} from '../lib/notificationScheduler';
import type { DonkiSolarFlare } from '@/shared/lib/nasaClient';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Devuelve el color de fondo del badge según la clase de llamarada.
 *
 * @what Asigna un color semántico: rojo para X, naranja para M, gris para el resto.
 * @why Permite identificar visualmente el nivel de peligro sin leer el código.
 * @impact Solo usado en `FlareItem`.
 *
 * @param classType - Código de clase de la llamarada (ej. "M1.5")
 * @returns Color hexadecimal
 */
function getFlareColor(classType: string): string {
  if (classType.startsWith('X')) return '#b71c1c';
  if (classType.startsWith('M')) return '#e65100';
  return '#37474f';
}

// ─── FlareItem ────────────────────────────────────────────────────────────────

/**
 * Ítem de lista que muestra una llamarada solar y su clase.
 *
 * @what Renderiza el ID de la llamarada, su clase con badge de color y
 *   su hora de inicio.
 * @why `FlatList` requiere un componente de renderizado independiente para
 *   evitar closures innecesarios en la función de render.
 * @impact Solo usado en `NotificationSettingsScreen`. No tiene dependencias externas.
 *
 * @param flare - Datos de la llamarada solar
 */
function FlareItem({ flare }: { flare: DonkiSolarFlare }) {
  return (
    <View style={styles.flareItem}>
      <View style={[styles.flareBadge, { backgroundColor: getFlareColor(flare.classType) }]}>
        <Text style={styles.flareClass}>{flare.classType}</Text>
      </View>
      <View style={styles.flareInfo}>
        <Text style={styles.flareId} numberOfLines={1}>
          {flare.flrID}
        </Text>
        <Text style={styles.flareTime}>{flare.beginTime?.replace('T', ' ').slice(0, 16)}</Text>
      </View>
    </View>
  );
}

// ─── PermissionBanner ─────────────────────────────────────────────────────────

/**
 * Banner que informa al usuario que los permisos no están concedidos.
 *
 * @what Muestra un mensaje de advertencia y un botón "Solicitar permisos".
 * @why Android 13+ requiere permiso explícito POST_NOTIFICATIONS.
 *   Sin este banner el usuario no sabe por qué los toggles no funcionan.
 * @impact Desaparece cuando `isGranted === true`. No se muestra en Web.
 *
 * @param onRequest - Función que abre el diálogo nativo de permiso
 */
function PermissionBanner({ onRequest }: { onRequest: () => void }) {
  return (
    <View style={styles.permissionBanner}>
      <Text style={styles.permissionText}>
        ⚠️ Permiso de notificaciones no concedido. Actívalo para recibir alertas solares y recordatorios.
      </Text>
      <TouchableOpacity style={styles.permissionButton} onPress={onRequest}>
        <Text style={styles.permissionButtonText}>Solicitar permisos</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── ToggleRow ────────────────────────────────────────────────────────────────

/**
 * Fila de toggle con icono, título y subtítulo opcional.
 *
 * @what Renderiza un Switch de React Native con etiqueta descriptiva.
 * @why Evita duplicar el layout del toggle para cada tipo de alerta.
 * @impact Usado tres veces en `NotificationSettingsScreen`.
 *
 * @param icon      - Emoji que identifica el tipo de alerta
 * @param title     - Nombre de la alerta
 * @param subtitle  - Descripción corta o estado ("Próximamente")
 * @param value     - Estado actual del toggle
 * @param disabled  - Si el toggle está deshabilitado
 * @param onValueChange - Callback cuando el usuario cambia el toggle
 */
function ToggleRow({
  icon,
  title,
  subtitle,
  value,
  disabled = false,
  onValueChange,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  value: boolean;
  disabled?: boolean;
  onValueChange: (val: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleIcon}>{icon}</Text>
      <View style={styles.toggleLabels}>
        <Text style={[styles.toggleTitle, disabled && styles.disabledText]}>{title}</Text>
        {subtitle ? (
          <Text style={styles.toggleSubtitle}>{subtitle}</Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#37474f', true: '#0288d1' }}
        thumbColor={value ? '#e1f5fe' : '#90a4ae'}
      />
    </View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────

/**
 * Pantalla principal del módulo de notificaciones.
 *
 * @what Lista los tres tipos de alerta configurables y muestra las llamaradas
 *   solares recientes del período de los últimos 7 días.
 * @why Demuestra la integración de `expo-notifications` con la API NASA DONKI,
 *   la gestión de permisos en Android 13+ y el scheduling local.
 * @impact Depende de `useDonki`, `useNotificationPermission` y
 *   `notificationScheduler`. Requiere red para cargar eventos DONKI.
 */
export function NotificationSettingsScreen() {
  const [solarAlertsEnabled, setSolarAlertsEnabled] = useState(false);
  const [apodEnabled, setApodEnabled] = useState(false);

  const { flares, majorFlares, isLoading, isError } = useDonki();
  const { isGranted, isLoading: isPermissionLoading, requestPermission } = useNotificationPermission();

  // Las notificaciones push no están disponibles en Web
  const isPushSupported = Platform.OS !== 'web';

  /**
   * Maneja el toggle de alertas solares.
   *
   * @what Si se activa, envía de inmediato una alerta si hay llamaradas M+/X+.
   *   Si se desactiva, no hace nada (las alertas inmediatas ya se enviaron).
   * @why El usuario espera feedback visual tras activar el toggle.
   * @impact Llama a `scheduleSolarStormAlert` con los eventos DONKI actuales.
   *
   * @param enabled - Nuevo estado del toggle
   */
  async function handleSolarToggle(enabled: boolean): Promise<void> {
    setSolarAlertsEnabled(enabled);
    if (enabled && isPushSupported) {
      await scheduleSolarStormAlert(flares).catch(() => null);
    }
  }

  /**
   * Maneja el toggle del recordatorio diario de APOD.
   *
   * @what Programa o cancela la notificación diaria según el estado del toggle.
   * @why Dar al usuario control total sobre las notificaciones diarias.
   * @impact Llama a `scheduleApodDailyReminder` o `cancelApodDailyReminder`.
   *
   * @param enabled - Nuevo estado del toggle
   */
  async function handleApodToggle(enabled: boolean): Promise<void> {
    setApodEnabled(enabled);
    if (enabled && isPushSupported) {
      await scheduleApodDailyReminder().catch(() => null);
    } else {
      await cancelApodDailyReminder().catch(() => null);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Banner de permisos */}
      {isPushSupported && !isPermissionLoading && !isGranted && (
        <PermissionBanner onRequest={requestPermission} />
      )}

      <FlatList<DonkiSolarFlare>
        data={majorFlares}
        keyExtractor={(item) => item.flrID}
        renderItem={({ item }) => <FlareItem flare={item} />}
        ListHeaderComponent={
          <View>
            {/* Título */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>⚡ Alertas astronómicas</Text>
              <Text style={styles.headerSubtitle}>
                Configura qué eventos del cosmos quieres que te notifiquemos.
              </Text>
            </View>

            {/* Toggles */}
            <View style={styles.section}>
              <ToggleRow
                icon="🌞"
                title="Tormentas solares clase M+"
                subtitle={
                  isPushSupported
                    ? 'Alerta inmediata cuando hay llamaradas moderadas o extremas'
                    : 'No disponible en Web'
                }
                value={solarAlertsEnabled}
                disabled={!isPushSupported || (!isGranted && !isPermissionLoading)}
                onValueChange={handleSolarToggle}
              />
              <View style={styles.divider} />
              <ToggleRow
                icon="🛰️"
                title="Paso de la ISS"
                subtitle="Próximamente"
                value={false}
                disabled
                onValueChange={() => null}
              />
              <View style={styles.divider} />
              <ToggleRow
                icon="📸"
                title="Imagen del día (APOD)"
                subtitle={
                  isPushSupported
                    ? 'Recordatorio diario a las 9:00 h'
                    : 'No disponible en Web'
                }
                value={apodEnabled}
                disabled={!isPushSupported || (!isGranted && !isPermissionLoading)}
                onValueChange={handleApodToggle}
              />
            </View>

            {/* Sección de llamaradas recientes */}
            <View style={styles.solarSection}>
              <Text style={styles.sectionTitle}>
                Llamaradas clase M+ (últimos 7 días)
              </Text>
              {isLoading && (
                <ActivityIndicator color="#0288d1" style={styles.loader} />
              )}
              {isError && (
                <Text style={styles.errorText}>
                  No se pudieron cargar los eventos solares. Revisa tu conexión.
                </Text>
              )}
              {!isLoading && !isError && majorFlares.length === 0 && (
                <Text style={styles.emptyText}>
                  Sin llamaradas mayores en los últimos 7 días. El Sol está tranquilo 🌤️
                </Text>
              )}
            </View>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
  },
  listContent: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e3f2fd',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#90a4ae',
    lineHeight: 20,
  },
  permissionBanner: {
    margin: 16,
    backgroundColor: '#1a2332',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f57f17',
  },
  permissionText: {
    color: '#fff176',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  permissionButton: {
    backgroundColor: '#0288d1',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    marginHorizontal: 16,
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingHorizontal: 4,
    marginBottom: 24,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  toggleIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  toggleLabels: {
    flex: 1,
    marginRight: 8,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e3f2fd',
  },
  toggleSubtitle: {
    fontSize: 12,
    color: '#78909c',
    marginTop: 2,
  },
  disabledText: {
    color: '#546e7a',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#1e2a3a',
    marginHorizontal: 16,
  },
  solarSection: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#b0bec5',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  loader: {
    marginVertical: 20,
  },
  errorText: {
    color: '#ef9a9a',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    color: '#78909c',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  flareItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
  },
  flareBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 12,
    minWidth: 52,
    alignItems: 'center',
  },
  flareClass: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  flareInfo: {
    flex: 1,
  },
  flareId: {
    color: '#b0bec5',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    marginBottom: 2,
  },
  flareTime: {
    color: '#546e7a',
    fontSize: 11,
  },
});
