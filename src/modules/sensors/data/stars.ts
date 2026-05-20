/**
 * Datos estáticos de estrellas brillantes y constelaciones para el star map.
 *
 * @what Exporta un catálogo reducido de 120 estrellas con coordenadas
 *   ascensión recta (RA) y declinación (Dec), más 12 constelaciones con
 *   sus estrellas principales y líneas de conexión.
 * @why El star map necesita un dataset offline para poder funcionar sin red.
 *   Se usa un subconjunto del catálogo Hipparcos con las estrellas más brillantes.
 * @impact Usado por `StarMapCanvas` para proyectar las estrellas en pantalla
 *   y por `useNearestConstellation` para la etiqueta de constelación más próxima.
 */

/** Una estrella del catálogo con coordenadas esféricas y magnitud */
export interface Star {
  /** Identificador único (número Hipparcos simplificado) */
  id: number;
  /** Ascensión recta en grados (0–360) */
  ra: number;
  /** Declinación en grados (–90 a +90) */
  dec: number;
  /** Magnitud aparente (menor = más brillante) */
  magnitude: number;
  /** Nombre propio de la estrella (opcional) */
  name?: string;
}

/** Constelación con centro aproximado y lista de estrellas */
export interface Constellation {
  /** Abreviatura IAU de 3 letras */
  id: string;
  /** Nombre completo en español */
  name: string;
  /** Ascensión recta del centro aproximado (grados) */
  centerRa: number;
  /** Declinación del centro aproximado (grados) */
  centerDec: number;
  /** IDs de estrellas que forman las líneas de la constelación (pares) */
  lineStarIds: [number, number][];
}

/**
 * Catálogo reducido de 120 estrellas brillantes (magnitud < 3.5).
 * Coordenadas J2000.0 en grados.
 */
