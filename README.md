# 🌱 VoluntALIA - API de gestión de voluntarios

VoluntALIA es una API construida con **Node.js** y **PostgreSQL** que permite gestionar voluntarios de manera sencilla y organizada.  
Su propósito es servir como base para aplicaciones que requieran registrar, autenticar y administrar voluntarios dentro de una organización.  

---

## 🚀 Tecnologías utilizadas
- **Node.js** + **Express** → Backend de la API  
- **PostgreSQL** → Base de datos relacional  
- **Sequelize** → ORM para modelado y migraciones  
- **JWT** → Autenticación segura con tokens  

---

## ⚙️ Requisitos previos
Antes de iniciar, asegúrate de tener instalado:

1. [Node.js](https://nodejs.org/) (v16+ recomendado)  
2. [Docker Desktop](https://www.docker.com/products/docker-desktop/)  
3. [Git](https://git-scm.com/)  

---

## 🐘 Configuración de PostgreSQL con Docker

1. Descarga e instala **Docker Desktop** desde la [página oficial](https://www.docker.com/products/docker-desktop/).  
2. Abre una terminal y ejecuta el siguiente comando para levantar un contenedor de PostgreSQL en el puerto `5432`:

   ```bash
   docker run --name voluntalia-db      -e POSTGRES_USER=postgres      -e POSTGRES_PASSWORD=masterkey      -e POSTGRES_DB=voluntalia-test      -p 5432:5432      -d postgres
   ```

   📌 Esto creará una base de datos llamada `voluntalia-test` lista para conectarse desde la API.

3. (Opcional) Si quieres entrar al contenedor:  
   ```bash
   docker exec -it voluntalia-db psql -U postgres -d voluntalia-test
   ```


## 🛠️ Preparación de la base de datos

1. Asegúrate de que tu base de datos tenga habilitada la extensión `uuid-ossp`:  

   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

2. Ejecuta las migraciones de Sequelize:  
   ```bash
   npx sequelize-cli db:migrate
   ```

3. Ejecuta los seeders para poblar la base de datos con datos iniciales:  
   ```bash
   npx sequelize-cli db:seed:all
   ```

---

## ▶️ Ejecución del proyecto

Con todo configurado, ya puedes iniciar el servidor de desarrollo:  

```bash
npm run dev
```

La API estará corriendo en:  
👉 [http://localhost:4000](http://localhost:4000)

---
