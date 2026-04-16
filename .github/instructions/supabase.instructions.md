---
applyTo: "src/shared/lib/**,src/modules/auth/**,src/modules/realtime/**"
---

# Instructions — Supabase

## Cliente centralizado

Usar siempre el cliente de `src/shared/lib/supabaseClient.ts`. Nunca crear instancias adicionales.

```ts
import { supabase } from "@/shared/lib/supabaseClient";
```

## Seguridad — obligatorio

- **Sin `service_role` key en el cliente**: solo `anon` key.
- **RLS activado** en todas las tablas desde la primera migración.
- Variables de entorno:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Nunca hardcodear URLs ni keys en el código fuente.

## Patrones de uso

### Auth

```ts
/**
 * @what  suscribe al estado de autenticación de Supabase
 * @why   evita múltiples subscripciones en distintas pantallas
 * @impact afecta a todas las rutas protegidas; requiere test actualizado
 */
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (event, session) => { ... }
);

// limpiar al desmontar el componente
return () => subscription.unsubscribe();
```

### Queries con RLS

```ts
// correcto — el usuario autenticado solo ve sus propios registros (RLS)
const { data, error } = await supabase.from("observations").select("*");

// incorrecto — nunca bypassear RLS en el cliente
```

### Realtime

```ts
/**
 * @what  suscribe a cambios en tiempo real de la tabla `iss_positions`
 * @why   muestra la posición actualizada de la ISS sin polling manual
 * @impact requiere que RLS permita SELECT a usuarios anónimos en esa tabla
 */
const channel = supabase
  .channel('iss-realtime')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'iss_positions' },
    (payload) => { ... }
  )
  .subscribe();

return () => supabase.removeChannel(channel);
```

## Manejo de errores

```ts
const { data, error } = await supabase.from("observations").select("*");

if (error) {
  // lanzar error con mensaje legible en español para el usuario
  throw new Error(`Error al cargar observaciones: ${error.message}`);
}
```
