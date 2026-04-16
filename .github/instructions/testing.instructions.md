---
applyTo: "src/**/__tests__/**,src/**/*.test.ts,src/**/*.test.tsx"
---

# Instructions — tests

## Framework

- **Jest** + **React Native Testing Library (RNTL)**.
- Cobertura mínima: **80 % de líneas y ramas** por módulo.
- Ejecutar siempre antes de commit: `pnpm test --coverage`.

## Convenciones de archivos

```
src/modules/<nombre>/__tests__/
  use<Nombre>.test.ts       ← hooks
  <Nombre>Screen.test.tsx   ← pantallas / componentes
  <util>.test.ts            ← funciones utilitarias
```

## Qué cubrir obligatoriamente

### Hooks

- Estado inicial (antes de resolver la query).
- Transición `loading → data` (mock de respuesta exitosa).
- Transición `loading → error` (mock de error de red).
- Limpieza de efectos secundarios (unmount).

### Componentes / pantallas

- Render mínimo sin props opcionales.
- Interacción del usuario (`fireEvent`, `userEvent`).
- Estado de error con mensaje visible.
- Accesibilidad: al menos un `getByRole` por componente interactivo.

### Funciones utilitarias

- Caso normal.
- Valores límite: `0`, `null`, `undefined`, `NaN`, string vacío.
- Error esperado: verificar que se lanza con el mensaje correcto.

## Mocks estándar

```ts
// mock de TanStack Query
jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

// mock de Supabase
jest.mock("@/shared/lib/supabaseClient", () => ({
  supabase: { from: jest.fn(), auth: { onAuthStateChange: jest.fn() } },
}));

// mock de módulos nativos de Expo
jest.mock("expo-sensors", () => ({
  Gyroscope: { addListener: jest.fn(), removeAllListeners: jest.fn() },
}));
```

## Idioma en tests

- Descripciones de `describe` y `it`/`test`: **español**.
- Variables y funciones auxiliares: **inglés**.

```ts
describe('useApod', () => {
  it('retorna estado de carga inicial', () => { ... });
  it('retorna los datos de la imagen del día', () => { ... });
  it('maneja errores de red correctamente', () => { ... });
});
```
