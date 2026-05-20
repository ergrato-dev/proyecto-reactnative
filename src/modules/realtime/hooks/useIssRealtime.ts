import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/shared/lib/supabaseClient';
import type { IssCoordinates } from '@/modules/maps/hooks/useIssPosition';

/**
 * Nombre del canal Supabase Realtime para la ISS.
 * Constante exportada para usarla en tests y en el publicador.
 */
export const ISS_REALTIME_CHANNEL = 'iss-realtime';

/** Nombre de la tabla en Supabase donde se insertan las posiciones */
export const ISS_POSITIONS_TABLE = 'iss_positions';

/** Payload de un INSERT en la tabla `iss_positions` */
export interface IssPositionRow {
  id?: number;
  latitude: number;
  longitude: number;
  timestamp: number;
  inserted_at?: string;
}

/** Estado expuesto por `useIssRealtime` */
export interface IssRealtimeState {
  /** Última posición recibida por Realtime (null antes del primer evento) */
  realtimePosition: IssCoordinates | null;
  /** True mientras el canal está conectándose o reconectando */
  isConnecting: boolean;
  /** True cuando el canal está subscrito y escuchando */
  isSubscribed: boolean;
  /** Publica una posición en la tabla Supabase para que todos los clientes la reciban */
  publishPosition: (coords: IssCoordinates) => Promise<void>;
}

/**
 * @what Hook que se suscribe al canal Realtime de Supabase `iss-realtime`
 *   y expone la última posición ISS recibida, más un método para publicar.
 * @why Permite que múltiples clientes (dispositivos) reciban la posición ISS
 *   actualizada en tiempo real sin necesidad de hacer polling independiente
 *   cada uno — el primer cliente que publica lo difunde a todos los demás.
 * @impact Requiere que la tabla `iss_positions` exista en Supabase con RLS
 *   que permita INSERT y SELECT a usuarios anónimos. El canal se limpia
 *   automáticamente al desmontar el componente consumidor.
 */
export function useIssRealtime(): IssRealtimeState {
  const [realtimePosition, setRealtimePosition] = useState<IssCoordinates | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Referencia al canal para poder limpiarlo en cleanup
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    setIsConnecting(true);
    setIsSubscribed(false);

    const channel = supabase
      .channel(ISS_REALTIME_CHANNEL)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: ISS_POSITIONS_TABLE,
        },
        (payload) => {
          const row = payload.new as IssPositionRow;
          setRealtimePosition({
            latitude: row.latitude,
            longitude: row.longitude,
            timestamp: row.timestamp,
          });
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnecting(false);
          setIsSubscribed(true);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setIsConnecting(false);
          setIsSubscribed(false);
        } else if (status === 'CLOSED') {
          setIsSubscribed(false);
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, []);

  /**
   * @what Inserta una fila en `iss_positions` para que todos los suscriptores
   *   reciban la posición actualizada vía Realtime.
   * @why Centraliza la publicación en un método del hook para facilitar
   *   tests (mock del cliente Supabase) y reutilización.
   * @impact Solo funciona si el usuario anónimo tiene permiso INSERT en la
   *   tabla (política RLS correspondiente).
   *
   * @param coords - Coordenadas a publicar
   */
  const publishPosition = useCallback(async (coords: IssCoordinates): Promise<void> => {
    const { error } = await supabase.from(ISS_POSITIONS_TABLE).insert({
      latitude: coords.latitude,
      longitude: coords.longitude,
      timestamp: coords.timestamp,
    });

    if (error) {
      throw new Error(`Error al publicar posición ISS: ${error.message}`);
    }
  }, []);

  return { realtimePosition, isConnecting, isSubscribed, publishPosition };
}
