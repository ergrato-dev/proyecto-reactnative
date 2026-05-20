/**
 * Tarjeta de un cuerpo celeste para la lista del catálogo solar.
 *
 * @what Renderiza el nombre en inglés, el tipo de cuerpo, la gravedad y el radio
 *   medio de un `SolarBody` en una tarjeta presionable.
 * @why La FlatList y SectionList del catálogo solar necesitan un componente
 *   de item homogéneo para garantizar rendimiento de virtualización.
 * @impact Cambios en el layout o props de este componente afectan a todas las
 *   listas del módulo `lists/`. Requiere actualizar el snapshot test si se añade.
 */

import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import type { SolarBody } from '@/shared/lib/solarSystemClient';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface BodyCardProps {
  /** Datos del cuerpo celeste a mostrar */
  body: SolarBody;
  /** Callback al pulsar la tarjeta */
  onPress: () => void;
  /** testID para localizar el elemento en tests */
  testID?: string;
}

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Tarjeta presionable que muestra los datos clave de un cuerpo celeste.
 */
export function BodyCard({ body, onPress, testID }: BodyCardProps) {
  // Preferimos el nombre en inglés; si no existe, usamos el nombre original (francés en la API)
  const displayName = body.englishName || body.name;
  const bodyType = body.bodyType || 'Desconocido';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      testID={testID ?? `body-card-${body.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${displayName}, ${bodyType}`}
    >
      <View style={styles.row}>
        <Text style={styles.name} numberOfLines={1}>
          {displayName}
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{bodyType}</Text>
        </View>
      </View>

      <View style={styles.stats}>
        {body.gravity !== null && (
          <Text style={styles.stat} testID={`gravity-${body.id}`}>
            🌐 {body.gravity} m/s²
          </Text>
        )}
        {body.meanRadius !== null && (
          <Text style={styles.stat} testID={`radius-${body.id}`}>
            📏 {body.meanRadius} km
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0d1f3c',
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#4fc3f7',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    color: '#e3f2fd',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#1565c0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#90caf9',
    fontSize: 11,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  stat: {
    color: '#78909c',
    fontSize: 12,
  },
});
