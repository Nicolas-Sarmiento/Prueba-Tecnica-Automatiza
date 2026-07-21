import { useState, useEffect } from 'react';
import api from '../lib/api';
import { exportToExcel } from '../lib/exportToExcel';
import { Search, Download } from 'lucide-react';

export default function QueryPanel() {
  const [locations, setLocations] = useState<any[]>([]);
  const [locationId, setLocationId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await api.get('/locations');
        setLocations(res.data.data || []);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    fetchLocations();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !locationId) return;

    setLoading(true);
    try {
      // Ensure backend receives ISO format dates including timezone considerations
      const startIso = new Date(`${startDate}T00:00:00`).toISOString();
      const endIso = new Date(`${endDate}T23:59:59`).toISOString();

      const response = await api.get('/reports/events', {
        params: { startDate: startIso, endDate: endIso, locationId }
      });
      const data = response.data.map( (row: any) => ({
        "evento_id": row.eventId,
        "timestamp": row.timestamp,
        "biostar_event_id": row.biostar_eventId,
        "biostar_id_persona": row.person_biostar_id,
        "tipo_evento": row.eventType,
        "primer_nombre": row.firstName,
        "primer_apellido": row.firstLastName,
        "tipo_doc": row.documentType,
        "documento": row.documentNumber,
        "ubicacion": row.locationName,
        "punto_acceso": row.accessPointName
      }));
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      alert('Error al consultar eventos.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (events.length === 0) return;
    exportToExcel(events, `events_report_${startDate}_to_${endDate}`);
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontWeight: 600 }}>Consultas de Eventos</h2>
        <button className="btn btn-primary" onClick={handleExport} disabled={events.length === 0}>
          <Download size={16} /> Exportar Excel
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
            <label className="form-label">Sede (Ubicación)</label>
            <select 
              className="form-control" 
              value={locationId} 
              onChange={(e) => setLocationId(e.target.value)}
              required
            >
              <option value="">Seleccione una sede...</option>
              {locations.map(loc => (
                <option key={loc.locationId} value={loc.locationId}>{loc.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '150px' }}>
            <label className="form-label">Fecha Inicio</label>
            <input 
              type="date" 
              className="form-control" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '150px' }}>
            <label className="form-label">Fecha Fin</label>
            <input 
              type="date" 
              className="form-control" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: '42px' }}>
            {loading ? <div className="spinner" /> : <><Search size={16} /> Buscar</>}
          </button>
        </form>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <div className="spinner" />
          </div>
        ) : (
          <div className="table-wrapper">
            {events.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    {Object.keys(events[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {events.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((val: any, i) => (
                        <td key={i}>{val !== null && typeof val === 'object' ? JSON.stringify(val) : String(val)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No hay eventos para los filtros seleccionados
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
