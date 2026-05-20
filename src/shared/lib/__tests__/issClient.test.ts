import { fetchIssPosition, fetchAstronauts } from '../issClient';

// ─── Helpers de mock ──────────────────────────────────────────────────────────

function mockFetchOk(body: unknown): void {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(body),
  } as Response);
}

function mockFetchError(status: number, statusText: string): void {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: false,
    status,
    statusText,
  } as Response);
}

// ─── fetchIssPosition ─────────────────────────────────────────────────────────

describe('fetchIssPosition', () => {
  afterEach(() => jest.resetAllMocks());

  it('debería retornar la posición de la ISS cuando la respuesta es exitosa', async () => {
    // Arrange
    const mockResponse = {
      message: 'success',
      timestamp: 1713312000,
      iss_position: { latitude: '25.1234', longitude: '-80.5678' },
    };
    mockFetchOk(mockResponse);

    // Act
    const result = await fetchIssPosition();

    // Assert
    expect(result.message).toBe('success');
    expect(result.iss_position.latitude).toBe('25.1234');
  });

  it('debería llamar al endpoint correcto de Open-Notify', async () => {
    // Arrange
    mockFetchOk({ message: 'success', timestamp: 0, iss_position: { latitude: '0', longitude: '0' } });

    // Act
    await fetchIssPosition();

    // Assert
    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('api.open-notify.org/iss-now.json');
  });

  it('debería lanzar un error en español cuando la respuesta falla', async () => {
    // Arrange
    mockFetchError(500, 'Internal Server Error');

    // Act & Assert
    await expect(fetchIssPosition()).rejects.toThrow('Error al obtener la posición de la ISS');
  });
});

// ─── fetchAstronauts ──────────────────────────────────────────────────────────

describe('fetchAstronauts', () => {
  afterEach(() => jest.resetAllMocks());

  it('debería retornar la lista de astronautas cuando la respuesta es exitosa', async () => {
    // Arrange
    const mockResponse = {
      message: 'success',
      number: 7,
      people: [
        { name: 'Oleg Kononenko', craft: 'ISS' },
        { name: 'Jasmin Moghbeli', craft: 'ISS' },
      ],
    };
    mockFetchOk(mockResponse);

    // Act
    const result = await fetchAstronauts();

    // Assert
    expect(result.number).toBe(7);
    expect(result.people[0].name).toBe('Oleg Kononenko');
  });

  it('debería llamar al endpoint correcto de Open-Notify', async () => {
    // Arrange
    mockFetchOk({ message: 'success', number: 0, people: [] });

    // Act
    await fetchAstronauts();

    // Assert
    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('api.open-notify.org/astros.json');
  });

  it('debería lanzar un error en español cuando la respuesta falla', async () => {
    // Arrange
    mockFetchError(503, 'Service Unavailable');

    // Act & Assert
    await expect(fetchAstronauts()).rejects.toThrow(
      'Error al obtener la tripulación en el espacio',
    );
  });
});
