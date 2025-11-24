# Database Migration Guide

## Issue: 400 Bad Request on /api/transaccion/solicitar

If you encounter a 400 Bad Request error when trying to create a new solicitud (request), it's likely because your database is missing the `parametros` column in the `Solicitud_Proceso` table.

## Solution

### For Existing Databases (Running Containers)

If your Docker containers are already running and have data, you need to apply the migration:

1. **Connect to the PostgreSQL container:**
   ```bash
   docker exec -it clima_postgres psql -U user -d clima_db
   ```

2. **Run the migration script:**
   ```bash
   docker exec -i clima_postgres psql -U user -d clima_db < init/postgres/migration-add-parametros.sql
   ```

   Or manually execute:
   ```sql
   ALTER TABLE "Solicitud_Proceso" ADD COLUMN "parametros" JSONB;
   ```

### For Fresh Installations

If you're setting up a new environment, simply run:

```bash
docker-compose down -v
docker-compose up -d
```

The `parametros` column is already included in the `init/postgres/codigoPSQL.sql` file and will be created automatically.

## Verification

After applying the migration, verify the column exists:

```bash
docker exec -it clima_postgres psql -U user -d clima_db -c "\d \"Solicitud_Proceso\""
```

You should see `parametros | jsonb` in the output.

## What Changed?

The `parametros` column was added to store process-specific parameters as JSON data. This allows the system to save configuration details for each solicitud, such as:
- sensorId
- fechaInicio / fechaFin
- umbral (for alerts)
- variable (temperature, humidity, etc.)

This is used in conjunction with the "Ver Detalle" (View Details) functionality to display what parameters were used for each request.
