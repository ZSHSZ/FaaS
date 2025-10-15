// src/components/WaitingPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function WaitingPage() {
  const navigate = useNavigate();
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    let intervalId;

    const checkVerificationStatus = async () => {
      try {
        const userLogin = localStorage.getItem('registeredLogin');
        if (!userLogin) {
            setErrorMessage('Не удалось найти данные пользователя для проверки.');
            setCheckingStatus(false);
            clearInterval(intervalId);
            return;
        }

        const backendUrl = `http://192.168.1.23:8000/verify-email?login=${userLogin}`;
        const response = await fetch(backendUrl);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Ошибка проверки статуса верификации');
        }

        const data = await response.json();
        if (data.is_verified) {
          console.log('Email верифицирован, перенаправление на страницу входа.');
          clearInterval(intervalId);
          localStorage.removeItem('registeredLogin');
          navigate('/');
        } else {
          console.log('Email пока не верифицирован, продолжаем ждать...');
        }
      } catch (error) {
        console.error('Ошибка при проверке статуса верификации:', error);
        setErrorMessage(error.message || 'Произошла ошибка при проверке статуса.');
        clearInterval(intervalId); // Останавливаем опрос при ошибке
        setCheckingStatus(false);
      }
    };

    intervalId = setInterval(checkVerificationStatus, 5000);

    return () => {
      clearInterval(intervalId);
      console.log('Интервал проверки статуса очищен.');
    };
  }, [navigate]);

  return (
    <div className="waiting-page-wrapper">
      <div className="waiting-message">
        <h2>Ожидание подтверждения Email</h2>
        {checkingStatus && <p>Перейдите на свою почту и подтвердите вход.</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {checkingStatus && (
            <p>
                Мы автоматически проверим статус вашей верификации.
                <br />
                Пожалуйста, не закрывайте эту страницу.
            </p>
        )}
        {!checkingStatus && !errorMessage && (
            <p>
                Email успешно подтвержден! Перенаправление на страницу входа...
            </p>
        )}
        <button onClick={() => navigate('/')} className="login-button" style={{marginTop: '20px'}}>
            Вернуться на страницу входа
        </button>
      </div>
    </div>
  );
}

export default WaitingPage;
