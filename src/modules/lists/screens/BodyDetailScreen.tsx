/**
 * Pantalla de detalle de un cuerpo celeste.
 *
 * @what Muestra todos los campos disponibles de un `SolarBody`:
 *   nombre, tipo, masa, volumen, densidad, gravedad, radios, período orbital,
 *   rotación, inclinación axial, temperatura, lunas e información de descubrimiento.
 * @why Cumple RF-LIST-04 — el usuario puede ver todos los datos científicos
 *   de cualquier cuerpo que seleccione en el catálogo solar.
 * @impact Consume `useBodyDetail(bodyId)` via `route.params`.
 *   Cambios en `SolarBody` (solarSystemClient.ts) se reflejan aquí directamente.
 */

import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { BodyDetailScreenProps } from '@/modules/navigation/types';
import { useBodyDetail } from '../hooks/useBodyDetail';

// ─── Componentes internos ─────────────────────────────────────────────────────

/** Indicador de carga inicial */
function LoadingView() {
  return (
    <View style={styles.centered} testID="loading-view">
      <ActivityIndicator size="large" color="#4fc3f7" />
      <Text style={styles.loadingText}>Cargando datos...</Text>
    </View>
  );
}

/** Vista de error */
function ErrorView({ name }: { name: string }) {
  return (
    <View style={styles.centered} testID="error-view">
      <Text style={styles.errorText}>No se pudo cargar la información de {name}.</Text>
    </View>
  );
}

/** Fila de dato con etiqueta y valor */
function DataRow({ label, value, testID }: { label: string; value: string; testID?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} testID={testID}>
        {value}
      </Text>
    </View>
  );
}

/** Sección con título separador */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

// ─── Helpers de formateo ──────────────────────────────────────────────────────

/**
 * Formatea un valor de masa (massValue × 10^massExponent) a texto legible.
 *
 * @what Convierte el objeto `{ massValue, massExponent }` de la API a string.
 * @why La API no devuelve la masa en un formato directamente imprimible.
 * @impact Usado solo en `BodyDetailScreen`.
 */
export function formatMass(massValue: number, massExponent: number): string {
  return `${massValue} × 10^${massExponent} kg`;
}

/**
 * Convierte temperatura en Kelvin a Celsius.
 *
 * @what Resta 273.15 K para obtener °C.
 * @why Los usuarios entienden mejor Celsius que Kelvin.
 * @impact Usado solo en `BodyDetailScreen`.
 *
 * @param kelvin - Temperatura en Kelvin
 */
export function kelvinToCelsius(kelvin: number): string {
  return `${(kelvin - 273.15).toFixed(1)} °C (${kelvin} K)`;
}

// ─── Pantalla ─────────────────────────────────────────────────────────────────

/**
 * Pantalla de detalle de un cuerpo celeste del sistema solar.
 *
 * @what Renderiza todos los campos de `SolarBody` en una ScrollView organizada
 *   en secciones temáticas (Identificación, Física, Órbita, Descubrimiento).
 * @why El catálogo solar (RF-LIST-04) requiere acceso a datos completos de cada cuerpo.
 * @impact Navega hasta aquí desde `SolarCatalogScreen` con `bodyId` y `bodyName`.
 */
