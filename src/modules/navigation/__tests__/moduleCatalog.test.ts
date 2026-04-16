/**
 * Tests unitarios para el catálogo de módulos (`moduleCatalog.ts`).
 *
 * @what Verifica la integridad de los datos del catálogo: cantidad,
 *   identificadores únicos, valores válidos de plataforma y fase.
 * @why El catálogo es datos estáticos de configuración; si se rompe
 *   (ej.: duplicados, valores inválidos), la pantalla Home falla silenciosamente.
 * @impact Cubre `MODULE_CATALOG` y los tipos `PlatformStatus` / `ModuleCatalogItem`.
 */

import { MODULE_CATALOG, type PlatformStatus } from '../moduleCatalog';

/** Valores válidos para el estado de una plataforma */
const VALID_PLATFORM_STATUSES: PlatformStatus[] = ['ready', 'pending', 'not-applicable'];

describe('MODULE_CATALOG', () => {
  it('debería contener exactamente 13 módulos', () => {
    expect(MODULE_CATALOG).toHaveLength(13);
  });

  it('debería tener IDs únicos en todos los módulos', () => {
    const ids = MODULE_CATALOG.map((m) => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('todos los módulos deberían tener fase entre 1 y 13', () => {
    MODULE_CATALOG.forEach((m) => {
      expect(m.phase).toBeGreaterThanOrEqual(1);
      expect(m.phase).toBeLessThanOrEqual(13);
    });
  });

  it('todos los módulos deberían tener estados de plataforma válidos', () => {
    MODULE_CATALOG.forEach((m) => {
      expect(VALID_PLATFORM_STATUSES).toContain(m.platforms.android);
      expect(VALID_PLATFORM_STATUSES).toContain(m.platforms.web);
      expect(VALID_PLATFORM_STATUSES).toContain(m.platforms.ios);
    });
  });

  it('todos los módulos deberían tener nombre y caso de uso no vacíos', () => {
    MODULE_CATALOG.forEach((m) => {
      expect(m.name.trim().length).toBeGreaterThan(0);
      expect(m.astronomicalUseCase.trim().length).toBeGreaterThan(0);
    });
  });

  it('el módulo de navegación (fase 1) debería tener Android y Web como ready', () => {
    const nav = MODULE_CATALOG.find((m) => m.id === 'navigation');
    expect(nav).toBeDefined();
    expect(nav?.platforms.android).toBe('ready');
    expect(nav?.platforms.web).toBe('ready');
    expect(nav?.platforms.ios).toBe('pending');
    expect(nav?.phase).toBe(1);
  });

  it('los módulos de cámara y notificaciones deberían tener web como not-applicable', () => {
    const camera = MODULE_CATALOG.find((m) => m.id === 'camera');
    const notifications = MODULE_CATALOG.find((m) => m.id === 'notifications');
    expect(camera?.platforms.web).toBe('not-applicable');
    expect(notifications?.platforms.web).toBe('not-applicable');
  });

  it('todos los módulos deberían tener fase única', () => {
    const phases = MODULE_CATALOG.map((m) => m.phase);
    const uniquePhases = new Set(phases);
    expect(uniquePhases.size).toBe(phases.length);
  });
});
