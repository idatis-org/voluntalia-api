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
  nginx:
    build: .
    ports:
      - "9200:80"
    volumes:
      - "C:/tmp/files:/usr/share/nginx/html/files"

```
#### 📌 Detalles

1. El puerto 9200 del host se mapea al puerto 80 del contenedor.

2. La carpeta C:/tmp/files del host se monta dentro del contenedor.

3. Dentro de C:/tmp/files puede existir la carpeta images.

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
        autoindex on;
    }
}

```

#### 📌 Explicación

* /files/ es la ruta pública para acceder a los archivos.

* alias apunta al volumen montado desde el host.

* autoindex on permite listar los archivos desde el navegador.

## 🚀 Despliegue en Docker

Desde la raíz del proyecto, ejecutar:
```bash
docker-compose up --build
```

Esto:

* Construye la imagen de Nginx

* Levanta el contenedor

* Expone el servicio en el puerto configurado

## 🧪 Acceso a las Imágenes

Si existe la siguiente ruta en el host:

`C:/tmp/files/images/example.jpg`


La imagen estará disponible en:

`http://localhost:9200/files/images/example.jpg`