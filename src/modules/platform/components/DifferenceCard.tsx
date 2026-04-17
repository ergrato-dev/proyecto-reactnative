import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import type {
  PlatformDifference,
  SupportedPlatform} from '../data/differences';
import {
  SUPPORT_ICON,
} from '../data/differences';

interface DifferenceCardProps {
  /** Datos de la diferencia a mostrar */
  difference: PlatformDifference;
  /** Plataforma activa, para resaltar su columna */
  activePlatform: SupportedPlatform;
}

/**
 * @what Tarjeta que muestra una diferencia de plataforma con badge de soporte
 *   y snippet de código expandible.
 * @why Encapsula la presentación de cada diferencia para que PlatformShowcaseScreen
 *   solo gestione la lista, no el layout interno de cada ítem.
 * @impact Cambios en el diseño de la tarjeta afectan todas las diferencias.
 *   El snapshot test debe actualizarse si se modifica el layout.
 */
export function DifferenceCard({ difference, activePlatform }: DifferenceCardProps) {
  const [expanded, setExpanded] = useState(false);

  const platforms: SupportedPlatform[] = ['android', 'web', 'ios'];

  return (
    <View style={styles.card} testID={`difference-card-${difference.id}`}>
      {/* Cabecera */}
      <Text style={styles.title}>{difference.title}</Text>
      <Text style={styles.description}>{difference.description}</Text>

      {/* Badges de soporte por plataforma */}
      <View style={styles.badges}>
        {platforms.map((platform) => {
          const level = difference.support[platform];
          const isActive = platform === activePlatform;
          return (
            <View
              key={platform}
              style={[styles.badge, isActive && styles.activeBadge]}
              testID={`badge-${difference.id}-${platform}`}
            >
              <Text style={styles.badgeIcon}>{SUPPORT_ICON[level]}</Text>
              <Text style={[styles.badgePlatform, isActive && styles.activeBadgeText]}>
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Nota específica para la plataforma activa */}
      {difference.notes?.[activePlatform] && (
        <Text style={styles.note} testID={`note-${difference.id}`}>
          💡 {difference.notes[activePlatform]}
        </Text>
      )}

      {/* Snippet de código (expandible) */}
      <TouchableOpacity
        onPress={() => setExpanded((prev) => !prev)}
        style={styles.snippetToggle}
        testID={`snippet-toggle-${difference.id}`}
        activeOpacity={0.7}
      >
        <Text style={styles.snippetToggleText}>
          {expanded ? '▲ Ocultar código' : '▼ Ver snippet'}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.snippetContainer} testID={`snippet-${difference.id}`}>
          <Text style={styles.snippet}>{difference.codeSnippet}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111122',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E8E8FF',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#8888AA',
    marginBottom: 12,
    lineHeight: 18,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1A1A2E',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  activeBadge: {
    borderColor: '#4FC3F7',
    backgroundColor: '#0D2A3A',
  },
  badgeIcon: {
    fontSize: 12,
  },
  badgePlatform: {
    fontSize: 12,
    color: '#7777AA',
    fontWeight: '500',
  },
  activeBadgeText: {
    color: '#4FC3F7',
    fontWeight: '700',
  },
  note: {
    fontSize: 12,
    color: '#AAAACC',
    marginBottom: 10,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  snippetToggle: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  snippetToggleText: {
    fontSize: 12,
    color: '#4FC3F7',
    fontWeight: '500',
  },
  snippetContainer: {
    marginTop: 8,
    backgroundColor: '#0A0A18',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  snippet: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#C8D8E8',
    lineHeight: 16,
  },
});
