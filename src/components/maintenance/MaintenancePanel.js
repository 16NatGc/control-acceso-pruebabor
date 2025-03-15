import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import './MaintenancePanel.css';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const MaintenancePanel = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [accessHistory, setAccessHistory] = useState([]);
  const [cars, setCars] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [accessCodes, setAccessCodes] = useState([]);
  const [newCar, setNewCar] = useState({ placa: '', modelo: '', color: '' });
  const [editCar, setEditCar] = useState(null);
  const [newGeneratedCode, setNewGeneratedCode] = useState(null);
  const [selectedCarId, setSelectedCarId] = useState(null); // Nuevo estado para el auto seleccionado
  const [expirationDate, setExpirationDate] = useState('2025-12-31T23:59'); // Nuevo estado para la fecha de expiración
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || localStorage.getItem('roleName') !== 'Mantenimiento') {
      setError('No tienes permisos para esta sección.');
      localStorage.removeItem('token');
      localStorage.removeItem('roleName');
      navigate('/', { replace: true });
      return;
    }
    fetchData();
  }, [activeSection, navigate]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');

    try {
      if (activeSection === 'dashboard' || activeSection === 'access') {
        try {
          const accessResponse = await axios.get('http://localhost:3001/api/maintenance/access', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAccessHistory(accessResponse.data || []);
        } catch (err) {
          console.error('Error al obtener historial de accesos:', err.response?.data || err.message);
          setAccessHistory([]);
        }
      }

      if (activeSection === 'dashboard' || activeSection === 'cars' || activeSection === 'access-codes') {
        try {
          const carsResponse = await axios.get('http://localhost:3001/api/maintenance/cars', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCars(carsResponse.data || []);
        } catch (err) {
          console.error('Error al obtener autos:', err.response?.data || err.message);
          setCars([]);
        }
      }

      if (activeSection === 'dashboard' || activeSection === 'access-codes') {
        try {
          const codesResponse = await axios.get('http://localhost:3001/api/maintenance/access-codes', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAccessCodes(codesResponse.data || []);
        } catch (err) {
          console.error('Error al obtener códigos de acceso:', err.response?.data || err.message);
          setAccessCodes([]);
        }

        try {
          const sensorsResponse = await axios.get('http://localhost:3001/api/maintenance/sensors', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setSensors(sensorsResponse.data || []);
        } catch (err) {
          console.error('Error al obtener sensores:', err.response?.data || err.message);
          setSensors([]);
        }
      }
    } catch (error) {
      console.error(`Error general al obtener datos para ${activeSection}:`, error);
      setError(error.response?.data?.message || `Error al cargar los datos de ${activeSection}`);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('roleName');
        navigate('/', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('roleName');
    navigate('/', { replace: true });
  };

  const handleGenerateCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const formattedExpirationDate = new Date(expirationDate).toISOString().replace('T', ' ').substring(0, 19);
      const response = await axios.post(
        'http://localhost:3001/api/maintenance/generate-code',
        {
          id_auto: selectedCarId,
          fecha_expiracion: formattedExpirationDate,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewGeneratedCode(response.data);
      fetchData();
    } catch (error) {
      console.error('Error al generar el código:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Error al generar el código');
    } finally {
      setLoading(false);
    }
  };

  const handleInsertCar = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.post('http://localhost:3001/api/maintenance/cars', newCar, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Auto registrado con éxito');
      setNewCar({ placa: '', modelo: '', color: '' });
      fetchData();
    } catch (error) {
      console.error('Error al registrar auto:', error);
      setError(error.response?.data?.message || 'Error al registrar el auto');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCar = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axios.put(`http://localhost:3001/api/maintenance/cars/${id}`, editCar, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Auto actualizado con éxito');
      setEditCar(null);
      fetchData();
    } catch (error) {
      console.error('Error al actualizar auto:', error);
      setError(error.response?.data?.message || 'Error al actualizar el auto');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCar = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este auto?')) {
      setLoading(true);
      setError(null);
      try {
        await axios.delete(`http://localhost:3001/api/maintenance/cars/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        alert('Auto eliminado con éxito');
        fetchData();
      } catch (error) {
        console.error('Error al eliminar auto:', error);
        setError(error.response?.data?.message || 'Error al eliminar el auto');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteAccessCode = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este código de acceso?')) {
      setLoading(true);
      setError(null);
      try {
        await axios.delete(`http://localhost:3001/api/maintenance/access-codes/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        alert('Código de acceso eliminado con éxito');
        fetchData();
      } catch (error) {
        console.error('Error al eliminar código de acceso:', error);
        setError(error.response?.data?.message || 'Error al eliminar el código de acceso');
      } finally {
        setLoading(false);
      }
    }
  };

  const accessChartData = {
    labels: accessHistory.map((entry) => new Date(entry.fecha_entrada).toLocaleDateString()),
    datasets: [
      {
        label: 'Entradas',
        data: accessHistory.map((entry) => (entry.fecha_entrada ? 1 : 0)),
        backgroundColor: '#4CAF50',
      },
      {
        label: 'Salidas',
        data: accessHistory.map((entry) => (entry.fecha_salida ? 1 : 0)),
        backgroundColor: '#FF6384',
      },
    ],
  };

  const sensorChartData = {
    labels: ['Libre', 'Ocupado'],
    datasets: [
      {
        data: [
          sensors.filter((sensor) => sensor.estado === 'Libre').length,
          sensors.filter((sensor) => sensor.estado === 'Ocupado').length,
        ],
        backgroundColor: ['#36A2EB', '#FFCE56'],
      },
    ],
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="admin-panel">
      <button className="toggle-sidebar" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        <i className={isSidebarOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
      </button>
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <h2 className="sidebar-title">Control Acceso</h2>
        <ul className="sidebar-menu">
          <li>
            <button
              onClick={() => {
                setActiveSection('dashboard');
                setIsSidebarOpen(false);
              }}
              className={activeSection === 'dashboard' ? 'active' : ''}
            >
              <i className="fas fa-tachometer-alt"></i> Dashboard
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                setActiveSection('access');
                setIsSidebarOpen(false);
              }}
              className={activeSection === 'access' ? 'active' : ''}
            >
              <i className="fas fa-history"></i> Mis Accesos
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                setActiveSection('cars');
                setIsSidebarOpen(false);
              }}
              className={activeSection === 'cars' ? 'active' : ''}
            >
              <i className="fas fa-car"></i> Mis Autos
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                setActiveSection('access-codes');
                setIsSidebarOpen(false);
              }}
              className={activeSection === 'access-codes' ? 'active' : ''}
            >
              <i className="fas fa-key"></i> Códigos de Acceso
            </button>
          </li>
          <li>
            <button onClick={handleLogout} className="logout-button">
              <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
            </button>
          </li>
        </ul>
      </div>
      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="content-header">
          <h1>
            {activeSection === 'dashboard' && 'Dashboard Mantenimiento'}
            {activeSection === 'access' && 'Mis Accesos'}
            {activeSection === 'cars' && 'Mis Autos'}
            {activeSection === 'access-codes' && 'Códigos de Acceso'}
          </h1>
        </div>
        <div className="content-body">
          <div className="content-sections">
            <div className="form-column">
              {activeSection === 'dashboard' && (
                <div className="dashboard-section">
                  <div className="dashboard-card">
                    <h3>Historial de Accesos</h3>
                    <Bar data={accessChartData} />
                  </div>
                  <div className="dashboard-card">
                    <h3>Estado de Sensores</h3>
                    <Doughnut data={sensorChartData} />
                  </div>
                  <div className="dashboard-card">
                    <h3>Autos Registrados</h3>
                    <p>{cars.length}</p>
                  </div>
                  <div className="dashboard-card">
                    <h3>Códigos Activos</h3>
                    <p>{accessCodes.filter((code) => code.estado === 'Activo').length}</p>
                  </div>
                </div>
              )}

              {activeSection === 'access' && (
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Fecha Entrada</th>
                      <th>Fecha Salida</th>
                      <th>Vigilante</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accessHistory.length === 0 ? (
                      <tr>
                        <td colSpan="4">No hay accesos registrados.</td>
                      </tr>
                    ) : (
                      accessHistory.map((access) => (
                        <tr key={access.id_detalle_acceso}>
                          <td>{access.id_detalle_acceso}</td>
                          <td>{access.fecha_entrada}</td>
                          <td>{access.fecha_salida || 'N/A'}</td>
                          <td>{access.id_vigilante || 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {activeSection === 'cars' && (
                <form onSubmit={handleInsertCar} className="form-section">
                  <div className="form-group">
                    <label>Placa</label>
                    <input
                      type="text"
                      placeholder="Placa"
                      value={newCar.placa}
                      onChange={(e) => setNewCar({ ...newCar, placa: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Modelo</label>
                    <input
                      type="text"
                      placeholder="Modelo"
                      value={newCar.modelo}
                      onChange={(e) => setNewCar({ ...newCar, modelo: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Color</label>
                    <input
                      type="text"
                      placeholder="Color"
                      value={newCar.color}
                      onChange={(e) => setNewCar({ ...newCar, color: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-submit">
                      Agregar
                    </button>
                    <button type="button" className="btn-cancel" onClick={() => setNewCar({ placa: '', modelo: '', color: '' })}>
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {activeSection === 'access-codes' && (
                <div className="form-section">
                  <h3>Generar Nuevo Código</h3>
                  <div className="form-group">
                    <label>Seleccionar Auto (Opcional)</label>
                    <select
                      value={selectedCarId || ''}
                      onChange={(e) => setSelectedCarId(e.target.value ? parseInt(e.target.value) : null)}
                    >
                      <option value="">Sin auto</option>
                      {cars.map((car) => (
                        <option key={car.id_auto} value={car.id_auto}>
                          {car.placa} - {car.modelo}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Fecha de Expiración</label>
                    <input
                      type="datetime-local"
                      value={expirationDate}
                      onChange={(e) => setExpirationDate(e.target.value)}
                      required
                    />
                  </div>
                  <button onClick={handleGenerateCode} className="btn-submit" disabled={loading}>
                    {loading ? 'Generando...' : 'Generar Código'}
                  </button>
                  {newGeneratedCode && (
                    <div className="generated-code">
                      <p>
                        <strong>Código:</strong> {newGeneratedCode.code}
                      </p>
                      <p>
                        <strong>Fecha de Expiración:</strong>{' '}
                        {newGeneratedCode.fecha_expiracion
                          ? new Date(newGeneratedCode.fecha_expiracion).toLocaleString()
                          : 'Nunca'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="table-column">
              {activeSection === 'dashboard' && (
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Fecha Entrada</th>
                      <th>Fecha Salida</th>
                      <th>Vigilante</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accessHistory.length === 0 ? (
                      <tr>
                        <td colSpan="3">No hay accesos recientes.</td>
                      </tr>
                    ) : (
                      accessHistory.slice(0, 5).map((access) => (
                        <tr key={access.id_detalle_acceso}>
                          <td>{access.fecha_entrada}</td>
                          <td>{access.fecha_salida || 'N/A'}</td>
                          <td>{access.id_vigilante || 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {activeSection === 'access' && (
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Fecha Entrada</th>
                      <th>Fecha Salida</th>
                      <th>Vigilante</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accessHistory.length === 0 ? (
                      <tr>
                        <td colSpan="4">No hay accesos registrados.</td>
                      </tr>
                    ) : (
                      accessHistory.map((access) => (
                        <tr key={access.id_detalle_acceso}>
                          <td>{access.id_detalle_acceso}</td>
                          <td>{access.fecha_entrada}</td>
                          <td>{access.fecha_salida || 'N/A'}</td>
                          <td>{access.id_vigilante || 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {activeSection === 'cars' && (
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Placa</th>
                      <th>Modelo</th>
                      <th>Color</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cars.length === 0 ? (
                      <tr>
                        <td colSpan="5">No hay autos registrados.</td>
                      </tr>
                    ) : (
                      cars.map((car) => (
                        <tr key={car.id_auto}>
                          <td>{car.id_auto}</td>
                          <td>
                            {editCar && editCar.id_auto === car.id_auto ? (
                              <input
                                type="text"
                                value={editCar.placa}
                                onChange={(e) => setEditCar({ ...editCar, placa: e.target.value })}
                              />
                            ) : (
                              car.placa
                            )}
                          </td>
                          <td>
                            {editCar && editCar.id_auto === car.id_auto ? (
                              <input
                                type="text"
                                value={editCar.modelo}
                                onChange={(e) => setEditCar({ ...editCar, modelo: e.target.value })}
                              />
                            ) : (
                              car.modelo
                            )}
                          </td>
                          <td>
                            {editCar && editCar.id_auto === car.id_auto ? (
                              <input
                                type="text"
                                value={editCar.color}
                                onChange={(e) => setEditCar({ ...editCar, color: e.target.value })}
                              />
                            ) : (
                              car.color
                            )}
                          </td>
                          <td>
                            {editCar && editCar.id_auto === car.id_auto ? (
                              <>
                                <button onClick={() => handleUpdateCar(car.id_auto)} className="btn-action">
                                  Guardar
                                </button>
                                <button onClick={() => setEditCar(null)} className="btn-action">
                                  Cancelar
                                </button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => setEditCar(car)} className="btn-action">
                                  Editar
                                </button>
                                <button onClick={() => handleDeleteCar(car.id_auto)} className="btn-action">
                                  Eliminar
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {activeSection === 'access-codes' && (
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Código</th>
                      <th>Estado</th>
                      <th>Fecha Expiración</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accessCodes.length === 0 ? (
                      <tr>
                        <td colSpan="5">No hay códigos de acceso registrados.</td>
                      </tr>
                    ) : (
                      accessCodes.map((code) => (
                        <tr key={code.id_acceso}>
                          <td>{code.id_acceso}</td>
                          <td>{code.codigo}</td>
                          <td>{code.estado}</td>
                          <td>{code.fecha_expiracion || 'N/A'}</td>
                          <td>
                            <button onClick={() => handleDeleteAccessCode(code.id_acceso)} className="btn-action">
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePanel;
