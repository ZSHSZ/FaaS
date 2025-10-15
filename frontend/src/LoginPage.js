import {useState} from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
    const [login, setLogin] =  useState('');
    const [password, setPassword] =  useState('');
    const [passwordError, setPasswordError] = useState(null);
    const [submitError, setSubmitError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleUsernameCHange = (event) => {
        setLogin(event.target.value);
    };
    const handlePasswordCHange = (event) => {
        setPassword(event.target.value);
        setPasswordError(null)
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitError(null);

        if(password.length < 8) {
            setPasswordError('Пароль должен быть не менее 8 символов');
            console.log('Форма не прошла валидацию на клиенте');
            return;
        }

        setLoading(true);

        try {
            const backendUrl = 'http://192.168.1.23:8000/login';

            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ login, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка входа');
            }

            const data = await response.json();
            console.log('Успешный ответ от бэкенда:', data);
            if (data.access_token) {
                localStorage.setItem('accessToken', data.access_token);
                localStorage.setItem('userLogin', login);
                navigate('/main');
            } else {
                throw new Error('Токен доступа не получен от сервера.');
            }
        } catch (error) {
            console.error('Ошибка при отправке данных:', error);
            setSubmitError(error.message || 'Произошла ошибка при попытке входа.');
        } finally {
            setLoading(false);
        }
    };
    const handleRegisterClick = () => {
        navigate('/register');
    }
  return (
    <div className="login-page-wrapper">
        <form onSubmit={handleSubmit} className="login-form">
            <h2>Вход</h2>
            <div className="form-group">
                <label htmlFor="login">Логин:</label>
                <input
                    type="text"
                    id="login"
                    value={login}
                    onChange={handleUsernameCHange}
                    required
                    />
            </div>
            <div className="form-group">
                <label htmlFor="password">Пароль:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={handlePasswordCHange}
                    required
                    />
                {passwordError && (
                    <p className="error-message">{passwordError}</p>
                )}
            </div>
            {submitError && (
                <p className="error-message">{submitError}</p>
            )}
            <div>
                <button type="submit" className="login-button" disabled={loading}>
                    {loading ? 'Вход...' : 'Войти'}
                </button>
                <button type="button" className="login-button" onClick={handleRegisterClick}>
                    Регитрация
                </button>
            </div>
        </form>
    </div>
  );
}

export default LoginPage;