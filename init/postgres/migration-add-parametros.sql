-- Migration: Add parametros column to Solicitud_Proceso table
-- This migration adds the parametros JSONB column if it doesn't exist
-- Run this if you get a 400 Bad Request error on /api/transaccion/solicitar

-- Check if column exists before adding (idempotent migration)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'Solicitud_Proceso' 
        AND column_name = 'parametros'
    ) THEN
        ALTER TABLE "Solicitud_Proceso" ADD COLUMN "parametros" JSONB;
        RAISE NOTICE 'Column parametros added successfully to Solicitud_Proceso table';
    ELSE
        RAISE NOTICE 'Column parametros already exists in Solicitud_Proceso table';
    END IF;
END $$;
