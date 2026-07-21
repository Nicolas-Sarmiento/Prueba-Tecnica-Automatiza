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

## USO

Para acceder al sistema se requiere de un usario y contraseña. Existen dos usuarios registrados en la base de datos. Con los roles administrador y supervisor. El administrador puede cargar datos, el supervisor no. Ambos pueden ver los datos.

El usuario administrador es:
- usuario: admin
- contraseña: password

El usuario supervisor es:
- usuario: supervisor
- contraseña: password

Para subir nuevos datos se requiere de un archivo Excel. Un archivo de ejemplo se encuentra en la carpeta raíz con el nombre `sample.xls`. El archivo está basado en el archivo compartido por Talento Humano con algunos cambios.

### Estructura del archivo Excel

#### Hoja Empleados:
Contiene los mismos datos que el archivo excel compartido por Talento Humano, sin embargo son solamente obligatorios los campos primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, tipo_doc, numero_documento, pais, id_biostar. El sistema realiza una limpieza de los datos muy simple como colocar todo en mayúsculas, para los tipos de documento se utilizan las siglas 'CC', 'CE', 'PASAPORTE', 'CIP' y 'PEP'. En país admite únicamente 'COLOMBIA' y 'PANAMA', siendo insensible a las mayúsculas o tildes. También se eliminan tildes y acentos de los datos.

#### Hoja Ubicaciones:
Contiene los mismos datos que la hoja SEDES compartida por Talento humano, solo cambia su nombre de la hoja y del campo código, que ahora se llama codigo_ubicacion. Se añaden los campos tipo ('SEDE', 'EDIFICIO', 'PISO', 'OFICINA', 'ZONA') y ubicacion_padre_id, que sería un campo para referirse a la ubicación en la cuál se encuentra, este por ahora se debe dejar vacio porque no hay lógica desarrollada. Los campos obligatorios son codigo_ubicacion, nombre, direccion, ciudad, pais y aforo son obligatorios, si no hay tipo se toma como SEDE.
#### Hoja Accesos:
Esta es una hoja nueva añadida, contiene los campos biostar_id representando el identificador que tiene el acceso en el sistema de BioStar, codigo_ubicacion es la referencia a la ubicacion y por úlitmo nombre, estos tres campos son obligatorios.

### Eventos
El sistema se integra con un entorno simulado de BioStar, el cual al iniciar genera algunos eventos de entradas y salidas. Pero, también el usuario puede crear eventos, para ello puede enviar una petición POST a la ruta /api/events. con el siguiente formato:
```
{
  "user_id": "91021",
  "device_id": "1",
  "type": "ENTRADA" // o "SALIDA"
}
```

Donde user_id es el id_biostar de la persona, device_id es el id_biostar del acceso y type es el tipo de evento. Con esto se puede validar la vista del aforo actual. El sistema descarta los ingresos dobles, es decir si existen dos salidas consecutivas de la misma persona, para el cálculo de la ocupación. Sin embargo, si se registra en los eventos y se puede consultar, esto con el fin de que las anomalías se detallen en un informe por ejemplo de auditoría.

## Tecnologías Utilizadas
- **Frontend:** React, TypeScript, Vite, CSS.
- **Backend:** Node.js, Express, TypeScript, Arquitectura Hexagonal (Clean Architecture), JWT.
- **Base de Datos:** PostgreSQL.
- **Infraestructura:** Docker, Docker Compose, Nginx.