/**
 * Pantalla del diario de observaciones astronómicas.
 *
 * @what Lista las observaciones del usuario con opciones para crear, editar
 *   y eliminar entradas. Incluye un formulario modal inline para añadir
 *   nuevas observaciones.
 * @why Demuestra operaciones CRUD completas sobre una tabla Supabase con RLS,
 *   combinando estado local React con persistencia remota.
 * @impact Usa `useObservations` — requiere sesión activa (RLS). Si el usuario
 *   cierra sesión, esta pantalla muestra un mensaje de acceso no autorizado.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '@/modules/navigation/types';
import { useObservations, type Observation, type ObservationInput } from '../hooks/useObservations';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ObservationLog'>;

// ─── Formulario nuevo ─────────────────────────────────────────────────────────

interface NewObservationFormProps {
  onSave: (input: ObservationInput) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

/**
 * Formulario inline para crear una nueva observación.
 *
 * @what Campos: objeto observado (title), tipo (body), fecha (observed_at)
 *   en formato ISO y notas libres.
 * @why Mantiene el formulario dentro de la misma pantalla para evitar
 *   una navegación extra que complica el flujo de testing.
 * @impact Al guardar, llama a `useObservations.create` y recarga la lista.
 */
function NewObservationForm({ onSave, onCancel, loading }: NewObservationFormProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    if (!title.trim() || !body.trim()) return;
    await onSave({
      title: title.trim(),
      body: body.trim(),
      observed_at: new Date().toISOString(),
      notes: notes.trim() || null,
    });
  };

  return (
    <View style={formStyles.container} testID="new-observation-form">
      <Text style={formStyles.label}>Objeto observado</Text>
      <TextInput
        style={formStyles.input}
        placeholder="Ej: Júpiter, M42 - Nebulosa de Orión"
        placeholderTextColor="#546e7a"
        value={title}
        onChangeText={setTitle}
        testID="title-input"
      />
      <Text style={formStyles.label}>Tipo de objeto</Text>
      <TextInput
        style={formStyles.input}
        placeholder="Ej: planeta, nebulosa, galaxia"
        placeholderTextColor="#546e7a"
        value={body}
        onChangeText={setBody}
        testID="body-input"
      />
      <Text style={formStyles.label}>Notas (opcional)</Text>
      <TextInput
        style={[formStyles.input, formStyles.multiline]}
        placeholder="Condiciones del cielo, equipo usado..."
        placeholderTextColor="#546e7a"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        testID="notes-input"
      />
      <View style={formStyles.row}>
        <TouchableOpacity style={formStyles.cancelButton} onPress={onCancel} testID="cancel-form-button">
          <Text style={formStyles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[formStyles.saveButton, (!title.trim() || !body.trim()) && formStyles.disabled]}
          onPress={handleSave}
          disabled={loading || !title.trim() || !body.trim()}
          testID="save-observation-button"
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={formStyles.saveText}>Guardar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Item de la lista ─────────────────────────────────────────────────────────

/**
 * Tarjeta de una observación en la lista.
 *
 * @what Muestra título, tipo, fecha y notas con botón de eliminar.
 * @why Componente presentacional separado para facilitar el testing
 *   y el memoizado con React.memo.
 * @impact Al pulsar eliminar, llama al callback del padre.
 */
const ObservationCard = React.memo(function ObservationCard({
  observation,
  onDelete,
}: {
  observation: Observation;
  onDelete: (id: string) => void;
}) {
  const date = new Date(observation.observed_at).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View style={cardStyles.container} testID={`observation-card-${observation.id}`}>
      <View style={cardStyles.header}>
        <View style={cardStyles.info}>
          <Text style={cardStyles.title}>{observation.title}</Text>
          <Text style={cardStyles.body}>{observation.body}</Text>
        </View>
        <TouchableOpacity
          onPress={() => onDelete(observation.id)}
          style={cardStyles.deleteButton}
          testID={`delete-observation-${observation.id}`}
        >
          <Text style={cardStyles.deleteText}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={cardStyles.date}>📅 {date}</Text>
      {observation.notes ? (
        <Text style={cardStyles.notes}>{observation.notes}</Text>
      ) : null}
    </View>
  );
});

// ─── Pantalla principal ───────────────────────────────────────────────────────

/**
 * Pantalla del diario de observaciones del usuario.
 *
 * @what Lista observaciones + formulario inline para crear nuevas.
 *   Confirmación nativa (Alert) antes de eliminar.
 * @why Centraliza el CRUD en una sola pantalla para simplificar la
 *   navegación y el estado del módulo de demostración.
 * @impact Requiere sesión activa. Cambios en `useObservations` afectan
 *   directamente esta pantalla.
 */
export function ObservationsScreen(_props: Props) {
  const { observations, loading, error, create, remove } = useObservations();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCreate = async (input: ObservationInput) => {
    setSaving(true);
    await create(input);
    setSaving(false);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Eliminar observación',
      '¿Seguro que quieres eliminar esta observación? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => remove(id) },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.centered} testID="loading-state">
        <ActivityIndicator color="#4fc3f7" size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      testID="observations-screen"
    >
      {error && (
        <View style={styles.errorBanner} testID="error-banner">
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={observations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ObservationCard observation={item} onDelete={handleDelete} />
        )}
        ListHeaderComponent={
          showForm ? (
            <NewObservationForm
              onSave={handleCreate}
              onCancel={() => setShowForm(false)}
              loading={saving}
            />
          ) : null
        }
        ListEmptyComponent={
          !showForm ? (
            <View style={styles.emptyState} testID="empty-state">
              <Text style={styles.emptyIcon}>🌌</Text>
              <Text style={styles.emptyText}>
                Aún no tienes observaciones.{'\n'}
                ¡Añade tu primera entrada!
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.list}
      />

      {!showForm && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowForm(true)}
          testID="add-observation-button"
        >
          <Text style={styles.fabText}>＋ Nueva observación</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050d24' },
  centered: { flex: 1, backgroundColor: '#050d24', justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingBottom: 88 },
  errorBanner: {
    margin: 16,
    backgroundColor: 'rgba(183,28,28,0.2)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ef5350',
  },
  errorText: { color: '#ef9a9a', fontSize: 13 },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyText: { color: '#78909c', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    left: 20,
    backgroundColor: '#1565c0',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: '#0d1b2a',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1a2e4a',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  info: { flex: 1, marginRight: 12 },
  title: { fontSize: 16, fontWeight: '700', color: '#e3f2fd', marginBottom: 2 },
  body: { fontSize: 13, color: '#4fc3f7', textTransform: 'capitalize' },
  date: { fontSize: 12, color: '#546e7a', marginTop: 6 },
  notes: { fontSize: 13, color: '#90a4ae', marginTop: 6, lineHeight: 18 },
  deleteButton: { padding: 4 },
  deleteText: { color: '#ef5350', fontSize: 16 },
});

const formStyles = StyleSheet.create({
  container: {
    backgroundColor: '#0d1b2a',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1565c0',
  },
  label: { color: '#90a4ae', fontSize: 12, marginBottom: 4, marginTop: 8 },
  input: {
    backgroundColor: '#050d24',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1565c0',
    color: '#e3f2fd',
    padding: 12,
    fontSize: 14,
  },
  multiline: { height: 72, textAlignVertical: 'top' },
  row: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 10 },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#546e7a',
  },
  cancelText: { color: '#90a4ae', fontSize: 14 },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1565c0',
  },
  disabled: { opacity: 0.5 },
  saveText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
