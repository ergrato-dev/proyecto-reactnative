/// <reference types="jest" />
/**
 * Tests unitarios para la configuración de deep linking (`linking.ts`).
 *
 * @what Verifica que la configuración de linking tiene los prefixes correctos
 *   y que todas las rutas principales están registradas.
 * @why Si falta una ruta en el linking, el deep link falla silenciosamente;
 *   estos tests actúan como contrato de que las rutas críticas existen.
 * @impact Cubre el objeto `linking` exportado desde `linking.ts`.
 */

import { linking } from '../linking';

describe('linking', () => {
  it('debería incluir el scheme cosmosrn:// como primer prefijo', () => {
    expect(linking.prefixes[0]).toBe('cosmosrn://');
  });

  it('debería incluir al menos 2 prefixes (scheme + HTTPS)', () => {
    expect(linking.prefixes.length).toBeGreaterThanOrEqual(2);
  });

  it('debería tener configuración de screens definida', () => {
    expect(linking.config).toBeDefined();
    expect(linking.config?.screens).toBeDefined();
  });

  it('debería registrar la ruta MainTabs en la raíz', () => {
    const screens = linking.config?.screens as Record<string, unknown>;
    expect(screens).toHaveProperty('MainTabs');
  });

  it('debería registrar rutas del drawer (Animations, Sensors, Camera, Platform)', () => {
    const screens = linking.config?.screens as Record<string, unknown>;
    expect(screens).toHaveProperty('Animations');
    expect(screens).toHaveProperty('Sensors');
    expect(screens).toHaveProperty('Camera');
    expect(screens).toHaveProperty('Platform');
  });

  it('debería registrar la ruta home dentro de Explore', () => {
    const screens = linking.config?.screens as Record<string, unknown>;
    const mainTabs = screens['MainTabs'] as { screens: Record<string, unknown> };
    const explore = mainTabs.screens['Explore'] as { screens: Record<string, unknown> };
    expect(explore.screens['Home']).toBe('home');
  });

  it('debería registrar la ruta ISS dentro de MainTabs', () => {
    const screens = linking.config?.screens as Record<string, unknown>;
    const mainTabs = screens['MainTabs'] as { screens: Record<string, unknown> };
    expect(mainTabs.screens).toHaveProperty('ISS');
  });

  it('debería registrar body/:bodyId para el detalle de cuerpo celeste', () => {
    const screens = linking.config?.screens as Record<string, unknown>;
    const mainTabs = screens['MainTabs'] as { screens: Record<string, unknown> };
    const explore = mainTabs.screens['Explore'] as { screens: Record<string, unknown> };
    expect(explore.screens['BodyDetail']).toBe('body/:bodyId');
  });
});
