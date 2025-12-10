import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';

const API_URL = 'http://localhost:3000/api/auth/login';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [captchaValue, setCaptchaValue] = useState(null); // Estado para el valor del CAPTCHA
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // 🔑 NOTA IMPORTANTE: Reemplaza con tu propia clave pública de reCAPTCHA
    const RECAPTCHA_SITE_KEY = '6LcqZiYsAAAAABPTrvAnGBqaUVzNPzYTlPIQtokf';

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        // 1. Verificar CAPTCHA (Requisito de seguridad)
        if (!captchaValue) {
            setError('Por favor, completa el CAPTCHA.');
            return;
        }

        try {
            // 2. Llamada al Backend para autenticación
            const response = await axios.post(API_URL, { email, password });

            // 3. Almacenar JWT y Rol (Manejo de sesión)
            const token = response.data.token;
            const rol = response.data.user.rol;

            localStorage.setItem('token', token);
            localStorage.setItem('rol', rol);

            // 4. Redirigir según el rol
            navigate('/dashboard');

        } catch (err) {
            // 401 Unauthorized o 400 Bad Request
            setError(err.response?.data?.message || 'Error de conexión. Inténtalo de nuevo.');
        }
    };

    // Manejar el cambio de valor del CAPTCHA
    const handleCaptchaChange = (value) => {
        setCaptchaValue(value);
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
                    />
                </div>

                <button
                    type="submit"
                    disabled={!captchaValue} // Deshabilita si el CAPTCHA no está completo
                    style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white' }}
                >
                    Ingresar
                </button>
            </form>
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        </div>
    );
};

export default Login;