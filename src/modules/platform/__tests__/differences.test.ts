import {
  CATEGORY_LABELS,
  getCurrentPlatform,
  PLATFORM_DIFFERENCES,
  SUPPORT_ICON,
  SupportLevel,
} from '../data/differences';

/**
 * Tests unitarios de los datos puros del módulo platform.
 * No requieren mocks: validan integridad de la estructura de datos.
 */

describe('PLATFORM_DIFFERENCES', () => {
  it('contiene exactamente 8 diferencias', () => {
    expect(PLATFORM_DIFFERENCES).toHaveLength(8);
  });

  it('todos los IDs son únicos', () => {
    const ids = PLATFORM_DIFFERENCES.map((d) => d.id);
    expect(new Set(ids).size).toBe(8);
  });

  it('cada diferencia tiene todos los campos requeridos', () => {
    for (const diff of PLATFORM_DIFFERENCES) {
      expect(diff.id).toBeTruthy();
      expect(diff.title).toBeTruthy();
      expect(diff.description).toBeTruthy();
      expect(diff.category).toBeTruthy();
      expect(diff.codeSnippet).toBeTruthy();
      expect(diff.support).toBeDefined();
      expect(diff.support.android).toBeTruthy();
      expect(diff.support.web).toBeTruthy();
      expect(diff.support.ios).toBeTruthy();
    }
  });

  it('todas las categorías son válidas', () => {
    const validCategories = Object.keys(CATEGORY_LABELS);
    for (const diff of PLATFORM_DIFFERENCES) {
      expect(validCategories).toContain(diff.category);
    }
  });

  it('todos los niveles de soporte son válidos', () => {
    const validLevels: SupportLevel[] = ['full', 'partial', 'unavailable'];
    for (const diff of PLATFORM_DIFFERENCES) {
      expect(validLevels).toContain(diff.support.android);
      expect(validLevels).toContain(diff.support.web);
      expect(validLevels).toContain(diff.support.ios);
    }
  });

  it('incluye diferencia de camera-permission', () => {
    const entry = PLATFORM_DIFFERENCES.find((d) => d.id === 'camera-permission');
    expect(entry).toBeDefined();
    expect(entry!.category).toBe('permissions');
  });

  it('incluye diferencia de action-sheet', () => {
    const entry = PLATFORM_DIFFERENCES.find((d) => d.id === 'action-sheet');
    expect(entry).toBeDefined();
    expect(entry!.category).toBe('ui');
  });
});

describe('CATEGORY_LABELS', () => {
  it('tiene etiquetas para las 6 categorías esperadas', () => {
    const expected = ['permissions', 'ui', 'sensors', 'storage', 'navigation', 'network'];
    for (const cat of expected) {
      expect(CATEGORY_LABELS).toHaveProperty(cat);
      expect(CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]).toBeTruthy();
    }
  });
});

describe('SUPPORT_ICON', () => {
  it('tiene íconos para los 3 niveles de soporte', () => {
    expect(SUPPORT_ICON.full).toBeTruthy();
    expect(SUPPORT_ICON.partial).toBeTruthy();
    expect(SUPPORT_ICON.unavailable).toBeTruthy();
  });
});

describe('getCurrentPlatform', () => {
  it('retorna un valor válido de SupportedPlatform', () => {
    const valid = ['android', 'web', 'ios'];
    expect(valid).toContain(getCurrentPlatform());
  });
});
