import pool from '../../config/postgres.js'; 

//Create
export async function crearUsuarios(email) {
// La función crearUsuario() no debe ser un solo INSERT. Debe ejecutar una transacción SQL que haga tres inserciones atómicas: una en Usuario, otra en Usuario_Credencial (contraseña) y otra en Cuentas_Corrientes (saldo inicial).
    const client = await pool.connect();
    try {
        await client.query('BEGIN'); // Iniciamos la transacción
        
        // 1. Insertar en Usuario y obtener el usuario_id generado
        const insertUsuarioText = `
            INSERT INTO "Usuario" (mail, rol_id)
            VALUES ($1, (SELECT rol_id FROM "Rol" WHERE descripcion = 'usuario'))
            RETURNING usuario_id
        `;
        const resUsuario = await client.query(insertUsuarioText, [email]);
        const usuarioId = resUsuario.rows[0].usuario_id;
        
        // 2. Insertar en Usuario_Credencial con una contraseña por defecto (ejemplo: 'defaultpass')
        const insertCredencialText = `
            INSERT INTO "Usuario_Credencial" (usuario_id, contraseña)
            VALUES ($1, $2)
        `;
        await client.query(insertCredencialText, [usuarioId, 'defaultpass']);
        
        // 3. Insertar en Cuentas_Corrientes con saldo inicial de 0
        const insertCuentaText = `
            INSERT INTO "Cuentas_Corrientes" (usuario_id, saldo)
            VALUES ($1, $2)
        `;
        await client.query(insertCuentaText, [usuarioId, 0]);
        
        await client.query('COMMIT'); // Confirmamos la transacción
        return usuarioId; // Devolvemos el ID del nuevo usuario
    } catch (error) {
        await client.query('ROLLBACK'); // Revertimos la transacción en caso de error
        throw error; // Re-lanzamos el error para manejarlo afuera
    } finally {
        client.release(); // Liberamos el cliente de vuelta al pool
    }


}

// REad
export async function buscarPorEmail(email) {
    // Usamos $1 para seguridad (previene inyecciones SQL)
    const SQL = `
        SELECT u.usuario_id, u.mail, uc.contraseña, r.descripcion AS rol_nombre
        FROM "Usuario" u
        JOIN "Usuario_Credencial" uc ON u.usuario_id = uc.usuario_id
        JOIN "Rol" r ON u.rol_id = r.rol_id
        WHERE u.mail = $1
    `;
    
    // El pool ejecuta la consulta
    const resultado = await pool.query(SQL, [email]); 

    // Devolvemos la primera fila (el usuario encontrado) o null
    return resultado.rows[0]; 
}