import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Activity, MapPin } from 'lucide-react';
import { exportToExcel } from '../lib/exportToExcel';
import { Download } from 'lucide-react';

export default function OccupancyPanel() {
  const [occupancyData, setOccupancyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOccupancy = async () => {
    try {
      const response = await api.get('/reports/occupancy');
      setOccupancyData(response.data);
    } catch (error) {
      console.error('Error fetching occupancy:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOccupancy();
    const interval = setInterval(fetchOccupancy, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleExport = () => {
    if (occupancyData.length === 0) return;
    exportToExcel(occupancyData, `occupancy_report_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontWeight: 600 }}>Nivel de Ocupación</h2>
        <button className="btn btn-primary" onClick={handleExport} disabled={occupancyData.length === 0}>
          <Download size={16} /> Exportar Excel
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <div className="spinner" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {occupancyData.map((loc) => {
            const current = loc.occupancyLevel || 0;
            const capacity = loc.capacity || 0;
            const percentage = capacity > 0 ? (current / capacity) * 100 : 0;
            const isNearLimit = percentage >= 90;
            
            return (
              <div key={loc.locationId} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: isNearLimit ? 'var(--danger-color)' : 'var(--primary-color)' }} />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  <MapPin size={18} style={{ color: 'var(--primary-color)' }} />
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>{loc.name}</h3>
                </div>
                
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Código: <strong>{loc.locationCode}</strong>
                </div>
                

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Ocupación</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: isNearLimit ? 'var(--danger-color)' : 'var(--text-primary)' }}>
                    {current} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 400 }}>/ {capacity}</span>
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${Math.min(percentage, 100)}%`, 
                    backgroundColor: isNearLimit ? 'var(--danger-color)' : 'var(--primary-color)',
                    transition: 'width 0.5s ease-in-out'
                  }} />
                </div>
                
                {isNearLimit && (
                  <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Activity size={12} /> Alta ocupación detectada
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
