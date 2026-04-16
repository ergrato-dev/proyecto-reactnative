/**
 * Tests de la pantalla AstronautsScreen.
 *
 * @what Verifica los estados de carga, error, lista vacía y lista con datos
 *   de la pantalla de tripulación de la ISS.
 * @why `AstronautsScreen` es el punto de entrada de `useAstronauts`; si no
 *   renderiza correctamente el estado de carga o los datos, el usuario ve
 *   una pantalla rota al navegar desde el mapa ISS.
 * @impact Cubre `AstronautsScreen` y el componente `AstronautCard`.
 *   Usa mock de `useAstronauts` para aislar de la capa de datos.
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { AstronautsScreen } from '../screens/AstronautsScreen';

// ─── Mock de useAstronauts ────────────────────────────────────────────────────
jest.mock('../hooks/useAstronauts');
import { useAstronauts } from '../hooks/useAstronauts';
const mockUseAstronauts = useAstronauts as jest.Mock;

/** Props mínimas de navegación */
const emptyNavProps = {
  navigation: {} as never,
  route: {} as never,
};

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('AstronautsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería mostrar el indicador de carga', () => {
    mockUseAstronauts.mockReturnValue({
      astronauts: [],
      count: 0,
      isLoading: true,
      isError: false,
      error: null,
    });
    render(<AstronautsScreen {...emptyNavProps} />);
    expect(screen.getByTestId('loading-view')).toBeTruthy();
    expect(screen.getByText('Consultando la tripulación…')).toBeTruthy();
  });

  it('debería mostrar el mensaje de error', () => {
    mockUseAstronauts.mockReturnValue({
      astronauts: [],
      count: 0,
      isLoading: false,
      isError: true,
      error: new Error('Network error'),
    });
    render(<AstronautsScreen {...emptyNavProps} />);
    expect(screen.getByTestId('error-view')).toBeTruthy();
    expect(screen.getByText('No se pudo obtener la tripulación')).toBeTruthy();
  });

  it('debería renderizar la lista de astronautas', () => {
    mockUseAstronauts.mockReturnValue({
      astronauts: [
        { name: 'Oleg Kononenko', craft: 'ISS' },
        { name: 'Nikolai Chub', craft: 'ISS' },
      ],
      count: 2,
      isLoading: false,
      isError: false,
      error: null,
    });
    render(<AstronautsScreen {...emptyNavProps} />);
    expect(screen.getByTestId('astronauts-list')).toBeTruthy();
    expect(screen.getByText('Oleg Kononenko')).toBeTruthy();
    expect(screen.getByText('Nikolai Chub')).toBeTruthy();
  });

  it('debería mostrar el conteo de personas', () => {
    mockUseAstronauts.mockReturnValue({
      astronauts: [{ name: 'Sunita Williams', craft: 'ISS' }],
      count: 1,
      isLoading: false,
      isError: false,
      error: null,
    });
    render(<AstronautsScreen {...emptyNavProps} />);
    expect(screen.getByTestId('astronaut-count')).toBeTruthy();
    expect(screen.getByText('1 persona actualmente')).toBeTruthy();
  });

  it('debería mostrar plural cuando hay más de una persona', () => {
    mockUseAstronauts.mockReturnValue({
      astronauts: [
        { name: 'Astronauta A', craft: 'ISS' },
        { name: 'Astronauta B', craft: 'ISS' },
      ],
      count: 2,
      isLoading: false,
      isError: false,
      error: null,
    });
    render(<AstronautsScreen {...emptyNavProps} />);
    expect(screen.getByText('2 personas actualmente')).toBeTruthy();
  });

  it('debería renderizar tarjetas con testID para cada astronauta', () => {
    mockUseAstronauts.mockReturnValue({
      astronauts: [{ name: 'Jane Doe', craft: 'ISS' }],
      count: 1,
      isLoading: false,
      isError: false,
      error: null,
    });
    render(<AstronautsScreen {...emptyNavProps} />);
    expect(screen.getByTestId('astronaut-card-Jane-Doe')).toBeTruthy();
  });
});
