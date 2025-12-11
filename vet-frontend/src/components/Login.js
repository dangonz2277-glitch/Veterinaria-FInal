import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';

const API_URL = 'https://veterinaria-final-1.onrender.com/api/auth/login'; //

const Login = () => {
    const [email, setEmail] = useState(''); //
    const [password, setPassword] = useState(''); //
    const [captchaValue, setCaptchaValue] = useState(null); //
    const [error, setError] = useState(''); //
    const [isConnecting, setIsConnecting] = useState(false);

    const navigate = useNavigate(); //

    // Clave Pública de reCAPTCHA
    const RECAPTCHA_SITE_KEY = '6LcYGygsAAAAAOLuSBWnWV9Nu-ngJrRmdNhgPTdp'; //

    const handleLogin = async (e) => {
        e.preventDefault(); //
        setError(''); //

        // 1. Verificar CAPTCHA
        if (!captchaValue) { //
            setError('Por favor, completa el CAPTCHA.'); //
            return;
        }

        // 🛑 ACTIVAR EL POPUP DE CARGA antes de la llamada a la API
        setIsConnecting(true);

        try {
            // 2. Llamada al Backend para autenticación (Aquí empieza el delay)
            const response = await axios.post(API_URL, { email, password }); //

            // 3. Almacenar JWT y Rol (Manejo de sesión)
            const token = response.data.token; //
            const rol = response.data.user.rol; //

            localStorage.setItem('token', token); //
            localStorage.setItem('rol', rol); //

            // 4. Redirigir. El componente deja de renderizarse aquí.
            navigate('/dashboard'); //

        } catch (err) {
            // 🛑 DESACTIVAR el popup y mostrar error
            setIsConnecting(false);
            setError(err.response?.data?.message || 'Error de conexión. Inténtalo de nuevo.'); //
        }
    };

    const handleCaptchaChange = (value) => { //
        setCaptchaValue(value); //
    };

    // --- ESTILOS DEL POPUP (Asegúrate de que el 'spin' se agregue en tu CSS principal) ---
    const popupStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    };

    const popupContentStyle = {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        color: '#333'
    };

    const spinnerStyle = {
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #007bff',
        borderRadius: '50%',
        width: '30px',
        height: '30px',
        display: 'inline-block',
        animation: 'spin 1s linear infinite'
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <h2>🩺 Login Veterinaria</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ display: 'block', width: '100%', padding: '10px', margin: '10px 0' }}
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ display: 'block', width: '100%', padding: '10px', margin: '10px 0' }}
                />

                {/* Integración del CAPTCHA */}
                <div style={{ margin: '15px 0' }}>
                    <ReCAPTCHA
                        sitekey={RECAPTCHA_SITE_KEY}
                        onChange={handleCaptchaChange}
                        disabled={isConnecting}
                    />
                </div>

                <button
                    type="submit"
                    // Deshabilitar si Captcha no está completo O si está cargando
                    disabled={!captchaValue || isConnecting}
                    style={{ width: '100%', padding: '10px', backgroundColor: isConnecting ? '#6c757d' : '#007bff', color: 'white' }}
                >
                    {isConnecting ? 'Conectando...' : 'Ingresar'}
                </button>
            </form>
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

            {/* 🛑 POPUP DE CARGA: Se muestra solo cuando isConnecting es true */}
            {isConnecting && (
                <div style={popupStyle}>
                    <div style={popupContentStyle}>
                        <div style={spinnerStyle}></div>
                        <h4 style={{ margin: '15px 0 5px 0' }}>Conectando al Servidor</h4>
                        <p style={{ margin: 0, fontSize: '0.9em' }}>
                            Por favor, espere. El servidor de Render puede tardar unos segundos en despertar.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;