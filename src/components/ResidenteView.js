import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ResidenteViewStyles.css';
import userIcon from '../img/clientes.png';
import { FaEye, FaTimes } from 'react-icons/fa';
import { Modal, Button } from 'react-bootstrap'; // Importamos Modal y Button de react-bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';

const ResidenteView = () => {
    const [data, setData] = useState([]);
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedResident, setSelectedResident] = useState(null);

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

    const handleViewDetails = (resident) => {
        setSelectedResident(resident);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
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
                    <h2>Vista de Datos de Residente</h2>
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
                                        onClick={() => handleViewDetails(item)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Modal show={showModal} onHide={handleCloseModal} className="resident-details-modal">
                    <Modal.Header>
                        <Modal.Title>Detalles del Residente</Modal.Title>
                        <Button variant="outline-secondary" onClick={handleCloseModal}>
                            <FaTimes />
                        </Button>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedResident && (
                            <div>
                                <p><strong>ID Usuario:</strong> {selectedResident.id_usuario}</p>
                                <p><strong>Nombre:</strong> {selectedResident.nombre}</p>
                                <p><strong>Teléfono:</strong> {selectedResident.telefono}</p>
                                <p><strong>Email:</strong> {selectedResident.email}</p>
                            </div>
                        )}
                    </Modal.Body>
                </Modal>
            </div>
        </div>
    );
};

export default ResidenteView;