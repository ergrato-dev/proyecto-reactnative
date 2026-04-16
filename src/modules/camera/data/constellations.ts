/**
 * Datos estáticos de constelaciones para el overlay AR.
 *
 * @what Exporta 12 constelaciones con sus estrellas principales, coordenadas
 *   proyectadas en pantalla (normalizadas 0–1) y líneas de conexión.
 *   Las coordenadas están pre-calculadas para un campo de visión de 60°
 *   centrado en el cénit boreal (constelaciones visibles en latitudes medias).
 * @why El overlay AR necesita posiciones de pantalla para renderizar el SVG
 *   sin depender de la ubicación GPS del dispositivo (demo offline).
 * @impact Usado exclusivamente por `ConstellationOverlay`; cambios en el
 *   formato de datos requieren actualizar el componente y sus tests.
 */

/** Estrella con posición normalizada para el overlay (0,0 = top-left, 1,1 = bottom-right) */
export interface ARStar {
  /** ID único de la estrella */
  id: number;
  /** Nombre propio de la estrella (si existe) */
  name?: string;
  /** Posición X normalizada en pantalla (0–1) */
  x: number;
  /** Posición Y normalizada en pantalla (0–1) */
  y: number;
  /** Magnitud aparente (menor = más brillante) */
  magnitude: number;
}

/** Constelación con sus estrellas y líneas de conexión para el overlay */
export interface ARConstellation {
  /** Abreviatura IAU de 3 letras */
  id: string;
  /** Nombre completo en español */
  name: string;
  /** Estrellas que componen la constelación */
  stars: ARStar[];
  /** Pares de IDs de estrellas que forman las líneas de la constelación */
  lines: [number, number][];
  /** Color del overlay en formato hex */
  color: string;
}

/** Constelaciones con posiciones normalizadas (demo para campo de visión ~60°) */
export const AR_CONSTELLATIONS: ARConstellation[] = [
  {
    id: 'ORI',
    name: 'Orión',
    color: '#4fc3f7',
    stars: [
      { id: 1, name: 'Betelgeuse', x: 0.52, y: 0.22, magnitude: 0.45 },
      { id: 2, name: 'Rigel',      x: 0.38, y: 0.72, magnitude: 0.18 },
      { id: 3, name: 'Alnilam',    x: 0.45, y: 0.48, magnitude: 1.7  },
      { id: 4, name: 'Alnitak',    x: 0.49, y: 0.52, magnitude: 1.77 },
      { id: 5, name: 'Mintaka',    x: 0.41, y: 0.44, magnitude: 2.07 },
      { id: 6, name: 'Saiph',      x: 0.56, y: 0.74, magnitude: 1.51 },
      { id: 7, name: 'Bellatrix',  x: 0.35, y: 0.24, magnitude: 1.64 },
    ],
    lines: [[1,3],[3,4],[4,5],[5,7],[2,4],[6,4],[1,7]],
  },
  {
    id: 'UMA',
    name: 'Osa Mayor',
    color: '#ce93d8',
    stars: [
      { id: 10, name: 'Dubhe',    x: 0.62, y: 0.15, magnitude: 1.79 },
      { id: 11, name: 'Merak',    x: 0.66, y: 0.22, magnitude: 2.37 },
      { id: 12, name: 'Phad',     x: 0.72, y: 0.28, magnitude: 2.44 },
      { id: 13, name: 'Megrez',   x: 0.68, y: 0.20, magnitude: 3.31 },
      { id: 14, name: 'Alioth',   x: 0.74, y: 0.18, magnitude: 1.77 },
      { id: 15, name: 'Mizar',    x: 0.81, y: 0.15, magnitude: 2.23 },
      { id: 16, name: 'Alkaid',   x: 0.88, y: 0.12, magnitude: 1.86 },
    ],
    lines: [[10,11],[11,12],[12,13],[13,14],[14,15],[15,16],[10,13]],
  },
  {
    id: 'CAS',
    name: 'Casiopea',
    color: '#80deea',
    stars: [
      { id: 20, name: 'Shedar',   x: 0.18, y: 0.18, magnitude: 2.24 },
      { id: 21, name: 'Caph',     x: 0.12, y: 0.14, magnitude: 2.27 },
      { id: 22, name: 'Navi',     x: 0.24, y: 0.12, magnitude: 2.47 },
      { id: 23, name: 'Ruchbah',  x: 0.30, y: 0.16, magnitude: 2.68 },
      { id: 24, name: 'Segin',    x: 0.36, y: 0.14, magnitude: 3.38 },
    ],
    lines: [[21,20],[20,22],[22,23],[23,24]],
  },
  {
    id: 'LEO',
    name: 'Leo',
    color: '#fff176',
    stars: [
      { id: 30, name: 'Régulo',   x: 0.28, y: 0.52, magnitude: 1.36 },
      { id: 31, name: 'Denébola', x: 0.62, y: 0.48, magnitude: 2.01 },
      { id: 32, name: 'Algieba',  x: 0.44, y: 0.44, magnitude: 2.08 },
      { id: 33,                   x: 0.38, y: 0.56, magnitude: 2.61 },
      { id: 34,                   x: 0.52, y: 0.42, magnitude: 3.33 },
    ],
    lines: [[30,33],[33,32],[32,34],[34,31],[30,32]],
  },
  {
    id: 'SCO',
    name: 'Escorpio',
    color: '#ef9a9a',
    stars: [
      { id: 40, name: 'Antares',  x: 0.50, y: 0.82, magnitude: 0.92 },
      { id: 41, name: 'Graffias', x: 0.44, y: 0.78, magnitude: 2.31 },
      { id: 42, name: 'Shaula',   x: 0.60, y: 0.88, magnitude: 1.62 },
      { id: 43,                   x: 0.56, y: 0.86, magnitude: 2.7  },
      { id: 44,                   x: 0.46, y: 0.74, magnitude: 2.82 },
    ],
    lines: [[41,44],[44,40],[40,43],[43,42]],
  },
];
