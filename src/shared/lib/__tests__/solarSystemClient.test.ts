import { fetchAllBodies, fetchBodyById } from '../solarSystemClient';

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

// ─── fetchAllBodies ───────────────────────────────────────────────────────────

describe('fetchAllBodies', () => {
  afterEach(() => jest.resetAllMocks());

  it('debería retornar la lista de cuerpos cuando la respuesta es exitosa', async () => {
    // Arrange
    const mockBodies = [
      { id: 'terre', name: 'La Terre', englishName: 'Earth', isPlanet: true, bodyType: 'Planet' },
    ];
    mockFetchOk({ bodies: mockBodies });

    // Act
    const result = await fetchAllBodies();

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].englishName).toBe('Earth');
  });

  it('debería llamar al endpoint correcto de la API', async () => {
    // Arrange
    mockFetchOk({ bodies: [] });

    // Act
    await fetchAllBodies();

    // Assert
    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('api.le-systeme-solaire.net/rest/bodies');
  });

  it('debería lanzar un error en español cuando la respuesta falla', async () => {
    // Arrange
    mockFetchError(503, 'Service Unavailable');

    // Act & Assert
    await expect(fetchAllBodies()).rejects.toThrow('Error al obtener el catálogo del sistema solar');
  });
});

// ─── fetchBodyById ────────────────────────────────────────────────────────────

describe('fetchBodyById', () => {
  afterEach(() => jest.resetAllMocks());

  it('debería retornar los datos del cuerpo cuando la respuesta es exitosa', async () => {
    // Arrange
    const mockBody = { id: 'mars', englishName: 'Mars', isPlanet: true, bodyType: 'Planet' };
    mockFetchOk(mockBody);

    // Act
    const result = await fetchBodyById('mars');

    // Assert
    expect(result.englishName).toBe('Mars');
  });

  it('debería incluir el ID codificado en la URL', async () => {
    // Arrange
    mockFetchOk({ id: 'lune', englishName: 'Moon', isPlanet: false, bodyType: 'Moon' });

    // Act
    await fetchBodyById('lune');

    // Assert
    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('/bodies/lune');
  });

  it('debería lanzar un error en español cuando el ID no existe', async () => {
    // Arrange
    mockFetchError(404, 'Not Found');

    // Act & Assert
    await expect(fetchBodyById('inexistente')).rejects.toThrow(
      'Error al obtener los datos del cuerpo "inexistente"',
    );
  });
});
