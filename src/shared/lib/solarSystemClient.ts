/**
 * Cliente HTTP centralizado para la API Solar System OpenData.
 *
 * @what Exporta funciones tipadas para obtener cuerpos del sistema solar
 *   (planetas, lunas, asteroides, cometas) desde la API abierta de le-systeme-solaire.net.
 * @why Centralizar las llamadas evita duplicar la URL base y los tipos de respuesta
 *   en múltiples hooks del módulo `lists/`.
 * @impact Todos los hooks del módulo `lists/` dependen de este cliente.
 *   No requiere autenticación — API completamente abierta.
 */

/** URL base de la API Solar System OpenData */
const SOLAR_BASE_URL = 'https://api.le-systeme-solaire.net/rest';

// ─── Tipos de respuesta ────────────────────────────────────────────────────────

/** Tipo de cuerpo celeste según la clasificación de la API */
export type BodyType = 'Planet' | 'Moon' | 'Asteroid' | 'Comet' | 'Dwarf Planet' | string;

/** Datos de un cuerpo celeste del sistema solar */
export interface SolarBody {
  id: string;
  name: string;
  englishName: string;
  isPlanet: boolean;
  bodyType: BodyType;
  mass: { massValue: number; massExponent: number } | null;
  vol: { volValue: number; volExponent: number } | null;
  density: number | null;
  gravity: number | null;
  meanRadius: number | null;
  equaRadius: number | null;
  polarRadius: number | null;
  sideralOrbit: number | null;  // días
  sideralRotation: number | null;
  axialTilt: number | null;
  avgTemp: number | null;        // Kelvin
  moons: Array<{ moon: string; rel: string }> | null;
  discoveredBy: string;
  discoveryDate: string;
  aroundPlanet: { planet: string; rel: string } | null;
}

/** Respuesta de la lista de cuerpos celestes */
export interface SolarBodyListResponse {
  bodies: SolarBody[];
}

// ─── Funciones del cliente ────────────────────────────────────────────────────

/**
 * Obtiene la lista completa de cuerpos del sistema solar.
 *
 * @what Llama a `/bodies` y devuelve todos los cuerpos registrados en la API.
 * @why El módulo `lists/` necesita esta lista para el catálogo de FlatList / SectionList.
 * @impact Usado en `useBodyList`. Aplicar `staleTime` de 24h — los datos orbitales
 *   no cambian frecuentemente.
 *
 * @returns Lista de todos los cuerpos del sistema solar
 * @throws Error con mensaje en español si la respuesta no es OK
 */
export async function fetchAllBodies(): Promise<SolarBody[]> {
  const response = await fetch(`${SOLAR_BASE_URL}/bodies`);

  if (!response.ok) {
    throw new Error(
      `Error al obtener el catálogo del sistema solar: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as SolarBodyListResponse;
  return data.bodies;
}

/**
 * Obtiene los datos detallados de un cuerpo celeste por su ID.
 *
 * @what Llama a `/bodies/:id` y devuelve todos los campos del cuerpo indicado.
 * @why El módulo `lists/` necesita los detalles completos para la pantalla de detalle.
 * @impact Usado en `useBodyDetail`. Aplicar `staleTime` de 24h.
 *
 * @param id - Identificador único del cuerpo (ej. `"terre"`, `"mars"`, `"lune"`)
 * @returns Datos completos del cuerpo celeste
 * @throws Error con mensaje en español si la respuesta no es OK o el ID no existe
 */
export async function fetchBodyById(id: string): Promise<SolarBody> {
  const response = await fetch(`${SOLAR_BASE_URL}/bodies/${encodeURIComponent(id)}`);

  if (!response.ok) {
    throw new Error(
      `Error al obtener los datos del cuerpo "${id}": ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<SolarBody>;
}
