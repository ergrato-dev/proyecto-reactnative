---
mode: agent
description: Añade tests a un módulo existente hasta alcanzar cobertura ≥ 80%
---

# Añadir tests al módulo

Analiza el módulo `${input:moduleName}` en `src/modules/${input:moduleName}/` y genera
los tests faltantes para alcanzar una cobertura ≥ 80 % de líneas y ramas.

## Proceso

1. Leer todos los archivos del módulo (hooks, componentes, utils).
2. Identificar qué está cubierto y qué falta.
3. Generar los archivos de test en `src/modules/${input:moduleName}/__tests__/`.

## Convenciones

- Framework: **Jest** + **React Native Testing Library**.
- Mocks: usar `jest.mock()` para Supabase, TanStack Query y módulos nativos.
- Nomenclatura: `nombreArchivo.test.ts` (hooks/utils) o `NombreComponente.test.tsx` (UI).
- Comentarios de test en **español**.

## Qué cubrir por tipo

| Tipo         | Casos obligatorios                                                              |
| ------------ | ------------------------------------------------------------------------------- |
| Hook         | estado inicial, transición loading→data, transición loading→error, cleanup      |
| Componente   | render con props mínimos, interacción del usuario, estado de error, `getByRole` |
| Función util | caso normal, límites (0, null, undefined, NaN), error esperado                  |
| Integración  | flujo completo de pantalla con datos mockeados de la API astronómica            |

## Ejemplo de estructura esperada

```
src/modules/${input:moduleName}/
  __tests__/
    use${input:moduleName|capitalize}.test.ts
    ${input:moduleName}Screen.test.tsx
    (utils si existen)
```
