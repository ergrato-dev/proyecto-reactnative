/**
 * Esquema de validación Zod para el formulario de búsqueda de asteroides.
 *
 * @what Define y exporta el schema Zod `asteroidSearchSchema` y el tipo
 *   `AsteroidSearchFormValues` inferido de él.
 * @why Centralizar las reglas de negocio (rango ≤ 7 días, fecha inicio ≤ fin)
 *   en un único lugar garantiza que react-hook-form y los tests compartan
 *   exactamente las mismas restricciones.
 * @impact Usado en `AsteroidSearchScreen` (react-hook-form) y en los tests
 *   unitarios del schema. Cambios aquí pueden romper la validación del formulario.
 */

import { z } from 'zod';

// ─── Constantes ───────────────────────────────────────────────────────────────

/** Rango máximo de días aceptado por la API NeoWs de NASA */
export const MAX_DATE_RANGE_DAYS = 7;

/** Formato de fecha esperado: YYYY-MM-DD */
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// ─── Helpers exportados ────────────────────────────────────────────────────────

/**
 * Calcula la diferencia en días entre dos fechas en formato YYYY-MM-DD.
 *
 * @what Devuelve `endDate - startDate` en días enteros.
 * @why Necesario para la regla de validación de rango ≤ 7 días y para los tests.
 * @impact Usado dentro de `asteroidSearchSchema.refine` y exportado para tests.
 *
 * @param start - Fecha de inicio en formato YYYY-MM-DD
 * @param end   - Fecha de fin en formato YYYY-MM-DD
 * @returns Diferencia en días (puede ser negativa si el orden es incorrecto)
 */
export function diffInDays(start: string, end: string): number {
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  return Math.round((endMs - startMs) / (1000 * 60 * 60 * 24));
}

/**
 * Formatea una fecha Date o ISO string a formato YYYY-MM-DD.
 *
 * @what Toma un objeto `Date` o string ISO y devuelve sólo la parte de fecha.
 * @why El formulario y el cliente NeoWs trabajan con cadenas YYYY-MM-DD;
 *   este helper elimina horas, minutos y zona horaria.
 * @impact Usado en `AsteroidSearchScreen` para inicializar los campos de fecha.
 *
 * @param date - Fecha como objeto Date o string ISO
 * @returns Cadena en formato YYYY-MM-DD
 */
export function formatDateToISO(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Devuelve la fecha de hoy más N días en formato YYYY-MM-DD.
 *
 * @what Suma `offsetDays` al día actual (UTC) y devuelve la fecha resultante.
 * @why Permite calcular la fecha por defecto para el campo `endDate`
 *   (hoy + 7 días) sin acoplar la lógica al componente de pantalla.
 * @impact Usado en `AsteroidSearchScreen` para el valor inicial del formulario.
 *
 * @param offsetDays - Días a sumar (negativo para fechas pasadas)
 * @returns Cadena en formato YYYY-MM-DD
 */
export function todayPlusDays(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return formatDateToISO(d);
}

// ─── Schema ───────────────────────────────────────────────────────────────────

/**
 * Schema Zod para el formulario de búsqueda de asteroides.
 *
 * Reglas de negocio:
 * - `startDate`: cadena con formato YYYY-MM-DD, obligatoria.
 * - `endDate`: cadena con formato YYYY-MM-DD, obligatoria.
 * - Refinement 1: `startDate` debe ser anterior o igual a `endDate`.
 * - Refinement 2: el rango entre ambas fechas no puede superar 7 días (límite NeoWs).
 */
export const asteroidSearchSchema = z
  .object({
    /** Fecha de inicio de la búsqueda (YYYY-MM-DD) */
    startDate: z
      .string()
      .regex(DATE_REGEX, 'Formato de fecha inválido (YYYY-MM-DD)')
      .min(1, 'La fecha de inicio es obligatoria'),

    /** Fecha de fin de la búsqueda (YYYY-MM-DD) */
    endDate: z
      .string()
      .regex(DATE_REGEX, 'Formato de fecha inválido (YYYY-MM-DD)')
      .min(1, 'La fecha de fin es obligatoria'),
  })
  .refine(
    (data) => diffInDays(data.startDate, data.endDate) >= 0,
    {
      message: 'La fecha de inicio debe ser anterior o igual a la fecha de fin',
      path: ['startDate'],
    },
  )
  .refine(
    (data) => diffInDays(data.startDate, data.endDate) <= MAX_DATE_RANGE_DAYS,
    {
      message: `El rango máximo es de ${MAX_DATE_RANGE_DAYS} días (límite de la API NASA)`,
      path: ['endDate'],
    },
  );

/** Tipo inferido del schema — usado en react-hook-form y en la pantalla */
export type AsteroidSearchFormValues = z.infer<typeof asteroidSearchSchema>;
