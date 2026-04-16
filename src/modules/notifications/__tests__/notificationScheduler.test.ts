/**
 * Tests de la librería notificationScheduler.
 *
 * @what Verifica: configuración del handler, scheduling de alerta solar con
 *   y sin flares M+, scheduling y cancelación del recordatorio APOD.
 * @why `notificationScheduler` es la capa que interactúa directamente con
 *   expo-notifications; si las llamadas a la API fallan las alertas no se envían.
 * @impact Cubre `lib/notificationScheduler.ts`. Mock de `expo-notifications`
 *   para aislar de APIs nativas.
 */

import {
  configureNotificationHandler,
  scheduleSolarStormAlert,
  scheduleApodDailyReminder,
  cancelApodDailyReminder,
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
