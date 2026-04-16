# Plan de Trabajo — CosmosRN

**Proyecto:** CosmosRN — Showcase app de astronomía básica en React Native  
**Stack:** Expo SDK 55.0.15 · React Native 0.83 · TypeScript · Supabase · pnpm  
**Plataformas:** Android → Web → iOS  
**Narrativa:** planetas · satélites · asteroides · clima espacial · ISS · proyecto Artemis  
**Última actualización:** Abril 2026

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
- [ ] Registrar clave NASA en `https://api.nasa.gov/` y guardar en `.env`
- [ ] Crear proyecto Supabase free tier y guardar credenciales en `.env`
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

- [ ] Implementar `useApod` (TanStack Query → NASA APOD, staleTime 1h)
- [ ] Pantalla APOD: imagen progresiva, título, descripción, créditos
- [ ] Soporte de vídeo APOD (abrir en navegador externo)
- [ ] Navegación a APODs anteriores (≤ 30 días)
- [ ] Persistir APOD del día en AsyncStorage / MMKV para offline
- [ ] Sistema de favoritos (planetas) persistido localmente
- [ ] Historial de búsquedas de asteroides (últimas 10)
- [ ] Pantalla de gestión de caché con espacio usado y botón borrar
- [ ] Share API: compartir imagen APOD
- [ ] Tests: carga, offline fallback, añadir/quitar favorito, historial
- [ ] Cobertura ≥ 80%
- [ ] Commit: `feat(storage): APOD viewer with offline cache and favorites`

---

## Fase 5 — Módulo: Rastreo ISS (`maps/` + `realtime/`)

> **Caso de uso astronómico:** posición en tiempo real de la ISS  
> **RF:** RF-MAP-01 al RF-MAP-05, RF-RT-01 al RF-RT-03 | **HU:** HU-07, HU-08

- [ ] Instalar react-native-maps con versión exacta y auditar
- [ ] Implementar `useIssPosition` (polling cada 5s, Open-Notify)
- [ ] Implementar `useAstronauts` (Open-Notify, staleTime 1h)
- [ ] Mapa con marcador ISS actualizado en tiempo real
- [ ] Trazar trayectoria orbital (últimos 10 min, 120 puntos)
- [ ] Panel de coordenadas superpuesto al mapa
- [ ] Botón "centrar en ISS"
- [ ] Lista de tripulantes con nombre y nave
- [ ] Supabase Realtime: publicar posición ISS y suscribir múltiples clientes
- [ ] Reconexión automática tras pérdida de red
- [ ] Tests: render mapa, actualización posición, lista tripulantes, reconexión mock
- [ ] Cobertura ≥ 80%
- [ ] Commit: `feat(maps): ISS real-time tracker with react-native-maps and Supabase Realtime`

---

## Fase 6 — Módulo: Proyecto Artemis (`artemis/`)

> **Caso de uso astronómico:** estado de misiones lunares, cronograma de lanzamientos y galería de imágenes oficiales de la NASA  
> **RF:** RF-ART-01 al RF-ART-04 | **HU:** HU-16 _(añadir a `user-stories.md`)_

- [ ] Añadir `fetchArtemisImages` a `nasaClient.ts` (NASA Images API — `images-api.nasa.gov`, sin auth)
- [ ] Implementar `useArtemisImages` (TanStack Query, staleTime 6h)
- [ ] Datos estáticos de misiones: Artemis I (completada 2022), Artemis II (tripulada 2026), Artemis III (alunizaje 2027+)
- [ ] `MissionStatusScreen` — lista de misiones con estado, tripulación y fecha objetivo (FlatList)
- [ ] `ArtemisGalleryScreen` — galería horizontal de imágenes oficiales con título y fecha
- [ ] Añadir entrada en el Drawer para acceso directo a la sección Artemis
- [ ] Tests: render lista de misiones, estados completada/en-progreso/planificada, carga de galería
- [ ] Cobertura ≥ 80%
- [ ] Commit: `feat(artemis): mission status screen and NASA image gallery`

