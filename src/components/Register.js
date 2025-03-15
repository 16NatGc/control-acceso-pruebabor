import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './RegisterStyles.css';
import logoint2 from '../img/logoint2.png';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    password: '',
    id_rol: '2', // Por defecto "Residente"
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:3001/api/auth/register', formData); // Utilizando /auth/register
      alert('Usuario registrado con éxito. Por favor, inicia sesión.');
      navigate('/');
    } catch (error) {
      console.error('Error al registrar:', error.response?.data);
      setError(error.response?.data?.message || 'Error al registrar usuario. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <img src={logoint2} alt="Logo" className="register-logo" />
        <h2>Registrar</h2>
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label htmlFor="nombre">Nombre:</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="telefono">Teléfono:</label>
            <input
              type="text"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="id_rol">Rol:</label>
            <select
              id="id_rol"
              name="id_rol"
              value={formData.id_rol}
              onChange={handleChange}
              required
            >
              <option value="2">Residente</option>
              <option value="3">Mantenimiento</option>
              <option value="4">Vigilante</option>
              <option value="5">Visitante</option>
            </select>
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="register-button" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar'}
          </button>
        </form>
        <div className="signup-link">
          <p>
            ¿Ya tienes una cuenta? <button onClick={() => navigate('/')}>Inicia sesión</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;