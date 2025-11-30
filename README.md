# Sistema de Monitoreo Climático - API REST + Frontend

Sistema poliglota de monitoreo de sensores climáticos compuesto por una **API REST** y un **frontend web** que consume todos los endpoints del backend.

A diferencia de una TUI basada en terminal, en este proyecto:

* La **API REST** expone endpoints HTTP (JSON)
* El **frontend** interactúa con la API para:

  * Autenticarse
  * Visualizar sensores y mediciones
  * Ejecutar procesos y ver resultados
  * Consultar reportes
  * Administrar usuarios, roles y permisos

---

## Descripción

Aplicación que gestiona sensores de temperatura y humedad utilizando tres bases de datos especializadas:

* **PostgreSQL**: Usuarios, roles, transacciones y facturación
* **MongoDB**: Mediciones de sensores y procesos de ejecución
* **Redis**: Caché de estado en tiempo real para respuestas rápidas

El frontend permite interactuar visualmente con todas las funcionalidades expuestas por la API.

---

## Características

* **API REST completa** (CRUD + endpoints de procesos)
* **Autenticación JWT** con roles:

  * Usuario
  * Técnico
  * Admin
* Gestión de sensores y mediciones climáticas
* Ejecución de procesos con cobro por análisis
* Detección de alertas por umbrales
* Sistema de mensajería interna entre usuarios
* Reportes estadísticos:

  * Promedios
  * Máximas / Mínimas
  * Desviación estándar
* Caché inteligente con Redis para consultas frecuentes
* Frontend moderno conectado al backend

---

## Stack Tecnológico

### Backend (API REST)

* **Runtime**: Node.js 20
* **Framework**: Express
* **Gestor de paquetes**: pnpm
* **Bases de datos**: PostgreSQL 14, MongoDB 7, Redis
* **Contenedores**: Docker Compose

### Frontend

* Framework elegido por el equipo (React / Next.js / Vue / etc.)
* Consumo de endpoints vía fetch/axios
* Manejo de sesiones JWT

---

## Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd tp-poliglota-api

# Copiar archivo de entorno
cp .env.example .env

# Levantar servicios (API + bases de datos)
docker-compose up -d
```

---

## Uso

La API ofrece endpoints para autenticación, sensores, procesos, reportes y mensajes.
El frontend consume todos los endpoints automáticamente una vez iniciada la aplicación.

**Usuarios disponibles por defecto:**

* Admin: `admin@sistema.com`
* Usuario: `usuario@test.com`
* Técnico: `tecnico@sistema.com`

---

## Arquitectura General

```
Frontend (Web App)
        │
        ▼
API REST (Node.js + Express)
        │
 ┌──────┼─────────┬──────────┐
 │      │          │          │
 ▼      ▼          ▼          ▼
PostgreSQL   MongoDB     Redis     Servicios de análisis
```

---

## Sobre el Proyecto

Proyecto académico — Universidad Argentina de la Empresa
Materia: **Ingeniería de Datos II (No Relacionales)**

**Autor:** Agustín Monetti

---

Si querés, te preparo también un **README para el frontend**, o un **diagrama de endpoints** para documentar la API 🚀
