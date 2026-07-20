exports.up = (pgm) => {
  // ENUMS
  pgm.createType('location_type_enum', ['SEDE', 'EDIFICIO', 'PISO', 'OFICINA', 'ZONA']);
  pgm.createType('country_enum', ['COLOMBIA', 'PANAMA']);
  pgm.createType('document_type_enum', ['CC', 'CE', 'PASAPORTE', 'CIP', 'PEP']);
  pgm.createType('event_type_enum', ['ENTRADA', 'SALIDA']);

  // TABLE: Location
  pgm.createTable('Location', {
    locationId: 'id', // PK, autoincremental
    locationCode: { type: 'varchar(50)', notNull: true, unique: true },
    name: { type: 'varchar(150)', notNull: true },
    type: { type: 'location_type_enum' },
    isActive: { type: 'boolean', default: true },
    capacity: { type: 'integer' },
    parent_locationId: {
      type: 'integer',
      references: '"Location"',
      onDelete: 'SET NULL',
    },
    address: { type: 'varchar(255)' },
    city: { type: 'varchar(100)' },
    country: { type: 'country_enum' },
    occupancyLevel: { type: 'integer', default: 0 },
  });

  // TABLE: Person
  pgm.createTable('Person', {
    personId: 'id', // PK
    firstName: { type: 'varchar(100)', notNull: true },
    secondName: { type: 'varchar(100)' },
    firstLastName: { type: 'varchar(100)', notNull: true },
    secondLastName: { type: 'varchar(100)' },
    biostar_id: { type: 'varchar(100)', notNull: true, unique: true },
  });

  // TABLE: Document
  pgm.createTable('Document', {
    documentId: 'id', // PK
    personId: {
      type: 'integer',
      notNull: true,
      references: '"Person"',
      onDelete: 'CASCADE',
    },
    documentType: { type: 'document_type_enum', notNull: true },
    documentNumber: { type: 'varchar(50)', notNull: true },
    country: { type: 'country_enum' },
    main: { type: 'boolean', default: false },
  });
  
  // Create an index to quickly find documents and enforce unique document per person/type
  pgm.addIndex('Document', ['documentType', 'documentNumber'], { unique: true });

  // TABLE: AccessPoint
  pgm.createTable('AccessPoint', {
    accessPointId: 'id', // PK
    name: { type: 'varchar(150)', notNull: true },
    locationId: {
      type: 'integer',
      notNull: true,
      references: '"Location"',
      onDelete: 'CASCADE',
    },
    biostar_id: { type: 'varchar(100)', notNull: true, unique: true },
  });

  // TABLE: Event
  pgm.createTable('Event', {
    eventId: 'id', // PK
    accessPointId: {
      type: 'integer',
      notNull: true,
      references: '"AccessPoint"',
      onDelete: 'CASCADE',
    },
    personId: {
      type: 'integer',
      notNull: true,
      references: '"Person"',
      onDelete: 'CASCADE',
    },
    timestamp: { type: 'timestamp', notNull: true },
    eventType: { type: 'event_type_enum', notNull: true },
    biostar_eventId: { type: 'varchar(100)', unique: true },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('Event');
  pgm.dropTable('AccessPoint');
  pgm.dropTable('Document');
  pgm.dropTable('Person');
  pgm.dropTable('Location');
  
  pgm.dropType('event_type_enum');
  pgm.dropType('document_type_enum');
  pgm.dropType('country_enum');
  pgm.dropType('location_type_enum');
};
