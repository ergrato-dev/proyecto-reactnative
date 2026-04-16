# Historias de Usuario — CosmosRN

**Proyecto:** CosmosRN — Showcase app de astronomía básica en React Native  
**Versión:** 1.0  
**Fecha:** Abril 2026  
**Clasificación:** Académico

---

## Actores del sistema

| Actor | Descripción |
|---|---|
| **Visitante** | Usuario no autenticado que explora la app. |
| **Observador** | Usuario registrado con perfil y diario de observaciones. |
| **Desarrollador** | Persona que estudia el código del showcase como referencia académica. |

---

## Épica 1 — Exploración del sistema solar

### HU-01 — Catálogo de planetas

> **Como** visitante,  
> **quiero** ver una lista completa de los cuerpos del sistema solar con sus datos físicos,  
> **para** aprender sobre planetas, lunas y asteroides de forma visual e interactiva.

**Criterios de aceptación:**
- [ ] La lista carga desde la API Solar System OpenData en menos de 3 s.
- [ ] Se muestran al menos: nombre, tipo, masa, radio y período orbital de cada cuerpo.
- [ ] Los cuerpos están agrupados por tipo (planetas, satélites, asteroides, cometas).
- [ ] Al tocar un ítem se abre la pantalla de detalle.
- [ ] En modo offline se muestra la última versión cacheada con un indicador.

**Estimación:** M (Media)  
**Módulo:** `lists/`

---

### HU-02 — Detalle de un cuerpo celeste

> **Como** visitante,  
> **quiero** ver los datos completos de un planeta o satélite concreto,  
> **para** profundizar en sus características orbitales y físicas.

**Criterios de aceptación:**
- [ ] Se muestra: nombre, tipo, masa (kg), densidad (g/cm³), gravedad (m/s²), período orbital (días), excentricidad y velocidad de escape.
- [ ] Se muestra si el cuerpo tiene atmósfera y su composición aproximada.
- [ ] Si el cuerpo es un satélite, se indica su planeta anfitrión con enlace a su detalle.

**Estimación:** S (Pequeña)  
**Módulo:** `lists/`

---

### HU-03 — Animación de órbitas planetarias

> **Como** visitante,  
> **quiero** ver una animación del sistema solar interior con los planetas orbitando,  
> **para** entender visualmente las diferencias en velocidad y distancia orbitales.

**Criterios de aceptación:**
- [ ] Mercurio, Venus, Tierra y Marte orbitan a velocidades proporcionales a sus períodos reales.
- [ ] El usuario puede pausar y reanudar la animación.
- [ ] Al tocar un planeta se muestra su nombre y período orbital.
- [ ] La animación corre a 60 fps sin caídas en dispositivos Android de gama media.

**Estimación:** L (Grande)  
**Módulo:** `animations/`

---

## Épica 2 — Imagen astronómica del día (APOD)

### HU-04 — Ver la imagen del día

> **Como** visitante,  
> **quiero** ver la imagen astronómica del día de la NASA con su explicación,  
> **para** descubrir diariamente un fenómeno o evento del cosmos.

**Criterios de aceptación:**
- [ ] Se muestra la imagen o vídeo del día con título, fecha, descripción y créditos.
- [ ] La imagen de alta resolución carga de forma progresiva (placeholder mientras carga).
- [ ] La imagen del día se almacena en caché local para acceso offline.
- [ ] El usuario puede compartir la imagen usando la API nativa de Share.

**Estimación:** S (Pequeña)  
**Módulo:** `storage/`, `notifications/`

---

### HU-05 — Navegar entre APODs anteriores

> **Como** visitante,  
> **quiero** ver las imágenes astronómicas de días anteriores,  
> **para** explorar el archivo visual de la NASA.

**Criterios de aceptación:**
- [ ] Se puede navegar hasta 30 días hacia atrás mediante un selector de fecha.
- [ ] Cada consulta usa caché de TanStack Query para evitar peticiones repetidas.
- [ ] Los vídeos de YouTube (cuando el APOD es un vídeo) se abren en el navegador externo.

**Estimación:** S (Pequeña)  
**Módulo:** `storage/`

---

## Épica 3 — Asteroides cercanos a la Tierra

### HU-06 — Buscar asteroides por rango de fechas

> **Como** visitante,  
> **quiero** filtrar los asteroides cercanos a la Tierra por un rango de fechas,  
> **para** conocer qué objetos han pasado o pasarán cerca de nuestro planeta.

**Criterios de aceptación:**
- [ ] El formulario valida que el rango no supere 7 días y que la fecha inicio ≤ fecha fin.
- [ ] Los errores de validación se muestran debajo de cada campo en español.
- [ ] Los resultados muestran: nombre, velocidad (km/s), distancia mínima (km) y si es potencialmente peligroso (PHA).
- [ ] Los asteroides PHA se destacan visualmente (icono de advertencia o color diferente).

**Estimación:** M (Media)  
**Módulo:** `forms/`

---

## Épica 4 — Rastreo de la ISS

### HU-07 — Ver la posición actual de la ISS

> **Como** visitante,  
> **quiero** ver la posición de la Estación Espacial Internacional en un mapa en tiempo real,  
> **para** saber dónde está en este momento y sobre qué países está sobrevolando.

**Criterios de aceptación:**
- [ ] El marcador de la ISS se actualiza cada 5 segundos en el mapa.
- [ ] Se muestra la trayectoria orbital de los últimos 10 minutos.
- [ ] Un botón centra el mapa sobre la posición actual de la ISS.
- [ ] Las coordenadas (lat, lon) se muestran en un panel superpuesto al mapa.

