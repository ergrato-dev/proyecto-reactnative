---
applyTo: "src/modules/**"
---

# Instructions — módulos del showcase

Cada módulo en `src/modules/<nombre>/` demuestra una capacidad específica de React Native
usando el cosmos como hilo narrativo.

## Estructura obligatoria por módulo

```
src/modules/<nombre>/
  index.ts              ← barrel export con comentario @what/@why/@impact
  screens/              ← una o más pantallas del módulo
  components/           ← componentes privados del módulo
  hooks/                ← custom hooks (useQuery, estado local)
  __tests__/            ← cobertura ≥ 80%
```

## Documentación TSDoc — obligatoria

Cada función, hook y componente debe incluir:

```ts
/**
 * @what  qué hace exactamente este elemento
 * @why   por qué existe en el contexto del módulo/app
 * @impact qué se rompe o cambia si se modifica
 */
```

## Reglas de estilo

- Nomenclatura técnica en **inglés** (variables, funciones, tipos, archivos).
- Comentarios en código en **español**.
- Sin `any` implícito ni `@ts-ignore` sin justificación y issue asociado.
- Props de componentes siempre tipados con `interface` o `type`.

## APIs astronómicas disponibles

Usar siempre el cliente centralizado de `src/shared/lib/`:

```ts
// correcto — usar el cliente configurado con la API key
import { nasaClient } from "@/shared/lib/nasaClient";
import { solarSystemClient } from "@/shared/lib/solarSystemClient";

// incorrecto — fetch directo sin cliente
fetch("https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY");
```

## Compatibilidad de plataformas

Antes de usar cualquier API nativa, verificar disponibilidad:

```ts
import { Platform } from "react-native";

if (Platform.OS === "android") {
  // lógica específica de Android
}
```

Archivos platform-specific: `.android.tsx`, `.web.tsx`, `.ios.tsx`.
