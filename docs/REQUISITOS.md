# Requisitos

Autor: Nicolas Sarmiento  
Fecha: 19 de julio de 2026  
Versión: 1.0  

## Requisitos Funcionales
A continuación se presenta la descripción de los requisitos funcionales para el desarrollo del MVP. Por cada requisito se detalla: el identificador, el nombre, la descripción, el nivel de prioridad y el criterio de validación. Todos los requisitos presentados a continuación tienen como origen la reunión realizada con el cliente.

| Identificador | RF-01 |
| --- | --- |
| Nombre | Consultar aforo por sede |
| Descripción | El sistema debe permitir consultar la cantidad estimada de personas presentes en cada sede según los eventos de acceso registrados. |
| Prioridad | Alta |
| Criterio de aceptación | El sistema muestra el aforo calculado de las sedes a partir de los eventos de acceso disponibles. |     

| Identificador | RF-02 |
| --- | --- |
| Nombre | Generar reporte de entradas y salidas |
| Descripción | El sistema debe permitir generar reportes de eventos de acceso registrados, incluyendo información de la persona, sede, fecha, hora y tipo de evento. El sistema también integra filtros que permitirán ajustar el reporte por sede o por rango de fechas. |
| Prioridad | Alta |
| Criterio de aceptación | El sistema genera una tabla con los datos relevantes de las entradas y salidas aplicando correctamente los filtros seleccionados por el usuario. | 

| Identificador | RF-03 |
| --- | --- |
| Nombre | Descarga de reportes en archivo Excel |
| Descripción | El sistema debe permitir exportar los reportes generados en formato Excel. |
| Prioridad | Alta |
| Criterio de aceptación |El sistema genera el archivo de Excel con la información correcta. | 

| Identificador | RF-04 |
| --- | --- |
| Nombre | Importar personas y sedes desde Excel |
| Descripción | El sistema debe permitir la carga masiva de información de personas y sedes mediante archivos Excel, validando que los registros cumplan con la información mínima requerida.. |
| Prioridad | Alta |
| Criterio de aceptación |El sistema importa los registros válidos y genera una notificación para aquellos que no cumplen las validaciones requeridas. | 

| Identificador | RF-05 |
| --- | --- |
| Nombre | Actualización de información existente durante la importación |
| Descripción | Durante el proceso de importación, el sistema debe identificar registros existentes y actualizar únicamente aquellos cuya información haya cambiado. |
| Prioridad | Media |
| Criterio de aceptación | El sistema actualiza correctamente los registros modificados. |

| Identificador | RF-06 |
| --- | --- |
| Nombre | Resumen de la operación de importación |
| Descripción | Después de terminar el proceso de cargar información mediante un archivo de Excel, el sistema muestra al usuario cuántos registros fueron creados, actualizados y cuáles fueron rechazados por contener datos inválidos o faltantes. |
| Prioridad | Alta |
| Criterio de aceptación | El sistema muestra al usuario los registros cargados, actualizados y los rechazados, junto con su justificación. | 

| Identificador | RF-07 |
| --- | --- |
| Nombre | Consumo de API de BioStar |
| Descripción | El sistema debe obtener información relacionada con eventos de acceso mediante la integración con la API proporcionada por el fabricante del sistema de control de acceso.. |
| Prioridad | Alta |
| Criterio de aceptación | El sistema puede obtener eventos de acceso mediante un componente independiente de integración. | 


## Requisitos No Funcionales

En esta sección se presentan los requisitos no funcionales que debe cumplir el MVP basados en la reunión con el cliente y con el uso de buenas prácticas. Para cada requisito se detalla el nombre, la descripción, la prioridad y el criterio de aceptación.

| Identificador | RNF-01 |
| --- | --- |
| Nombre | Uso de PostgreSQL | 
| Descripción | El sistema debe utilizar como base de datos PostgreSQL. |
| Prioridad | Alta |
| Criterio de aceptación| El sistema utiliza el motor de PostgreSQL.| 

| Identificador | RNF-02 |
| --- | --- |
| Nombre | Uso de React JS | 
| Descripción | Para el desarrollo del frontend se utiliza la librería de React JS|
| Prioridad | Alta |
| Criterio de aceptación| El frontend está construido utilizando la librería de React JS| 

| Identificador | RNF-03 |
| --- | --- |
| Nombre | Autenticación | 
| Descripción | El sistema debe restringir el acceso a las funcionalidades mediante autenticación de usuarios. |
| Prioridad | Media |
| Criterio de aceptación| Un usuario no autenticado no puede acceder a las funcionalidades protegidas.| 

