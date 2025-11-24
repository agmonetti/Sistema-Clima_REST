import pool from '../config/postgres.js';

/**
 * Run database migrations to ensure schema is up to date
 * This is run automatically when the backend starts
 */
export async function runMigrations() {
    const client = await pool.connect();
    
    try {
        console.log('🔍 Checking database schema...');
        
        // Use DO block for idempotent migration with built-in existence check
        const migrationQuery = `
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
                    RAISE NOTICE 'Column parametros added successfully';
                ELSE
                    RAISE NOTICE 'Column parametros already exists';
                END IF;
            END $$;
        `;
        
        await client.query(migrationQuery);
        console.log('✅ Database schema is up to date');
        
    } catch (error) {
        console.error('❌ Migration error:', error.message);
        console.error('Stack trace:', error.stack);
        // Don't throw - let the app start anyway, but warn about potential issues
        console.warn('⚠️  Warning: Migration failed. The application may not work correctly if the database schema is outdated.');
    } finally {
        client.release();
    }
}
