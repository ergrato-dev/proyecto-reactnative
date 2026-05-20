/**
 * Tests de MissionStatusScreen.
 *
 * @what Verifica que la pantalla renderiza las 3 misiones Artemis con sus
 *   badges de estado, objetivos y botón de navegación a la galería.
 * @why `MissionStatusScreen` es el punto de entrada del módulo Artemis;
 *   si las misiones no se renderizan correctamente, el showcase falla.
 * @impact Cubre `screens/MissionStatusScreen.tsx` y transitivaente
 *   `data/missions.ts`. Usa mock de navegación.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { MissionStatusScreen } from '../screens/MissionStatusScreen';
import { ARTEMIS_MISSIONS } from '../data/missions';

// ─── Mock de navegación ───────────────────────────────────────────────────────
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

function buildProps() {
  return {
    navigation: { navigate: mockNavigate, goBack: mockGoBack } as never,
    route: {} as never,
  };
}

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('MissionStatusScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería renderizar el título del programa', () => {
    render(<MissionStatusScreen {...buildProps()} />);
    expect(screen.getByText('🌙 Programa Artemis')).toBeTruthy();
  });

  it('debería renderizar las 3 tarjetas de misión', () => {
    render(<MissionStatusScreen {...buildProps()} />);
    ARTEMIS_MISSIONS.forEach((mission) => {
      expect(screen.getByTestId(`mission-card-${mission.id}`)).toBeTruthy();
    });
  });

  it('debería mostrar el nombre de cada misión', () => {
    render(<MissionStatusScreen {...buildProps()} />);
    expect(screen.getByText('Artemis I')).toBeTruthy();
    expect(screen.getByText('Artemis II')).toBeTruthy();
    expect(screen.getByText('Artemis III')).toBeTruthy();
  });

  it('debería mostrar el badge "Completada" para Artemis I', () => {
    render(<MissionStatusScreen {...buildProps()} />);
    expect(screen.getByTestId('badge-completed')).toBeTruthy();
  });

  it('debería mostrar el badge "En curso" para Artemis II', () => {
    render(<MissionStatusScreen {...buildProps()} />);
    expect(screen.getByTestId('badge-in-progress')).toBeTruthy();
  });

  it('debería mostrar el badge "Planificada" para Artemis III', () => {
    render(<MissionStatusScreen {...buildProps()} />);
    expect(screen.getByTestId('badge-planned')).toBeTruthy();
  });

  it('debería navegar a ArtemisGallery al pulsar el botón de galería', () => {
    render(<MissionStatusScreen {...buildProps()} />);
    fireEvent.press(screen.getByTestId('gallery-button'));
    expect(mockNavigate).toHaveBeenCalledWith('ArtemisGallery');
  });

  it('debería mostrar el objetivo de Artemis I', () => {
    render(<MissionStatusScreen {...buildProps()} />);
    expect(
      screen.getByText('Primer vuelo de prueba no tripulado de SLS y Orion'),
    ).toBeTruthy();
  });

  it('debería mostrar la fecha objetivo de Artemis I (2022-11-16)', () => {
    render(<MissionStatusScreen {...buildProps()} />);
    expect(screen.getByText('2022-11-16')).toBeTruthy();
  });

  it('debería mostrar la tripulación de Artemis II', () => {
    render(<MissionStatusScreen {...buildProps()} />);
    expect(screen.getByText('• Reid Wiseman')).toBeTruthy();
    expect(screen.getByText('• Victor Glover')).toBeTruthy();
  });
});
