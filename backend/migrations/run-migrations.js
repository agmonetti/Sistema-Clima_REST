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
        const checkColumnQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Solicitud_Proceso' 
            AND column_name = 'parametros'
        `;
        
        const result = await client.query(checkColumnQuery);
        
        if (result.rows.length === 0) {
            console.log('⚠️  Column "parametros" not found in Solicitud_Proceso table. Adding it...');
            
            await client.query('BEGIN');
            await client.query('ALTER TABLE "Solicitud_Proceso" ADD COLUMN "parametros" JSONB');
            await client.query('COMMIT');
            
            console.log('✅ Column "parametros" added successfully!');
        } else {
            console.log('✅ Database schema is up to date');
        }
        
    } catch (error) {
        console.error('❌ Migration error:', error.message);
        await client.query('ROLLBACK').catch(() => {});
        // Don't throw - let the app start anyway, but log the error
    } finally {
        client.release();
    }
}
