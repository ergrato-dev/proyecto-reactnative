/**
 * Tests de las pantallas placeholder del módulo navigation.
 *
 * @what Verifica que cada pantalla placeholder renderiza su título y
 *   mensaje de disponibilidad de fase correctamente.
 * @why Las pantallas placeholder son contratos de routing: si no renderizan,
 *   el navegador lanzaría un error en tiempo de ejecución en esa ruta.
 * @impact Cubre `ObservationLogScreen`, `APODDetailScreen`, `AuthScreen` e
 *   `ISSMapScreen` (placeholder de navegación, distinta de la implementación real
 *   en `src/modules/maps/`).
 *   `SolarCatalogScreen` y `BodyDetailScreen` se testean en `src/modules/lists/`.
 *   `AsteroidSearchScreen` fue movida al módulo `forms/` en Fase 3.
 *   `APODGalleryScreen` fue movida al módulo `storage/` en Fase 4.
 *   La implementación completa de ISS se testea en `src/modules/maps/`.
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ObservationLogScreen } from '../screens/PlaceholderScreens';
import { APODDetailScreen } from '../screens/APODDetailScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { ISSMapScreen } from '../screens/ISSMapScreen';

describe('ObservationLogScreen', () => {
  it('debería renderizar el título y el mensaje de fase', () => {
    render(<ObservationLogScreen />);
    expect(screen.getByText('Diario de Observaciones')).toBeTruthy();
    expect(screen.getByText('Disponible en Fase 10 — Autenticación')).toBeTruthy();
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

describe('AuthScreen', () => {
  it('debería renderizar el título y el mensaje de fase', () => {
    render(<AuthScreen />);
    expect(screen.getByText('Perfil de Observador')).toBeTruthy();
    expect(screen.getByText('Disponible en Fase 10 — Autenticación')).toBeTruthy();
  });
});

// ─── ISSMapScreen (placeholder de navegación) ─────────────────────────────────
// Nota: la implementación real del mapa ISS vive en src/modules/maps/.
// Este placeholder cubre la ruta mientras el módulo maps/ no esté integrado.

describe('ISSMapScreen', () => {
  /** Props mínimas compuestas para ISSMapScreen (no usa props de navegación) */
  const issNavProps = { navigation: {} as never, route: {} as never };

  it('debería renderizar el icono del satélite', () => {
    render(<ISSMapScreen {...issNavProps} />);
    expect(screen.getByText('🛰️')).toBeTruthy();
  });

  it('debería renderizar el título de la pantalla', () => {
    render(<ISSMapScreen {...issNavProps} />);
    expect(screen.getByText('ISS en Tiempo Real')).toBeTruthy();
  });

  it('debería renderizar el mensaje de fase pendiente', () => {
    render(<ISSMapScreen {...issNavProps} />);
    expect(screen.getByText('Disponible en Fase 6 — Mapas')).toBeTruthy();
  });
});
