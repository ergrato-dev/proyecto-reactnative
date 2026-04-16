/**
 * Hook CRUD para el diario de observaciones astronómicas del usuario.
 *
 * @what Expone las operaciones de lectura, creación, edición y eliminación de
 *   observaciones en la tabla `observations` de Supabase, con RLS garantizando
 *   que cada usuario solo accede a sus propias entradas.
 * @why Centraliza la capa de datos del diario para que `ObservationsScreen`
 *   no contenga lógica de acceso a base de datos.
 * @impact Requiere que el usuario esté autenticado (RLS). Si el usuario no tiene
 *   sesión activa, todas las operaciones devolverán error de Supabase.
 *   Tabla requerida: `observations` con columnas `id`, `user_id`, `title`,
 *   `body`, `observed_at`, `notes`, `created_at`.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/shared/lib/supabaseClient';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface Observation {
  id: string;
  user_id: string;
  /** Nombre del objeto observado (ej: "Jupiter", "M42 - Nebulosa de Orión") */
  title: string;
  /** Tipo de objeto: planeta, estrella, nebulosa, galaxia, etc. */
  body: string;
  /** ISO 8601 — fecha y hora de la observación */
  observed_at: string;
  /** Notas libres del observador */
  notes: string | null;
  created_at: string;
}

export type ObservationInput = Pick<Observation, 'title' | 'body' | 'observed_at' | 'notes'>;

export interface UseObservationsResult {
  observations: Observation[];
  loading: boolean;
  error: string | null;
  /** Recarga manualmente la lista de observaciones */
  refresh: () => Promise<void>;
  /** Crea una nueva observación */
  create: (input: ObservationInput) => Promise<boolean>;
  /** Edita una observación existente por id */
  update: (id: string, input: Partial<ObservationInput>) => Promise<boolean>;
  /** Elimina una observación por id */
  remove: (id: string) => Promise<boolean>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useObservations(): UseObservationsResult {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchObservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: supaError } = await supabase
      .from('observations')
      .select('*')
      .order('observed_at', { ascending: false });

    if (supaError) {
      setError(`Error al cargar observaciones: ${supaError.message}`);
      setLoading(false);
      return;
    }
    setObservations((data as Observation[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchObservations();
  }, [fetchObservations]);

  const create = useCallback(async (input: ObservationInput): Promise<boolean> => {
    setError(null);
    const { error: supaError } = await supabase.from('observations').insert([input]);
    if (supaError) {
      setError(`Error al crear observación: ${supaError.message}`);
      return false;
    }
    await fetchObservations();
    return true;
  }, [fetchObservations]);

  const update = useCallback(async (id: string, input: Partial<ObservationInput>): Promise<boolean> => {
    setError(null);
    const { error: supaError } = await supabase
      .from('observations')
      .update(input)
      .eq('id', id);
    if (supaError) {
      setError(`Error al actualizar observación: ${supaError.message}`);
      return false;
    }
    await fetchObservations();
    return true;
  }, [fetchObservations]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    setError(null);
    const { error: supaError } = await supabase
      .from('observations')
      .delete()
      .eq('id', id);
    if (supaError) {
      setError(`Error al eliminar observación: ${supaError.message}`);
      return false;
    }
    setObservations((prev) => prev.filter((o) => o.id !== id));
    return true;
  }, []);

  return {
    observations,
    loading,
    error,
    refresh: fetchObservations,
    create,
    update,
    remove,
  };
}
