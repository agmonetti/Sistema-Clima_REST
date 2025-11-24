import pool from '../config/postgres.js';

export async function runMigrations() {
    const client = await pool.connect();
    try {
        console.log('⏳ Running database migrations...');

        // Migration: Add parametros column to Solicitud_Proceso
        const addParametrosColumn = `
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_schema = 'public' 
                    AND table_name = 'Solicitud_Proceso' 
                    AND column_name = 'parametros'
                ) THEN
                    ALTER TABLE "Solicitud_Proceso" 
                    ADD COLUMN "parametros" JSONB DEFAULT NULL;
                    RAISE NOTICE 'Added parametros column to Solicitud_Proceso';
                END IF;
            END $$;
        `;

        await client.query(addParametrosColumn);
        console.log('✅ Migrations completed successfully');
    } catch (error) {
        console.error('❌ Migration error:', error.message);
        throw error;
    } finally {
        client.release();
    }
}