export function BodyDetailScreen({ route }: BodyDetailScreenProps) {
  const { bodyId, bodyName } = route.params;
  const { data, isLoading, isError, isFetching } = useBodyDetail(bodyId);

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView name={bodyName} />;
  if (!data) return null;

  const displayName = data.englishName || data.name;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} testID="detail-scroll">
      {/* Banner de actualización en segundo plano */}
      {isFetching && (
        <View style={styles.refreshBanner} testID="refresh-banner">
          <Text style={styles.refreshText}>Actualizando datos...</Text>
        </View>
      )}

      {/* Nombre y tipo */}
      <View style={styles.hero}>
        <Text style={styles.heroName} testID="body-name">
          {displayName}
        </Text>
        {data.name !== displayName && (
          <Text style={styles.heroAlt} testID="body-alt-name">
            {data.name}
          </Text>
        )}
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText} testID="body-type">
            {data.bodyType || 'Desconocido'}
          </Text>
        </View>
        {data.isPlanet && (
          <View style={styles.planetBadge}>
            <Text style={styles.planetBadgeText}>Planeta</Text>
          </View>
        )}
      </View>

      {/* Datos físicos */}
      <Section title="Propiedades físicas">
        {data.mass && (
          <DataRow
            label="Masa"
            value={formatMass(data.mass.massValue, data.mass.massExponent)}
            testID="body-mass"
          />
        )}
        {data.vol && (
          <DataRow
            label="Volumen"
            value={`${data.vol.volValue} × 10^${data.vol.volExponent} km³`}
            testID="body-volume"
          />
        )}
        {data.density !== null && (
          <DataRow
            label="Densidad"
            value={`${data.density} g/cm³`}
            testID="body-density"
          />
        )}
        {data.gravity !== null && (
          <DataRow
            label="Gravedad superficial"
            value={`${data.gravity} m/s²`}
            testID="body-gravity"
          />
        )}
        {data.meanRadius !== null && (
          <DataRow
            label="Radio medio"
            value={`${data.meanRadius} km`}
            testID="body-mean-radius"
          />
        )}
        {data.equaRadius !== null && (
          <DataRow
            label="Radio ecuatorial"
            value={`${data.equaRadius} km`}
            testID="body-equa-radius"
          />
        )}
        {data.polarRadius !== null && (
          <DataRow
            label="Radio polar"
            value={`${data.polarRadius} km`}
            testID="body-polar-radius"
          />
        )}
        {data.avgTemp !== null && (
          <DataRow
            label="Temperatura media"
            value={kelvinToCelsius(data.avgTemp)}
            testID="body-temp"
          />
        )}
      </Section>

      {/* Datos orbitales */}
      <Section title="Órbita y rotación">
        {data.sideralOrbit !== null && (
          <DataRow
            label="Período orbital"
            value={`${data.sideralOrbit} días`}
            testID="body-orbital"
          />
        )}
        {data.sideralRotation !== null && (
          <DataRow
            label="Rotación sidérea"
            value={`${data.sideralRotation} h`}
            testID="body-rotation"
          />
        )}
        {data.axialTilt !== null && (
          <DataRow
            label="Inclinación axial"
            value={`${data.axialTilt}°`}
            testID="body-axial"
          />
        )}
        {data.aroundPlanet && (
          <DataRow
            label="Orbita alrededor de"
            value={data.aroundPlanet.planet}
            testID="body-around"
          />
        )}
      </Section>

      {/* Satélites */}
      {data.moons && data.moons.length > 0 && (
        <Section title="Satélites naturales">
          <DataRow
            label="Número de lunas"
            value={String(data.moons.length)}
            testID="body-moons-count"
          />
          <Text style={styles.moonsList} testID="body-moons-list">
            {data.moons.map((m) => m.moon).join(', ')}
          </Text>
        </Section>
      )}

      {/* Descubrimiento */}
      {(data.discoveredBy || data.discoveryDate) && (
        <Section title="Descubrimiento">
          {data.discoveredBy ? (
            <DataRow label="Descubierto por" value={data.discoveredBy} testID="body-discovered-by" />
          ) : null}
          {data.discoveryDate ? (
            <DataRow label="Fecha de descubrimiento" value={data.discoveryDate} testID="body-discovery-date" />
          ) : null}
        </Section>
      )}

      {/* Enlace a NASAClient (placeholder para Fase futura) */}
      <TouchableOpacity style={styles.moreButton} testID="more-button">
        <Text style={styles.moreButtonText}>Ver más en NASA</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#050d24',
  },
  content: {
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    backgroundColor: '#050d24',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#78909c',
    marginTop: 12,
    fontSize: 15,
  },
  errorText: {
    color: '#ef9a9a',
    fontSize: 15,
    textAlign: 'center',
  },
  refreshBanner: {
    backgroundColor: '#1a237e',
    padding: 8,
    alignItems: 'center',
  },
  refreshText: {
    color: '#90caf9',
    fontSize: 12,
  },
  hero: {
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#0d1f3c',
  },
  heroName: {
    color: '#e3f2fd',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  heroAlt: {
    color: '#546e7a',
    fontSize: 14,
    marginBottom: 12,
  },
  typeBadge: {
    backgroundColor: '#1565c0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 6,
  },
  typeBadgeText: {
    color: '#90caf9',
    fontSize: 13,
    fontWeight: '600',
  },
  planetBadge: {
    backgroundColor: '#4a148c',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  planetBadgeText: {
    color: '#ce93d8',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#4fc3f7',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#0d1f3c',
    paddingBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
  },
  label: {
    color: '#78909c',
    fontSize: 14,
    flex: 1,
  },
  value: {
    color: '#e3f2fd',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  moonsList: {
    color: '#b0bec5',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
  moreButton: {
    margin: 24,
    backgroundColor: '#0d1f3c',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1565c0',
  },
  moreButtonText: {
    color: '#4fc3f7',
    fontWeight: '600',
  },
});