| Identificador | RNF-04 |
| --- | --- |
| Nombre | Escalabilidad | 
| Descripción | El sistema debe estar organizado siguiendo una arquitectura modular que facilite la incorporación de nuevas funcionalidades con un impacto mínimo sobre los componentes existentes. |
| Prioridad | Alta |
| Criterio de aceptación| La incorporación de una nueva funcionalidad requiere modificaciones únicamente en los módulos relacionados, sin afectar el resto del sistema.| 


##  Preguntas al Cliente y Suposiciones

La entrevista permitió identificar algunos puntos que requieren aclaración debido a información incompleta o ambigua. Debido a que durante la prueba técnica no se contará con retroalimentación de los interesados, se establecen las siguientes suposiciones para orientar el diseño.

1. ¿Quiénes serán los usuarios del sistema y qué responsabilidades tendrá cada uno?

    Según la entrevista, hablan de los informes utilizados por el área de Auditoria e información solicitada por gerencia. Aquí se asumirá que el área de seguridad utiliza el sistema y brinda dicha información y que en el sistema existe un rol privilegiado que puede hacer las importaciones y un rol que realice consultas.

2. ¿Las personas siempre registran la salida? Además de las salidas de emergencia, ¿existen otros escenarios donde no quede registrada?

    Asumiré que los empleados marcan la salida siempre y que los casos donde no registra es únicamente la salida de emergencia y es un caso excepcional que es muy poco frecuente. El sistema no realizará inferencias sobre salidas faltantes debido a que no existe información suficiente para determinar si una persona continúa dentro de la sede.

3. ¿Qué campos son obligatorios para importar un registro de un empleado desde un archivo Excel?

    En este caso asumiré que los datos esenciales son los nombres y apellidos, el documento de identificación y el id de BioStar, suponiendo que es con el que el sistema identifica los accesos y el nivel de acceso. Estos datos los considero esenciales para conocer quién ingresa, lo cual es el objetivo principal del sistema. El código de empleado si bien solo funcionará para empleados y a futuro si se agrega otro tipo de personas como contratistas, servicios generales, etc. No funcionará, pero agregarlo sirve si las áreas luego necesitan ese código porque forma parte de otro sistema de información de la organización.

4. Aunque en la entrevista se habla de que existen personas con diferentes documentos de identificación, ¿existe uno principal o todos tienen la misma validez?

    Como hay varios empleados con diferentes documentos, según la información proporcionada en la entrevista. Debido a que una persona puede tener múltiples documentos registrados, el documento no será utilizado como identificador único del registro.

5. Cuando se detecte una anomalía en el acceso de una persona, como una entrada sin una salida previa, ¿cómo espera el negocio que se gestione la situación para el cálculo del aforo?

    Se asume que el cálculo no tiene que ser 100% preciso y se busca una estimación. El cálculo del aforo se realizará mediante la diferencia entre eventos de entrada y salida registrados. Los eventos faltantes no serán inferidos, por lo que el resultado representa una estimación basada únicamente en la información disponible.

6. ¿El aforo representa únicamente la ocupación actual o también se debería permitir consultas históricas sobre este dato?

    Como no hay más información disponible y en la entrevista solamente mencionan que la gerencia quiere ver en un panel el aforo, entonces solamente representa la ocupación actual de una sede.

7. En la entrevista comentan que los reportes solamente requieren los registros de quien entró a una sede en específico. ¿Los reportes requieren información adicional que el sistema deba generar?

    Solamente se tomarán los registros de entrada y salida, tal como se menciona en la entrevista.

8. ¿Qué tiempo de respuesta máximo esperan del sistema?

    Debido a que no se definieron métricas de rendimiento, el sistema priorizará tiempos de respuesta adecuados para operaciones interactivas comunes. No se establecerá una métrica específica. 

9. ¿Las personas están previamente cargadas en el sistema de BioStar del fabricante o se espera que la gestión de personas se haga a través de la importación de usuarios a través del archivo de Excel?

    Se asume que sí y por tal razón ya viene el id_biostar en el archivo Excel, de esta manera también el sistema no incrementa la complejidad al tener que gestionar la creación de usuarios en el sistema de BioStar.

10. Si los empleados son identificados por cédula, entonces ¿qué significado tiene el id del empleado en el archivo de Excel compartido?

    Se almacenará como un atributo específico de empleados y no como identificador universal de una persona, ya que otros tipos de personas podrían no contar con dicho código.

11. ¿Las personas que no son empleados también manejan un id_biostar o su gestión es diferente a la de los empleados?

    Se asume que cualquier persona registrada en el sistema de control de acceso cuenta con un identificador proporcionado por BioStar. Esto permite mantener la integración con dicho sistema sin importar el tipo de persona registrado.