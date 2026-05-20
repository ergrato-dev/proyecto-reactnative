/**
 * Tests unitarios del catálogo de estrellas y constelaciones.
 *
 * @what Valida la integridad del dataset BRIGHT_STARS y CONSTELLATIONS:
 *   cantidad mínima, rango de coordenadas, unicidad de IDs y coherencia
 *   de las referencias de líneas de constelación.
 * @why El star map depende de estos datos offline; cualquier error en el
 *   catálogo causa proyecciones incorrectas o crashes en runtime.
 * @impact Test de datos puros — no requiere mocks ni renderizado.
 */

import { BRIGHT_STARS, CONSTELLATIONS } from '../data/stars';

describe('BRIGHT_STARS', () => {
  it('contiene al menos 100 estrellas', () => {
    expect(BRIGHT_STARS.length).toBeGreaterThanOrEqual(100);
  });

  it('todos los ids son únicos', () => {
    const ids = BRIGHT_STARS.map((s) => s.id);
    expect(new Set(ids).size).toBe(BRIGHT_STARS.length);
  });

  it('todas las RA están en el rango [0, 360)', () => {
    for (const star of BRIGHT_STARS) {
      expect(star.ra).toBeGreaterThanOrEqual(0);
      expect(star.ra).toBeLessThan(360);
    }
  });

  it('todas las Dec están en el rango [-90, +90]', () => {
    for (const star of BRIGHT_STARS) {
      expect(star.dec).toBeGreaterThanOrEqual(-90);
      expect(star.dec).toBeLessThanOrEqual(90);
    }
  });

  it('todas las magnitudes son números finitos', () => {
    for (const star of BRIGHT_STARS) {
      expect(Number.isFinite(star.magnitude)).toBe(true);
    }
  });

  it('las estrellas con nombre no tienen cadena vacía', () => {
    const namedStars = BRIGHT_STARS.filter((s) => s.name !== undefined);
    for (const star of namedStars) {
      expect(star.name!.length).toBeGreaterThan(0);
    }
  });

  it('incluye a Sirio (la estrella más brillante del cielo nocturno)', () => {
    const sirius = BRIGHT_STARS.find((s) => s.name === 'Sirio');
    expect(sirius).toBeDefined();
    expect(sirius!.magnitude).toBeLessThan(0);
  });
});

describe('CONSTELLATIONS', () => {
  it('contiene al menos 12 constelaciones', () => {
    expect(CONSTELLATIONS.length).toBeGreaterThanOrEqual(12);
  });

  it('todos los ids son únicos', () => {
    const ids = CONSTELLATIONS.map((c) => c.id);
    expect(new Set(ids).size).toBe(CONSTELLATIONS.length);
  });

  it('todos los centerRa están en [0, 360)', () => {
    for (const c of CONSTELLATIONS) {
      expect(c.centerRa).toBeGreaterThanOrEqual(0);
      expect(c.centerRa).toBeLessThan(360);
    }
  });

  it('todos los centerDec están en [-90, +90]', () => {
    for (const c of CONSTELLATIONS) {
      expect(c.centerDec).toBeGreaterThanOrEqual(-90);
      expect(c.centerDec).toBeLessThanOrEqual(90);
    }
  });

  it('todos los starIds en lineStarIds existen en BRIGHT_STARS', () => {
    const starIds = new Set(BRIGHT_STARS.map((s) => s.id));
    for (const c of CONSTELLATIONS) {
      for (const [a, b] of c.lineStarIds) {
        expect(starIds.has(a)).toBe(true);
        expect(starIds.has(b)).toBe(true);
      }
    }
  });

  it('incluye Orión (ORI)', () => {
    const orion = CONSTELLATIONS.find((c) => c.id === 'ORI');
    expect(orion).toBeDefined();
    expect(orion!.lineStarIds.length).toBeGreaterThan(0);
  });
});