---

## Fase 7 — Módulo: Notificaciones (`notifications/`)

> **Caso de uso astronómico:** alertas de tormentas solares y paso de la ISS  
> **RF:** RF-NOTIF-01 al RF-NOTIF-04 | **HU:** HU-09

- [ ] Instalar expo-notifications con versión exacta y auditar
- [ ] Implementar `useDonki` (NASA DONKI, staleTime 30 min)
- [ ] Lógica: disparar notificación local si evento solar ≥ clase M
- [ ] Configurar alerta de paso ISS por proximidad (radio ≤ 500 km)
- [ ] Opción de notificación diaria con APOD del día
- [ ] Pantalla de configuración de alertas con toggles
- [ ] Solicitud de permiso con explicación en español
- [ ] Tests: lógica de detección de evento M+, permisos mock, scheduling
- [ ] Cobertura ≥ 80%
- [ ] Commit: `feat(notifications): solar storm and ISS pass alerts with expo-notifications`

---

## Fase 8 — Módulo: Sensores / Star Map (`sensors/`)

> **Caso de uso astronómico:** mapa estelar controlado por giroscopio  
> **RF:** RF-SENS-01 al RF-SENS-04 | **HU:** HU-10

- [ ] Instalar expo-sensors con versión exacta y auditar
- [ ] Implementar `useGyroscope` y `useAccelerometer` con limpieza en unmount
- [ ] Renderizar ≥ 100 estrellas con coordenadas reales (AR/Dec → XY)
- [ ] Giroscopio controla rotación; acelerómetro controla inclinación
- [ ] Fallback a gestos táctiles si no hay giroscopio
- [ ] Label con nombre de constelación más próxima al centro
- [ ] Tests: lectura de sensor (mock), fallback táctil, label de constelación
- [ ] Cobertura ≥ 80%
- [ ] Commit: `feat(sensors): gyroscope-driven star map with graceful fallback`

---

## Fase 9 — Módulo: Autenticación y perfil (`auth/`)

> **Caso de uso astronómico:** diario personal de observaciones  
> **RF:** RF-AUTH-01 al RF-AUTH-05 | **HU:** HU-11, HU-12, HU-13

- [ ] Instalar @supabase/supabase-js + expo-secure-store con versiones exactas y auditar
- [ ] Implementar `useAuthSession` (singleton listener `onAuthStateChange`)
- [ ] Pantalla de registro (email + contraseña, validación Zod)
- [ ] Pantalla de login con opción biométrica (expo-local-authentication)
- [ ] Guardar token en expo-secure-store (nunca AsyncStorage sin cifrado)
- [ ] Migración Supabase: tabla `observations` con RLS
- [ ] CRUD de observaciones: crear, listar, editar, eliminar
- [ ] Tests: registro, login, biometría mock, CRUD observaciones mock
- [ ] Cobertura ≥ 80%
- [ ] Commit: `feat(auth): Supabase auth with biometrics and observations diary`

---

## Fase 10 — Módulo: Animaciones (`animations/`)

> **Caso de uso astronómico:** órbitas planetarias animadas  
> **RF:** RF-ANIM-01 al RF-ANIM-04 | **HU:** HU-03

- [ ] Instalar react-native-reanimated + react-native-gesture-handler con versiones exactas y auditar
- [ ] Animar órbitas de Mercurio, Venus, Tierra y Marte (worklet en UI thread)
- [ ] Velocidades proporcionales a períodos orbitales reales
- [ ] Controles de pausa / reanudación
- [ ] Drag para rotar planeta en 3D (Gesture Handler)
- [ ] Spring zoom al seleccionar planeta
- [ ] Tests: animación pausa/resume, gesto drag (mock), spring trigger
- [ ] Cobertura ≥ 80%
- [ ] Commit: `feat(animations): orbital animations with Reanimated 3 worklets`

---

