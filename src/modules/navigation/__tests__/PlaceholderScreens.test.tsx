/**
 * Tests de las pantallas placeholder del módulo navigation.
 *
 * @what Verifica que cada pantalla placeholder renderiza su título y
 *   mensaje de disponibilidad de fase correctamente.
 * @why Las pantallas placeholder son contratos de routing: si no renderizan,
 *   el navegador lanzaría un error en tiempo de ejecución en esa ruta.
 * @impact Cubre `ObservationLogScreen`, `APODDetailScreen` y `AuthScreen`.
 *   `SolarCatalogScreen` y `BodyDetailScreen` se testean en `src/modules/lists/`.
 *   `AsteroidSearchScreen` fue movida al módulo `forms/` en Fase 3.
 *   `APODGalleryScreen` fue movida al módulo `storage/` en Fase 4.
 *   `ISSMapScreen` y `AstronautsScreen` fueron movidas al módulo `maps/` en Fase 5.
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ObservationLogScreen } from '../screens/PlaceholderScreens';
import { APODDetailScreen } from '../screens/APODDetailScreen';
import { AuthScreen } from '../screens/AuthScreen';

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
