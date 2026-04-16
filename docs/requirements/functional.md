# Requisitos Funcionales — CosmosRN

**Proyecto:** CosmosRN — Showcase app de astronomía básica en React Native  
**Versión:** 1.0  
**Fecha:** Abril 2026  
**Clasificación:** Académico

---

## Módulo 1 — Navegación (RF-NAV)

| ID | Requisito |
|---|---|
| RF-NAV-01 | El sistema debe presentar una pantalla de inicio (Home) que liste todos los módulos disponibles con su estado por plataforma (Android ✓ / Web ✓ / iOS pendiente). |
| RF-NAV-02 | El sistema debe implementar navegación tipo Stack para el flujo de detalle de planetas y asteroides. |
| RF-NAV-03 | El sistema debe implementar navegación tipo Tabs para las secciones principales: Explorar, ISS, APOD, Perfil. |
| RF-NAV-04 | El sistema debe implementar un Drawer lateral con acceso rápido a todos los módulos del showcase. |
| RF-NAV-05 | El sistema debe soportar deep linking para abrir directamente cualquier módulo desde una URL externa. |

---

## Módulo 2 — Catálogo de cuerpos del sistema solar (RF-LIST)

| ID | Requisito |
|---|---|
| RF-LIST-01 | El sistema debe consultar la API Solar System OpenData y mostrar la lista completa de cuerpos del sistema solar (planetas, lunas, asteroides, cometas). |
| RF-LIST-02 | El sistema debe renderizar la lista con virtualización eficiente (FlatList), soportando al menos 500 elementos sin degradación visible de rendimiento. |
| RF-LIST-03 | El sistema debe agrupar los cuerpos por tipo (planeta, satélite natural, asteroide, cometa) usando SectionList. |
| RF-LIST-04 | El sistema debe mostrar en cada ítem: nombre, tipo, masa, radio medio y período orbital. |
| RF-LIST-05 | El sistema debe navegar al detalle del cuerpo al seleccionar un ítem de la lista. |

---

## Módulo 3 — Búsqueda de asteroides (RF-FORM)

| ID | Requisito |
|---|---|
| RF-FORM-01 | El sistema debe presentar un formulario con campos de fecha inicio, fecha fin y distancia máxima (en UA) para filtrar asteroides cercanos a la Tierra. |
| RF-FORM-02 | El sistema debe validar que la fecha de inicio no sea posterior a la fecha de fin. |
| RF-FORM-03 | El sistema debe validar que el rango de fechas no supere 7 días (límite de la API NeoWs). |
| RF-FORM-04 | El sistema debe gestionar el foco entre campos y el cierre del teclado virtual al enviar. |
| RF-FORM-05 | El sistema debe consultar la API NASA NeoWs y mostrar los resultados paginados. |
| RF-FORM-06 | El sistema debe mostrar para cada asteroide: nombre, velocidad relativa (km/s), distancia mínima (km) y si es potencialmente peligroso. |

---

## Módulo 4 — Animaciones orbitales (RF-ANIM)

| ID | Requisito |
|---|---|
| RF-ANIM-01 | El sistema debe animar la órbita de los planetas del sistema solar interior (Mercurio, Venus, Tierra, Marte) usando Reanimated 3. |
| RF-ANIM-02 | El sistema debe implementar rotación 3D de un planeta al recibir un gesto de arrastre (drag). |
| RF-ANIM-03 | El sistema debe implementar una animación spring al seleccionar un planeta (efecto de zoom). |
| RF-ANIM-04 | Las velocidades orbitales de la animación deben ser proporcionales a los períodos reales de cada planeta. |

---

## Módulo 5 — Cámara y AR (RF-CAM)

| ID | Requisito |
|---|---|
| RF-CAM-01 | El sistema debe solicitar permiso de cámara al usuario antes de activarla, explicando el motivo. |
| RF-CAM-02 | El sistema debe mostrar un overlay de constelaciones sobre la vista de cámara en tiempo real. |
| RF-CAM-03 | El sistema debe usar el giroscopio para ajustar el overlay según la orientación del dispositivo. |
| RF-CAM-04 | El sistema debe capturar una foto de la vista actual y permitir guardarla en la galería. |
| RF-CAM-05 | En plataformas donde la cámara no esté disponible (Web), el sistema debe mostrar un mensaje informativo y deshabilitar el módulo. |

---

## Módulo 6 — Rastreo ISS (RF-MAP)