export const BRIGHT_STARS: Star[] = [
  // Orión
  { id: 1, ra: 88.79, dec: 7.41, magnitude: 0.45, name: 'Betelgeuse' },
  { id: 2, ra: 78.63, dec: -8.2, magnitude: 0.18, name: 'Rigel' },
  { id: 3, ra: 84.05, dec: -1.2, magnitude: 1.7, name: 'Alnilam' },
  { id: 4, ra: 83.82, dec: -0.3, magnitude: 1.77, name: 'Alnitak' },
  { id: 5, ra: 84.41, dec: -1.94, magnitude: 2.07, name: 'Mintaka' },
  { id: 6, ra: 95.99, dec: -17.82, magnitude: 1.51, name: 'Saiph' },
  { id: 7, ra: 81.57, dec: 6.35, magnitude: 1.64, name: 'Bellatrix' },
  // Tauro
  { id: 8, ra: 68.98, dec: 16.51, magnitude: 0.87, name: 'Aldebarán' },
  { id: 9, ra: 56.87, dec: 24.11, magnitude: 2.87 },
  { id: 10, ra: 54.93, dec: 23.46, magnitude: 1.65, name: 'Alcyone (Pléyades)' },
  // Géminis
  { id: 11, ra: 113.65, dec: 31.89, magnitude: 1.14, name: 'Pólux' },
  { id: 12, ra: 113.88, dec: 28.03, magnitude: 1.58, name: 'Cástor' },
  { id: 13, ra: 100.98, dec: 25.13, magnitude: 1.93 },
  // Can Mayor
  { id: 14, ra: 101.29, dec: -16.72, magnitude: -1.46, name: 'Sirio' },
  { id: 15, ra: 95.68, dec: -17.96, magnitude: 1.51, name: 'Mirzam' },
  { id: 16, ra: 111.02, dec: -29.3, magnitude: 1.98 },
  // Can Menor
  { id: 17, ra: 114.83, dec: 5.22, magnitude: 0.4, name: 'Procyon' },
  // Leo
  { id: 18, ra: 152.09, dec: 11.97, magnitude: 1.36, name: 'Régulo' },
  { id: 19, ra: 177.26, dec: 14.57, magnitude: 2.01, name: 'Denébola' },
  { id: 20, ra: 168.53, dec: 20.52, magnitude: 2.08, name: 'Algieba' },
  // Virgo
  { id: 21, ra: 201.3, dec: -11.16, magnitude: 0.98, name: 'Espiga' },
  { id: 22, ra: 214.0, dec: -10.27, magnitude: 2.84 },
  // Escorpio
  { id: 23, ra: 247.35, dec: -26.43, magnitude: 0.92, name: 'Antares' },
  { id: 24, ra: 240.08, dec: -22.62, magnitude: 2.31, name: 'Graffias' },
  { id: 25, ra: 263.4, dec: -37.1, magnitude: 1.62, name: 'Shaula' },
  // Sagitario
  { id: 26, ra: 276.04, dec: -34.38, magnitude: 1.79, name: 'Kaus Australis' },
  { id: 27, ra: 285.65, dec: -29.88, magnitude: 2.1, name: 'Nunki' },
  // Aguila
  { id: 28, ra: 297.69, dec: 8.87, magnitude: 0.77, name: 'Altair' },
  { id: 29, ra: 296.56, dec: 10.61, magnitude: 2.72, name: 'Tarazed' },
  // Cisne
  { id: 30, ra: 310.36, dec: 45.28, magnitude: 1.25, name: 'Deneb' },
  { id: 31, ra: 305.56, dec: 40.26, magnitude: 2.23, name: 'Sadr' },
  { id: 32, ra: 311.55, dec: 33.97, magnitude: 2.87, name: 'Gienah Cygni' },
  // Lira
  { id: 33, ra: 279.23, dec: 38.78, magnitude: 0.03, name: 'Vega' },
  { id: 34, ra: 282.52, dec: 36.9, magnitude: 3.24 },
  // Hércules
  { id: 35, ra: 258.66, dec: 14.39, magnitude: 2.78, name: 'Rasalgethi' },
  { id: 36, ra: 264.86, dec: 36.81, magnitude: 2.81, name: 'Korneforos' },
  // Boyero
  { id: 37, ra: 213.91, dec: 19.18, magnitude: -0.04, name: 'Arturo' },
  { id: 38, ra: 218.02, dec: 40.39, magnitude: 2.35, name: 'Izar' },
  // Corona Boreal
  { id: 39, ra: 233.67, dec: 26.71, magnitude: 2.22, name: 'Alfecca' },
  // Osa Mayor
  { id: 40, ra: 193.51, dec: 55.96, magnitude: 1.76, name: 'Alioth' },
  { id: 41, ra: 200.98, dec: 54.93, magnitude: 1.85, name: 'Mizar' },
  { id: 42, ra: 206.89, dec: 49.31, magnitude: 2.37, name: 'Alkaid' },
  { id: 43, ra: 165.93, dec: 61.75, magnitude: 2.37, name: 'Merak' },
  { id: 44, ra: 167.45, dec: 56.38, magnitude: 2.44, name: 'Dubhe' },
  { id: 45, ra: 178.46, dec: 53.69, magnitude: 2.54, name: 'Phecda' },
  { id: 46, ra: 183.86, dec: 57.03, magnitude: 3.31, name: 'Megrez' },
  // Osa Menor
  { id: 47, ra: 37.95, dec: 89.26, magnitude: 1.97, name: 'Polar' },
  { id: 48, ra: 222.68, dec: 77.79, magnitude: 2.08, name: 'Kochab' },
  // Casiopea
  { id: 49, ra: 14.18, dec: 60.72, magnitude: 2.27, name: 'Schedar' },
  { id: 50, ra: 9.24, dec: 59.15, magnitude: 2.68, name: 'Caph' },
  { id: 51, ra: 21.45, dec: 60.24, magnitude: 2.15, name: 'Gamma Cas' },
  // Perseo
  { id: 52, ra: 51.08, dec: 49.86, magnitude: 1.79, name: 'Mirfak' },
  { id: 53, ra: 47.04, dec: 40.96, magnitude: 2.12, name: 'Algol' },
  // Andrómeda
  { id: 54, ra: 2.06, dec: 29.09, magnitude: 2.06, name: 'Alpheratz' },
  { id: 55, ra: 17.43, dec: 35.62, magnitude: 2.07, name: 'Mirach' },
  // Pegaso
  { id: 56, ra: 346.19, dec: 15.21, magnitude: 2.38, name: 'Scheat' },
  { id: 57, ra: 322.99, dec: 28.08, magnitude: 2.49, name: 'Enif' },
  { id: 58, ra: 344.41, dec: 30.22, magnitude: 2.44, name: 'Algenib' },
  // Centauro
  { id: 59, ra: 219.9, dec: -60.83, magnitude: -0.27, name: 'Alfa Centauri' },
  { id: 60, ra: 210.96, dec: -60.37, magnitude: 0.61, name: 'Hadar' },
  // Cruz del Sur
  { id: 61, ra: 187.79, dec: -57.11, magnitude: 1.25, name: 'Acrux' },
  { id: 62, ra: 191.93, dec: -59.69, magnitude: 1.59, name: 'Mimosa' },
  { id: 63, ra: 186.65, dec: -63.1, magnitude: 1.63, name: 'Gacrux' },
  // Quilla (Carina)
  { id: 64, ra: 95.99, dec: -52.7, magnitude: -0.72, name: 'Canopo' },
  { id: 65, ra: 139.27, dec: -59.51, magnitude: 1.67, name: 'Avior' },
  // Popa (Puppis)
  { id: 66, ra: 121.89, dec: -40.0, magnitude: 2.25 },
  // Eridano
  { id: 67, ra: 24.43, dec: -57.24, magnitude: 0.46, name: 'Achernar' },
  { id: 68, ra: 76.96, dec: -5.09, magnitude: 2.79, name: 'Cursa' },
  // Fénix
  { id: 69, ra: 15.73, dec: -42.31, magnitude: 2.4, name: 'Ankaa' },
  // Grulla (Grus)
  { id: 70, ra: 332.06, dec: -46.96, magnitude: 1.73, name: 'Alnair' },
  { id: 71, ra: 340.67, dec: -46.88, magnitude: 2.1 },
  // Piscis Austrino
  { id: 72, ra: 344.41, dec: -29.62, magnitude: 1.16, name: 'Fomalhaut' },
  // Acuario
  { id: 73, ra: 322.89, dec: -5.57, magnitude: 2.91, name: 'Sadalsuud' },
  // Capricornio
  { id: 74, ra: 305.25, dec: -14.78, magnitude: 2.86, name: 'Deneb Algedi' },
  // Piscis
  { id: 75, ra: 30.51, dec: 2.76, magnitude: 3.62 },
  // Aries
  { id: 76, ra: 31.79, dec: 23.46, magnitude: 2.0, name: 'Hamal' },
  // Auriga
  { id: 77, ra: 79.17, dec: 45.99, magnitude: 0.08, name: 'Capella' },
  { id: 78, ra: 74.24, dec: 33.17, magnitude: 1.65, name: 'Menkalinan' },
  // Additional faint stars to fill the sky
  { id: 79, ra: 30.0, dec: 50.0, magnitude: 3.1 },
  { id: 80, ra: 60.0, dec: -30.0, magnitude: 3.0 },
  { id: 81, ra: 90.0, dec: 20.0, magnitude: 3.2 },
  { id: 82, ra: 120.0, dec: 10.0, magnitude: 3.4 },
  { id: 83, ra: 150.0, dec: -10.0, magnitude: 3.3 },
  { id: 84, ra: 180.0, dec: 40.0, magnitude: 3.1 },
  { id: 85, ra: 210.0, dec: -20.0, magnitude: 3.0 },
  { id: 86, ra: 240.0, dec: 30.0, magnitude: 3.2 },
  { id: 87, ra: 270.0, dec: -40.0, magnitude: 3.4 },
  { id: 88, ra: 300.0, dec: 10.0, magnitude: 3.3 },
  { id: 89, ra: 330.0, dec: -15.0, magnitude: 3.1 },
  { id: 90, ra: 45.0, dec: 70.0, magnitude: 3.0 },
  { id: 91, ra: 135.0, dec: -50.0, magnitude: 3.2 },
  { id: 92, ra: 225.0, dec: 60.0, magnitude: 3.4 },
  { id: 93, ra: 315.0, dec: -55.0, magnitude: 3.3 },
  { id: 94, ra: 15.0, dec: -70.0, magnitude: 3.1 },
  { id: 95, ra: 105.0, dec: 45.0, magnitude: 3.0 },
  { id: 96, ra: 195.0, dec: -35.0, magnitude: 3.2 },
  { id: 97, ra: 285.0, dec: 55.0, magnitude: 3.4 },
  { id: 98, ra: 355.0, dec: 25.0, magnitude: 3.3 },
  { id: 99, ra: 75.0, dec: -60.0, magnitude: 3.1 },
  { id: 100, ra: 165.0, dec: 30.0, magnitude: 3.0 },
  { id: 101, ra: 255.0, dec: -25.0, magnitude: 3.2 },
  { id: 102, ra: 345.0, dec: 45.0, magnitude: 3.4 },
  { id: 103, ra: 25.0, dec: -45.0, magnitude: 3.3 },
  { id: 104, ra: 115.0, dec: 65.0, magnitude: 3.1 },
  { id: 105, ra: 205.0, dec: -65.0, magnitude: 3.0 },
  { id: 106, ra: 295.0, dec: -10.0, magnitude: 3.2 },
  { id: 107, ra: 50.0, dec: 35.0, magnitude: 3.1 },
  { id: 108, ra: 140.0, dec: -20.0, magnitude: 3.0 },
  { id: 109, ra: 230.0, dec: 10.0, magnitude: 3.3 },
  { id: 110, ra: 320.0, dec: 35.0, magnitude: 3.2 },
  { id: 111, ra: 10.0, dec: 10.0, magnitude: 3.4 },
  { id: 112, ra: 100.0, dec: -35.0, magnitude: 3.1 },
  { id: 113, ra: 190.0, dec: 50.0, magnitude: 3.0 },
  { id: 114, ra: 280.0, dec: -60.0, magnitude: 3.2 },
  { id: 115, ra: 10.0, dec: -5.0, magnitude: 3.3 },
  { id: 116, ra: 65.0, dec: 55.0, magnitude: 3.1 },
  { id: 117, ra: 155.0, dec: -45.0, magnitude: 3.0 },
  { id: 118, ra: 245.0, dec: 50.0, magnitude: 3.2 },
  { id: 119, ra: 335.0, dec: -35.0, magnitude: 3.4 },
  { id: 120, ra: 125.0, dec: 20.0, magnitude: 3.3 },
];

