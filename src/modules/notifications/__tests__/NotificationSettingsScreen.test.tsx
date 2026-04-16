/**
 * Tests de la pantalla NotificationSettingsScreen.
 *
 * @what Verifica: renderizado de los tres toggles, banner de permisos,
 *   botón de solicitud de permisos, estado de carga y error de DONKI.
 * @why La pantalla es el punto de entrada del módulo; si los toggles o
 *   el banner no se renderizan correctamente el usuario no puede configurar alertas.
 * @impact Cubre `screens/NotificationSettingsScreen.tsx`. Mocks de
 *   `expo-notifications`, `nasaClient` y `@tanstack/react-query`.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationSettingsScreen } from '../screens/NotificationSettingsScreen';
import type { DonkiSolarFlare } from '@/shared/lib/nasaClient';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@/shared/lib/nasaClient', () => ({
  fetchSolarFlares: jest.fn(),
  fetchArtemisImages: jest.fn(),
  fetchApod: jest.fn(),
  fetchNeoWsFeed: jest.fn(),
}));

const mockGetPermissionsAsync = jest.fn();
const mockRequestPermissionsAsync = jest.fn();
const mockScheduleNotificationAsync = jest.fn();
const mockCancelScheduledNotificationAsync = jest.fn();
const mockSetNotificationHandler = jest.fn();

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: (...args: unknown[]) => mockGetPermissionsAsync(...args),
  requestPermissionsAsync: (...args: unknown[]) =>
    mockRequestPermissionsAsync(...args),
  scheduleNotificationAsync: (...args: unknown[]) =>
    mockScheduleNotificationAsync(...args),
  cancelScheduledNotificationAsync: (...args: unknown[]) =>
    mockCancelScheduledNotificationAsync(...args),
  setNotificationHandler: (...args: unknown[]) =>
    mockSetNotificationHandler(...args),
  SchedulableTriggerInputTypes: { DAILY: 'daily' },
  AndroidImportance: { MAX: 5, HIGH: 4 },
}));

import { fetchSolarFlares } from '@/shared/lib/nasaClient';
const mockFetch = fetchSolarFlares as jest.Mock;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildFlare(classType: string, id: string): DonkiSolarFlare {
  return {
    flrID: id,
    beginTime: '2024-11-15T10:30Z',
    peakTime: null,
    endTime: null,
    classType,
    sourceLocation: 'N15E20',
    activeRegionNum: null,
  };
}

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: 0 } },
  });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

function renderScreen() {
  return render(
    <Wrapper>
      <NotificationSettingsScreen />
    </Wrapper>,
  );
}

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('NotificationSettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue([]);
    mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockScheduleNotificationAsync.mockResolvedValue('mock-id');
    mockCancelScheduledNotificationAsync.mockResolvedValue(undefined);
  });

  it('renderiza el título de la pantalla', async () => {
    renderScreen();
    await waitFor(() => {
      expect(screen.getByText(/Alertas astronómicas/i)).toBeTruthy();
    });
  });

  it('renderiza los tres toggles de alerta', async () => {
    renderScreen();
    await waitFor(() => {
      expect(screen.getByText(/Tormentas solares clase M\+/i)).toBeTruthy();
      expect(screen.getByText(/Paso de la ISS/i)).toBeTruthy();
      expect(screen.getByText(/Imagen del día/i)).toBeTruthy();
    });
  });

  it('muestra "Próximamente" en el toggle de ISS', async () => {
    renderScreen();
    await waitFor(() => {
      expect(screen.getByText('Próximamente')).toBeTruthy();
    });
  });

  it('NO muestra el banner de permisos cuando el permiso está concedido', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });
    renderScreen();

    await waitFor(() => {
      expect(screen.queryByText(/Solicitar permisos/i)).toBeNull();
    });
  });

  it('muestra el banner y el botón de permisos cuando no están concedidos', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'denied' });
    mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
    renderScreen();

    await waitFor(() => {
      expect(screen.getByText(/Solicitar permisos/i)).toBeTruthy();
    });
  });

  it('llama a requestPermissionsAsync al pulsar el botón de permisos', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'denied' });
    mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
    renderScreen();

    const btn = await screen.findByText(/Solicitar permisos/i);
    fireEvent.press(btn);

    await waitFor(() => {
      expect(mockRequestPermissionsAsync).toHaveBeenCalledTimes(1);
    });
  });

  it('muestra mensaje vacío cuando no hay llamaradas M+ en el período', async () => {
    mockFetch.mockResolvedValue([buildFlare('C3.1', 'FLR-001')]);
    renderScreen();

    await waitFor(() => {
      expect(screen.getByText(/Sin llamaradas mayores/i)).toBeTruthy();
    });
  });

  it('muestra las llamaradas M+ cuando las hay', async () => {
    mockFetch.mockResolvedValue([
      buildFlare('M1.5', 'FLR-2024-11-15T10:30Z-001'),
      buildFlare('X2.0', 'FLR-2024-11-15T12:00Z-002'),
    ]);
    renderScreen();

    await waitFor(() => {
      expect(screen.getByText('M1.5')).toBeTruthy();
      expect(screen.getByText('X2.0')).toBeTruthy();
    });
  });

  it('muestra mensaje de error cuando DONKI falla', async () => {
    mockFetch.mockRejectedValue(new Error('API error'));
    renderScreen();

    await waitFor(() => {
      expect(screen.getByText(/No se pudieron cargar los eventos solares/i)).toBeTruthy();
    });
  });

  it('activa el toggle solar y llama a scheduleNotificationAsync con flares M+', async () => {
    mockFetch.mockResolvedValue([
      buildFlare('M2.0', 'FLR-2024-11-15T10:30Z-001'),
    ]);
    mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });

    renderScreen();

    // Esperar a que la pantalla esté lista
    await waitFor(() =>
      expect(screen.getByText(/Tormentas solares clase M\+/i)).toBeTruthy(),
    );

    // El switch de tormentas solares tiene accessibilityRole 'switch'
    const switches = screen.getAllByRole('switch');
    // Primer switch es el de tormentas solares
    fireEvent(switches[0], 'valueChange', true);

    await waitFor(() => {
      expect(mockScheduleNotificationAsync).toHaveBeenCalledTimes(1);
    });
  });

  it('activa el toggle APOD y llama a scheduleNotificationAsync para el reminder diario', async () => {
    mockFetch.mockResolvedValue([]);
    mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockCancelScheduledNotificationAsync.mockResolvedValue(undefined);

    renderScreen();

    await waitFor(() =>
      expect(screen.getByText(/Imagen del día/i)).toBeTruthy(),
    );

    const switches = screen.getAllByRole('switch');
    // Tercer switch es el de APOD (índice 2)
    fireEvent(switches[2], 'valueChange', true);

    await waitFor(() => {
      expect(mockScheduleNotificationAsync).toHaveBeenCalledTimes(1);
    });
  });

  it('desactiva el toggle APOD y llama a cancelScheduledNotificationAsync', async () => {
    mockFetch.mockResolvedValue([]);
    mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockCancelScheduledNotificationAsync.mockResolvedValue(undefined);
    mockScheduleNotificationAsync.mockResolvedValue('apod-id');

    renderScreen();

    await waitFor(() =>
      expect(screen.getByText(/Imagen del día/i)).toBeTruthy(),
    );

    const switches = screen.getAllByRole('switch');
    // Activar primero
    fireEvent(switches[2], 'valueChange', true);
    await waitFor(() => expect(mockScheduleNotificationAsync).toHaveBeenCalled());

    // Luego desactivar
    fireEvent(switches[2], 'valueChange', false);
    await waitFor(() => {
      expect(mockCancelScheduledNotificationAsync).toHaveBeenCalled();
    });
  });
});