**Estimación:** M (Media)  
**Módulo:** `maps/`, `realtime/`

---

### HU-08 — Ver la tripulación de la ISS

> **Como** visitante,  
> **quiero** saber quiénes están actualmente en el espacio,  
> **para** conocer a los astronautas a bordo de la ISS y otras naves.

**Criterios de aceptación:**
- [ ] Se listan nombre y nave de cada persona actualmente en el espacio.
- [ ] La información se obtiene de la API Open-Notify y se cachea 1 hora.
- [ ] Si la lista está vacía, se muestra un mensaje informativo.

**Estimación:** XS (Muy pequeña)  
**Módulo:** `maps/`

---

## Épica 5 — Clima espacial

### HU-09 — Recibir alertas de tormentas solares

> **Como** observador,  
> **quiero** recibir una notificación cuando ocurra una tormenta solar significativa,  
> **para** estar al tanto de eventos que pueden afectar comunicaciones y auroras boreales.

**Criterios de aceptación:**
- [ ] El sistema consulta la API DONKI periódicamente.
- [ ] Se envía una notificación local cuando se detecta un evento de clase M o superior.
- [ ] La notificación incluye: tipo de evento, intensidad, fecha y descripción breve.
- [ ] El usuario puede desactivar este tipo de alertas desde la configuración.

**Estimación:** M (Media)  
**Módulo:** `notifications/`

---

## Épica 6 — Star Map con sensores

### HU-10 — Explorar el cielo estrellado con el dispositivo

> **Como** visitante,  
> **quiero** mover mi dispositivo para explorar el mapa estelar,  
> **para** identificar constelaciones y estrellas apuntando al cielo.

**Criterios de aceptación:**
- [ ] El mapa estelar muestra al menos 100 estrellas posicionadas según coordenadas reales.
- [ ] El giroscopio controla la rotación del mapa; el acelerómetro controla la inclinación.
- [ ] En dispositivos sin giroscopio se habilitan gestos táctiles como alternativa.
- [ ] El nombre de la constelación más próxima al centro de la pantalla se muestra en un label.

**Estimación:** L (Grande)  
**Módulo:** `sensors/`

---

## Épica 7 — Perfil y diario de observaciones

### HU-11 — Registrarme como observador

> **Como** visitante,  
> **quiero** crear una cuenta con mi email y contraseña,  
> **para** acceder a mi diario personal de observaciones astronómicas.

**Criterios de aceptación:**
- [ ] El formulario de registro valida email con formato correcto y contraseña ≥ 8 caracteres.
- [ ] Se muestra un mensaje de confirmación al registrarse correctamente.
- [ ] El usuario recibe un email de confirmación de Supabase Auth.
- [ ] En caso de error (email duplicado, red caída) se muestra un mensaje descriptivo en español.

**Estimación:** S (Pequeña)  
**Módulo:** `auth/`

---

### HU-12 — Iniciar sesión con biometría

> **Como** observador,  
> **quiero** iniciar sesión con mi huella dactilar o Face ID,  
> **para** acceder rápidamente a mi perfil sin escribir mi contraseña.

**Criterios de aceptación:**
- [ ] La opción biométrica solo se ofrece si hay una sesión activa previa y el dispositivo la soporta.
- [ ] Si la biometría falla 3 veces, se solicita la contraseña como alternativa.
- [ ] En dispositivos o plataformas sin soporte biométrico la opción no aparece.

**Estimación:** S (Pequeña)  
**Módulo:** `auth/`

---

### HU-13 — Registrar una observación astronómica

> **Como** observador,  
> **quiero** guardar en mi diario las observaciones que realizo,  
> **para** llevar un registro personal de mis sesiones de astronomía amateur.

**Criterios de aceptación:**
- [ ] El formulario incluye: fecha/hora, objeto observado (campo libre), notas, condiciones atmosféricas y foto opcional.
- [ ] Las observaciones se guardan en Supabase con RLS; solo el usuario autenticado puede ver las suyas.
- [ ] Se puede editar o eliminar cualquier observación propia.
- [ ] La lista de observaciones se muestra en orden cronológico inverso.

**Estimación:** M (Media)  
**Módulo:** `auth/`

---

## Épica 8 — Showcase académico (desarrollador)

### HU-14 — Explorar las diferencias entre plataformas

> **Como** desarrollador,  
> **quiero** ver en una pantalla comparativa cómo se comporta el mismo código en Android, Web e iOS,  
> **para** entender las capacidades y limitaciones de React Native en cada plataforma.

**Criterios de aceptación:**
- [ ] La pantalla compara: permisos, APIs nativas disponibles, diferencias de UI y rendimiento.
- [ ] Se indica visualmente qué funcionalidades están soportadas en cada plataforma.
- [ ] Cada diferencia incluye un snippet de código comentado que explica la solución.

**Estimación:** M (Media)  
**Módulo:** `platform/`

---

### HU-15 — Ver el catálogo de módulos del showcase

> **Como** desarrollador,  
> **quiero** acceder a un catálogo con todos los módulos del showcase y su estado,  
> **para** navegar directamente al módulo que quiero estudiar.

**Criterios de aceptación:**
- [ ] La pantalla Home lista todos los módulos con: nombre, descripción breve, caso de uso astronómico y estado de plataforma (Android / Web / iOS).
- [ ] Cada módulo tiene un icono representativo del tema astronómico.
- [ ] El catálogo es navigable tanto por tabs como por el Drawer lateral.

**Estimación:** S (Pequeña)  
**Módulo:** `navigation/`
