# TUI - Text User Interface

## ¿Qué es una TUI?

Una **TUI (Text User Interface)** es una interfaz de usuario basada en texto que se ejecuta en la terminal. A diferencia de una API REST que expone endpoints HTTP y devuelve JSON, la TUI ofrece:

- 🎯 **Menús navegables** con flechas del teclado (↑↓)
- ⌨️ **Inputs interactivos** con validación en tiempo real
- 🔒 **Contraseñas ocultas** (se muestran como ***)
- 📊 **Tablas ASCII** con bordes y colores
- 🎨 **Colores** para destacar información importante
- ⏳ **Spinners** que indican operaciones en progreso

## ¿Por qué NO es una API REST?

| Característica | API REST | TUI |
|----------------|----------|-----|
| Protocolo | HTTP | Terminal (stdin/stdout) |
| Respuesta | JSON | Texto formateado |
| Interacción | Request/Response | Menús interactivos |
| Sesión | Tokens/Cookies | Memoria del proceso |
| Cliente | Navegador/Postman | Terminal |

La TUI:
- ❌ NO usa HTTP
- ❌ NO tiene endpoints
- ❌ NO devuelve JSON
- ✅ Interfaz interactiva de terminal
- ✅ Navegación con teclado
- ✅ Sesión en memoria
- ✅ Reutiliza todo el backend (servicios, repositorios, modelos)

## Instalación

```bash
cd backend
pnpm install
```

## Uso

### Iniciar la TUI

```bash
pnpm tui
```

### Modo desarrollo (con hot-reload)

```bash
pnpm tui:dev
```

## Estructura del proyecto

```
backend/tui/
├── index.js          # Punto de entrada - banner, conexión DB, loop principal
├── session.js        # Gestor de sesión en memoria (singleton)
├── auth.js           # Pantalla de login/registro
├── menus/
│   ├── principal.js  # Menú principal con opciones por rol
│   ├── sensores.js   # CRUD de sensores
│   ├── mediciones.js # Visualización de mediciones
│   ├── procesos.js   # Catálogo y solicitud de procesos
│   ├── mensajeria.js # Chat privado y grupal
│   ├── usuarios.js   # Gestión de usuarios (admin)
│   └── transacciones.js # Cuenta corriente y facturación
└── utils/
    ├── tablas.js     # Funciones para crear tablas ASCII
    ├── colores.js    # Paleta de colores y estilos
    └── helpers.js    # Funciones auxiliares comunes
```

## Funcionalidades

### 1. Autenticación
- **Login**: Ingresa email y contraseña (oculta con *)
- **Registro**: Crea una cuenta nueva con validaciones
- La sesión se mantiene en memoria mientras el programa esté activo

### 2. Menú Principal
Las opciones varían según el rol del usuario:

| Opción | Usuario | Técnico | Admin |
|--------|---------|---------|-------|
| Sensores (ver) | ✅ | ✅ | ✅ |
| Sensores (crear/editar) | ❌ | ✅ | ✅ |
| Sensores (eliminar) | ❌ | ❌ | ✅ |
| Mediciones | ✅ | ✅ | ✅ |
| Procesos | ✅ | ✅ | ✅ |
| Mensajería | ✅ | ✅ | ✅ |
| Mi Cuenta | ✅ | ✅ | ✅ |
| Gestión Usuarios | ❌ | ❌ | ✅ |

### 3. Sensores
- Ver lista de sensores en tabla formateada
- Buscar por nombre, ciudad o ID
- Crear nuevo sensor (técnico/admin)
- Editar sensor existente (técnico/admin)
- Eliminar sensor con confirmación (solo admin)

### 4. Mediciones
- Ver últimas mediciones de un sensor
- Generar reporte estadístico por rango de fechas
- Buscar alertas (temperatura/humedad fuera de umbral)

### 5. Procesos
- Ver catálogo de procesos disponibles con precios
- Solicitar proceso (se cobra del saldo)
- Ver historial de procesos ejecutados
- Los procesos disponibles incluyen:
  - Informe de máximas y mínimas
  - Informe de promedios
  - Análisis de desviación
  - Consultar datos
  - Buscar alertas

### 6. Mensajería
- Ver conversaciones existentes
- Iniciar chat privado con otro usuario
- Crear grupos de chat
- Ver historial de mensajes
- Enviar mensajes

