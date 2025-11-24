import pool from '../config/postgres.js';

/**
 * Run database migrations to ensure schema is up to date
 * This is run automatically when the backend starts
 */
export async function runMigrations() {
    const client = await pool.connect();
    
    try {
        console.log('🔍 Checking database schema...');
        
        // Check if parametros column exists in Solicitud_Proceso table
        // Use table_schema to ensure we're checking the right schema (public by default)
        const checkColumnQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public'
            AND table_name = 'Solicitud_Proceso' 
            AND column_name = 'parametros'
        `;
        
        const result = await client.query(checkColumnQuery);
        
        if (result.rows.length === 0) {
            console.log('⚠️  Column "parametros" not found in Solicitud_Proceso table. Adding it...');
            
            // Use DO block for better error handling and idempotency
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
                    END IF;
                END $$;
            `;
            
            await client.query(migrationQuery);
            
            console.log('✅ Column "parametros" added successfully!');
        } else {
            console.log('✅ Database schema is up to date');
        }
        
    } catch (error) {
        console.error('❌ Migration error:', error.message);
        // Don't throw - let the app start anyway, but log the error
    } finally {
        client.release();
    }
}
