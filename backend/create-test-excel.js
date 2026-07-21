const xlsx = require('xlsx');

const ubicaciones = [
  { codigo_ubicacion: 'LOC01', nombre_ubicacion: 'Sede Principal', ciudad: 'Bogota', pais: 'COLOMBIA', direccion: 'Calle 100', aforo_maximo: 500, activa: 'SI', Tipo: 'SEDE' },
  { codigo_ubicacion: 'LOC02', nombre_ubicacion: 'Sede Norte', ciudad: 'Medellin', pais: 'COLOMBIA', direccion: 'Cra 50', aforo_maximo: 300, activa: 'SI', Tipo: 'SEDE' }
];

const empleados = [
  { id_biostar: 'EMP001', primer_nombre: 'Juan', primer_apellido: 'Perez', segundo_nombre: 'Carlos', segundo_apellido: 'Gomez', tipo_doc: 'CC', numero_documento: '12345678', pais: 'COLOMBIA' },
  { id_biostar: 'EMP002', primer_nombre: 'Maria', primer_apellido: 'Lopez', segundo_nombre: '', segundo_apellido: '', tipo_doc: 'CE', numero_documento: '87654321', pais: 'COLOMBIA' }
];

const accesos = [
  { biostar_id: 'ACC01', codigo_ubicacion: 'LOC01', nombre: 'Puerta Principal' },
  { biostar_id: 'ACC02', codigo_ubicacion: 'LOC02', nombre: 'Torniquete 1' }
];

const wb = xlsx.utils.book_new();

const wsUbicaciones = xlsx.utils.json_to_sheet(ubicaciones);
xlsx.utils.book_append_sheet(wb, wsUbicaciones, 'Ubicaciones');

const wsEmpleados = xlsx.utils.json_to_sheet(empleados);
xlsx.utils.book_append_sheet(wb, wsEmpleados, 'Empleados');

const wsAccesos = xlsx.utils.json_to_sheet(accesos);
xlsx.utils.book_append_sheet(wb, wsAccesos, 'Accesos');

xlsx.writeFile(wb, 'datos_prueba.xlsx');
console.log('Archivo datos_prueba.xlsx creado exitosamente.');
