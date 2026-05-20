/**
 * Datos estáticos del programa Artemis de la NASA.
 *
 * @what Define los tipos y la lista de misiones del programa Artemis,
 *   incluyendo su estado, objetivo, tripulación y fecha objetivo.
 * @why Centralizar aquí los datos evita hard-coding en pantallas individuales
 *   y facilita su actualización cuando cambie el calendario de la NASA.
 * @impact Usado por `MissionStatusScreen`. Sin dependencias externas —
 *   no genera tráfico de red.
 */

/** Estado posible de una misión Artemis */
export type MissionStatus = 'completed' | 'in-progress' | 'planned';

/** Definición de una misión del programa Artemis */
export interface ArtemisMission {
  /** Identificador único de la misión (ej. 'artemis-1') */
  id: string;
  /** Nombre legible de la misión (ej. 'Artemis I') */
  name: string;
  /** Estado actual de la misión */
  status: MissionStatus;
  /** Objetivo principal de la misión en una línea */
  objective: string;
  /** Descripción extendida con contexto histórico y técnico */
  description: string;
  /**
   * Nombres de la tripulación.
   * `null` indica misión no tripulada.
   */
  crew: string[] | null;
  /**
   * Fecha objetivo de lanzamiento o realización.
   * Puede ser un año ('2027') o una fecha ISO ('2022-11-16').
   */
  targetDate: string;
}

/**
 * Lista de misiones del programa Artemis de la NASA.
 *
 * Fuente de referencia: https://www.nasa.gov/artemis/
 */
export const ARTEMIS_MISSIONS: ArtemisMission[] = [
  {
    id: 'artemis-1',
    name: 'Artemis I',
    status: 'completed',
    objective: 'Primer vuelo de prueba no tripulado de SLS y Orion',
    description:
      'Misión inaugural del Sistema de Lanzamiento Espacial (SLS). La cápsula Orion '
      + 'viajó 1.4 millones de km en 25.5 días, orbitó la Luna y regresó a la Tierra. '
      + 'Validó todos los sistemas para vuelos tripulados futuros.',
    crew: null,
    targetDate: '2022-11-16',
  },
  {
    id: 'artemis-2',
    name: 'Artemis II',
    status: 'in-progress',
    objective: 'Primer vuelo tripulado alrededor de la Luna desde Apolo 17',
    description:
      'Cuatro astronautas a bordo de Orion realizarán una trayectoria de vuelo libre '
      + 'alrededor de la Luna (sin aterrizaje) para validar los sistemas de soporte '
      + 'vital y navegación en misión tripulada.',
    crew: ['Reid Wiseman', 'Victor Glover', 'Christina Koch', 'Jeremy Hansen'],
    targetDate: '2026',
  },
  {
    id: 'artemis-3',
    name: 'Artemis III',
    status: 'planned',
    objective: 'Primer alunizaje tripulado desde 1972, polo sur lunar',
    description:
      'La misión trasladará astronautas al polo sur lunar utilizando el Human '
      + 'Landing System (HLS) de SpaceX Starship. Incluirá la primera mujer y '
      + 'la primera persona de color en caminar sobre la Luna.',
    crew: ['TBD', 'TBD', 'TBD', 'TBD'],
    targetDate: '2027',
  },
];
