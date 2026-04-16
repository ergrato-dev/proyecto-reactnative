/**
 * Pantalla de estado de las misiones del programa Artemis.
 *
 * @what Lista las misiones Artemis (I, II, III) con su estado actual,
 *   tripulación, objetivo y fecha objetivo, usando datos estáticos.
 * @why Introduce el contexto narrativo del módulo: el regreso de la
 *   humanidad a la Luna. Demuestra FlatList con datos locales tipados
 *   y renderizado condicional por estado de misión.
 * @impact Depende de `data/missions.ts`. Sin dependencias de red —
 *   siempre disponible offline. Navegación hacia `ArtemisGallery`.
 */

import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ArtemisStackParamList } from '@/modules/navigation/types';
import { ARTEMIS_MISSIONS, type ArtemisMission, type MissionStatus } from '../data/missions';

/** Props de la pantalla de estado de misiones */
type Props = NativeStackScreenProps<ArtemisStackParamList, 'MissionStatus'>;

// ─── Badge de estado ──────────────────────────────────────────────────────────

/**
 * Badge visual que refleja el estado de una misión con color semántico.
 *
 * @what Renderiza un chip coloreado con el texto del estado.
 * @why Un ícono de color rápido permite escanear el estado sin leer el texto.
 * @impact Solo usado en `MissionCard`. Cambiar `MissionStatus` requiere
 *   actualizar el map de colores y etiquetas aquí.
 *
 * @param status - Estado de la misión
 */
function StatusBadge({ status }: { status: MissionStatus }) {
  const config: Record<MissionStatus, { label: string; color: string; bg: string }> = {
    completed: { label: 'Completada', color: '#a5d6a7', bg: '#1b5e20' },
    'in-progress': { label: 'En curso', color: '#fff176', bg: '#f57f17' },
    planned: { label: 'Planificada', color: '#90caf9', bg: '#0d47a1' },
  };

  const { label, color, bg } = config[status];

  return (
    <View style={[badgeStyles.container, { backgroundColor: bg }]} testID={`badge-${status}`}>
      <Text style={[badgeStyles.text, { color }]}>{label}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  container: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

// ─── Tarjeta de misión ────────────────────────────────────────────────────────

/**
 * Tarjeta que resume una misión Artemis individual.
 *
 * @what Muestra nombre, badge de estado, objetivo, descripción,
 *   tripulación y fecha objetivo.
 * @why Encapsula la presentación de cada misión para facilitar el snapshot
 *   test y mantener `MissionStatusScreen` limpia.
 * @impact Usado únicamente en `MissionStatusScreen`.
 *
 * @param mission - Datos completos de la misión
 */
function MissionCard({ mission }: { mission: ArtemisMission }) {
  return (
    <View
      style={cardStyles.container}
      testID={`mission-card-${mission.id}`}
    >
      <Text style={cardStyles.name}>{mission.name}</Text>
      <StatusBadge status={mission.status} />
      <Text style={cardStyles.objective}>{mission.objective}</Text>
      <Text style={cardStyles.description}>{mission.description}</Text>

      {mission.crew && (
        <View style={cardStyles.crewSection}>
          <Text style={cardStyles.crewLabel}>Tripulación:</Text>
          {mission.crew.map((member) => (
            <Text key={member} style={cardStyles.crewMember}>
              • {member}
            </Text>
          ))}
        </View>
      )}

      <View style={cardStyles.dateRow}>
        <Text style={cardStyles.dateLabel}>📅 Fecha objetivo: </Text>
        <Text style={cardStyles.dateValue}>{mission.targetDate}</Text>
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: '#0d1b3e',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1a237e',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#e8eaf6',
    marginBottom: 8,
  },
  objective: {
    fontSize: 14,
    fontWeight: '600',
    color: '#b3c5ff',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: '#9fa8da',
    lineHeight: 19,
    marginBottom: 10,
  },
  crewSection: {
    marginBottom: 10,
  },
  crewLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7986cb',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  crewMember: {
    fontSize: 13,
    color: '#c5cae9',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateLabel: {
    fontSize: 12,
    color: '#7986cb',
  },
  dateValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b3c5ff',
  },
});

// ─── Pantalla principal ───────────────────────────────────────────────────────

/**
 * Pantalla de estado del programa Artemis de la NASA.
 *
 * @what Muestra una lista de las misiones Artemis con su estado, objetivo,
 *   tripulación y fechas clave. Incluye botón para ir a la galería de imágenes.
 * @why Contextualiza el módulo astronómicamente: el programa Artemis es
 *   el esfuerzo actual más relevante de exploración lunar tripulada.
 * @impact Punto de entrada del módulo `artemis/`. Navega a `ArtemisGallery`
 *   usando el stack de navegación `ArtemisStack`.
 */
export function MissionStatusScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={ARTEMIS_MISSIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MissionCard mission={item} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>🌙 Programa Artemis</Text>
            <Text style={styles.subtitle}>
              El regreso de la humanidad a la Luna — y más allá.
            </Text>
            <TouchableOpacity
              style={styles.galleryButton}
              onPress={() => navigation.navigate('ArtemisGallery')}
              testID="gallery-button"
            >
              <Text style={styles.galleryButtonText}>📷 Ver galería de imágenes</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={<View style={styles.footer} />}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#050d1a',
  },
  list: {
    paddingTop: 8,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#e8eaf6',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#7986cb',
    marginBottom: 16,
    lineHeight: 20,
  },
  galleryButton: {
    backgroundColor: '#1a237e',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3f51b5',
  },
  galleryButtonText: {
    color: '#c5cae9',
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    height: 24,
  },
});
