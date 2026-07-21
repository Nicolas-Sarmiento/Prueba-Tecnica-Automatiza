import { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import { exportToExcel } from '../lib/exportToExcel';
import { Download, Upload, Users, MapPin, Navigation } from 'lucide-react';

export default function DataPanel() {
  const [activeTab, setActiveTab] = useState<'persons' | 'locations' | 'access-points'>('persons');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [importOptions, setImportOptions] = useState({ Empleados: true, Ubicaciones: true, Accesos: true });
  const [importResult, setImportResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = localStorage.getItem('role') === 'ADMIN';

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = `/${activeTab}`;
      const response = await api.get(endpoint);
      let fetchedData = response.data.data || [];

      // Mapear y aplanar los datos según la pestaña activa para tener cabeceras amigables
      switch (activeTab) {
        case 'persons':
          fetchedData = fetchedData.map((row: any) => ({
            'ID BD': row.personId,
            'biostar_id': row.biostar_id,
            'primer_nombre': row.firstName,
            'segundo_nombre': row.secondName || '',
            'primer_apellido': row.firstLastName,
            'segundo_apellido': row.secondLastName || '',
            'tipo_doc': row.document?.documentType || '',
            'numero_documento': row.document?.documentNumber || '',
            'pais': row.document?.country || ''
          }));
          break;
        case 'locations':
          fetchedData = fetchedData.map((row: any) => ({
            'ID Sede': row.locationId,
            'codigo_ubicacion': row.locationCode,
            'nombre_ubicacion': row.name,
            'ciudad': row.city || '',
            'pais': row.country || '',
            'direccion': row.address || '',
            'aforo_maximo': row.capacity || '0',
            'activa': row.isActive ? 'SI' : 'NO',
            'ubicacion_padre_id': row.parentLocationId || ''
          }));
          break;
        case 'access-points':
          fetchedData = fetchedData.map((row: any) => ({
            'ID Puerta': row.accessPointId,
            'nombre': row.name,
            'biostar_id': row.biostar_id,
            'codigo_ubicacion': row.locationCode
          }));
          break;
      }

      setData(fetchedData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const hojas = Object.keys(importOptions).filter(k => importOptions[k as keyof typeof importOptions]).join(',');
    if (!hojas) {
      alert('Debe seleccionar al menos un tipo de dato para importar');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('hojas', hojas);

    setUploading(true);
    setImportResult(null);
    try {
      const response = await api.post('/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImportResult(response.data.data);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al cargar el archivo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExport = () => {
    if (data.length === 0) return;
    exportToExcel(data, `export_${activeTab}_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontWeight: 600 }}>Gestión de Datos</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {isAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--surface-color)', padding: '0.5rem 1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
              <label style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <input type="checkbox" checked={importOptions.Empleados} onChange={(e) => setImportOptions({...importOptions, Empleados: e.target.checked})} /> Personas
              </label>
              <label style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <input type="checkbox" checked={importOptions.Ubicaciones} onChange={(e) => setImportOptions({...importOptions, Ubicaciones: e.target.checked})} /> Ubicaciones
              </label>
              <label style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <input type="checkbox" checked={importOptions.Accesos} onChange={(e) => setImportOptions({...importOptions, Accesos: e.target.checked})} /> Accesos
              </label>
              <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)' }}></div>
              <input 
                type="file" 
                accept=".xlsx, .xls" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileUpload} 
              />
              <button 
                className="btn btn-outline" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <div className="spinner" /> : <><Upload size={16} /> Cargar Datos</>}
              </button>
            </div>
          )}
          <button className="btn btn-primary" onClick={handleExport} disabled={data.length === 0}>
            <Download size={16} /> Exportar Excel
          </button>
        </div>
      </div>

      {importResult && (
        <div className="card fade-in" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--primary-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>Resumen de Importación</h3>
            <button className="btn btn-outline" onClick={() => setImportResult(null)} style={{ padding: '0.25rem 0.5rem' }}>Cerrar</button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {Object.entries(importResult.summary || {}).map(([sheet, stats]: [string, any]) => (
              <div key={sheet} style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius)' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{sheet}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--success-color)' }}>Agregados: {stats.created}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--primary-color)' }}>Actualizados: {stats.updated}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--danger-color)' }}>Rechazados: {stats.rejected}</div>
              </div>
            ))}
          </div>

          {importResult.errors && importResult.errors.length > 0 && (
            <div>
              <h4 style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--danger-color)', marginBottom: '0.5rem' }}>Errores ({importResult.errors.length}):</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto', backgroundColor: '#fee2e2', borderRadius: 'var(--radius)', padding: '0.5rem' }}>
                <table className="table" style={{ fontSize: '0.75rem', backgroundColor: 'transparent' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '0.5rem' }}>Hoja</th>
                      <th style={{ padding: '0.5rem' }}>Fila</th>
                      <th style={{ padding: '0.5rem' }}>Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importResult.errors.map((err: any, i: number) => (
                      <tr key={i}>
                        <td style={{ padding: '0.5rem' }}>{err.sheet}</td>
                        <td style={{ padding: '0.5rem' }}>{err.row}</td>
                        <td style={{ padding: '0.5rem' }}>{err.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'persons' ? 'active' : ''}`}
            onClick={() => setActiveTab('persons')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Users size={16} /> Personas
          </button>
          <button 
            className={`tab ${activeTab === 'locations' ? 'active' : ''}`}
            onClick={() => setActiveTab('locations')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <MapPin size={16} /> Ubicaciones
          </button>
          <button 
            className={`tab ${activeTab === 'access-points' ? 'active' : ''}`}
            onClick={() => setActiveTab('access-points')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Navigation size={16} /> Puntos de Acceso
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <div className="spinner" />
          </div>
        ) : (
          <div className="table-wrapper">
            {data.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    {Object.keys(data[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, index) => (
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
                No hay datos para mostrar
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
