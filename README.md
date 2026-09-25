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

1. [Node.js](https://nodejs.org/) (v20.17.0)  
2. [Docker Desktop](https://www.docker.com/products/docker-desktop/)  
3. [Git](https://git-scm.com/)  

---

## 🔑 Variables de entorno

Copia `.env.example` a `.env` y rellena los valores:

```bash
cp .env.example .env
```

`.env` nunca debe subirse a git (ya está en `.gitignore`).

## 🚀 Levantar todo el stack con un solo comando (alternativa)

Si prefieres no configurar cada pieza por separado, hay un `docker-compose.yml` en la raíz del workspace (un nivel por encima de este repo) que levanta Postgres, la API, el frontend y el servidor de archivos juntos, con la red interna ya resuelta:

```bash
cd ..
docker-compose up --build
```

El resto de esta guía (pasos manuales de Postgres, migraciones, etc.) sigue siendo válida si prefieres levantar cada pieza por separado o correr la API en local con `npm run dev`.

## 🐘 Configuración de PostgreSQL con Docker (manual)

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
4. UI Base de datos: En mi caso he utilizado [DBeaver](https://dbeaver.io/download/) porque es facil de instalar, la interfaz es muy fácil de entender y para crear las conexiones con la base de datos no tienes ningún problema


## 🛠️ Preparación de la base de datos

1. Partimos de que estás usando DBeaver, Crea un nuevo script de la base de datos y asegúrate de que tu base de datos tenga habilitada la extensión `uuid-ossp`:  

   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

2. Ejecuta las migraciones de Sequelize, desde la raiz del proyecto, sino has hecho un `npm install` es el momento:  
   ```bash
   npx sequelize-cli db:migrate
   ```

3. Ejecuta los seeders para poblar la base de datos con datos iniciales:  
   ```bash
   npx sequelize-cli db:seed:all
   ```

---

## 🔧 Ajustes adicionales en el sistema

### &nbsp;&nbsp;&nbsp;&nbsp; :email:  Sendgrid

Tenemos un archivo de configuración `Sendgrid_configuration.md` que debemos de configurar en nuestro .env para poder utilizar este servicio, donde a la hora de registrar un usuario a este le llegará un mail para crear la contraseña.

Nosotros ya tenemos configuraciones para esto, las podéis crear vosotros o nos la pedís.

### &nbsp;&nbsp;&nbsp;&nbsp; 📂 Manage files

Tenemos un archivo de configuracion y guia paso a paso `Manage_files_configuration.md` donde se explica como crear el contenedor y la estructura de cada uno de los archivos para despachar archivos en la aplicación

### &nbsp;&nbsp;&nbsp;&nbsp; 📮 Postman

`VoluntALIA.postman_collection.json` trae todos los endpoints de la API ya organizados por recurso (Auth, User, Notification, Document, Activity, Skill, WorkLog, Dashboard), listos para importar en Postman y probar sin escribir las peticiones a mano.

---

## ▶️ Ejecución del proyecto

Con todo configurado, ya puedes iniciar el servidor de desarrollo:  

```bash
npm run dev
```

La API estará corriendo en:  
👉 [http://localhost:4000](http://localhost:4000)

---
