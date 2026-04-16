# Copilot Instructions — proyecto-reactnative

Showcase app de **astronomía básica** en React Native (Expo managed → bare cuando sea
necesario), para demostrar las capacidades del framework en un contexto temático
concreto. Prioridad de plataformas: **Android → Web → iOS**.

El hilo narrativo de la app es el cosmos: planetas, satélites, eventos astronómicos,
clima espacial y la Estación Espacial Internacional, proyecto Artemis. Cada módulo técnico de React
Native se justifica con un caso de uso astronómico real.

---

## APIs astronómicas (abiertas / gratuitas)

| API                        | Base URL                                  | Auth             | Uso en la app                         |
| -------------------------- | ----------------------------------------- | ---------------- | ------------------------------------- |
| **NASA APOD**              | `https://api.nasa.gov/planetary/apod`     | API key gratuita | Imagen astronómica del día            |
| **NASA NeoWs**             | `https://api.nasa.gov/neo/rest/v1`        | API key gratuita | Asteroides cercanos a la Tierra       |
| **NASA DONKI**             | `https://api.nasa.gov/DONKI`              | API key gratuita | Clima espacial, tormentas solares     |
| **Solar System OpenData**  | `https://api.le-systeme-solaire.net/rest` | Sin auth         | Datos orbitales y físicos de planetas |
| **Open-Notify ISS**        | `http://api.open-notify.org/iss-now.json` | Sin auth         | Posición en tiempo real de la ISS     |
| **Open-Notify Astronauts** | `http://api.open-notify.org/astros.json`  | Sin auth         | Tripulantes actuales en el espacio    |

### Clave NASA

- Registrar en `https://api.nasa.gov/` (aprobación inmediata, gratuita).
- Guardar en `.env` como `EXPO_PUBLIC_NASA_API_KEY`.
- Usar `DEMO_KEY` solo para desarrollo inicial (límite: 30 req/hora por IP).

---

## Mapa módulo → tema astronómico

| Módulo RN        | Caso de uso astronómico                                             |
| ---------------- | ------------------------------------------------------------------- |
| `navigation/`    | Navegación entre secciones: Planetas, ISS, APOD, Eventos            |
| `lists/`         | Catálogo de cuerpos del sistema solar (planetas, lunas, asteroides) |
| `forms/`         | Filtros de búsqueda de asteroides por fecha y distancia             |
| `animations/`    | Órbitas planetarias animadas, rotación de planetas 3D               |
| `camera/`        | AR overlay con constelaciones apuntando al cielo                    |
| `maps/`          | Mapa terrestre con posición en tiempo real de la ISS                |
| `storage/`       | Caché de imágenes APOD y favoritos del usuario                      |
| `notifications/` | Alertas de tormenta solar (DONKI) y paso de la ISS                  |
| `sensors/`       | Giroscopio para mover el cielo estrellado (star map)                |
| `auth/`          | Perfil de observador: diario de observaciones en Supabase           |
| `realtime/`      | Posición ISS en tiempo real (polling + Supabase broadcast)          |
| `platform/`      | Diferencias Android/Web/iOS en permisos de cámara y sensores        |

---

## Stack principal

| Capa             | Tecnología                   | Versión exacta                             |
| ---------------- | ---------------------------- | ------------------------------------------ |
| Runtime          | React Native                 | 0.83.x (vía Expo SDK 55)                   |
| Framework        | Expo SDK                     | 55.0.15                                    |
| Lenguaje         | TypeScript                   | 5.x (la que venga con Expo SDK 55)         |
| Navegación       | React Navigation v7          | pinear al instalar                         |
| Animaciones      | Reanimated + Gesture Handler | pinear al instalar                         |
| Estado global    | Zustand                      | pinear al instalar                         |
| Fetching / caché | TanStack Query               | pinear al instalar                         |
| Formularios      | react-hook-form + Zod        | pinear al instalar                         |
| Backend          | Supabase (free tier)         | @supabase/supabase-js — pinear al instalar |
| Package manager  | **pnpm** (NUNCA npm ni yarn) | save-exact=true en ~/.config/pnpm/rc       |

