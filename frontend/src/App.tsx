import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DataPanel from './pages/DataPanel';
import QueryPanel from './pages/QueryPanel';
import OccupancyPanel from './pages/OccupancyPanel';
import Layout from './components/Layout';

function App() {
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/data" />} />
        
        <Route element={<Layout />}>
          <Route path="/data" element={isAuthenticated ? <DataPanel /> : <Navigate to="/login" />} />
          <Route path="/queries" element={isAuthenticated ? <QueryPanel /> : <Navigate to="/login" />} />
          <Route path="/occupancy" element={isAuthenticated ? <OccupancyPanel /> : <Navigate to="/login" />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
