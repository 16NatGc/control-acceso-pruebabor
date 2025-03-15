import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './VigilanteViewStyles.css';
import userIcon from '../img/clientes.png';
import { FaEye } from 'react-icons/fa';

const VigilanteView = () => {
    const [data, setData] = useState([]);
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const decodedToken = JSON.parse(atob(token.split('.')[1]));
                const userRoleId = decodedToken.role;
                const userNameFromToken = decodedToken.nombre;

                const response = await axios.get('http://localhost:3001/api/usuarios', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const filteredData = response.data.filter(user => user.id_rol === userRoleId);
                setData(filteredData);
                setUserName(userNameFromToken);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleViewDetails = (id) => {
        alert(`Ver detalles del usuario con ID: ${id}`);
    };

    const highlightMatch = (text, searchTerm) => {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, index) => {
            if (regex.test(part)) {
                return (
                    <span key={index} className="highlighted">
                        {part}
                    </span>
                );
            } else {
                return part;
            }
        });
    };

    const filteredData = data.filter((item) => {
        return (
            item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.telefono.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div className="residente-view-container">
            <div className="residente-view-box">
                <div className="header">
                    <h2>Vista de Datos de Vigilante</h2>
                    <div className="user-info">
                        <div className="user-profile">
                            <img src={userIcon} alt="User Icon" className="user-icon" />
                            <span className="user-name">{userName}</span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
                </div>
                <input
                    type="text"
                    placeholder="Buscar..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <table>
                    <thead>
                        <tr>
                            <th>ID Usuario</th>
                            <th>Nombre</th>
                            <th>Teléfono</th>
                            <th>Email</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map(item => (
                            <tr key={item.id_usuario}>
                                <td>{highlightMatch(item.id_usuario.toString(), searchTerm)}</td>
                                <td>{highlightMatch(item.nombre, searchTerm)}</td>
                                <td>{highlightMatch(item.telefono, searchTerm)}</td>
                                <td>{highlightMatch(item.email, searchTerm)}</td>
                                <td>
                                    <FaEye
                                        className="view-details-icon"
                                        onClick={() => handleViewDetails(item.id_usuario)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VigilanteView;