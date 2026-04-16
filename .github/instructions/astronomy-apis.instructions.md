---
applyTo: "src/shared/lib/nasaClient.ts,src/shared/lib/solarSystemClient.ts,src/modules/**"
---

# Instructions — APIs astronómicas

## Clientes HTTP

Usar siempre los clientes centralizados de `src/shared/lib/`:

| Cliente             | Archivo                | API                               |
| ------------------- | ---------------------- | --------------------------------- |
| `nasaClient`        | `nasaClient.ts`        | api.nasa.gov (APOD, NeoWs, DONKI) |
| `solarSystemClient` | `solarSystemClient.ts` | api.le-systeme-solaire.net        |
| `issClient`         | `issClient.ts`         | api.open-notify.org               |

## NASA API Key

```ts
// correcto — usar variable de entorno con fallback a DEMO_KEY
const API_KEY = process.env.EXPO_PUBLIC_NASA_API_KEY ?? "DEMO_KEY";

// incorrecto — key hardcodeada
const API_KEY = "abc123mykey";
```

## staleTime por tipo de dato

```ts
// posición ISS — cambia cada segundos
staleTime: 5_000;

// clima espacial DONKI — actualización diaria
staleTime: 30 * 60 * 1000; // 30 minutos

// APOD — una imagen por día
staleTime: 60 * 60 * 1000; // 1 hora

// datos de planetas / cuerpos — cambios mínimos
staleTime: 24 * 60 * 60 * 1000; // 24 horas
```

## Query keys

Seguir la convención `['dominio', 'recurso', ...params]`:

```ts
queryKey: ["nasa", "apod", date];
queryKey: ["nasa", "neows", startDate, endDate];
queryKey: ["nasa", "donki", "solar-flare", startDate];
queryKey: ["solar-system", "bodies"];
queryKey: ["solar-system", "body", id];
queryKey: ["iss", "position"];
queryKey: ["iss", "astronauts"];
```

## Manejo de errores de red

```ts
/**
 * @what  envuelve el error de red en un mensaje legible
 * @why   el usuario debe ver un mensaje en español, no un stack trace
 * @impact afecta al estado de error que muestra el componente
 */
if (!response.ok) {
  throw new Error(
    `Error al obtener datos de NASA: ${response.status} ${response.statusText}`,
  );
}
```

## Límites de rate

- `DEMO_KEY`: 30 req/hora por IP — solo para desarrollo.
- Key personal: 1.000 req/hora — para testing y producción.
- Implementar caché agresiva (TanStack Query `staleTime` + `gcTime`) para minimizar llamadas.
