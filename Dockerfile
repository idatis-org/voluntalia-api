# Etapa 1: Build
FROM node:20-alpine AS build

# Instalar dependencias de compilación necesarias
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copiar package.json y package-lock.json primero (para cache de Docker)
COPY package*.json ./

# Instalar todas las dependencias (dev y prod)
RUN npm install

# Copiar el resto del código
COPY . .

# Etapa 2: Producción
FROM node:20-alpine AS prod

WORKDIR /app

# Copiar solo las dependencias de producción desde la etapa de build
COPY --from=build /app/node_modules ./node_modules

# Copiar el código fuente
COPY --from=build /app ./

# Exponer puerto de la API
EXPOSE 5000

# Comando para iniciar la API
CMD ["npm", "start"]