# 🌐 TP Persistencia Poliglota: Sistema de Gestión Climática

## 1. Visión General del Proyecto

Este proyecto implementa una arquitectura de **Persistencia Poliglota (Polyglot Persistence)** para la gestión de datos de sensores y la lógica transaccional de facturación y usuarios.

El objetivo es demostrar la elección estratégica de bases de datos para optimizar la **Consistencia (ACID)**, la **Velocidad de Ingesta (Escalabilidad)** y el **Rendimiento Cero-Latencia**, resolviendo las distintas necesidades de un sistema complejo.

| **Estado Actual** | **Fecha Límite** |
| :--- | :--- |
| Configuración de Entorno (Sprint 0) Completa y Lista. | **11 de Noviembre** |

***

## 2. Arquitectura de la Solución (Polyglot Stack) 🧠

La aplicación se compone de **cuatro servicios aislados** y orquestados mediante **Docker Compose**. Cada base de datos fue seleccionada por su fortaleza intrínseca.

### A. Capa de Aplicación (Backend)

| Componente | Tecnología | Rol y Justificación |
| :--- | :--- | :--- |
| **Backend** | **Node.js + NestJS/Express.js** | **Velocidad de Desarrollo y Ecosistema Unificado.** Elegido para minimizar la curva de aprendizaje inicial, permitiendo enfocarse rápidamente en la lógica de las APIs REST y la integración de datos. |
| **Gestión** | **pnpm** | **Mantenibilidad y Eficiencia.** Utilizado como gestor de paquetes para garantizar una gestión de dependencias estricta y eficiente en espacio de disco. |
| **Orquestación** | **Docker Compose** | **Operabilidad.** Permite levantar el entorno de 3 BD y el *backend* con un solo comando, asegurando consistencia y aislamiento de los servicios. |

### B. Capa de Datos (Justificación CAP)

| Base de Datos | Tipo | Criterio CAP Principal | Rol Funcional |
| :--- | :--- | :--- | :--- |
| **PostgreSQL** | Relacional (SQL) | **Consistencia (C)** | **Núcleo Transaccional (ACID).** Gestiona Usuarios, Roles, Facturación, Pagos y Cuentas Corrientes. Requiere integridad máxima. |
| **MongoDB** | NoSQL (Documental) | **Disponibilidad (A)** | **Datos Masivos / Series de Tiempo.** Gestiona Sensores y Mediciones (alta ingesta, gran volumen). Prioriza la velocidad de escritura y escalabilidad horizontal. |
| **Redis** | NoSQL (*Key-Value* / In-Memory) | **Disponibilidad (A)** | **Cache y Tiempo Real.** Almacena Sesiones Activas y Cache de Consultas Frecuentes. Ofrece latencia cero. |

***

## 3. Guía de Inicio Rápido (Entorno de Desarrollo) 🚀

El entorno de desarrollo se levanta utilizando el archivo `docker-compose.yml` configurado para tu arquitectura de 4 servicios.

### 3.1. Requisitos Previos

* **Docker Desktop** (o Docker Engine).
* **Node.js** y **pnpm** instalados.

### 3.2. Comandos de Operación

Ejecute todos los comandos desde la carpeta raíz (`tp-poliglota-clima/`).

| Comando | Descripción |
| :--- | :--- |
| **`docker compose up -d`** | **Levanta toda la arquitectura** (4 contenedores). Descarga imágenes, construye el *backend* y crea los volúmenes. |
| **`docker compose down`** | Detiene y elimina los contenedores (los datos persisten en los volúmenes). |
| **`docker compose logs -f backend`** | Muestra los logs en tiempo real del servicio de *backend*. |
| **`docker compose exec postgres psql -U clima_user clima_db`** | **Acceso Directo a PostgreSQL** (para testear la BD). |

***

## 4. Estructura de Persistencia (El `docker-compose.yml`)

Este archivo define la relación *Service Discovery*, Persistencia (Volúmenes) y Orquestación.

* **Service Discovery:** El *backend* se conecta a las bases de datos usando sus nombres de servicio: `postgres`, `mongo`, `redis`.
* **Volúmenes:** Se utilizan **Volúmenes Nombrados** (`postgres_data`, `mongo_data`, `redis_data`) para asegurar que los datos no se pierdan al reiniciar o eliminar los contenedores.

```yaml
# CÓDIGO DEL DOCKER-COMPOSE.YML (Contenido en el archivo del proyecto)