> **Nota RN 0.78**: el usuario originalmente pidió RN 0.78, pero esa versión nunca tuvo
> un Expo SDK estable dedicado (solo canary). El par estable más cercano con React 19
> y la nueva arquitectura es Expo SDK 55 + RN 0.83. Si se requiere estrictamente 0.78,
> hay que usar bare React Native sin managed workflow.

---

## Reglas de dependencias — OBLIGATORIAS

- **Versiones exactas siempre**: `"expo": "55.0.15"`, nunca `^`, `~`, `*`, `latest`.
- Al agregar cualquier paquete: `pnpm add paquete@X.Y.Z` con versión explícita.
- Antes de instalar una dependencia nueva:
  1. Consultar la versión estable actual en npmjs.com / pnpm info.
  2. Ejecutar `pnpm audit --audit-level moderate` antes de cada commit.
  3. Si hay CVEs en nivel moderate o superior → **no instalar** o buscar alternativa.
- `pnpm` global tiene `save-exact=true`; si en algún momento se genera un `package.json`
  con rangos (`^`, `~`), corregirlos inmediatamente a versión exacta.
- No usar `npx install-expo-modules` ni comandos que invoquen npm internamente sin
  controlar el resultado en `package.json`.

---

## Arquitectura de módulos

Cada módulo es una carpeta autónoma en `src/modules/<nombre>/`:

```
src/
  modules/
    navigation/        → Stack, Tabs, Drawer (React Navigation)
    lists/             → FlatList / SectionList alto rendimiento
    forms/             → react-hook-form + Zod, teclado, focus
    animations/        → Reanimated 3: drag, spring, interpolation
    camera/            → expo-camera / react-native-vision-camera
    maps/              → react-native-maps + geolocalización
    storage/           → AsyncStorage, MMKV, SQLite (op-sqlite)
    notifications/     → expo-notifications (FCM Android primero)
    sensors/           → expo-sensors: acelerómetro, giroscopio
    auth/              → Supabase Auth + biometría (expo-local-authentication)
    realtime/          → Supabase Realtime subscriptions
    platform/          → diferencias Android / Web / iOS
  shared/
    components/        → componentes reutilizables
    hooks/             → custom hooks
    lib/               → cliente Supabase, config, utils
    theme/             → colores, tipografía, dark/light mode
```

Pantalla raíz: catálogo (Home) que lista los módulos disponibles con estado de
plataforma (Android ✓ / Web ✓ / iOS pendiente).

---

## Backend: Supabase (free tier)

- Credenciales en `.env` local (nunca commitear).
- Variables de entorno: `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- Usar Row Level Security (RLS) en todas las tablas desde el inicio.
- No exponer la `service_role` key en el cliente.

---

## Filosofía de calidad — INNEGOCIABLE

> "No hay errores pequeños. Hay errores, y se corrigen — sin importar su origen,
> su tamaño, ni si los introdujo el desarrollador, una librería o el propio Copilot."

- Todo error detectado (lint, type, test, runtime, CVE) se corrige antes de continuar.
- No se postergue correcciones con `// TODO` sin issue asociado.
- No se usa `@ts-ignore` ni `eslint-disable` sin comentario que explique el porqué
  y un issue abierto para resolverlo.
- Las mejores prácticas se aplican siempre, no solo cuando hay tiempo.

---

## Documentación académica del código

Cada función, hook, componente y módulo debe documentarse siguiendo el esquema:
**¿Qué hace? → ¿Para qué existe? → ¿Qué impacta?**

### Componentes y hooks (TSDoc / JSDoc)

```tsx
/**
 * Hook que gestiona el ciclo de vida de la sesión de autenticación con Supabase.
 *
 * @what Suscribe al listener `onAuthStateChange` y expone el usuario y estado de carga.
 * @why Centraliza la lógica de sesión para evitar subscripciones duplicadas en
 *   múltiples pantallas y garantizar un único punto de verdad.
 * @impact Cualquier cambio en este hook afecta a todas las pantallas protegidas
 *   por el guard de autenticación. Requiere test unitario actualizado.
 *
 * @returns {{ user: User | null, loading: boolean }}
 */
export function useAuthSession() { ... }
```

