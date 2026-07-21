const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

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
    id: `ev-${eventIdCounter++}`,
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

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`BioStar Mock API listening on port ${PORT}`);
});
