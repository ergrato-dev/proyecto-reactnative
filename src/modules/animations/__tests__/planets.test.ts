/**
 * Tests unitarios de los datos orbitales de planetas.
 *
 * @what Verifica que el array PLANETS contiene los 4 planetas interiores con
 *   campos válidos y proporciones orbitales coherentes.
 * @why Los datos son la fuente de verdad de las animaciones; si cambian sin
 *   verificación, las proporciones visuales se rompen silenciosamente.
 * @impact Puramente datos — sin dependencias nativas ni mocks.
 */

import type { PlanetData } from '../data/planets';
import { PLANETS } from '../data/planets';

describe('PLANETS — datos orbitales', () => {
  it('contiene exactamente 4 planetas', () => {
    expect(PLANETS).toHaveLength(4);
  });

  it('tiene los ids esperados en orden de distancia al sol', () => {
    const ids = PLANETS.map((p) => p.id);
    expect(ids).toEqual(['mercury', 'venus', 'earth', 'mars']);
  });

  it('todos los planetas tienen los campos requeridos', () => {
    const requiredKeys: (keyof PlanetData)[] = [
      'id',
      'name',
      'color',
      'radius',
      'orbitRadius',
      'periodMs',
    ];
    PLANETS.forEach((planet) => {
      requiredKeys.forEach((key) => {
        expect(planet).toHaveProperty(key);
        expect(planet[key]).toBeDefined();
      });
    });
  });

  it('los colores son cadenas hexadecimales válidas', () => {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    PLANETS.forEach((planet) => {
      expect(planet.color).toMatch(hexRegex);
    });
  });

  it('los radios orbitales están ordenados de menor a mayor', () => {
    const radii = PLANETS.map((p) => p.orbitRadius);
    const sorted = [...radii].sort((a, b) => a - b);
    expect(radii).toEqual(sorted);
  });

  it('los períodos están ordenados de menor a mayor (proporcional a la realidad)', () => {
    const periods = PLANETS.map((p) => p.periodMs);
    const sorted = [...periods].sort((a, b) => a - b);
    expect(periods).toEqual(sorted);
  });

  it('Mercurio tiene el período más corto y Marte el más largo', () => {
    const mercury = PLANETS.find((p) => p.id === 'mercury')!;
    const mars = PLANETS.find((p) => p.id === 'mars')!;
    expect(mercury.periodMs).toBeLessThan(mars.periodMs);
  });

  it('la Tierra tiene periodMs = 8000 ms (valor base)', () => {
    const earth = PLANETS.find((p) => p.id === 'earth')!;
    expect(earth.periodMs).toBe(8000);
  });

  it('todos los radios (planeta y órbita) son números positivos', () => {
    PLANETS.forEach((planet) => {
      expect(planet.radius).toBeGreaterThan(0);
      expect(planet.orbitRadius).toBeGreaterThan(0);
    });
  });

  it('los nombres en español son los esperados', () => {
    const names = PLANETS.map((p) => p.name);
    expect(names).toContain('Mercurio');
    expect(names).toContain('Venus');
    expect(names).toContain('Tierra');
    expect(names).toContain('Marte');
  });
});