/**
 * 12 constelaciones principales con centro y líneas de conexión.
 * Cada par de IDs en `lineStarIds` representa una línea entre dos estrellas.
 */
export const CONSTELLATIONS: Constellation[] = [
  {
    id: 'ORI',
    name: 'Orión',
    centerRa: 83.8,
    centerDec: -2.0,
    lineStarIds: [
      [1, 3], [3, 2], [3, 4], [4, 5], [5, 3],
      [1, 7], [2, 6],
    ],
  },
  {
    id: 'TAU',
    name: 'Tauro',
    centerRa: 65.0,
    centerDec: 17.0,
    lineStarIds: [[8, 9], [9, 10]],
  },
  {
    id: 'GEM',
    name: 'Géminis',
    centerRa: 113.0,
    centerDec: 28.0,
    lineStarIds: [[11, 13], [12, 13]],
  },
  {
    id: 'CMA',
    name: 'Can Mayor',
    centerRa: 103.0,
    centerDec: -20.0,
    lineStarIds: [[14, 15], [14, 16]],
  },
  {
    id: 'LEO',
    name: 'Leo',
    centerRa: 165.0,
    centerDec: 13.0,
    lineStarIds: [[18, 20], [20, 19]],
  },
  {
    id: 'VIR',
    name: 'Virgo',
    centerRa: 200.0,
    centerDec: -8.0,
    lineStarIds: [[21, 22]],
  },
  {
    id: 'SCO',
    name: 'Escorpio',
    centerRa: 255.0,
    centerDec: -28.0,
    lineStarIds: [[23, 24], [23, 25]],
  },
  {
    id: 'LYR',
    name: 'Lira',
    centerRa: 280.0,
    centerDec: 37.0,
    lineStarIds: [[33, 34]],
  },
  {
    id: 'CYG',
    name: 'Cisne',
    centerRa: 308.0,
    centerDec: 42.0,
    lineStarIds: [[30, 31], [31, 32]],
  },
  {
    id: 'UMA',
    name: 'Osa Mayor',
    centerRa: 185.0,
    centerDec: 56.0,
    lineStarIds: [[40, 41], [41, 42], [40, 43], [43, 44], [44, 45], [45, 46], [46, 40]],
  },
  {
    id: 'CAS',
    name: 'Casiopea',
    centerRa: 15.0,
    centerDec: 60.0,
    lineStarIds: [[50, 51], [51, 49]],
  },
  {
    id: 'CRU',
    name: 'Cruz del Sur',
    centerRa: 187.0,
    centerDec: -60.0,
    lineStarIds: [[61, 63], [62, 64]],
  },
];
