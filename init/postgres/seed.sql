-- 2. INSERCIÓN DE ROLES
INSERT INTO "Rol" ("descripcion") VALUES
('usuario'), ('tecnico'), ('administrativo');

-- 3. INSERCIÓN DE MÉTODOS DE PAGO
INSERT INTO "Metodos_Pago" ("nombre", "isActive") VALUES
('Tarjeta de Crédito', TRUE),
('Transferencia Bancaria', TRUE),
('Efectivo', TRUE),
('PayPal', FALSE);
-- 4. INSERCIÓN MASIVA DE 100 USUARIOS Y SUS CREDENCIALES
INSERT INTO "Usuario" ("nombre", "mail", "rol_id", "isActive")
SELECT
    'Usuario Prueba ' || i,
    'user' || i || '@test.com',
    -- Asigna roles de forma cíclica (1, 2, 3, 1, 2, 3...)
    (i % 3) + 1, 
    TRUE
FROM generate_series(1, 100) as i;

-- 5. INSERCIÓN DE CREDENCIALES
-- Se asume una contraseña simple para todos, ya que el hash lo haría el backend.
INSERT INTO "Usuario_Credencial" ("usuario_id", "contraseña")
SELECT
    "usuario_id",
    'hashed_password_' || "usuario_id"
FROM "Usuario";
-- 6. CREACIÓN MASIVA DE CUENTAS CORRIENTES (100 Cuentas)
INSERT INTO "Cuentas_Corrientes" ("usuario_id", "saldoActual")
SELECT
    "usuario_id",
    (RANDOM() * 1000) + 100  -- Saldo aleatorio entre 100.00 y 1100.00
FROM "Usuario";

-- 7. INSERCIÓN MASIVA DE SOLICITUDES DE PROCESO (250 Solicitudes)
-- Creamos una serie de 1 a 250 y la usamos para seleccionar cíclicamente los IDs de usuario.
INSERT INTO "Solicitud_Proceso" ("usuario_id", "proceso_id", "isCompleted")
SELECT
    (SELECT "usuario_id" FROM "Usuario" LIMIT 1 OFFSET (i % 100)), -- Selecciona un usuario cíclicamente (ID 1, 2, 3... 100)
    'mongo_proc_' || LPAD(((i % 10) + 1)::text, 2, '0'), 
    CASE WHEN RANDOM() < 0.8 THEN FALSE ELSE TRUE END
FROM generate_series(0, 249) as i; -- Usamos 0 a 249 para indexar correctamente con OFFSET


-- 8. CREACIÓN MASIVA DE FACTURAS (200 Facturas)
INSERT INTO "Facturas" ("usuario_id", "solicitud_id", "estadoFactura")
SELECT
    sp."usuario_id",
    sp."solicitud_id",
    'pendiente'::estado_factura
FROM "Solicitud_Proceso" sp
WHERE sp."solicitud_id" <= 200; -- Facturas solo para las primeras 200 solicitudes


-- 9. CREACIÓN MASIVA DE PAGOS (150 Pagos)
INSERT INTO "Pagos" ("factura_id", "montoPagado", "metodo_pago_id")
SELECT
    f."factura_id",
    (RANDOM() * 50) + 10,  -- Monto de pago entre 10.00 y 60.00
    (i % 2) + 1 -- Asigna método de pago 1 o 2
FROM "Facturas" f
INNER JOIN generate_series(1, 150) AS i ON i = f."factura_id";
