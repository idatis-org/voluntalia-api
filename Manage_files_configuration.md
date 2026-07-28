# 🖼️ Servir Imágenes con Nginx y Docker

Este documento explica cómo configurar y desplegar un contenedor Docker con Nginx para servir imágenes y otros archivos estáticos desde un directorio del host.

---

## 📁 Estructura del Proyecto


├── docker-compose.yml
├── Dockerfile
├── nginx.conf
└── images/

* images/: carpeta donde se almacenan las imágenes.

* nginx.conf: configuración del servidor Nginx.

* Dockerfile: imagen personalizada de Nginx.

* docker-compose.yml: definición del servicio Docker.

## 🐳 Docker Compose

Archivo docker-compose.yml:
```yaml
services:
  file-server:
    build: .
    volumes:
      - "C:/tmp/files:/usr/share/nginx/html/files"
    networks:
      - voluntalia_net

networks:
  voluntalia_net:
    external: true
```
#### 📌 Detalles

1. El contenedor **ya no publica ningún puerto al host**: solo es alcanzable desde otros contenedores conectados a la red Docker `voluntalia_net` (en la práctica, la API). Así se evita que cualquiera con la URL pueda descargar archivos sin pasar por la autenticación/autorización de la API.

2. La carpeta C:/tmp/files del host se monta dentro del contenedor.

3. Dentro de C:/tmp/files puede existir la carpeta images.

4. La red `voluntalia_net` debe existir antes de levantar los servicios (se comparte con la API):
   ```bash
   docker network create voluntalia_net
   ```
   Luego, desde `voluntalia-api/` (que ahora también tiene su propio `docker-compose.yml`), levanta la API con `docker-compose up --build`, y desde aquí el file-server con el mismo comando. Ambos deben apuntar a la misma red externa.

5. La API referencia este servicio internamente por su nombre (`FILES_PATH=http://file-server/files` en el `.env` de `voluntalia-api`), no por `localhost:9200`.

## 📦 Dockerfile

Archivo Dockerfile:
```dockerfile
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

```
Este Dockerfile:

1. Usa la imagen oficial de Nginx basada en Alpine.

1. Sobrescribe la configuración por defecto de Nginx.

## 🌐 Configuración de Nginx

Archivo nginx.conf:
```nginx
server {
    listen 80;
    server_name localhost;

    location /files/ {
        alias /usr/share/nginx/html/files/;
        autoindex off;
    }
}

```

#### 📌 Explicación

* /files/ es la ruta interna (no pública) para acceder a los archivos, solo alcanzable desde la red Docker compartida.

* alias apunta al volumen montado desde el host.

* autoindex off evita que se pueda listar el contenido de una carpeta navegando directamente a su URL — solo se puede acceder a un archivo si se conoce su ruta exacta, y el único componente que la conoce y la sirve al cliente final es la API (tras validar autenticación).

## 🚀 Despliegue en Docker

Antes de la primera vez, crea la red compartida (una sola vez):
```bash
docker network create voluntalia_net
```

Desde la raíz del proyecto, ejecutar:
```bash
docker-compose up --build
```

Esto:

* Construye la imagen de Nginx

* Levanta el contenedor conectado a `voluntalia_net`

* **No** publica ningún puerto al host — el servicio solo es accesible desde otros contenedores de esa red (la API)

## 🧪 Acceso a las Imágenes

El acceso directo por navegador (p. ej. `http://localhost:9200/files/...`) **ya no está disponible** — es intencional, forma parte de la corrección de seguridad que cierra el acceso sin autenticación a los documentos.

Para descargar un archivo hay que pasar por la API, que sí exige autenticación:

`GET http://localhost:<PORT>/document/:id/download` (con `Authorization: Bearer <token>`)

La API resuelve internamente la URL real (`http://file-server/files/...`) y hace de proxy hacia el contenedor Nginx a través de la red interna `voluntalia_net`.