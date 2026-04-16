/**
 * Tests unitarios de useObservations.
 *
 * @what Verifica la carga inicial, creación, actualización, eliminación y
 *   recarga de observaciones. También comprueba que los errores de Supabase
 *   se propagan en español al estado `error`.
 * @why `useObservations` gestiona el CRUD completo del diario astronómico;
 *   cualquier fallo silencioso aquí causa inconsistencias entre la UI y la BD.
 * @impact Cubre `useObservations` + mock del cliente Supabase.
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useObservations, type Observation, type ObservationInput } from '../hooks/useObservations';
import { supabase } from '@/shared/lib/supabaseClient';

// ─── Mock de Supabase ─────────────────────────────────────────────────────────
// Se definen con jest.fn() dentro del factory para evitar hoisting de variables.
// El encadenamiento from().select().order() se configura en beforeEach.

jest.mock('@/shared/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockFrom = supabase.from as jest.Mock;

// Helpers de la cadena de métodos — se asignan en beforeEach
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();

  // Configuración base: carga inicial devuelve las observaciones mock
  mockOrder.mockResolvedValue({ data: MOCK_OBSERVATIONS, error: null });
  mockEq.mockReturnThis();

  mockSelect.mockReturnValue({ order: mockOrder });
  mockInsert.mockReturnValue({ error: null });
  mockUpdate.mockReturnValue({ eq: mockEq });
  mockDelete.mockReturnValue({ eq: mockEq });

  mockFrom.mockReturnValue({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
  });
});

const MOCK_OBSERVATIONS: Observation[] = [
  {
    id: 'obs-1',
    user_id: 'user-abc',
    title: 'Júpiter',
    body: 'planeta',
    observed_at: '2025-01-15T22:00:00Z',
    notes: 'Bandas ecuatoriales visibles',
    created_at: '2025-01-15T22:30:00Z',
  },
  {
    id: 'obs-2',
    user_id: 'user-abc',
    title: 'M42 - Nebulosa de Orión',
    body: 'nebulosa',
    observed_at: '2025-01-10T21:00:00Z',
    notes: null,
    created_at: '2025-01-10T21:30:00Z',
  },
];

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('useObservations', () => {
  describe('carga inicial', () => {
    it('debería cargar las observaciones al montar', async () => {
      const { result } = renderHook(() => useObservations());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.observations).toHaveLength(2);
      expect(result.current.observations[0].title).toBe('Júpiter');
      expect(result.current.error).toBeNull();
    });

    it('debería establecer error en español cuando falla la carga', async () => {
      mockOrder.mockResolvedValue({ data: null, error: { message: 'table not found' } });

      const { result } = renderHook(() => useObservations());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toMatch(/Error al cargar observaciones/);
      expect(result.current.observations).toHaveLength(0);
    });
  });

  describe('create()', () => {
    it('debería crear una observación y recargar la lista', async () => {
      const newInput: ObservationInput = {
        title: 'Saturno',
        body: 'planeta',
        observed_at: '2025-02-01T20:00:00Z',
        notes: 'Anillos perfectamente visibles',
      };

      // Tras la creación, la recarga devuelve 3 elementos
      const updatedList = [...MOCK_OBSERVATIONS, { ...newInput, id: 'obs-3', user_id: 'user-abc', created_at: '2025-02-01T20:30:00Z' }];
      mockInsert.mockResolvedValue({ error: null });
      mockOrder
        .mockResolvedValueOnce({ data: MOCK_OBSERVATIONS, error: null }) // carga inicial
        .mockResolvedValueOnce({ data: updatedList, error: null }); // recarga tras create

      const { result } = renderHook(() => useObservations());
      await waitFor(() => expect(result.current.loading).toBe(false));

      let ok: boolean;
      await act(async () => {
        ok = await result.current.create(newInput);
      });

      expect(ok!).toBe(true);
      expect(result.current.observations).toHaveLength(3);
    });

    it('debería retornar false y establecer error cuando insert falla', async () => {
      mockInsert.mockResolvedValue({ error: { message: 'Row Level Security violation' } });

      const { result } = renderHook(() => useObservations());
      await waitFor(() => expect(result.current.loading).toBe(false));

      let ok: boolean;
      await act(async () => {
        ok = await result.current.create({
          title: 'Venus',
          body: 'planeta',
          observed_at: '2025-02-02T21:00:00Z',
          notes: null,
        });
      });

      expect(ok!).toBe(false);
      expect(result.current.error).toMatch(/Error al crear observación/);
    });
  });

  describe('update()', () => {
    it('debería actualizar una observación y recargar la lista', async () => {
      const updatedList = MOCK_OBSERVATIONS.map((o) =>
        o.id === 'obs-1' ? { ...o, notes: 'Gran Mancha Roja visible' } : o,
      );
      mockEq.mockResolvedValueOnce({ error: null });
      mockOrder
        .mockResolvedValueOnce({ data: MOCK_OBSERVATIONS, error: null })
        .mockResolvedValueOnce({ data: updatedList, error: null });

      const { result } = renderHook(() => useObservations());
      await waitFor(() => expect(result.current.loading).toBe(false));

      let ok: boolean;
      await act(async () => {
        ok = await result.current.update('obs-1', { notes: 'Gran Mancha Roja visible' });
      });

      expect(ok!).toBe(true);
      expect(result.current.observations[0].notes).toBe('Gran Mancha Roja visible');
    });
  });

  describe('remove()', () => {
    it('debería eliminar una observación de forma optimista', async () => {
      mockEq.mockResolvedValueOnce({ error: null });

      const { result } = renderHook(() => useObservations());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.observations).toHaveLength(2);

      let ok: boolean;
      await act(async () => {
        ok = await result.current.remove('obs-1');
      });

      expect(ok!).toBe(true);
      expect(result.current.observations).toHaveLength(1);
      expect(result.current.observations[0].id).toBe('obs-2');
    });

    it('debería retornar false y establecer error cuando delete falla', async () => {
      mockEq.mockResolvedValueOnce({ error: { message: 'permission denied' } });

      const { result } = renderHook(() => useObservations());
      await waitFor(() => expect(result.current.loading).toBe(false));

      let ok: boolean;
      await act(async () => {
        ok = await result.current.remove('obs-1');
      });

      expect(ok!).toBe(false);
      expect(result.current.error).toMatch(/Error al eliminar observación/);
    });
  });

  describe('refresh()', () => {
    it('debería recargar la lista al llamar refresh', async () => {
      const refreshedList = [MOCK_OBSERVATIONS[0]];
      mockOrder
        .mockResolvedValueOnce({ data: MOCK_OBSERVATIONS, error: null })
        .mockResolvedValueOnce({ data: refreshedList, error: null });

      const { result } = renderHook(() => useObservations());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.observations).toHaveLength(2);

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.observations).toHaveLength(1);
    });
  });
});