### Funciones utilitarias

```tsx
/**
 * Formatea una distancia en metros a texto legible según la locale del dispositivo.
 *
 * @what Convierte `meters: number` a string con unidad apropiada (m / km).
 * @why El módulo de mapas necesita mostrar distancias sin acoplar la lógica de
 *   presentación al componente de mapa.
 * @impact Usado en MapScreen y NotificationCard; cambios rompen el snapshot test.
 *
 * @param meters - Distancia en metros (debe ser >= 0).
 * @returns String formateado, ej. "350 m" o "1.2 km".
 */
export function formatDistance(meters: number): string { ... }
```

### Módulos (`index.ts` o `README` dentro del módulo)

Cada módulo en `src/modules/<nombre>/` debe incluir un comentario de bloque al inicio
de su `index.ts` con:

- **Qué demuestra** este módulo en el contexto del showcase.
- **Por qué** se eligió esta librería/enfoque.
- **Impacto** en el resto de la app (dependencias cruzadas, permisos requeridos).

---

## Testing — cobertura mínima ≥ 80 %

- Framework: **Jest** + **React Native Testing Library**.
- Cobertura mínima obligatoria: **80 %** de líneas y ramas por módulo.
- Ejecutar antes de cada commit: `pnpm test --coverage`.
- Si la cobertura baja del umbral, el commit queda bloqueado (configurar en `jest.config.ts`).

### Qué testear por tipo

| Tipo         | Qué cubrir                                                                  |
| ------------ | --------------------------------------------------------------------------- |
| Hook         | estados iniciales, transiciones, efectos secundarios (mock de dependencias) |
| Componente   | render por props, interacciones de usuario, accesibilidad (`getByRole`)     |
| Función util | casos normales, límites (0, null, undefined), errores esperados             |
| Integración  | flujo completo de pantalla con mocks de Supabase / sensores                 |

### Convenciones de archivos de test

```
src/modules/auth/
  __tests__/
    useAuthSession.test.ts    ← test unitario del hook
    AuthScreen.test.tsx       ← test de componente/pantalla
```

---

## Convenciones de código

- TypeScript estricto: `"strict": true` en `tsconfig.json`.
- Componentes: PascalCase. Hooks: `use` prefix. Utils: camelCase.
- Imports: orden `react → react-native → expo → terceros → locales`.
- Sin `any` implícito. Tipar siempre los props de componentes.
- Platform-specific code: usar `Platform.OS` o archivos `.android.tsx` / `.web.tsx` / `.ios.tsx`.

### Idioma del código

| Elemento                                                   | Idioma      |
| ---------------------------------------------------------- | ----------- |
| Nombres de variables, funciones, clases, tipos, interfaces | **inglés**  |
| Nombres de archivos y carpetas                             | **inglés**  |
| Props, eventos, constantes, enums                          | **inglés**  |
| Commits, branch names, PR titles                           | **inglés**  |
| Comentarios en código (`//`, `/* */`, TSDoc)               | **español** |
| Mensajes de error visibles al usuario (UI)                 | **español** |
| Documentación en `copilot-instructions.md`                 | **español** |

```tsx
// ✅ Correcto
const userSession = await getAuthSession(); // obtiene la sesión activa del usuario

// ❌ Incorrecto — comentario en inglés
const userSession = await getAuthSession(); // gets the active user session

// ❌ Incorrecto — variable en español
const sesionUsuario = await getAuthSession();
```

---

## Commits

Formato Conventional Commits con cuerpo pedagógico:

```
type(scope): short description

For: reason this change was needed
Impact: what this affects/enables
```

Tipos: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `ci`.
Idioma del commit: **inglés**.

---

## Prioridad de plataformas

1. **Android**: funcionalidades nativas completas, testing primero en Android.
2. **Web** (`react-native-web`): responsivo, hover states, accesibilidad ARIA.
3. **iOS**: last — ajustes de safe area, haptics avanzados, ActionSheet nativo.

Al implementar una feature que usa API nativa, comprobar disponibilidad con
`Platform.OS` o el hook `usePlatformCapability` antes de renderizar.
