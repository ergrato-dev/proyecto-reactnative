---
mode: ask
description: Auditoría de dependencias antes de hacer commit
---

# Auditoría de dependencias

Ejecuta la auditoría completa de seguridad del proyecto antes de commitear.

## Pasos

1. Verificar que no haya rangos flotantes en `package.json`:

   ```bash
   grep -E '["]\^|["]\~|["]\*|latest' package.json
   ```

   Si hay resultados → **corregir a versión exacta antes de continuar**.

2. Ejecutar auditoría CVE:

   ```bash
   pnpm audit --audit-level moderate
   ```

3. Interpretar resultados:
   - **Sin vulnerabilidades** → listo para commit.
   - **Low** → documentar en el issue tracker, no bloquea commit.
   - **Moderate o superior** → **BLOQUEA el commit**. Opciones:
     a. Actualizar el paquete a versión parcheada: `pnpm add paquete@X.Y.Z`
     b. Buscar alternativa sin CVE activo.
     c. Si no hay fix disponible, abrir issue y documentar decisión con `pnpm audit --json > audit-report.json`.

4. Si se actualizó algún paquete, verificar que la versión en `package.json` sea exacta (sin `^` ni `~`).

## Criterio de paso

- ✅ `pnpm audit` sin vulnerabilidades moderate/high/critical
- ✅ `grep -E '["]\^|["]\~' package.json` sin resultados
- ✅ `pnpm test --coverage` con cobertura ≥ 80 %
