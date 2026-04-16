/**
 * @what Datos orbitales y visuales de los planetas interiores del sistema solar.
 * @why Centraliza la fuente de verdad para las animaciones de órbita, desacoplando
 *   los valores físicos/visuales de la lógica de animación y del componente.
 * @impact Cambiar este archivo afecta directamente las proporciones de la animación
 *   orbital en OrbitScreen y el catálogo de planetas renderizados.
 */

/** Datos de un planeta para la animación orbital */
export interface PlanetData {
  /** Identificador único (en inglés, minúsculas) */
  id: string;
  /** Nombre visible en español */
  name: string;
  /** Color del planeta en hexadecimal */
  color: string;
  /** Radio visual del punto del planeta en px */
  radius: number;
  /** Radio visual de la órbita en px */
  orbitRadius: number;
  /**
   * Período orbital en milisegundos para la animación.
   * Proporcional a los períodos reales: Mercurio=88d, Venus=225d, Tierra=365d, Marte=687d.
   * Base: Tierra = 8000 ms → factor = 8000 / 365.
   */
  periodMs: number;
}

/** Factor de escala: Tierra (365 días) → 8000 ms */
const SCALE_FACTOR = 8000 / 365;

/**
 * Planetas del sistema solar interior con datos proporcionales a la realidad.
 * Ordenados por distancia al Sol (menor a mayor).
 */
export const PLANETS: PlanetData[] = [
  {
    id: 'mercury',
    name: 'Mercurio',
    color: '#B5B5B5',
    radius: 5,
    orbitRadius: 60,
    periodMs: Math.round(88 * SCALE_FACTOR),    // ≈ 1927 ms
  },
  {
    id: 'venus',
    name: 'Venus',
    color: '#E8C07D',
    radius: 9,
    orbitRadius: 100,
    periodMs: Math.round(225 * SCALE_FACTOR),   // ≈ 4932 ms
  },
  {
    id: 'earth',
    name: 'Tierra',
    color: '#4B9CD3',
    radius: 10,
    orbitRadius: 145,
    periodMs: 8000,                              // = 365 * SCALE_FACTOR exacto
  },
  {
    id: 'mars',
    name: 'Marte',
    color: '#C1440E',
    radius: 7,
    orbitRadius: 195,
    periodMs: Math.round(687 * SCALE_FACTOR),   // ≈ 15057 ms
  },
];
