---
mode: agent
description: Andamiaje completo para un nuevo módulo del showcase astronómico
---

# Crear nuevo módulo

Genera el andamiaje completo para el módulo `${input:moduleName}` del showcase de astronomía en React Native.

## Estructura requerida

```
src/modules/${input:moduleName}/
  index.ts                          ← barrel export + comentario de módulo (@what/@why/@impact)
  screens/
    ${input:moduleName}Screen.tsx   ← pantalla principal
  components/                       ← componentes locales del módulo
  hooks/                            ← custom hooks del módulo
  __tests__/
    ${input:moduleName}Screen.test.tsx
```

## Reglas obligatorias

1. **Comentario de módulo** en `index.ts`:

   ```ts
   /**
    * @what  descripción de qué demuestra el módulo
    * @why   por qué se eligió esta librería/enfoque
    * @impact dependencias cruzadas y permisos requeridos
    */
   ```

2. **Documentación TSDoc** en cada función, hook y componente con `@what`, `@why`, `@impact`.

3. **Idioma**: nomenclatura técnica en inglés, comentarios en español.

4. **TypeScript estricto**: sin `any`, props tipados, sin `@ts-ignore`.

5. **Test mínimo** en `__tests__/` que cubra:
   - render correcto del componente principal
   - estado de carga (loading state)
   - estado de error (error state)
   - accesibilidad básica con `getByRole`

6. **Compatibilidad de plataformas**: verificar con `Platform.OS` antes de usar APIs nativas.
   Usar `.android.tsx` / `.web.tsx` / `.ios.tsx` cuando el comportamiento difiera.

7. **Dependencias**: si el módulo requiere un paquete nuevo, indicarlo con versión exacta
   (consultar `pnpm info <paquete> version`) y ejecutar `pnpm audit --audit-level moderate`.

## Contexto astronómico

Caso de uso del módulo: ${input:astronomicalUseCase}

API a consumir (si aplica): ${input:apiEndpoint}
