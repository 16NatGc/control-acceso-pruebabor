import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import './LoginStyles.css';
import logoint2 from '../img/logoint2.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const captchaRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadReCaptcha = () => {
            if (!window.grecaptcha) {
                const script = document.createElement('script');
                script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
                script.async = true;
                script.defer = true;
                script.onload = () => console.log('reCAPTCHA script cargado correctamente');
                script.onerror = () => console.error('Error al cargar el script de reCAPTCHA');
                document.body.appendChild(script);
            } else {
                console.log('reCAPTCHA ya está cargado');
            }
        };
        loadReCaptcha();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const captchaResponse = showCaptcha ? captchaRef.current?.getValue() : null;

        if (showCaptcha && !captchaResponse) {
            setError('Por favor, completa la verificación de reCAPTCHA.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:3001/api/auth/login', {
                email,
                password,
                captchaResponse,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const { token, roleName } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('roleName', roleName);

            setFailedAttempts(0);
            setShowCaptcha(false);
            if (captchaRef.current) captchaRef.current.reset();

            switch (roleName) {
                case 'Admin':
                    navigate('/admin');
                    break;
                case 'Residente':
                    navigate('/resident');
                    break;
                case 'Mantenimiento':
                    navigate('/maintenance');
                    break;
                case 'Vigilante':
                    navigate('/guard');
                    break;
                case 'Visitante':
                    navigate('/visitor');
                    break;
                default:
                    setError('Rol no reconocido. Contacta al administrador.');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
            setError(message);

            setFailedAttempts((prev) => {
                const newAttempts = prev + 1;
                if (newAttempts >= 3 && !showCaptcha) {
                    setShowCaptcha(true);
                }
                return newAttempts;
            });

            if (showCaptcha && captchaRef.current) {
                captchaRef.current.reset();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRecaptchaChange = (value) => {
        console.log('reCAPTCHA completado:', value);
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <img src={logoint2} alt="Logo" className="login-logo" />
                <h2>Iniciar Sesión</h2>
                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label htmlFor="email">Correo Electrónico:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Contraseña:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {showCaptcha && (
                        <div className="recaptcha-container">
                            <ReCAPTCHA
                                ref={captchaRef}
                                sitekey="6LeKnNwqAAAAAJFOjvm6lZIsTZgeQvOUguuJWTSa"
                                onChange={handleRecaptchaChange}
                            />
                        </div>
                    )}

                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Iniciando...' : 'Acceder'}
                    </button>
                </form>

                <div className="signup-link">
                    <p>
                        ¿No tienes una cuenta? <button onClick={() => navigate('/register')}>Registrar</button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;