/**
 * Tests de la librería notificationScheduler.
 *
 * @what Verifica: configuración del handler, scheduling de alerta solar con
 *   y sin flares M+, scheduling y cancelación del recordatorio APOD, y la
 *   función scheduleIssPassAlert con geolocalización (RF-NOTIF-03).
 * @why `notificationScheduler` es la capa que interactúa directamente con
 *   expo-notifications; si las llamadas a la API fallan las alertas no se envían.
 * @impact Cubre `lib/notificationScheduler.ts`. Mock de `expo-notifications`,
 *   `expo-location` e `issClient` para aislar de APIs nativas y de red.
 */

import {
  configureNotificationHandler,
  scheduleSolarStormAlert,
  scheduleApodDailyReminder,
  cancelApodDailyReminder,
  scheduleIssPassAlert,
  cancelIssPassAlert,
  haversineDistance,
  ISS_PASS_THRESHOLD_KM,
  NOTIFICATION_IDENTIFIERS,
} from '../lib/notificationScheduler';
import type { DonkiSolarFlare } from '@/shared/lib/nasaClient';

// ─── Mock de expo-notifications ───────────────────────────────────────────────

const mockSetNotificationHandler = jest.fn();
const mockScheduleNotificationAsync = jest.fn();
const mockCancelScheduledNotificationAsync = jest.fn();

jest.mock('expo-notifications', () => ({
  setNotificationHandler: (...args: unknown[]) =>
    mockSetNotificationHandler(...args),
  scheduleNotificationAsync: (...args: unknown[]) =>
    mockScheduleNotificationAsync(...args),
  cancelScheduledNotificationAsync: (...args: unknown[]) =>
    mockCancelScheduledNotificationAsync(...args),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  SchedulableTriggerInputTypes: { DAILY: 'daily' },
  AndroidImportance: { MAX: 5, HIGH: 4 },
}));

// ─── Mock de expo-location ────────────────────────────────────────────────────

const mockRequestForegroundPermissionsAsync = jest.fn();
const mockGetCurrentPositionAsync = jest.fn();

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: (...args: unknown[]) =>
    mockRequestForegroundPermissionsAsync(...args),
  getCurrentPositionAsync: (...args: unknown[]) =>
    mockGetCurrentPositionAsync(...args),
  Accuracy: { Balanced: 3 },
}));

// ─── Mock de issClient ────────────────────────────────────────────────────────

const mockFetchIssPosition = jest.fn();

jest.mock('@/shared/lib/issClient', () => ({
  fetchIssPosition: (...args: unknown[]) => mockFetchIssPosition(...args),
}));

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

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('NOTIFICATION_IDENTIFIERS', () => {
  it('define los identificadores canónicos', () => {
    expect(NOTIFICATION_IDENTIFIERS.SOLAR_STORM).toBe('solar-storm-alert');
    expect(NOTIFICATION_IDENTIFIERS.APOD_DAILY).toBe('apod-daily-reminder');
    expect(NOTIFICATION_IDENTIFIERS.ISS_PASS).toBe('iss-pass-alert');
  });
});

describe('configureNotificationHandler', () => {
  beforeEach(() => jest.clearAllMocks());

  it('llama a setNotificationHandler una vez', () => {
    configureNotificationHandler();
    expect(mockSetNotificationHandler).toHaveBeenCalledTimes(1);
  });

  it('pasa un objeto con handleNotification que resuelve con shouldShowAlert', async () => {
    configureNotificationHandler();

    const [handlerArg] = mockSetNotificationHandler.mock.calls[0] as [
      { handleNotification: () => Promise<{ shouldShowAlert: boolean }> },
    ];
    const result = await handlerArg.handleNotification();
    expect(result.shouldShowAlert).toBe(true);
  });
});

