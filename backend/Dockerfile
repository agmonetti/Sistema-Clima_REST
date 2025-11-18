# 1. IMAGEN BASE
FROM node:20-alpine

# 2. DIRECTORIO DE TRABAJO
WORKDIR /app

# 3. ACTIVAR PNPM (La forma moderna en Node 20)
# Corepack viene incluido en Node.js y gestiona las versiones de pnpm por ti.
RUN corepack enable && corepack prepare pnpm@latest --activate

# 4. COPIA DE ARCHIVOS DE DEPENDENCIAS
COPY package.json pnpm-lock.yaml ./

# 5. INSTALACIÓN DE DEPENDENCIAS
# --frozen-lockfile: Asegura que se instalen versiones exactas del lockfile (ideal para CI/Docker)
RUN pnpm install --frozen-lockfile

# 6. CÓDIGO FUENTE
COPY . .

# 7. PUERTO (Documentación)
EXPOSE 3000

# 8. EJECUCIÓN (¡EL CAMBIO CLAVE!)
# Ya no usamos 'tail -f'. Ahora queremos que arranque tu servidor.
CMD ["pnpm", "start"]