## Fase 11 — Módulo: Diferencias de plataforma (`platform/`)

> **Caso de uso astronómico:** comparativa Android/Web/iOS  
> **RF:** RF-PLAT-01 al RF-PLAT-03 | **HU:** HU-14

- [ ] Pantalla comparativa: permisos, APIs disponibles, diferencias de UI
- [ ] ActionSheet nativo iOS vs. BottomSheet Android
- [ ] Responsivo Web: 320 px → 1440 px
- [ ] Snippets de código comentados en cada diferencia
- [ ] Tests: render en cada plataforma (mock Platform.OS)
- [ ] Cobertura ≥ 80%
- [ ] Commit: `feat(platform): platform differences showcase with responsive web layout`

---

## Fase 12 — Módulo: Cámara AR (`camera/`) ⚡ Stretch goal

> **Caso de uso astronómico:** overlay de constelaciones en AR  
> **RF:** RF-CAM-01 al RF-CAM-05

- [ ] Instalar expo-camera o react-native-vision-camera con versión exacta y auditar
- [ ] Solicitud de permiso de cámara con explicación
- [ ] Overlay SVG de constelaciones sobre vista de cámara
- [ ] Integración con giroscopio (del módulo `sensors/`) para alinear overlay
- [ ] Captura de foto y guardado en galería
- [ ] Degradación en Web con mensaje informativo
- [ ] Tests: permiso denegado, permiso concedido, captura mock
- [ ] Cobertura ≥ 80%
- [ ] Commit: `feat(camera): AR constellation overlay with expo-camera`

---

## Fase 13 — Pulido y entrega académica

### 13.1 Tema y accesibilidad
- [ ] Implementar sistema de tema dark/light en `src/shared/theme/`
- [ ] Verificar contraste WCAG AA en todos los textos
- [ ] Añadir `accessibilityLabel` y `accessibilityRole` en todos los elementos interactivos
- [ ] Tamaño mínimo de área táctil 44×44 dp verificado

### 13.2 Calidad final
- [ ] `pnpm lint` — cero errores
- [ ] `pnpm tsc --noEmit` — cero errores de tipos
- [ ] `pnpm test --coverage` — todos los módulos ≥ 80%
- [ ] `pnpm audit --audit-level moderate` — sin CVEs moderate+
- [ ] Revisar que no hay `// TODO` sin issue asociado
- [ ] Revisar que no hay `@ts-ignore` sin comentario justificativo

### 13.3 Documentación final
- [ ] Completar TSDoc (`@what / @why / @impact`) en todos los módulos
- [ ] Actualizar `README.md` con instrucciones de instalación y ejecución
- [ ] Verificar que `.env.example` está actualizado con todas las variables

### 13.4 Commit de cierre
- [ ] Commit: `docs(project): finalize academic documentation and coverage report`

---

## Resumen de progreso

| Fase | Módulo | Estado |
|---|---|---|
| 0 | Fundamentos | 🟡 En progreso |
| 1 | Navegación | ⬜ Pendiente |
| 2 | Catálogo solar (lists) | ⬜ Pendiente |
| 3 | Formularios (forms) | ⬜ Pendiente |
| 4 | APOD + Storage | ⬜ Pendiente |
| 5 | ISS (maps + realtime) | ⬜ Pendiente |
| 6 | Artemis (missions + gallery) | ⬜ Pendiente |
| 7 | Notificaciones | ⬜ Pendiente |
| 8 | Star Map (sensors) | ⬜ Pendiente |
| 9 | Auth + Perfil | ⬜ Pendiente |
| 10 | Animaciones | ⬜ Pendiente |
| 11 | Platform showcase | ⬜ Pendiente |
| 12 | Cámara AR ⚡ | ⬜ Stretch goal |
| 13 | Pulido y entrega | ⬜ Pendiente |

**Leyenda:** ✅ Completo · 🟡 En progreso · ⬜ Pendiente · ⚡ Stretch goal
