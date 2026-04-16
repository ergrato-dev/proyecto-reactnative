# Requisitos No Funcionales — CosmosRN

**Proyecto:** CosmosRN — Showcase app de astronomía básica en React Native  
**Versión:** 1.0  
**Fecha:** Abril 2026  
**Clasificación:** Académico

---

## RNF-01 — Rendimiento

| ID | Requisito | Métrica |
|---|---|---|
| RNF-01.1 | La pantalla de inicio (Home) debe renderizarse en menos de 2 segundos en dispositivos Android de gama media (≥ 2 GB RAM). | Tiempo de renderizado ≤ 2 s |
| RNF-01.2 | Las listas virtualizadas (FlatList / SectionList) no deben caer por debajo de 60 fps durante el scroll en Android. | FPS ≥ 60 |
| RNF-01.3 | Las animaciones de órbitas (Reanimated 3) deben ejecutarse en el hilo UI, sin bloquear el hilo JS. | Worklet en UI thread |
| RNF-01.4 | El tiempo de respuesta de las consultas a APIs externas no debe superar 3 segundos; pasado ese umbral se muestra un indicador de carga y opción de reintentar. | Timeout ≤ 3 s |
| RNF-01.5 | La posición de la ISS debe actualizarse visualmente en el mapa con una latencia máxima de 1 segundo sobre la frecuencia de polling (5 s). | Latencia UI ≤ 6 s |

---

## RNF-02 — Disponibilidad offline

| ID | Requisito |
|---|---|
| RNF-02.1 | La app debe ser funcional en modo offline para los datos previamente cacheados (APOD del día, lista de planetas, favoritos). |
| RNF-02.2 | Al detectar pérdida de conectividad, el sistema debe mostrar un banner informativo no intrusivo y degradar solo las funciones que requieren red. |
| RNF-02.3 | La caché de TanStack Query debe persistir entre sesiones para los datos con `staleTime` de 24 horas o más. |

---

## RNF-03 — Seguridad

| ID | Requisito |
|---|---|
| RNF-03.1 | Las credenciales de Supabase (`URL` y `anon key`) deben almacenarse únicamente en variables de entorno (`.env`), nunca en el código fuente ni en el control de versiones. |
| RNF-03.2 | Todas las tablas de Supabase deben tener Row Level Security (RLS) habilitado desde la primera migración. |
| RNF-03.3 | La `service_role` key de Supabase no debe usarse ni exponerse en el cliente móvil en ninguna circunstancia. |
| RNF-03.4 | La clave de la NASA API debe almacenarse en `.env` como `EXPO_PUBLIC_NASA_API_KEY`. En ningún caso se hardcodeará en el código. |
| RNF-03.5 | Las dependencias deben auditarse con `pnpm audit --audit-level moderate` antes de cada commit. Ninguna vulnerabilidad de nivel moderate, high o critical puede llegar a producción sin mitigación documentada. |
| RNF-03.6 | Los tokens de sesión de Supabase deben almacenarse en `expo-secure-store` (keychain / keystore), nunca en `AsyncStorage` sin cifrado. |

---

## RNF-04 — Mantenibilidad

| ID | Requisito |
|---|---|
| RNF-04.1 | La cobertura de tests (líneas y ramas) debe ser ≥ 80 % por módulo, medida con `pnpm test --coverage`. |
| RNF-04.2 | Todo elemento de código (función, hook, componente, módulo) debe documentarse con TSDoc siguiendo el esquema `@what / @why / @impact`. |
| RNF-04.3 | No se permite el uso de `any` implícito, `@ts-ignore` ni `eslint-disable` sin comentario justificativo e issue abierto. |
| RNF-04.4 | Las dependencias deben tener versiones exactas (sin `^`, `~`, `*` ni `latest`) para garantizar builds reproducibles. |
| RNF-04.5 | Cada módulo debe ser autónomo: sus dependencias internas deben importarse desde `src/shared/`; no se permiten importaciones cruzadas entre módulos. |

---

## RNF-05 — Usabilidad y accesibilidad

| ID | Requisito |
|---|---|
| RNF-05.1 | Todos los elementos interactivos deben tener `accessibilityLabel` y `accessibilityRole` correctamente configurados. |
| RNF-05.2 | El contraste mínimo entre texto y fondo debe cumplir WCAG 2.1 nivel AA (ratio ≥ 4.5:1 para texto normal). |
| RNF-05.3 | La app debe soportar modo oscuro y modo claro, respetando la preferencia del sistema operativo. |
| RNF-05.4 | El tamaño mínimo de área táctil para elementos interactivos es 44×44 dp (directriz Android e iOS). |
| RNF-05.5 | Los mensajes de error visibles al usuario deben estar en español y ser accionables (describir qué hacer a continuación). |

---

## RNF-06 — Compatibilidad de plataformas

| ID | Requisito |
|---|---|
| RNF-06.1 | La app debe funcionar en Android API 24+ (Android 7.0 Nougat) como mínimo. |
| RNF-06.2 | La versión Web debe ser funcional en Chrome ≥ 110, Firefox ≥ 110 y Safari ≥ 16. |
| RNF-06.3 | La versión iOS debe funcionar en iOS 15.1+ (requerimiento de Expo SDK 55). |
| RNF-06.4 | Las funcionalidades que no estén disponibles en alguna plataforma deben degradarse graciosamente, mostrando una pantalla informativa en lugar de un crash. |

---

## RNF-07 — Escalabilidad y límites de API

| ID | Requisito |
|---|---|
| RNF-07.1 | El cliente TanStack Query debe implementar caché agresiva (`staleTime` y `gcTime`) para minimizar el número de llamadas a la NASA API y permanecer dentro del límite gratuito (1.000 req/hora). |
| RNF-07.2 | La app debe mostrar un mensaje de error amigable cuando la NASA API devuelva error 429 (rate limit excedido). |
| RNF-07.3 | El backend Supabase free tier soporta hasta 500 MB de base de datos y 1 GB de almacenamiento; la app debe gestionar el crecimiento del diario de observaciones advirtiendo al usuario si se acerca al límite. |

---

## RNF-08 — Calidad de código y proceso

| ID | Requisito |
|---|---|
| RNF-08.1 | El proyecto debe pasar sin errores ESLint y TypeScript antes de cada commit (`pnpm lint && pnpm tsc --noEmit`). |
| RNF-08.2 | Los commits deben seguir el formato Conventional Commits con cuerpo pedagógico (`For:` / `Impact:`). |
| RNF-08.3 | No se permite el uso de `npm` ni `yarn`; el único gestor de paquetes autorizado es `pnpm`. |
| RNF-08.4 | Todo error detectado (lint, type, test, runtime, CVE) debe corregirse antes de continuar con nuevas funcionalidades; no se permite acumular deuda técnica con `// TODO` sin issue asociado. |
