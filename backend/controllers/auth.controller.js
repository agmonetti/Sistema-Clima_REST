import * as AuthService from '../services/auth.service.js';

//REGISTRO
export const register = async (req, res) => {
    try {
        // req.body contiene el JSON que envías desde Postman
        const datos = req.body;
        const usuarioCreado = await AuthService.register(datos);
        
        // 201 Created
        res.status(201).json({
            message: 'Usuario registrado con éxito',
            data: usuarioCreado
        });
    } catch (error) {
        // Si es error de negocio (ej. email duplicado), enviamos 400
        res.status(400).json({ error: error.message });
    }
};

//LOGIN
export const login = async (req, res) => {
    try {
        const { mail, password } = req.body;
        
        const resultado = await AuthService.login({ mail, password });
        
        // 200 OK
        res.status(200).json(resultado);
    } catch (error) {
        // 401 Unauthorized
        res.status(401).json({ error: error.message });
    }
};