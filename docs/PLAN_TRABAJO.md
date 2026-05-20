# Plan de Trabajo — CosmosRN

**Proyecto:** CosmosRN — Showcase app de astronomía básica en React Native  
**Stack:** Expo SDK 55.0.15 · React Native 0.83 · TypeScript · Supabase · pnpm  
**Plataformas:** Android → Web → iOS  
**Narrativa:** planetas · satélites · asteroides · clima espacial · ISS · proyecto Artemis  
**Última actualización:** Mayo 2026 — Fases 1-14 completadas (508 tests · TS clean · PR #1 mergeado — 2026-05-19)

> Marcar cada ítem con `[x]` al completarlo.  
> Añadir la fecha de cierre al final del ítem: `[x] descripción — ✅ 2026-04-16`

---

## Fase 0 — Fundamentos del proyecto

### 0.1 Documentación base
- [x] `copilot-instructions.md` con tema astronómico, APIs y stack — ✅ 2026-04-16
- [x] `.github/instructions/` — modules, testing, supabase, astronomy-apis — ✅ 2026-04-16
- [x] `.github/prompts/` — new-module, new-api-hook, add-tests, audit-dependencies — ✅ 2026-04-16
- [x] `docs/requirements/functional.md` — 36 RFs — ✅ 2026-04-16
- [x] `docs/requirements/non-functional.md` — 32 RNFs — ✅ 2026-04-16
- [x] `docs/requirements/user-stories.md` — 15 HUs — ✅ 2026-04-16
- [x] `docs/requirements/constraints.md` — restricciones — ✅ 2026-04-16
- [x] `.gitignore` — ✅ 2026-04-16

### 0.2 Inicialización del proyecto
- [x] `pnpm create expo-app@latest cosmosrn --template blank-typescript` — ✅ 2026-04-17
- [x] Verificar que `package.json` no tiene `^` ni `~` (corregir si los hay) — ✅ 2026-04-17
- [x] `pnpm audit --audit-level moderate` — sin CVEs moderate+ — ✅ 2026-04-17
- [x] Configurar `tsconfig.json` con `"strict": true` y path alias `@/` — ✅ 2026-04-17
- [x] Configurar ESLint + Prettier con reglas del proyecto — ✅ 2026-04-17
- [x] Crear `.env.example` con las variables requeridas (sin valores reales) — ✅ 2026-04-17
- [X] Registrar clave NASA en `https://api.nasa.gov/` y guardar en `.env`
- [X] Crear proyecto Supabase free tier y guardar credenciales en `.env`
- [x] Primer commit: `chore(init): bootstrap Expo SDK 55 project with strict TypeScript` — ✅ commit 6c9d9eb

### 0.3 Estructura de carpetas
- [x] Crear árbol `src/modules/` con carpetas vacías para los 12 módulos — ✅ 2026-04-17
- [x] Crear `src/shared/components/`, `hooks/`, `lib/`, `theme/` — ✅ 2026-04-17
- [x] Crear `src/shared/lib/nasaClient.ts` (cliente HTTP + API key) — ✅ 2026-04-17
- [x] Crear `src/shared/lib/solarSystemClient.ts` (Solar System OpenData) — ✅ 2026-04-17
- [x] Crear `src/shared/lib/issClient.ts` (Open-Notify) — ✅ 2026-04-17
- [x] Crear `src/shared/lib/supabaseClient.ts` (singleton) — ✅ 2026-04-17
- [x] Commit: `chore(structure): create module folders and shared lib clients` — ✅ commit 8543928

### 0.4 Infraestructura de testing
- [x] Instalar Jest + React Native Testing Library con versiones exactas — ✅ 2026-04-17
- [x] Configurar `jest.config.js` con umbral de cobertura 80% — ✅ 2026-04-17
- [x] `pnpm test --coverage`: 23 tests, 4 suites PASS; 100% stmts/funcs/lines, 92% branches — ✅ 2026-04-17
- [x] Commit: `chore(test): configure Jest with 80% coverage threshold` — ✅ commit 01ce71d

---

## Fase 1 — Módulo: Navegación (`navigation/`)

> **Caso de uso astronómico:** navegar entre Planetas, ISS, APOD, Eventos  
> **RF:** RF-NAV-01 al RF-NAV-05 | **HU:** HU-15

- [x] Instalar React Navigation v7 con versiones exactas y auditar
- [x] Implementar Stack Navigator para flujo de detalle
- [x] Implementar Bottom Tabs Navigator (Explorar / ISS / APOD / Perfil)
- [x] Implementar Drawer lateral con listado de módulos
- [x] Pantalla Home: catálogo con nombre, descripción y estado de plataforma por módulo
- [x] Configurar deep linking (scheme `cosmosrn://`)
- [x] Tests: navegación entre tabs, apertura del drawer, deep link
- [x] `pnpm audit` — sin CVEs moderate+
- [x] Cobertura ≥ 80% en el módulo
- [x] Commit: `feat(navigation): implement Stack, Tabs and Drawer with module catalog`

---

## Fase 2 — Módulo: Catálogo solar (`lists/`)

> **Caso de uso astronómico:** catálogo de planetas, lunas y asteroides  
> **RF:** RF-LIST-01 al RF-LIST-05 | **HU:** HU-01, HU-02

- [x] Implementar `useBodyList` (TanStack Query → Solar System OpenData `/bodies`)
- [x] Implementar `useBodyDetail` (query por ID)
- [x] FlatList con virtualización para ≥ 500 elementos
- [x] SectionList agrupado por tipo (planeta / satélite / asteroide / cometa)
- [x] Pantalla de detalle con todos los campos (RF-LIST-04)
- [x] Caché 24h + indicador offline
- [x] Tests: loading, data, error, scroll performance mock, detalle
- [x] Cobertura ≥ 80% → 98% stmts / 90% branches / 97% funcs / 99% lines
- [x] Commit: `feat(lists): solar system catalog with FlatList and SectionList` → `36c4c06`

---

## Fase 3 — Módulo: Formularios (`forms/`)

> **Caso de uso astronómico:** búsqueda de asteroides por fecha y distancia  
> **RF:** RF-FORM-01 al RF-FORM-06 | **HU:** HU-06

- [x] Instalar react-hook-form + Zod con versiones exactas y auditar
- [x] Implementar esquema Zod: validación de fechas y rango ≤ 7 días
- [x] Formulario con DatePicker (Android / Web / iOS) y campo de distancia
- [x] Gestión de foco entre campos y cierre de teclado
- [x] Implementar `useNeoWs` (TanStack Query → NASA NeoWs)
- [x] Lista de resultados con badge PHA (potencialmente peligroso)
- [x] Tests: validación correcta, error fecha invertida, error rango > 7 días, submit OK
- [x] Cobertura ≥ 80% → 98% stmts / 90% branches / 94% funcs / 98% lines (123 tests)
- [x] Commit: `feat(forms): asteroid search with react-hook-form and Zod validation` → `4928bee`

---

## Fase 4 — Módulo: APOD + Almacenamiento (`storage/`)

> **Caso de uso astronómico:** imagen astronómica del día y favoritos  
> **RF:** RF-APOD-01 al RF-APOD-03, RF-STOR-01 al RF-STOR-04 | **HU:** HU-04, HU-05

- [x] Implementar `useApod` (TanStack Query → NASA APOD, staleTime 1h) — ✅ 2026-04-16
- [x] Pantalla APOD: imagen progresiva, título, descripción, créditos — ✅ 2026-04-16
- [x] Soporte de vídeo APOD (abrir en navegador externo) — ✅ 2026-04-16
- [x] Navegación a APODs anteriores (≤ 30 días) — ✅ 2026-04-16
- [x] Persistir APOD del día en AsyncStorage para offline — ✅ 2026-04-16
- [x] Sistema de favoritos (planetas) persistido localmente — ✅ 2026-04-16
- [x] Historial de búsquedas de asteroides (últimas 10) — ✅ 2026-04-16
- [x] Pantalla de gestión de caché con espacio usado y botón borrar — ✅ 2026-04-16
- [x] Share API: compartir imagen APOD — ✅ 2026-04-16
- [x] Tests: carga, offline fallback, añadir/quitar favorito, historial — 44 tests ✅ 2026-04-16
- [x] Cobertura ≥ 80% → hooks 100% / APODDetailScreen 52% / ApodMedia 71% — ✅ 2026-04-16
- [x] Commit: `feat(storage): APOD viewer with offline cache and favorites` → `f94c982` — ✅ 2026-04-16

---

## Fase 5 — Módulo: Rastreo ISS (`maps/` + `realtime/`)

> **Caso de uso astronómico:** posición en tiempo real de la ISS  
> **RF:** RF-MAP-01 al RF-MAP-05, RF-RT-01 al RF-RT-03 | **HU:** HU-07, HU-08

- [x] Instalar react-native-maps con versión exacta y auditar — ✅ 2026-04-16
- [x] Implementar `useIssPosition` (polling cada 5s, Open-Notify) — ✅ 2026-04-16
- [x] Implementar `useAstronauts` (Open-Notify, staleTime 1h) — ✅ 2026-04-16
- [x] Mapa con marcador ISS actualizado en tiempo real — ✅ 2026-04-16
- [x] Trazar trayectoria orbital (últimos 10 min, 120 puntos) — ✅ 2026-04-16
- [x] Panel de coordenadas superpuesto al mapa — ✅ 2026-04-16
- [x] Botón "centrar en ISS" → navega a tripulación — ✅ 2026-04-16
- [x] Lista de tripulantes con nombre y nave — ✅ 2026-04-16
- [x] Supabase Realtime: publicar posición ISS y suscribir múltiples clientes — ✅ 2026-05-20
- [x] Reconexión automática tras pérdida de red — ✅ 2026-05-20
- [x] Tests: render mapa, actualización posición, lista tripulantes, Realtime, reconexión — 44 tests ✅ 2026-05-20
- [x] Cobertura ≥ 80% → maps/screens 80.43% branches / 94.73% lines — ✅ 2026-04-16
- [x] Commit: `feat(maps): ISS real-time tracker with react-native-maps` → `9bdf087` — ✅ 2026-04-16
- [x] Commit: `feat(realtime): Supabase Realtime ISS position broadcast with auto-reconnect` — ✅ 2026-05-20

---

## Fase 6 — Módulo: Proyecto Artemis (`artemis/`)

> **Caso de uso astronómico:** estado de misiones lunares, cronograma de lanzamientos y galería de imágenes oficiales de la NASA  
> **RF:** RF-ART-01 al RF-ART-04 | **HU:** HU-16 _(añadir a `user-stories.md`)_

- [x] Añadir `fetchArtemisImages` a `nasaClient.ts` (NASA Images API — `images-api.nasa.gov`, sin auth) — ✅ 2026-04-16
- [x] Implementar `useArtemisImages` (TanStack Query, staleTime 6h) — ✅ 2026-04-16
- [x] Datos estáticos de misiones: Artemis I (completada 2022), Artemis II (tripulada 2026), Artemis III (alunizaje 2027+) — ✅ 2026-04-16
- [x] `MissionStatusScreen` — lista de misiones con estado, tripulación y fecha objetivo (FlatList) — ✅ 2026-04-16
- [x] `ArtemisGalleryScreen` — galería horizontal de imágenes oficiales con título y fecha — ✅ 2026-04-16
- [x] Añadir entrada en el Drawer para acceso directo a la sección Artemis — ✅ 2026-04-16
- [x] Tests: render lista de misiones, estados completada/en-progreso/planificada, carga de galería — 26 tests ✅ 2026-04-16
- [x] Cobertura ≥ 80% — ✅ 2026-04-16
- [x] Commit: `feat(artemis): mission status screen and NASA image gallery` → `d35ac83` — ✅ 2026-04-16

---

## Fase 7 — Módulo: Notificaciones (`notifications/`)

> **Caso de uso astronómico:** alertas de tormentas solares y paso de la ISS  
> **RF:** RF-NOTIF-01 al RF-NOTIF-04 | **HU:** HU-09

- [x] Instalar `expo-notifications@0.29.14` y auditar CVEs — ✅ 2026-04-17
- [x] CVE alto `@xmldom/xmldom < 0.8.12` mitigado con `pnpm.overrides` — ✅ 2026-04-17
- [x] Implementar `useDonki` (NASA DONKI, staleTime 30 min, filtrado M+/X+) — ✅ 2026-04-17
- [x] Implementar `useNotificationPermission` (Android 13+ POST_NOTIFICATIONS) — ✅ 2026-04-17
- [x] Librería `notificationScheduler`: handler, alerta solar inmediata, APOD diaria (9:00 h) — ✅ 2026-04-17
- [x] `NotificationSettingsScreen`: toggles (solar M+, ISS próximamente, APOD diaria), banner de permisos — ✅ 2026-04-17
- [x] Solicitud de permiso con explicación en español y botón dedicado — ✅ 2026-04-17
- [x] Añadir `NotificationsStack` al drawer lateral — ✅ 2026-04-17
- [x] Tests: `isMajorSolarFlare`, `useDonki`, `useNotificationPermission`, `notificationScheduler`, `NotificationSettingsScreen` — 42 tests ✅ 2026-04-17
- [x] Cobertura ≥ 80% → hooks 100% / lib 100% / screens 82% stmts / 83% branches / 91% lines — ✅ 2026-04-17
- [x] Commit: `feat(notifications): solar storm alerts and notification settings with expo-notifications`

---

## Fase 8 — Módulo: Sensores / Star Map (`sensors/`)

> **Caso de uso astronómico:** mapa estelar controlado por giroscopio  
> **RF:** RF-SENS-01 al RF-SENS-04 | **HU:** HU-10

- [x] Instalar `expo-sensors@55.0.13` con versión exacta y auditar — sin CVEs — ✅ 2026-04-16
- [x] Implementar `useGyroscope` (integración velocidad angular → rotación, reset, cleanup) — ✅ 2026-04-16
- [x] Implementar `useAccelerometer` (lecturas crudas, cleanup en unmount) — ✅ 2026-04-16
- [x] Catálogo offline: 120 estrellas con coordenadas reales RA/Dec J2000.0 + 12 constelaciones — ✅ 2026-04-16
- [x] Giroscopio controla rotación del cielo (proyección equidistante RA/Dec → píxeles) — ✅ 2026-04-16
- [x] Fallback a gestos táctiles (PanResponder) si no hay giroscopio — ✅ 2026-04-16
- [x] Label con nombre de constelación más próxima al centro — ✅ 2026-04-16
- [x] Botón "Centrar" (resetea a Orión) + coordenadas RA/Dec en pantalla — ✅ 2026-04-16
- [x] Tests: catálogo de datos, `useGyroscope`, `useAccelerometer`, `StarMapScreen` — 30 tests ✅ 2026-04-16
- [x] Cobertura ≥ 80% → stars 100% / hooks 95%+ / screen 86% stmts / 89% branches — ✅ 2026-04-16
- [x] Commit: `feat(sensors): gyroscope-driven star map with graceful fallback` → `ea1f5be` — ✅ 2026-04-16

---

## Fase 9 — Módulo: Autenticación y perfil (`auth/`) ✅ COMPLETADA

> **Caso de uso astronómico:** diario personal de observaciones  
> **RF:** RF-AUTH-01 al RF-AUTH-05 | **HU:** HU-11, HU-12, HU-13  
> **Commit:** `0e3dc3b` — 317 tests passing (29 nuevos)

- [x] Instalar @supabase/supabase-js + expo-secure-store con versiones exactas y auditar
- [x] Implementar `useAuthSession` (singleton listener `onAuthStateChange`)
- [x] Pantalla de registro (email + contraseña, validación Zod)
- [x] Pantalla de login con opción biométrica (expo-local-authentication)
- [x] Guardar token en expo-secure-store (nunca AsyncStorage sin cifrado)
- [x] Migración Supabase: tabla `observations` con RLS
- [x] CRUD de observaciones: crear, listar, editar, eliminar
- [x] Tests: registro, login, biometría mock, CRUD observaciones mock
- [x] Cobertura ≥ 80%
- [x] Commit: `feat(auth): Supabase auth with biometrics and observations diary`

---

## Fase 10 — Módulo: Animaciones (`animations/`)

> **Caso de uso astronómico:** órbitas planetarias animadas  
> **RF:** RF-ANIM-01 al RF-ANIM-04 | **HU:** HU-03

- [x] Instalar react-native-reanimated + react-native-gesture-handler con versiones exactas y auditar
- [x] Animar órbitas de Mercurio, Venus, Tierra y Marte (worklet en UI thread)
- [x] Velocidades proporcionales a períodos orbitales reales
- [x] Controles de pausa / reanudación
- [x] Drag para rotar planeta en 3D (Gesture Handler)
- [x] Spring zoom al seleccionar planeta
- [x] Tests: animación pausa/resume, gesto drag (mock), spring trigger
- [x] Cobertura ≥ 80%
- [x] Commit: `feat(animations): orbital animations with Reanimated 4 worklets`

---

## Fase 11 — Módulo: Diferencias de plataforma (`platform/`)

> **Caso de uso astronómico:** comparativa Android/Web/iOS  
> **RF:** RF-PLAT-01 al RF-PLAT-03 | **HU:** HU-14

- [x] Pantalla comparativa: permisos, APIs disponibles, diferencias de UI
- [x] ActionSheet nativo iOS vs. BottomSheet Android
- [x] Responsivo Web: 320 px → 1440 px
- [x] Snippets de código comentados en cada diferencia
- [x] Tests: render en cada plataforma (mock Platform.OS)
- [x] Cobertura ≥ 80%
- [x] Commit: `feat(platform): platform differences showcase with responsive web layout`

---

## Fase 12 — Módulo: Cámara AR (`camera/`) ⚡ Stretch goal

> **Caso de uso astronómico:** overlay de constelaciones en AR  
> **RF:** RF-CAM-01 al RF-CAM-05

- [x] Instalar expo-camera@55.0.15 y react-native-svg@15.15.3 con versión exacta y auditar — ✅ 2026-04-16
- [x] Solicitud de permiso de cámara con explicación en español — ✅ 2026-04-16
- [x] Overlay SVG de constelaciones sobre vista de cámara (`ConstellationOverlay`) — ✅ 2026-04-16
- [x] Integración con giroscopio (módulo `sensors/`) para alinear overlay — ✅ 2026-04-16
- [x] Captura de foto (`takePictureAsync`) con previsualización — ✅ 2026-04-16
- [x] Degradación en Web con mensaje informativo — ✅ 2026-04-16
- [x] Tests: permiso denegado, permiso concedido, captura mock, overlay, Web — 18 tests ✅ 2026-04-16
- [x] Cobertura ≥ 80% — ✅ 2026-04-16
- [x] Commit: `feat(camera): AR constellation overlay with expo-camera` — ✅ 2026-04-16

---

## Fase 13 — Pulido y entrega académica

### 13.1 Tema y accesibilidad
- [x] Implementar sistema de tema dark/light en `src/shared/theme/`
- [x] Verificar contraste WCAG AA en todos los textos
- [x] Añadir `accessibilityLabel` y `accessibilityRole` en todos los elementos interactivos
- [x] Tamaño mínimo de área táctil 44×44 dp verificado

### 13.2 Calidad final
- [x] `pnpm lint` — cero errores
- [x] `pnpm tsc --noEmit` — cero errores de tipos
- [x] `pnpm test --coverage` — todos los módulos ≥ 80% (457 tests · 50 suites)
- [x] `pnpm audit --audit-level moderate` — sin CVEs moderate+
- [x] Revisar que no hay `// TODO` sin issue asociado
- [x] Revisar que no hay `@ts-ignore` sin comentario justificativo

### 13.3 Documentación final
- [x] Completar TSDoc (`@what / @why / @impact`) en todos los módulos
- [x] Actualizar `README.md` con instrucciones de instalación y ejecución
- [x] Verificar que `.env.example` está actualizado con todas las variables

### 13.4 Commit de cierre
- [x] Commit: `docs(project): finalize academic documentation and coverage report` — ✅ 2026-05-19

---

## Fase 14 — Correcciones post-auditoría (3 mayo 2026)

> Auditoría completa realizada el 2026-05-03 comparando estado real del código contra RFs, HUs, RNFs y restricciones.
> Todos los ítems de esta fase son **bloqueantes** para la entrega: incumplían RC-04.3, RC-05.1, RC-05.2 o RNF-08.1.

### 14.1 Bug de producción — `AsyncStorage.removeMany` inexistente
> **Origen:** `src/modules/storage/hooks/useApod.ts` L91 llama a `AsyncStorage.removeMany(keys)`.
> `removeMany` no existe en la API de `@react-native-async-storage/async-storage`; la función correcta es `multiRemove(keys)`.
> Impacto: el botón "Borrar caché" de `CacheManagementScreen` lanza `TypeError` en runtime.
> **RF afectado:** RF-STOR-04 | **RNF afectado:** RNF-08.1

- [x] Reemplazar `AsyncStorage.removeMany(keys)` por `AsyncStorage.multiRemove(keys)` en `useApod.ts` L91 — ✅ 2026-05-03
- [x] Corregir el mismo error en `useApod.test.tsx` (mock de `removeMany` → `multiRemove`) — ✅ 2026-05-03
- [x] Verificar `pnpm tsc --noEmit` sin error TS2339 en `useApod.ts` — ✅ 2026-05-03
- [x] Commit: `fix(storage): replace non-existent AsyncStorage.removeMany with multiRemove` — ✅ 2026-05-03

### 14.2 Errores TypeScript — 17 errores en 4 archivos
> **Origen:** `pnpm tsc --noEmit` reportó 17 errores tras la auditoría del 2026-05-03.
> Incumple RC-05.2 y RNF-08.1.

- [x] **`authScreens.test.tsx`**: corregir 9 errores TS2345 en mocks de `UseAuthActionsResult` / `UseObservationsResult` — ✅ 2026-05-03
- [x] **`authScreens.test.tsx`**: eliminar import no usado `waitFor` (TS6133 + ESLint `no-unused-vars`) — ✅ 2026-05-03
- [x] **`APODGalleryScreen.test.tsx`**: corregir predicado `find` con `AlertButton.text` — ✅ 2026-05-03
- [x] **`useTheme.test.ts`**: corregir 3 errores TS2345 — `'unspecified'` en lugar de `null` — ✅ 2026-05-03
- [x] Verificar `pnpm tsc --noEmit` → 0 errores — ✅ 2026-05-03
- [x] Verificar `pnpm lint` → 0 errores — ✅ 2026-05-03
- [x] Commit: `fix(tests): resolve 17 TypeScript errors and 1 ESLint error across test files` — ✅ 2026-05-03

### 14.3 CVE — `@xmldom/xmldom` override a versión aún vulnerable
> **Origen:** `pnpm.overrides` en `package.json` fija `@xmldom/xmldom` a `"0.8.12"`, pero el parche exige `>=0.8.13`.
> La versión 0.8.12 sigue siendo vulnerable. `pnpm audit` reporta 4 HIGH activos.
> Incumple RC-04.3 y RNF-03.5.

- [x] Actualizar `pnpm.overrides["@xmldom/xmldom"]` de `"0.8.12"` a `"0.8.13"` en `package.json` — ✅ 2026-05-03
- [x] Ejecutar `pnpm install` para regenerar `pnpm-lock.yaml` — ✅ 2026-05-03
- [x] Verificar `pnpm audit --audit-level high` → 0 vulnerabilidades high o critical — ✅ 2026-05-03
- [x] `postcss` (<8.5.10, moderate) y `uuid` (<14.0.0, low) son transitivas de Expo SDK 55 sin fix disponible — aceptadas — ✅ 2026-05-03
- [x] Commit: `fix(security): bump @xmldom/xmldom override to 0.8.13 to patch 4 HIGH CVEs` — ✅ 2026-05-03

### 14.4 Cobertura — 7 agrupaciones por debajo del 80%
> **Origen:** `pnpm test --coverage` del 2026-05-03.
> Incumple RC-05.1 y RNF-04.1.

| Archivo / Carpeta | Stmts | Branches | Funcs | Lines |
|---|---|---|---|---|
| `animations/components` (OrbitingPlanet.tsx) | 45% | 100% | 25% | 45% |
| `animations/screens` (OrbitScreen.tsx) | 77% | 50% | 50% | 84% |
| `auth/screens` (Login/Register/Observations) | 78% | 67% | 64% | 81% |
| `camera/screens` (ARConstellationScreen.tsx) | 61% | 57% | 50% | 64% |
| `storage/screens` (APODDetailScreen: 52% stmts) | 73% | 70% | 86% | 76% |
| `navigation/screens/ISSMapScreen.tsx` | 0% | 100% | 0% | 0% |
| `storage/components` (ApodMedia.tsx) | 71% | 67% | 33% | 71% |

- [x] Añadir tests a `OrbitingPlanet.tsx` (5 tests, 0%→100%) — ✅ 2026-05-03
- [x] Añadir tests a `OrbitScreen.tsx` (4 tests nuevos, branches 50%→100%) — ✅ 2026-05-03
- [x] Añadir tests a `auth/screens` (7 tests nuevos + 2 HU-12 lockout) — ✅ 2026-05-03
- [x] Añadir tests a `ARConstellationScreen.tsx` (3 tests nuevos) — ✅ 2026-05-03
- [x] Añadir tests a `APODDetailScreen.tsx` (4 tests handleShare) — ✅ 2026-05-03
- [x] Añadir test a `navigation/screens/ISSMapScreen.tsx` (3 tests, 0%→93%) — ✅ 2026-05-03
- [x] Añadir tests a `ApodMedia.tsx` (10 tests, 71%→100%) — ✅ 2026-05-03
- [x] Verificar `pnpm test --coverage` → todos los módulos ≥ 80% — ✅ 2026-05-03 (508 tests · 52 suites)
- [x] Commit: `test(coverage): add missing tests to reach ≥80% coverage in all modules` — ✅ 2026-05-03

### 14.5 RF-NOTIF-03 — Alerta de paso ISS sin implementar
> **Origen:** Auditoría del 2026-05-03.
> `NOTIFICATION_IDENTIFIERS.ISS_PASS` existe como constante pero no hay ninguna función que:
> (a) solicite geolocalización, (b) calcule si la ISS pasa a ≤ 500 km, (c) programe la notificación.
> El toggle "ISS próximamente" en `NotificationSettingsScreen` no tiene efecto funcional.
> **RF afectado:** RF-NOTIF-03

- [x] Instalar `expo-location@18.1.5` con versión exacta y auditar — ✅ 2026-05-03
- [x] Implementar `scheduleIssPassAlert(userLat, userLon)` en `notificationScheduler.ts`: obtiene posición ISS actual, calcula distancia haversine, si ≤ 500 km programa notificación local — ✅ 2026-05-03
- [x] Conectar `useNotificationPermission` con permiso de localización (`expo-location`) — ✅ 2026-05-03
- [x] Activar el toggle ISS en `NotificationSettingsScreen`: solicitar permiso de ubicación y llamar `scheduleIssPassAlert` — ✅ 2026-05-03
- [x] Tests: distancia > 500 km (no notifica), distancia ≤ 500 km (notifica), permiso ubicación denegado — ✅ 2026-05-03
- [x] Cobertura ≥ 80% en código nuevo — ✅ 2026-05-03 (notifications/lib 97.77%, notifications/screens 87.17%)
- [x] Commit: `feat(notifications): implement ISS pass alert with geolocation (RF-NOTIF-03)` — ✅ 2026-05-03

### 14.6 RC-02.3 — HTTP cleartext Open-Notify sin configurar en Android 9+
> **Origen:** `issClient.ts` usa `http://api.open-notify.org` (plain HTTP).
> Android 9 (API 28+) bloquea tráfico HTTP por defecto. Sin `usesCleartextTraffic`,
> las peticiones a Open-Notify fallan silenciosamente en producción.
> **Restricción afectada:** RC-02.3

- [x] Añadir `"usesCleartextTraffic": true` en el bloque `android` de `app.json` — ✅ 2026-05-03
- [x] Commit: `fix(android): enable cleartext traffic for Open-Notify HTTP API (RC-02.3)` — ✅ 2026-05-03

### 14.7 HU-12 — Fallback tras 3 intentos biométricos fallidos sin implementar
> **Origen:** Auditoría del 2026-05-03.
> `useBiometrics.ts` no tiene contador de intentos fallidos.
> Criterio de aceptación HU-12: "Si la biometría falla 3 veces, se solicita la contraseña".
> **HU afectada:** HU-12

- [x] Añadir estado `failCount` en `useBiometrics` hook — ✅ 2026-05-03
- [x] Incrementar contador en cada resultado `success: false` — ✅ 2026-05-03
- [x] Exponer `isLocked: boolean` (failCount >= 3) y `resetLock()` en el return del hook — ✅ 2026-05-03
- [x] En `LoginScreen`: ocultar botón biométrico cuando `isLocked === true`, mostrar banner con `resetLock` — ✅ 2026-05-03
- [x] Tests: banner de bloqueo visible con isLocked=true, resetLock llamado al pulsar botón — ✅ 2026-05-03 (31 tests)
- [x] Commit: `fix(auth): implement 3-strike lockout on biometric failure (HU-12)` — ✅ 2026-05-03

### 14.8 HU-16 — Historia de usuario Artemis sin documentar
> **Origen:** Fase 6 del plan indicó "Añadir HU-16 a `user-stories.md`" pero nunca se hizo.
> `user-stories.md` solo llega hasta HU-15.

- [x] Añadir HU-16 en `docs/requirements/user-stories.md` con criterios de aceptación del módulo Artemis — ✅ 2026-05-03
- [x] Verificar coherencia con RF-ART-01 al RF-ART-04 — ✅ 2026-05-03
- [x] Commit: `docs(requirements): add HU-16 Artemis mission showcase to user-stories` — ✅ 2026-05-03

### 14.9 Commit de cierre post-auditoría
- [x] `pnpm tsc --noEmit` → 0 errores — ✅ 2026-05-03
- [x] `pnpm lint` → 0 errores — ✅ 2026-05-03
- [x] `pnpm test --coverage` → 508 tests · 52 suites · todos ≥ 80% — ✅ 2026-05-03
- [x] `pnpm audit --audit-level high` → 0 CVEs high/critical (1 low + 2 moderate transitivas aceptadas) — ✅ 2026-05-03
- [x] Commit: `fix(quality): resolve post-audit blockers 14.1-14.8 (TS, coverage, CVEs, HU-12, HU-16)` — ✅ 2026-05-03

---

## Resumen de progreso

| Fase | Módulo | Estado |
|---|---|---|
| 0 | Fundamentos | ✅ Completo |
| 1 | Navegación | ✅ Completo |
| 2 | Catálogo solar (lists) | ✅ Completo |
| 3 | Formularios (forms) | ✅ Completo |
| 4 | APOD + Storage | ✅ Completo |
| 5 | ISS (maps + realtime) | ✅ Completo |
| 6 | Artemis (missions + gallery) | ✅ Completo |
| 7 | Notificaciones | ✅ Completo |
| 8 | Star Map (sensors) | ✅ Completo |
| 9 | Auth + Perfil | ✅ Completo |
| 10 | Animaciones | ✅ Completo |
| 11 | Platform showcase | ✅ Completo |
| 12 | Cámara AR ⚡ | ✅ Completo |
| 13 | Pulido y entrega | ✅ Completo |
| 14 | Correcciones post-auditoría | ✅ Completo |

**Leyenda:** ✅ Completo · 🟡 En progreso · ⬜ Pendiente · ⚡ Stretch goal
