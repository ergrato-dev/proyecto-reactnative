/**
 * Tests del schema Zod `asteroidSearchSchema` y sus helpers.
 *
 * @what Verifica las reglas de validación de fechas: formato correcto,
 *   fecha invertida, rango > 7 días, rango exactamente 7 días (límite válido).
 * @why El schema es la única fuente de verdad de las reglas de negocio;
 *   testear aquí garantiza que react-hook-form aplica las restricciones correctas.
 * @impact Si se modifica `asteroidSearchSchema`, estos tests deben actualizarse.
 */

import {
  asteroidSearchSchema,
  diffInDays,
  formatDateToISO,
  todayPlusDays,
  MAX_DATE_RANGE_DAYS,
} from '../schemas/asteroidSearchSchema';

// ─── diffInDays ────────────────────────────────────────────────────────────────

describe('diffInDays', () => {
  it('debería devolver 7 para un rango de 7 días', () => {
    expect(diffInDays('2026-04-01', '2026-04-08')).toBe(7);
  });

  it('debería devolver 0 para el mismo día', () => {
    expect(diffInDays('2026-04-01', '2026-04-01')).toBe(0);
  });

  it('debería devolver negativo cuando la fecha final es anterior a la inicial', () => {
    expect(diffInDays('2026-04-08', '2026-04-01')).toBeLessThan(0);
  });

  it('debería devolver 1 para días consecutivos', () => {
    expect(diffInDays('2026-04-01', '2026-04-02')).toBe(1);
  });
});

// ─── formatDateToISO ──────────────────────────────────────────────────────────

describe('formatDateToISO', () => {
  it('debería formatear un objeto Date correctamente', () => {
    // Crear fecha UTC para evitar diferencias de zona horaria en los tests
    const date = new Date(2026, 3, 16); // 16 de abril 2026 (mes 0-indexed)
    const result = formatDateToISO(date);
    expect(result).toBe('2026-04-16');
  });

  it('debería devolver la parte de fecha local de un string ISO (independiente de zona horaria)', () => {
    // La función usa getters locales (getDate/getMonth/getFullYear), por lo que
    // el resultado correcto depende de la zona horaria del entorno de test.
    // Calculamos el expected con el mismo new Date() para que el test sea robusto.
    const isoStr = '2026-04-16T00:00:00Z';
    const d = new Date(isoStr);
    const expected = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    expect(formatDateToISO(isoStr)).toBe(expected);
  });
});

// ─── todayPlusDays ────────────────────────────────────────────────────────────

describe('todayPlusDays', () => {
  it('debería devolver una fecha con formato YYYY-MM-DD', () => {
    const result = todayPlusDays(0);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('debería devolver una fecha 7 días posterior a hoy', () => {
    const today = new Date();
    const expected = new Date(today);
    expected.setDate(expected.getDate() + 7);
    const expectedStr = formatDateToISO(expected);
    expect(todayPlusDays(7)).toBe(expectedStr);
  });
});

// ─── asteroidSearchSchema ─────────────────────────────────────────────────────

describe('asteroidSearchSchema', () => {
  it('debería validar un rango correcto de 7 días', () => {
    const result = asteroidSearchSchema.safeParse({
      startDate: '2026-04-01',
      endDate: '2026-04-08',
    });
    expect(result.success).toBe(true);
  });

  it('debería validar un rango de 0 días (mismo día)', () => {
    const result = asteroidSearchSchema.safeParse({
      startDate: '2026-04-01',
      endDate: '2026-04-01',
    });
    expect(result.success).toBe(true);
  });

  it('debería rechazar cuando la fecha de inicio es posterior a la de fin', () => {
    const result = asteroidSearchSchema.safeParse({
      startDate: '2026-04-08',
      endDate: '2026-04-01',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain('startDate');
    }
  });

  it(`debería rechazar un rango mayor a ${MAX_DATE_RANGE_DAYS} días`, () => {
    const result = asteroidSearchSchema.safeParse({
      startDate: '2026-04-01',
      endDate: '2026-04-09', // 8 días
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain('endDate');
    }
  });

  it('debería rechazar una fecha con formato incorrecto', () => {
    const result = asteroidSearchSchema.safeParse({
      startDate: '01/04/2026', // formato incorrecto
      endDate: '2026-04-08',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain('startDate');
    }
  });

  it('debería rechazar campos vacíos', () => {
    const result = asteroidSearchSchema.safeParse({ startDate: '', endDate: '' });
    expect(result.success).toBe(false);
  });

  it('debería incluir el mensaje correcto para rango invertido', () => {
    const result = asteroidSearchSchema.safeParse({
      startDate: '2026-04-10',
      endDate: '2026-04-05',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes('anterior o igual'))).toBe(true);
    }
  });
});
