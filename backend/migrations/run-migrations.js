import pool from '../config/postgres.js';

/**
 * Run database migrations to ensure schema is up to date
 * This is run automatically when the backend starts
 */
export async function runMigrations() {
    const client = await pool.connect();
    
    try {
        console.log('🔍 Checking database schema...');
        
        // First check if column exists to provide clear feedback
        const checkQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public'
            AND table_name = 'Solicitud_Proceso' 
            AND column_name = 'parametros'
        `;
        
        const checkResult = await client.query(checkQuery);
        
        if (checkResult.rows.length === 0) {
            console.log('⚠️  Column "parametros" not found in Solicitud_Proceso table. Adding it...');
            
            // Use DO block for idempotent migration
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
                    END IF;
                END $$;
            `;
            
            await client.query(migrationQuery);
            console.log('✅ Column "parametros" added successfully!');
        } else {
            console.log('✅ Database schema is up to date (parametros column exists)');
        }
        
    } catch (error) {
        console.error('❌ Migration error:', error.message);
        console.error('Stack trace:', error.stack);
        console.error('');
        console.error('⚠️  MIGRATION FAILED: The application may not work correctly.');
        console.error('    Possible causes:');
        console.error('    - Database connection issues');
        console.error('    - Insufficient database permissions (need ALTER TABLE permission)');
        console.error('    - Table "Solicitud_Proceso" does not exist');
        console.error('');
        console.error('    To fix manually, connect to the database and run:');
        console.error('    ALTER TABLE "Solicitud_Proceso" ADD COLUMN "parametros" JSONB;');
        console.error('');
        console.error('    Or see MIGRATION.md for detailed instructions.');
    } finally {
        client.release();
    }
}
