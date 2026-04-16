/**
 * Tests de la función buildUrl interna de nasaClient.
 *
 * Como buildUrl es privada, se testea indirectamente comprobando
 * que fetchApod, fetchNeoWsFeed y fetchSolarFlares construyen las
 * URLs correctas y propagan correctamente los errores HTTP.
 */

import { fetchApod, fetchNeoWsFeed, fetchSolarFlares, fetchArtemisImages } from '../nasaClient';

// ─── Helpers de mock ──────────────────────────────────────────────────────────

/** Simula una respuesta fetch con el cuerpo JSON dado */
function mockFetchOk(body: unknown): void {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(body),
  } as Response);
}

/** Simula una respuesta fetch con error HTTP */
function mockFetchError(status: number, statusText: string): void {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: false,
    status,
    statusText,
  } as Response);
}

// ─── fetchApod ────────────────────────────────────────────────────────────────

describe('fetchApod', () => {
  afterEach(() => jest.resetAllMocks());

  it('debería retornar datos de APOD cuando la respuesta es exitosa', async () => {
    // Arrange
    const mockApod = {
      date: '2026-04-16',
      title: 'Vía Láctea',
      explanation: 'Vista panorámica de la galaxia.',
      url: 'https://apod.nasa.gov/apod/image.jpg',
      media_type: 'image',
      service_version: 'v1',
    };
    mockFetchOk(mockApod);

    // Act
    const result = await fetchApod('2026-04-16');

    // Assert
    expect(result.title).toBe('Vía Láctea');
    expect(result.date).toBe('2026-04-16');
  });

  it('debería incluir la fecha en la URL cuando se proporciona', async () => {
    // Arrange
    mockFetchOk({ date: '2026-04-01', title: 'Test', url: '', explanation: '', media_type: 'image', service_version: 'v1' });

    // Act
    await fetchApod('2026-04-01');

    // Assert
    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('date=2026-04-01');
    expect(calledUrl).toContain('api_key=');
  });

  it('debería lanzar un error en español cuando la respuesta falla', async () => {
    // Arrange
    mockFetchError(429, 'Too Many Requests');

    // Act & Assert
    await expect(fetchApod()).rejects.toThrow('Error al obtener la imagen del día');
  });
});

// ─── fetchNeoWsFeed ───────────────────────────────────────────────────────────

describe('fetchNeoWsFeed', () => {
  afterEach(() => jest.resetAllMocks());

  it('debería retornar asteroides cuando la respuesta es exitosa', async () => {
    // Arrange
    const mockFeed = { element_count: 1, near_earth_objects: {} };
    mockFetchOk(mockFeed);

    // Act
    const result = await fetchNeoWsFeed('2026-04-10', '2026-04-16');

    // Assert
    expect(result.element_count).toBe(1);
  });

  it('debería incluir start_date y end_date en la URL', async () => {
    // Arrange
    mockFetchOk({ element_count: 0, near_earth_objects: {} });

    // Act
    await fetchNeoWsFeed('2026-04-10', '2026-04-16');

    // Assert
    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('start_date=2026-04-10');
    expect(calledUrl).toContain('end_date=2026-04-16');
  });

  it('debería lanzar un error en español cuando la respuesta falla', async () => {
    // Arrange
    mockFetchError(403, 'Forbidden');

    // Act & Assert
    await expect(fetchNeoWsFeed('2026-04-10', '2026-04-16')).rejects.toThrow(
      'Error al buscar asteroides',
    );
  });
});

// ─── fetchSolarFlares ─────────────────────────────────────────────────────────

describe('fetchSolarFlares', () => {
  afterEach(() => jest.resetAllMocks());

  it('debería retornar una lista vacía cuando la API retorna null', async () => {
    // Arrange — la API DONKI retorna null si no hay eventos
    mockFetchOk(null);

    // Act
    const result = await fetchSolarFlares('2026-04-10', '2026-04-16');

    // Assert
    expect(result).toEqual([]);
  });

  it('debería retornar los eventos cuando la API retorna datos', async () => {
    // Arrange
    const mockFlares = [
      { flrID: 'FLR-001', beginTime: '2026-04-12T10:00Z', classType: 'M1.5', peakTime: null, endTime: null, sourceLocation: 'N14W22', activeRegionNum: null },
    ];
    mockFetchOk(mockFlares);

    // Act
    const result = await fetchSolarFlares('2026-04-10', '2026-04-16');

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].classType).toBe('M1.5');
  });

  it('debería lanzar un error en español cuando la respuesta falla', async () => {
    // Arrange
    mockFetchError(500, 'Internal Server Error');

    // Act & Assert
    await expect(fetchSolarFlares('2026-04-10', '2026-04-16')).rejects.toThrow(
      'Error al obtener datos de clima espacial',
    );
  });
});

// ─── fetchArtemisImages ───────────────────────────────────────────────────────

describe('fetchArtemisImages', () => {
  afterEach(() => jest.resetAllMocks());

  it('debería retornar los ítems de imagen cuando la respuesta es exitosa', async () => {
    // Arrange
    const mockResponse = {
      collection: {
        items: [
          {
            href: 'https://images-assets.nasa.gov/image/artemis-1/',
            data: [{ nasa_id: 'artemis-1', title: 'Artemis I Launch', description: '', date_created: '2022-11-16' }],
            links: [{ href: 'https://images-assets.nasa.gov/image/artemis-1/thumb.jpg', rel: 'preview' }],
          },
        ],
        metadata: { total_hits: 1 },
      },
    };
    mockFetchOk(mockResponse);

    // Act
    const result = await fetchArtemisImages(1);

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].data[0].title).toBe('Artemis I Launch');
  });

  it('debería usar la URL base de NASA Images (sin api_key)', async () => {
    // Arrange
    mockFetchOk({ collection: { items: [], metadata: { total_hits: 0 } } });

    // Act
    await fetchArtemisImages(5);

    // Assert
    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('images-api.nasa.gov');
    expect(calledUrl).toContain('q=Artemis');
    expect(calledUrl).toContain('media_type=image');
    expect(calledUrl).not.toContain('api_key=');
  });

  it('debería lanzar un error en español cuando la respuesta falla', async () => {
    // Arrange
    mockFetchError(503, 'Service Unavailable');

    // Act & Assert
    await expect(fetchArtemisImages()).rejects.toThrow(
      'Error al obtener imágenes de Artemis',
    );
  });
});
