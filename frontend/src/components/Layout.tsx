import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Database, Search, Activity } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
    window.location.reload(); // To force remount and check auth
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand" style={{ fontWeight: 600, fontSize: '1.25rem' }}>
          Access Control
        </div>
        <div className="nav-links">
          <NavLink to="/data" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={18} /> Datos
          </NavLink>
          <NavLink to="/queries" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={18} /> Consultas
          </NavLink>
          <NavLink to="/occupancy" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} /> Ocupación
          </NavLink>
        </div>
        <button onClick={handleLogout} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LogOut size={16} /> Salir
        </button>
      </nav>
      <main className="container fade-in">
        <Outlet />
      </main>
    </>
  );
}