describe('scheduleSolarStormAlert', () => {
  beforeEach(() => jest.clearAllMocks());

  it('devuelve null cuando no hay llamaradas M+/X+', async () => {
    const result = await scheduleSolarStormAlert([buildFlare('C3.1', 'FLR-001')]);
    expect(result).toBeNull();
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('devuelve null cuando la lista está vacía', async () => {
    const result = await scheduleSolarStormAlert([]);
    expect(result).toBeNull();
  });

  it('programa notificación con clase M cuando hay llamaradas M', async () => {
    mockScheduleNotificationAsync.mockResolvedValue('notif-id-001');

    const result = await scheduleSolarStormAlert([buildFlare('M1.5', 'FLR-M')]);

    expect(result).toBe('notif-id-001');
    expect(mockScheduleNotificationAsync).toHaveBeenCalledTimes(1);

    const [callArg] = mockScheduleNotificationAsync.mock.calls[0] as [
      { content: { title: string; body: string }; trigger: null },
    ];
    expect(callArg.content.title).toContain('M');
    expect(callArg.trigger).toBeNull(); // notificación inmediata
  });

  it('programa notificación con clase X cuando hay llamaradas X (nivel máximo)', async () => {
    mockScheduleNotificationAsync.mockResolvedValue('notif-id-002');

    const result = await scheduleSolarStormAlert([
      buildFlare('M1.5', 'FLR-M'),
      buildFlare('X2.0', 'FLR-X'),
    ]);

    expect(result).toBe('notif-id-002');
    const [callArg] = mockScheduleNotificationAsync.mock.calls[0] as [
      { content: { title: string } },
    ];
    expect(callArg.content.title).toContain('X');
  });

  it('incluye el conteo correcto de llamaradas en el body', async () => {
    mockScheduleNotificationAsync.mockResolvedValue('notif-id-003');

    await scheduleSolarStormAlert([
      buildFlare('M1.5', 'FLR-001'),
      buildFlare('M2.0', 'FLR-002'),
      buildFlare('X1.0', 'FLR-003'),
    ]);

    const [callArg] = mockScheduleNotificationAsync.mock.calls[0] as [
      { content: { body: string } },
    ];
    expect(callArg.content.body).toContain('3');
  });
});

describe('scheduleApodDailyReminder', () => {
  beforeEach(() => jest.clearAllMocks());

  it('cancela la notificación anterior antes de programar una nueva', async () => {
    mockCancelScheduledNotificationAsync.mockResolvedValue(undefined);
    mockScheduleNotificationAsync.mockResolvedValue('apod-id-001');

    await scheduleApodDailyReminder();

    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith(
      NOTIFICATION_IDENTIFIERS.APOD_DAILY,
    );
    expect(mockScheduleNotificationAsync).toHaveBeenCalledTimes(1);
  });

  it('programa la notificación diaria a las 9:00', async () => {
    mockCancelScheduledNotificationAsync.mockResolvedValue(undefined);
    mockScheduleNotificationAsync.mockResolvedValue('apod-id-001');

    await scheduleApodDailyReminder();

    const [callArg] = mockScheduleNotificationAsync.mock.calls[0] as [
      { trigger: { hour: number; minute: number } },
    ];
    expect(callArg.trigger.hour).toBe(9);
    expect(callArg.trigger.minute).toBe(0);
  });

  it('devuelve el identificador de la notificación', async () => {
    mockCancelScheduledNotificationAsync.mockResolvedValue(undefined);
    mockScheduleNotificationAsync.mockResolvedValue('apod-id-xyz');

    const id = await scheduleApodDailyReminder();
    expect(id).toBe('apod-id-xyz');
  });

  it('no lanza error si cancelScheduled falla (notificación no existía)', async () => {
    mockCancelScheduledNotificationAsync.mockRejectedValue(new Error('not found'));
    mockScheduleNotificationAsync.mockResolvedValue('apod-id-001');

    await expect(scheduleApodDailyReminder()).resolves.toBe('apod-id-001');
  });
});

describe('cancelApodDailyReminder', () => {
  beforeEach(() => jest.clearAllMocks());

  it('llama a cancelScheduledNotificationAsync con el identificador APOD', async () => {
    mockCancelScheduledNotificationAsync.mockResolvedValue(undefined);

    await cancelApodDailyReminder();

    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith(
      NOTIFICATION_IDENTIFIERS.APOD_DAILY,
    );
  });

  it('no lanza error si la notificación no existe', async () => {
    mockCancelScheduledNotificationAsync.mockRejectedValue(new Error('not found'));

    await expect(cancelApodDailyReminder()).resolves.toBeUndefined();
  });
});

// ─── haversineDistance ────────────────────────────────────────────────────────

describe('haversineDistance', () => {
  it('devuelve 0 para el mismo punto', () => {
    expect(haversineDistance(40.4, -3.7, 40.4, -3.7)).toBe(0);
  });

  it('calcula ~10,007 km para puntos antipodales (polo norte → polo sur)', () => {
    const dist = haversineDistance(90, 0, -90, 0);
    expect(dist).toBeGreaterThan(19_000); // circumference/2 ≈ 20,015 km
    expect(dist).toBeLessThan(21_000);
  });

  it('calcula ~558 km entre Madrid y Barcelona (valor de referencia conocido)', () => {
    // Madrid: 40.416°N, 3.703°W  |  Barcelona: 41.385°N, 2.173°E
    const dist = haversineDistance(40.416, -3.703, 41.385, 2.173);
    expect(dist).toBeGreaterThan(490);
    expect(dist).toBeLessThan(630);
  });

  it('devuelve un valor menor al umbral ISS para coordenadas muy cercanas', () => {
    const dist = haversineDistance(40.0, -3.0, 40.1, -3.1);
    expect(dist).toBeLessThan(ISS_PASS_THRESHOLD_KM);
  });
});

// ─── scheduleIssPassAlert ─────────────────────────────────────────────────────

describe('scheduleIssPassAlert', () => {
  // Posición de usuario: Madrid (40.4°N, 3.7°W)
  const USER_LOCATION = {
    coords: { latitude: 40.4, longitude: -3.7, altitude: 0, accuracy: 50, heading: 0, speed: 0 },
    timestamp: Date.now(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Por defecto: permiso concedido
    mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockGetCurrentPositionAsync.mockResolvedValue(USER_LOCATION);
    mockCancelScheduledNotificationAsync.mockResolvedValue(undefined);
  });

  it('lanza error cuando el permiso de ubicación es denegado', async () => {
    mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });

    await expect(scheduleIssPassAlert()).rejects.toThrow('location-permission-denied');
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('devuelve null cuando la ISS está a más de 500 km', async () => {
    // ISS sobre el Pacífico, lejos de Madrid
    mockFetchIssPosition.mockResolvedValue({
      message: 'success',
      timestamp: Date.now(),
      iss_position: { latitude: '0.0', longitude: '-140.0' },
    });

    const result = await scheduleIssPassAlert();

    expect(result).toBeNull();
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('envía notificación cuando la ISS está a ≤ 500 km', async () => {
    // ISS sobre España (muy cerca de Madrid)
    mockFetchIssPosition.mockResolvedValue({
      message: 'success',
      timestamp: Date.now(),
      iss_position: { latitude: '40.5', longitude: '-3.8' },
    });
    mockScheduleNotificationAsync.mockResolvedValue('iss-notif-001');

    const result = await scheduleIssPassAlert();

    expect(result).toBe('iss-notif-001');
    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith(
      NOTIFICATION_IDENTIFIERS.ISS_PASS,
    );
    expect(mockScheduleNotificationAsync).toHaveBeenCalledTimes(1);

    const [callArg] = mockScheduleNotificationAsync.mock.calls[0] as [
      { identifier: string; content: { title: string; body: string }; trigger: null },
    ];
    expect(callArg.identifier).toBe(NOTIFICATION_IDENTIFIERS.ISS_PASS);
    expect(callArg.content.title).toContain('ISS');
    expect(callArg.trigger).toBeNull(); // inmediata
  });

  it('la notificación incluye la distancia aproximada en el body', async () => {
    // ISS a ~100 km de Madrid
    mockFetchIssPosition.mockResolvedValue({
      message: 'success',
      timestamp: Date.now(),
      iss_position: { latitude: '41.0', longitude: '-3.7' },
    });
    mockScheduleNotificationAsync.mockResolvedValue('iss-notif-002');

    await scheduleIssPassAlert();

    const [callArg] = mockScheduleNotificationAsync.mock.calls[0] as [
      { content: { body: string } },
    ];
    expect(callArg.content.body).toMatch(/\d+ km/);
  });
});

// ─── cancelIssPassAlert ────────────────────────────────────────────────────────

describe('cancelIssPassAlert', () => {
  beforeEach(() => jest.clearAllMocks());

  it('llama a cancelScheduledNotificationAsync con el identificador ISS_PASS', async () => {
    mockCancelScheduledNotificationAsync.mockResolvedValue(undefined);

    await cancelIssPassAlert();

    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith(
      NOTIFICATION_IDENTIFIERS.ISS_PASS,
    );
  });

  it('no lanza error si la notificación no existe', async () => {
    mockCancelScheduledNotificationAsync.mockRejectedValue(new Error('not found'));

    await expect(cancelIssPassAlert()).resolves.toBeUndefined();
  });
});
