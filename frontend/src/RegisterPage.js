// src/RegisterPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUsernameChange = (event) => {
    setLogin(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    setEmailError(null);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    setPasswordError(null);
  };

  const handleRegistrationEnding = async (event) => {
    event.preventDefault();
    setSubmitError(null);
    setEmailError(null);
    setPasswordError(null);

    let isValid = true;
    const emailRegex = /^[^@\s]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setEmailError('Пожалуйста, введите корректный email');
      isValid = false;
    }
    if (password.length < 8) {
      setPasswordError('Пароль должен быть не менее 8 символов');
      isValid = false;
    }
    if (!login.trim()) {
      // Можно добавить сообщение об ошибке для логина, если требуется
      // setSubmitError('Пожалуйста, введите имя пользователя.');
      isValid = false;
    }

    if (!isValid) {
      console.log('Форма регистрации не прошла валидацию на клиенте');
      return;
    }

    setLoading(true);

    try {
      // !!! ВАЖНО: Убедитесь, что этот URL правильный для вашего бэкенда !!!
      const backendUrl = 'http://192.168.1.23:8000/register';

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка регистрации');
      }

      const data = await response.json();
      console.log('Успешный ответ от бэкенда:', data);

      localStorage.setItem('registeredLogin', login);

      navigate('/waiting');

    } catch (error) {
      console.error('Ошибка при отправке данных регистрации:', error);
      setSubmitError(error.message || 'Произошла ошибка при попытке регистрации.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/');
  };

  return (
    <div className="register-page-wrapper">
      <div className="register-form-container">
        <h2 className="register-title">Регистрация</h2>
        <form onSubmit={handleRegistrationEnding} className="register-form" noValidate>
          <div className="form-group">
            <input
              type="text"
              id="login"
              value={login}
              onChange={handleUsernameChange}
              placeholder="Имя пользователя"
              required
            />
            {/* Ошибка для логина, если необходимо */}
          </div>
          <div className="form-group">
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Email"
              required
              className={emailError ? 'input-error' : ''}
            />
            {emailError && (
              <p className="error-message">{emailError}</p>
            )}
          </div>

          <div className="form-group">
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Пароль"
              required
              className={passwordError ? 'input-error' : ''}
            />
            {passwordError && (
              <p className="error-message">{passwordError}</p>
            )}
          </div>

          {submitError && (
            <p className="error-message">{submitError}</p>
          )}

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? 'Регистрация...' : 'Регистрация'}
          </button>
        </form>
        <div className="login-bottom-section">
            <button type="button" className="login-switch-button" onClick={handleLoginClick} disabled={loading}>
                Вход
            </button>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
