const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
app.use(express.json());
app.use(cors());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// In-memory store for events
let events = [];
let eventIdCounter = Date.now();

// Endpoint to generate an event (used externally to simulate access)
app.post('/api/events', (req, res) => {
  const { user_id, device_id, type } = req.body;
  if (!user_id || !device_id || !type) {
    return res.status(400).json({ error: 'Missing required fields: user_id, device_id, type' });
  }

  const newEvent = {
    id: `ev-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`,
    datetime: req.body.datetime ? new Date(req.body.datetime).toISOString() : new Date().toISOString(),
    user_id: user_id, // biostar_id of Person
    device_id: device_id, // biostar_id of AccessPoint
    type: type // 'ENTRADA' or 'SALIDA'
  };

  events.push(newEvent);
  res.status(201).json(newEvent);
});

// Endpoint to fetch events based on a datetime filter (simulating BioStar's event search)
app.get('/api/events/search', (req, res) => {
  const { start_datetime, end_datetime } = req.query;
  
  let filteredEvents = events;
  if (start_datetime) {
    filteredEvents = filteredEvents.filter(e => new Date(e.datetime) >= new Date(start_datetime));
  }
  if (end_datetime) {
    filteredEvents = filteredEvents.filter(e => new Date(e.datetime) <= new Date(end_datetime));
  }

  res.json({
    EventCollection: {
      rows: filteredEvents
    }
  });
});

// Get all stored events (for debugging)
app.get('/api/events', (req, res) => {
  res.json(events);
});

// Populate historical data on startup
function generateHistoricalEvents() {
  const employees = ['91120', '91006', '91102', '91026', '91122'];
  const devices = ['1', '2', '3', '4', '5'];

  for (let i = 7; i > 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    for (const emp of employees) {
      const entryTime = new Date(date);
      entryTime.setHours(8, Math.floor(Math.random() * 30), 0, 0);
      
      const exitTime = new Date(date);
      exitTime.setHours(17, Math.floor(Math.random() * 30), 0, 0);

      const device = devices[Math.floor(Math.random() * devices.length)];

      events.push({
        id: `ev-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`,
        datetime: entryTime.toISOString(),
        user_id: emp,
        device_id: device,
        type: 'ENTRADA'
      });

      events.push({
        id: `ev-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`,
        datetime: exitTime.toISOString(),
        user_id: emp,
        device_id: device,
        type: 'SALIDA'
      });
    }
  }
  console.log(`[BioStar Mock] Generados ${events.length} eventos históricos en memoria.`);
}

generateHistoricalEvents();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`BioStar Mock API listening on port ${PORT}`);
});
