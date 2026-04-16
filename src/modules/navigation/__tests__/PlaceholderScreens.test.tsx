/**
 * Tests de las pantallas placeholder del módulo navigation.
 *
 * @what Verifica que cada pantalla placeholder renderiza su título y
 *   mensaje de disponibilidad de fase correctamente.
 * @why Las pantallas placeholder son contratos de routing: si no renderizan,
 *   el navegador lanzaría un error en tiempo de ejecución en esa ruta.
 * @impact Cubre `SolarCatalogScreen`, `AsteroidSearchScreen`,
 *   `BodyDetailScreen`, `ObservationLogScreen`, `APODGalleryScreen`,
 *   `AstronautsScreen`, `APODDetailScreen`, `ISSMapScreen` y `AuthScreen`.
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import {
  SolarCatalogScreen,
  AsteroidSearchScreen,
  BodyDetailScreen,
  ObservationLogScreen,
  APODGalleryScreen,
  AstronautsScreen,
} from '../screens/PlaceholderScreens';
import { APODDetailScreen } from '../screens/APODDetailScreen';
import { ISSMapScreen } from '../screens/ISSMapScreen';
import { AuthScreen } from '../screens/AuthScreen';

describe('SolarCatalogScreen', () => {
  it('debería renderizar el título y el mensaje de fase', () => {
    render(<SolarCatalogScreen />);
    expect(screen.getByText('Catálogo Solar')).toBeTruthy();
    expect(screen.getByText('Disponible en Fase 2 — Listas')).toBeTruthy();
  });
});

describe('AsteroidSearchScreen', () => {
  it('debería renderizar el título y el mensaje de fase', () => {
    render(<AsteroidSearchScreen />);
    expect(screen.getByText('Búsqueda de Asteroides')).toBeTruthy();
    expect(screen.getByText('Disponible en Fase 3 — Formularios')).toBeTruthy();
  });
});

describe('BodyDetailScreen', () => {
  it('debería renderizar el título y el mensaje de fase', () => {
    render(<BodyDetailScreen />);
    expect(screen.getByText('Detalle de Cuerpo Celeste')).toBeTruthy();
    expect(screen.getByText('Disponible en Fase 2 — Listas')).toBeTruthy();
  });
});

describe('ObservationLogScreen', () => {
  it('debería renderizar el título y el mensaje de fase', () => {
    render(<ObservationLogScreen />);
    expect(screen.getByText('Diario de Observaciones')).toBeTruthy();
    expect(screen.getByText('Disponible en Fase 10 — Autenticación')).toBeTruthy();
  });
});

describe('APODGalleryScreen', () => {
  it('debería renderizar el título y el mensaje de fase', () => {
    render(<APODGalleryScreen />);
    expect(screen.getByText('Galería APOD')).toBeTruthy();
    expect(screen.getByText('Disponible en Fase 7 — Storage')).toBeTruthy();
  });
});

describe('AstronautsScreen', () => {
  it('debería renderizar el título y el mensaje de fase', () => {
    render(<AstronautsScreen />);
    expect(screen.getByText('Astronautas en el Espacio')).toBeTruthy();
    expect(screen.getByText('Disponible en Fase 6 — Mapas')).toBeTruthy();
  });
});

// ─── Pantallas de módulos con props de navegación ────────────────────────────
// Estas pantallas reciben props de React Navigation pero no las usan;
// se pasan props vacías para satisfacer el tipado sin montar el navegador.

/** Props mínimas para pantallas que reciben props de RN pero no las usan */
const emptyNavProps = {
  navigation: {} as never,
  route: {} as never,
};

describe('APODDetailScreen', () => {
  it('debería renderizar el título y el mensaje de fase', () => {
    render(<APODDetailScreen {...emptyNavProps} />);
    expect(screen.getByText('Imagen del Día')).toBeTruthy();
    expect(screen.getByText('Disponible en Fase 2 — Listas / Fase 7 — Storage')).toBeTruthy();
  });
});

describe('ISSMapScreen', () => {
  it('debería renderizar el título y el mensaje de fase', () => {
    render(<ISSMapScreen {...emptyNavProps} />);
    expect(screen.getByText('ISS en Tiempo Real')).toBeTruthy();
    expect(screen.getByText('Disponible en Fase 6 — Mapas')).toBeTruthy();
  });
});

describe('AuthScreen', () => {
  it('debería renderizar el título y el mensaje de fase', () => {
    render(<AuthScreen />);
    expect(screen.getByText('Perfil de Observador')).toBeTruthy();
    expect(screen.getByText('Disponible en Fase 10 — Autenticación')).toBeTruthy();
  });
});
