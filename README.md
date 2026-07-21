# Sistema de Control de Accesos: Banco Andino

Autor: Nicolas Sarmiento


En la carpeta docs se encuentra toda la documentación referente a la planeación:
- Alcance
- Arquitectura
- Diagrama Entidad Relacion
- Evidencia del uso de IA


# Cómo Ejecutar el Proyecto

Este proyecto está completamente contenedorizado (Dockerizado) para garantizar que funcione de manera idéntica en cualquier máquina, sin necesidad de instalar Node.js ni bases de datos localmente.

### Requisitos
- **Docker** y **Docker Compose** instalados en tu sistema.
- Asegúrate de tener libres los puertos `80` (Frontend), `3000` (Backend API), `4000` (Mock BioStar) y `5432` (PostgreSQL).

### Instrucciones de Despliegue

1. **Clona o descarga este repositorio** y abre una terminal en la carpeta raíz del proyecto (donde se encuentra el archivo `docker-compose.yml`).
```bash
git clone https://github.com/Nicolas-Sarmiento/Prueba-Tecnica-Automatiza.git
cd Prueba-Tecnica-Automatiza
```
2. **Ejecuta el siguiente comando** para construir las imágenes y levantar todos los servicios en segundo plano:
   ```bash
   docker compose up --build -d
   ```
   *(Nota: Dependiendo de tu sistema operativo, es posible que necesites usar `sudo docker compose up --build -d`).*

3. **¡Eso es todo!** El sistema se encarga de todo el proceso de inicialización de forma automática:
   - Levanta la base de datos PostgreSQL.
   - Ejecuta las **migraciones de base de datos** automáticamente.
   - Ejecuta un **Seeder** interno que puebla la base de datos con los datos iniciales y usuarios administradores si es necesario.
   - Sirve el Frontend estático a través de Nginx en modo producción.

### Accesos del Sistema

Una vez que los contenedores estén corriendo, puedes acceder a las diferentes partes del sistema:

- **Frontend (Aplicación Web):** [http://localhost](http://localhost)
- **Backend API:** [http://localhost:3000](http://localhost:3000)

### Documentación de la API (Swagger)

El sistema cuenta con documentación interactiva de la API implementada con Swagger en los siguientes endpoints:

- **Backend API Docs:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **BioStar Mock API Docs:** [http://localhost:4000/api-docs](http://localhost:4000/api-docs)

### Detener el Proyecto
Para detener la aplicación y apagar los contenedores, ejecuta:
```bash
docker compose down
```
*(Si deseas borrar la base de datos para empezar desde cero la próxima vez, puedes usar `docker compose down -v`)*.

### Resolución de Problemas (Troubleshooting)

Si encuentras algún error al levantar los contenedores, aquí están las soluciones más comunes:

1. **Error de Puertos Ocupados (`port is already allocated`):**
   Esto sucede si ya tienes otra base de datos PostgreSQL o un servidor Nginx/Apache corriendo localmente. 
   * **Solución:** Detén tu servicio local (`sudo systemctl stop postgresql`) o edita el archivo `docker-compose.yml` para cambiar el puerto de salida (ej. `"5433:5432"`).

2. **Error de Permisos en Linux (`permission denied while trying to connect to the Docker daemon`):**
   * **Solución:** Ejecuta los comandos antecedidos por `sudo` (ej. `sudo docker compose up --build -d`).

3. **La Base de Datos no se actualiza o tiene datos corruptos:**
   Si hiciste cambios drásticos y el contenedor de BD se quedó en un estado inválido.
   * **Solución:** Ejecuta `docker compose down -v` para destruir los volúmenes en caché y luego vuelve a ejecutar `docker compose up --build -d`.

4. **Problemas con cambios en el código que no se reflejan (Caché de Docker):**
   Si realizaste modificaciones al código pero los contenedores siguen mostrando versiones anteriores.
   * **Solución:** Fuerza la reconstrucción de las imágenes sin usar caché: `docker compose build --no-cache` y luego levanta los contenedores: `docker compose up -d`.

5. **Ver los logs para depurar errores internos:**
   Si algún contenedor falla silenciosamente.
   * **Solución:** Ejecuta `docker compose logs -f` para ver los registros de todos los contenedores en tiempo real, o `docker compose logs -f [nombre_servicio]` (ej. `docker compose logs -f backend`) para un servicio específico.

---

## Tecnologías Utilizadas
- **Frontend:** React, TypeScript, Vite, CSS.
- **Backend:** Node.js, Express, TypeScript, Arquitectura Hexagonal (Clean Architecture), JWT.
- **Base de Datos:** PostgreSQL.
- **Infraestructura:** Docker, Docker Compose, Nginx.