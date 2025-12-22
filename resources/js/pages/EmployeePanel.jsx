import React from 'react';
import { useNavigate } from 'react-router-dom';

const EmployeePanel = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();

    // Dodajemy losowy numer na końcu, żeby przeglądarka "myślała", że to nowa strona
    const cacheBuster = Math.random().toString(36).substring(7);
    window.location.href = `/login?v=${cacheBuster}`;
};

    return (
        <div className="min-h-screen bg-blue-50 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-blue-600 px-8 py-4 flex justify-between items-center text-white">
                    <h2 className="text-xl font-bold">Panel Pracownika</h2>
                    <button onClick={handleLogout} className="bg-white text-blue-600 px-4 py-1 rounded-full text-sm font-bold hover:bg-blue-50">
                        Wyloguj
                    </button>
                </div>
                <div className="p-8">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Dzisiejsze zadania</h3>
                    <ul className="space-y-3">
                        <li className="flex items-center p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                            <span>✅ Wydanie Toyoty Auris - Godz. 12:00</span>
                        </li>
                        <li className="flex items-center p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                            <span>⏳ Sprawdzenie stanu technicznego BMW X5</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default EmployeePanel;