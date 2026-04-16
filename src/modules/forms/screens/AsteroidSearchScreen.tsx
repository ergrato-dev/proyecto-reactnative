/**
 * Pantalla `AsteroidSearchScreen` — búsqueda de asteroides cercanos a la Tierra.
 *
 * @what Muestra un formulario con dos campos de fecha (inicio / fin), valida
 *   con Zod que el rango sea ≤ 7 días, ejecuta la query NeoWs al enviar y
 *   presenta los resultados en FlatList con badge PHA para los peligrosos.
 * @why Demuestra el módulo `forms/` de React Native: gestión de teclado,
 *   validación reactiva con react-hook-form + Zod, y presentación de datos
 *   científicos de la API NASA NeoWs.
 * @impact Depende de `useNeoWs`, `AsteroidCard` y `asteroidSearchSchema`.
 *   Cambios en la navegación del stack Explorar pueden afectar al back button.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  asteroidSearchSchema,
  type AsteroidSearchFormValues,
  todayPlusDays,
} from '../schemas/asteroidSearchSchema';
import { useNeoWs, type FlatAsteroid } from '../hooks/useNeoWs';
import { AsteroidCard } from '../components/AsteroidCard';

// ─── Tipos ────────────────────────────────────────────────────────────────────

/** Parámetros de búsqueda confirmados (post-submit) */
interface SearchParams {
  startDate: string;
  endDate: string;
}

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Pantalla principal del módulo forms.
 *
 * Flujo:
 * 1. El usuario introduce fechas de inicio y fin.
 * 2. Al pulsar "Buscar", Zod valida el rango.
 * 3. Si es válido, `useNeoWs` ejecuta la query NASA NeoWs.
 * 4. Los resultados se muestran en FlatList con `AsteroidCard`.
 */
export function AsteroidSearchScreen() {
  // Parámetros confirmados tras submit — null = ninguna búsqueda aún
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AsteroidSearchFormValues>({
    resolver: zodResolver(asteroidSearchSchema),
    defaultValues: {
      startDate: todayPlusDays(0),
      endDate: todayPlusDays(7),
    },
  });

  // Query NeoWs — deshabilitada hasta que el usuario haga submit
  const { data, isLoading, isError, isFetching } = useNeoWs(
    searchParams?.startDate ?? '',
    searchParams?.endDate ?? '',
  );

  /** Maneja el submit del formulario: guarda los params validados */
  function onSubmit(values: AsteroidSearchFormValues) {
    Keyboard.dismiss();
    setSearchParams({ startDate: values.startDate, endDate: values.endDate });
  }

  /** Renderiza cada asteroide de la lista */
  function renderAsteroid({ item }: { item: FlatAsteroid }) {
    return <AsteroidCard asteroid={item} />;
  }

  /** Separador visual entre tarjetas */
  function ItemSeparator() {
    return <View style={styles.separator} />;
  }

  // ─── Render principal ──────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* ── Formulario ────────────────────────────────────────────────────── */}
      <View style={styles.form} testID="search-form">
        <Text style={styles.title}>Búsqueda de Asteroides</Text>
        <Text style={styles.subtitle}>
          Introduce un rango de fechas (máx. 7 días) para buscar asteroides
          cercanos a la Tierra según la API NeoWs de NASA.
        </Text>

        {/* Campo fecha inicio */}
        <Text style={styles.label}>Fecha de inicio</Text>
        <Controller
          control={control}
          name="startDate"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              testID="input-start-date"
              style={[styles.input, errors.startDate && styles.inputError]}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#666"
              keyboardType="numbers-and-punctuation"
              returnKeyType="next"
              accessibilityLabel="Fecha de inicio"
            />
          )}
        />
        {errors.startDate && (
          <Text style={styles.errorText} testID="error-start-date">
            {errors.startDate.message}
          </Text>
        )}

        {/* Campo fecha fin */}
        <Text style={styles.label}>Fecha de fin</Text>
        <Controller
          control={control}
          name="endDate"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              testID="input-end-date"
              style={[styles.input, errors.endDate && styles.inputError]}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#666"
              keyboardType="numbers-and-punctuation"
              returnKeyType="done"
              onSubmitEditing={handleSubmit(onSubmit)}
              accessibilityLabel="Fecha de fin"
            />
          )}
        />
        {errors.endDate && (
          <Text style={styles.errorText} testID="error-end-date">
            {errors.endDate.message}
          </Text>
        )}

        {/* Botón de búsqueda */}
        <TouchableOpacity
          testID="submit-button"
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
          accessibilityRole="button"
          accessibilityLabel="Buscar asteroides"
        >
          <Text style={styles.buttonText}>Buscar asteroides ☄️</Text>
        </TouchableOpacity>
      </View>

      {/* ── Resultados ────────────────────────────────────────────────────── */}

      {/* Sin búsqueda todavía */}
      {!searchParams && (
        <View style={styles.emptyState} testID="empty-state">
          <Text style={styles.emptyIcon}>🔭</Text>
          <Text style={styles.emptyText}>
            Introduce un rango de fechas y pulsa "Buscar" para encontrar
            asteroides cercanos a la Tierra.
          </Text>
        </View>
      )}

      {/* Cargando */}
      {searchParams && (isLoading || isFetching) && (
        <View style={styles.centered} testID="loading-view">
          <ActivityIndicator size="large" color="#4a9eff" />
          <Text style={styles.loadingText}>Consultando NASA NeoWs…</Text>
        </View>
      )}

      {/* Error */}
      {searchParams && isError && !isLoading && (
        <View style={styles.centered} testID="error-view">
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Error al cargar asteroides</Text>
          <Text style={styles.errorSubtitle}>
            Comprueba tu conexión o intenta con un rango diferente.
          </Text>
        </View>
      )}

      {/* Lista de resultados */}
      {searchParams && data && !isLoading && (
        <>
          {/* Contador */}
          <Text style={styles.resultCount} testID="result-count">
            {data.length === 0
              ? 'Sin resultados para este rango'
              : `${data.length} asteroide${data.length !== 1 ? 's' : ''} encontrado${data.length !== 1 ? 's' : ''}`}
          </Text>

          <FlatList
            testID="asteroid-list"
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={renderAsteroid}
            ItemSeparatorComponent={ItemSeparator}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            maxToRenderPerBatch={20}
            windowSize={10}
          />
        </>
      )}
    </KeyboardAvoidingView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0d0d1a',
  },
  form: {
    padding: 20,
    backgroundColor: '#13132a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e3a',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#8888aa',
    marginBottom: 16,
    lineHeight: 18,
  },
  label: {
    fontSize: 13,
    color: '#aaaacc',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a4a',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#ffffff',
    marginBottom: 4,
  },
  inputError: {
    borderColor: '#ff6b6b',
  },
  errorText: {
    fontSize: 12,
    color: '#ff6b6b',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#4a9eff',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#8888aa',
    textAlign: 'center',
    lineHeight: 20,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    color: '#8888aa',
    marginTop: 12,
    fontSize: 14,
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ff6b6b',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 13,
    color: '#8888aa',
    textAlign: 'center',
  },
  resultCount: {
    fontSize: 13,
    color: '#8888aa',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  listContent: {
    paddingBottom: 24,
  },
  separator: {
    height: 0,
  },
});
