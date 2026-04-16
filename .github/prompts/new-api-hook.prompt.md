---
mode: agent
description: Crea un custom hook que consume una API astronómica con TanStack Query
---

# Crear hook de API astronómica

Genera un custom hook para consumir el endpoint `${input:apiEndpoint}` usando TanStack Query.

## Parámetros

- **Nombre del hook**: `${input:hookName}` (debe empezar con `use`)
- **Endpoint**: `${input:apiEndpoint}`
- **Propósito**: ${input:purpose}

## Estructura del hook

```ts
// src/modules/${input:moduleName}/hooks/${input:hookName}.ts

/**
 * @what  descripción concisa de lo que hace el hook
 * @why   razón de existencia en el contexto del módulo
 * @impact pantallas y componentes que dependen de este hook
 *
 * @returns {{ data, isLoading, isError, error, refetch }}
 */
export function ${input:hookName}() { ... }
```

## Requisitos técnicos

1. **TanStack Query** (`useQuery`): gestionar loading, error y caché.
2. **Query key** descriptiva: `['astronomía', 'nombreRecurso', ...params]`.
3. **Tipo de respuesta** definido como interface TypeScript (sin `any`).
4. **Error handling**: capturar y re-lanzar con mensaje legible en español.
5. **staleTime** apropiado según la frecuencia de actualización del dato:
   - Posición ISS → `staleTime: 5_000` (5 s)
   - APOD → `staleTime: 60 * 60 * 1000` (1 h)
   - Planetas / cuerpos → `staleTime: 24 * 60 * 60 * 1000` (24 h)
6. **NASA API Key**: usar `EXPO_PUBLIC_NASA_API_KEY` desde `process.env` (fallback `DEMO_KEY`).

## Test requerido

Crear `__tests__/${input:hookName}.test.ts` con:

- estado inicial (loading)
- respuesta exitosa (mockeado)
- manejo de error de red
