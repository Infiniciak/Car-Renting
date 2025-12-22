import './bootstrap';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App'; // Nowa ścieżka do mniejszego App.jsx

ReactDOM.createRoot(document.getElementById('app')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);