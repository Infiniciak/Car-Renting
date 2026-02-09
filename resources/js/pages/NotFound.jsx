import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center p-6 transition-colors duration-300">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-xl text-center">
                <p className="text-6xl font-black text-indigo-500">404</p>
                <h1 className="text-2xl font-black mt-2">Nie znaleziono strony</h1>
                <p className="text-gray-500 dark:text-gray-300 mt-2">
                    Ten adres nie istnieje lub zostal przeniesiony.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-5 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold"
                    >
                        Wstecz
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-5 py-2 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-500"
                    >
                        Strona glowna
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
