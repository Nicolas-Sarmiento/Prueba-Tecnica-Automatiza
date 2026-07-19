# Alcance 

**Autor**: Nicolas Sarmiento  
**Fecha**: 18 de julio de 2026  
**Versión**: 1.0


En el presente documento se define el alcance del Producto Mínimo Viable (MVP) para la solución de gestión de accesos para el banco Andino. A continuación se describen el objetivo y las funcionalidades incluidas y excluidas, con su respectiva justificación.

En el contexto de la gestión de accesos del Banco Andino, se utiliza el software del fabricante de los sistemas físicos. Debido a las limitaciones del software actual, la operación de la organización se vuelve tediosa y poco eficiente para la realización de los reportes, así como para la consulta del aforo en las diferentes sedes. La información extraída es utilizada por áreas como recursos humanos y auditoría.

La organización desea una capa sobre el software actual que realice informes y consultas respecto a las entradas y salidas del personal. La información se maneja en archivos de Excel. Por lo tanto, el Producto Mínimo Viable (MVP) tiene el objetivo de optimizar el flujo de las operaciones de generación de informes y consulta de información al sistema de gestión de accesos. Para lograr este objetivo, el MVP debe incluir las funcionalidades: consulta de aforo por sede, generación de reportes por rangos de fechas e importación de datos a través de archivos de Excel. Con estas funcionalidades la organización puede solucionar los problemas en el flujo de las operaciones que involucran al sistema de accesos.

A continuación se especifican las razones que tiene cada funcionalidad para ser elegidas y también las que se dejan fuera del alcance.

| Funcionalidad | Estado | Justificación |  
| --- | --- | --- |
| Consulta del aforo por sedes | Incluida | Soluciona una de las principales necesidades de la organización.
| Generación de reportes de entradas y salidas en un rango de tiempo | Incluida | Reduce el tiempo de elaboración de informes utilizados por el área de auditoría y recursos humanos.
| Importación de usuarios y sedes mediante archivos Excel | Incluida | Mantiene la compatibilidad del flujo actual de trabajo de la organización, mediante el uso de archivos de Excel. Así mismo, se incluye validación de registros y resumen de la carga, lo cual es explícitamente solicitado por el cliente. |  
| Adaptador para la integración con API de BioStar (simulado)| Incluida| El sistema funcionará como una capa sobre el software BioStar y es necesario validar la arquitectura y desacoplar la solución del proveedor mientras se dispone de un ambiente real de pruebas. | 
| Consultas de aforo por piso o zona | No Incluida | No hay presencia de información de pisos o zonas en el archivo de Excel y por lo tanto no es posible implementar y validar esta funcionalidad. Sin embargo, el diseño debe contemplar una actualización para esta funcionalidad.|
| Administración manual de sedes y/o usuarios| No Incluida | En el flujo de trabajo, la gestión de tanto empleados como de sedes se realiza mediante archivos de Excel. Debido a las limitaciones de tiempo, no es una funcionalidad que aporte a la solución del problema principal. Sin embargo, esta funcionalidad puede ser añadida en futuras iteraciones. | 
| Administración de visitantes y contratistas | No incluida | Es una funcionalidad que no es prioritaria, el cliente dejó en claro que puede esperar y por lo tanto, no aportaría mucho valor inicial al MVP. | 

Para los criterios de inclusión se utilizaron los siguientes. Una funcionalidad se incluye cuando:
- Resuelve un problema mencionado explícitamente por el cliente.
- Aporta valor a la solución desde la primera iteración.
- Puede implementarse y validarse sin requerir de la infraestructura o servicios externos.
- Reduce considerablemente el tiempo de actividades que se realizan de forma manual.
- Hace parte del flujo principal del negocio y permite que se amplie a futuras versiones sin requerir rediseños importantes.
- Es alcanzable dentro de los límites de tiempos establecidos.  
Por otro lado, los criterios de exclusión de una funcionalidad son los siguientes: 
- No es prioridad.
- Depende de información que no está disponible.
- Incrementa la complejidad en la implementación.
- Se puede implementar en futuras versiones.
- El tiempo requerido para su implementación supera los límites o no permitiría la implementación de funcionalidades prescindibles.





