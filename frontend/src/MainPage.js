import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function MainPage() {
  const navigate = useNavigate();
  const [userLogin, setUserLogin] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [generatedJson, setGeneratedJson] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  const fileInputRef = useRef(null);

  const getInitialCode = (lang) => {
    if (lang === 'python') {
      return `def my_python_function(arg1, arg2):\n    # Ваш код на Python\n    result = arg1 + arg2\n    return result`;
    } else if (lang === 'go') {
      return `package main\n\nimport "fmt"\n\nfunc MyGoFunction(arg1, arg2 int) int {\n\t// Ваш код на Go\n\tresult := arg1 + arg2\n\treturn result\n}`;
    }
    return '';
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedLogin = localStorage.getItem('userLogin');

    if (!token) {
      navigate('/');
    } else {
      if (storedLogin) {
        setUserLogin(storedLogin);
      }
      setCode(getInitialCode(selectedLanguage));
    }
  }, [navigate, selectedLanguage]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userLogin');
    navigate('/');
  };

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    setCode(getInitialCode(lang));
    setGeneratedJson(null);
  };

  const handleCodeChange = (event) => {
    setCode(event.target.value);
  };

  const generateJson = () => {
    const jsonOutput = {
      language: selectedLanguage,
      code: code,
    };
    setGeneratedJson(JSON.stringify(jsonOutput, null, 2));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/zip") {
      setZipFile(file);
      console.log('Выбран ZIP-файл:', file.name, file);
    } else {
      setZipFile(null);
      alert('Пожалуйста, выберите файл с расширением .zip');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleZipUpload = async () => {
    if (!zipFile) {
      alert('Пожалуйста, сначала выберите ZIP-файл.');
      return;
    }

    console.log(`Имитация отправки файла "${zipFile.name}" на бэкенд для обработки.`);
    const simulatedResponse = {
      message: `ZIP-файл "${zipFile.name}" был отправлен на бэкенд для извлечения функций.`,
      extractedFunctionsPlaceholder: [
        {
          fileName: "example_python_file.py",
          functionName: "my_extracted_python_func",
          codeSnippet: "def my_extracted_python_func():\n    return 'Hello from Python ZIP!'"
        },
        {
          fileName: "example_go_file.go",
          functionName: "MyExtractedGoFunc",
          codeSnippet: "func MyExtractedGoFunc() string {\n\treturn \"Hello from Go ZIP!\"\n}"
        }
      ],
      backendProcessStatus: "success"
    };
    setGeneratedJson(JSON.stringify(simulatedResponse, null, 2));
    alert(`ZIP-файл "${zipFile.name}" успешно выбран и готов к имитации отправки на бэкенд.`);
  };

  return (
    <div className="main-page-wrapper">
      <div className="main-content">
        <h2 className="main-page-title">Добро пожаловать{userLogin ? `, ${userLogin}` : ''}!</h2>
        <p className="main-page-paragraph">Вы успешно вошли в систему. Здесь вы можете писать и готовить функции для отправки.</p>

        {/* Секция выбора языка и ввода кода */}
        <div className="language-selector">
          <button
            onClick={() => handleLanguageChange('python')}
            className={`language-button ${selectedLanguage === 'python' ? 'active' : ''}`}
          >
            Python
          </button>
          <button
            onClick={() => handleLanguageChange('go')}
            className={`language-button ${selectedLanguage === 'go' ? 'active' : ''}`}
          >
            Go
          </button>
        </div>

        <h3 className="main-page-subtitle">Код на {selectedLanguage === 'python' ? 'Python' : 'Go'}:</h3>
        <textarea
          value={code}
          onChange={handleCodeChange}
          rows="15"
          cols="80"
          spellCheck="false"
          className="code-textarea"
        ></textarea>

        <button
          onClick={generateJson}
          className="action-button"
        >
          Сгенерировать JSON из текущего кода
        </button>

        <hr className="section-divider" />

        {/* Секция загрузки ZIP-файла */}
        <h3 className="main-page-subtitle">Загрузить функции из ZIP-архива:</h3>
        <div className="zip-upload-section">
            <div className="zip-upload-input-group">
                <input
                    type="file"
                    accept=".zip"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="zip-file-input"
                />
                {zipFile && <span className="zip-file-name">Выбран файл: <strong>{zipFile.name}</strong></span>}
            </div>
            <button
                onClick={handleZipUpload}
                disabled={!zipFile}
                className="upload-zip-button"
            >
                Обработать ZIP
            </button>
        </div>

        {/* Секция отображения сгенерированного JSON */}
        {generatedJson && (
          <div className="json-output-container">
            <h3 className="main-page-subtitle">Сгенерированный JSON:</h3>
            <pre className="json-output-pre">
              <code>{generatedJson}</code>
            </pre>
          </div>
        )}

        <button onClick={handleLogout} className="logout-button">
          Выйти
        </button>
      </div>
    </div>
  );
}

export default MainPage;
