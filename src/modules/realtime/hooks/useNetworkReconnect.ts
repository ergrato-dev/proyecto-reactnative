import { useEffect, useRef, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

/** Callback que se invoca cuando se recupera la conexión */
export type ReconnectCallback = () => void;

/** Estado expuesto por `useNetworkReconnect` */
export interface NetworkReconnectState {
  /** True cuando hay conectividad a internet */
  isConnected: boolean;
  /** True cuando la app acaba de recuperar conexión (dura un ciclo de render) */
  justReconnected: boolean;
}

/**
 * @what Hook que observa el estado de red del dispositivo y llama a un callback
 *   automáticamente cuando se recupera la conectividad tras haberla perdido.
 * @why El módulo Realtime (WebSocket de Supabase) se desconecta ante pérdidas
 *   de red; este hook detecta la reconexión y permite re-suscribirse al canal
 *   ISS sin que el usuario tenga que reiniciar la app.
 * @impact Usa `@react-native-community/netinfo` (ya instalado como dep de
 *   react-native-maps / expo). `onReconnect` se llama una única vez por cada
 *   ciclo offline → online para evitar re-suscripciones duplicadas.
 *
 * @param onReconnect - Función a ejecutar al recuperar la conexión
 */
export function useNetworkReconnect(onReconnect?: ReconnectCallback): NetworkReconnectState {
  const [isConnected, setIsConnected] = useState(true);
  const [justReconnected, setJustReconnected] = useState(false);

  // Guardar el estado previo para detectar la transición offline → online
  const prevConnectedRef = useRef<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connected = state.isConnected ?? false;
      setIsConnected(connected);

      // Transición offline → online: reconexión detectada
      if (prevConnectedRef.current === false && connected) {
        setJustReconnected(true);
        onReconnect?.();
        // Resetear el flag en el siguiente ciclo de render
        setTimeout(() => setJustReconnected(false), 0);
      }

      prevConnectedRef.current = connected;
    });

    return () => unsubscribe();
  }, [onReconnect]);

  return { isConnected, justReconnected };
}