| ID | Requisito |
|---|---|
| RF-MAP-01 | El sistema debe mostrar un mapa terrestre con la posición actual de la ISS, actualizada cada 5 segundos. |
| RF-MAP-02 | El sistema debe trazar la trayectoria orbital de la ISS en los últimos 10 minutos. |
| RF-MAP-03 | El sistema debe mostrar las coordenadas actuales (latitud, longitud, altitud) de la ISS. |
| RF-MAP-04 | El sistema debe mostrar la lista de astronautas actualmente a bordo de la ISS. |
| RF-MAP-05 | El sistema debe permitir centrar el mapa sobre la posición actual de la ISS con un botón. |

---

## Módulo 7 — Almacenamiento local (RF-STOR)

| ID | Requisito |
|---|---|
| RF-STOR-01 | El sistema debe almacenar en caché la imagen APOD del día para visualización offline. |
| RF-STOR-02 | El sistema debe permitir marcar cuerpos del sistema solar como favoritos y persistirlos localmente. |
| RF-STOR-03 | El sistema debe almacenar el historial de búsquedas de asteroides (últimas 10 búsquedas). |
| RF-STOR-04 | El sistema debe ofrecer una pantalla de gestión de caché que muestre el espacio usado y permita borrarlo. |

---

## Módulo 8 — Notificaciones (RF-NOTIF)

| ID | Requisito |
|---|---|
| RF-NOTIF-01 | El sistema debe solicitar permiso de notificaciones al usuario con explicación del propósito. |
| RF-NOTIF-02 | El sistema debe enviar una notificación local cuando se detecte una tormenta solar nivel M o superior (API DONKI). |
| RF-NOTIF-03 | El sistema debe permitir configurar alertas para cuando la ISS pase sobre una ubicación concreta (radio ≤ 500 km). |
| RF-NOTIF-04 | El sistema debe mostrar la imagen APOD del día como notificación si el usuario activa esa opción. |

---

## Módulo 9 — Sensores y star map (RF-SENS)

| ID | Requisito |
|---|---|
| RF-SENS-01 | El sistema debe leer el giroscopio del dispositivo para desplazar el cielo estrellado en función de la orientación física. |
| RF-SENS-02 | El sistema debe leer el acelerómetro para detectar inclinación y ajustar la perspectiva del star map. |
| RF-SENS-03 | El sistema debe mostrar al menos 100 estrellas posicionadas según coordenadas astronómicas reales (ascensión recta y declinación). |
| RF-SENS-04 | El sistema debe degradar funcionalmente en dispositivos sin giroscopio, usando solo el acelerómetro o gestos táctiles. |

---

## Módulo 10 — Autenticación y perfil (RF-AUTH)

| ID | Requisito |
|---|---|
| RF-AUTH-01 | El sistema debe permitir registro e inicio de sesión mediante email/contraseña usando Supabase Auth. |
| RF-AUTH-02 | El sistema debe ofrecer autenticación biométrica (huella / face ID) como método alternativo en la sesión activa. |
| RF-AUTH-03 | El sistema debe mantener la sesión activa entre reinicios de la app usando almacenamiento seguro. |
| RF-AUTH-04 | El usuario autenticado debe poder registrar observaciones astronómicas (fecha, objeto observado, notas, foto) en su diario personal en Supabase. |
| RF-AUTH-05 | El usuario debe poder consultar, editar y eliminar sus propias observaciones. |

---

## Módulo 11 — Realtime ISS (RF-RT)

| ID | Requisito |
|---|---|
| RF-RT-01 | El sistema debe publicar la posición de la ISS en Supabase Realtime cada 5 segundos desde el cliente. |
| RF-RT-02 | Múltiples clientes suscritos al canal deben recibir la actualización de posición simultáneamente. |
| RF-RT-03 | El sistema debe reconectarse automáticamente tras una pérdida de conexión sin intervención del usuario. |

---

## Módulo 12 — Diferencias de plataforma (RF-PLAT)

| ID | Requisito |
|---|---|
| RF-PLAT-01 | El sistema debe mostrar en una pantalla comparativa el comportamiento de permisos (cámara, localización, notificaciones) en Android, Web e iOS. |
| RF-PLAT-02 | El sistema debe adaptar los componentes de UI a las convenciones de cada plataforma (ActionSheet nativo en iOS, BottomSheet en Android). |
| RF-PLAT-03 | En Web, el sistema debe ser responsivo desde 320 px hasta 1440 px de ancho. |

---

## Imagen astronómica del día — APOD (RF-APOD)

| ID | Requisito |
|---|---|
| RF-APOD-01 | El sistema debe consultar la API NASA APOD y mostrar la imagen o vídeo del día con su título, descripción y créditos. |
| RF-APOD-02 | El sistema debe permitir navegar al APOD de días anteriores (hasta 30 días hacia atrás). |
| RF-APOD-03 | El sistema debe soportar imágenes de alta resolución con carga progresiva. |
