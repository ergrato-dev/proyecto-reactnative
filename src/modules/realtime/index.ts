/**
 * @what Barrel de exportación del módulo `realtime/`.
 * @why Permite importar desde `@/modules/realtime` sin conocer la estructura interna,
 *   siguiendo el patrón de módulo autónomo del proyecto.
 * @impact Cambios en este barrel afectan a `ISSMapScreen` y cualquier pantalla
 *   que consuma posición ISS vía Supabase Realtime.
 */

export { useIssRealtime } from './hooks/useIssRealtime';
export { useNetworkReconnect } from './hooks/useNetworkReconnect';
export type { IssRealtimeState, IssPositionRow } from './hooks/useIssRealtime';
export type { NetworkReconnectState, ReconnectCallback } from './hooks/useNetworkReconnect';
export { ISS_REALTIME_CHANNEL, ISS_POSITIONS_TABLE } from './hooks/useIssRealtime';