### 7. Mi Cuenta / Facturación
- Ver saldo actual
- Cargar dinero a la cuenta
- Ver historial de transacciones

### 8. Gestión de Usuarios (Admin)
- Ver todos los usuarios
- Buscar usuario por ID
- Desactivar usuarios
- Reactivar usuarios

## Librerías utilizadas

| Librería | Propósito |
|----------|-----------|
| `inquirer` | Menús interactivos, inputs, confirmaciones |
| `chalk` | Colores y estilos en la terminal |
| `cli-table3` | Tablas ASCII con bordes |
| `ora` | Spinners de carga |
| `boxen` | Cajas decorativas |
| `figlet` | Banner ASCII art |
| `clear` | Limpiar pantalla |

## Convenciones de colores

- 🟢 **Verde**: Éxito, activo, acciones positivas
- 🔴 **Rojo**: Error, inactivo, acciones destructivas
- 🟡 **Amarillo**: Advertencia, pendiente
- 🔵 **Azul**: Información, títulos
- 🟣 **Magenta**: Destacado

## Ejemplo de uso

```
 ██████╗██╗     ██╗███╗   ███╗ █████╗    ████████╗██╗   ██╗██╗
██╔════╝██║     ██║████╗ ████║██╔══██╗   ╚══██╔══╝██║   ██║██║
██║     ██║     ██║██╔████╔██║███████║      ██║   ██║   ██║██║
██║     ██║     ██║██║╚██╔╝██║██╔══██║      ██║   ██║   ██║██║
╚██████╗███████╗██║██║ ╚═╝ ██║██║  ██║      ██║   ╚██████╔╝██║
 ╚═════╝╚══════╝╚═╝╚═╝     ╚═╝╚═╝  ╚═╝      ╚═╝    ╚═════╝ ╚═╝

📦 Conectando a servicios...

✔ MongoDB conectado
✔ PostgreSQL conectado
✔ Redis conectado

✓ Todos los servicios conectados correctamente

? Selecciona una opción:
❯ 👤 Iniciar Sesión
  ✓ Registrarse
  🚪 Salir
```

## Cómo agregar nuevas funcionalidades

### Agregar un nuevo menú

1. Crear archivo en `tui/menus/nuevo.js`:

```javascript
import inquirer from 'inquirer';
import chalk from 'chalk';
import { limpiarPantalla } from '../utils/helpers.js';
import { TITULO } from '../utils/colores.js';

export async function menuNuevo() {
    while (true) {
        limpiarPantalla();
        console.log(TITULO('\n📋 NUEVO MENÚ\n'));

        const { opcion } = await inquirer.prompt([
            {
                type: 'list',
                name: 'opcion',
                message: 'Selecciona:',
                choices: [
                    { name: 'Opción 1', value: 'op1' },
                    { name: 'Volver', value: 'volver' }
                ]
            }
        ]);

        if (opcion === 'volver') return;
        
        // Manejar opciones...
    }
}
```

2. Importar y agregar en `menus/principal.js`

### Agregar validaciones

```javascript
{
    type: 'input',
    name: 'email',
    message: 'Email:',
    validate: (input) => {
        if (!input) return 'El email es requerido';
        if (!input.includes('@')) return 'Email inválido';
        return true;
    }
}
```

### Usar spinners

```javascript
import ora from 'ora';

const spinner = ora('Cargando...').start();
try {
    const datos = await fetchDatos();
    spinner.succeed('Datos cargados');
} catch (error) {
    spinner.fail('Error al cargar');
}
```

## Troubleshooting

### Error: "Cannot find module"
Asegúrate de estar en el directorio `backend` y haber ejecutado `pnpm install`

### Error de conexión a base de datos
Verifica que el archivo `.env` tenga las credenciales correctas y que los servicios (MongoDB, PostgreSQL, Redis) estén corriendo.

### Los colores no se muestran
Algunos terminales no soportan colores ANSI. Prueba con otra terminal o configura tu terminal para soportar colores.

## Contribuir

Para agregar nuevas funcionalidades:

1. Crea el archivo correspondiente en la estructura
2. Usa los helpers de `utils/` para mantener consistencia
3. Sigue las convenciones de colores
4. Agrega validaciones en todos los inputs
5. Muestra spinners en operaciones async
6. Documenta el nuevo código
