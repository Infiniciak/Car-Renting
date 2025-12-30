import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserPanel = ({ onLogout }) => {
    const navigate = useNavigate();
    const [balance, setBalance] = useState(0);
    const [topUpAmount, setTopUpAmount] = useState(50);
    const [loading, setLoading] = useState(true);

    // Pobieranie aktualnych danych użytkownika (w tym salda)
    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8000/api/user', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBalance(res.data.balance);
            setLoading(false);
        } catch (err) {
            console.error("Błąd pobierania salda", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    // Funkcja doładowania konta
    const handleTopUp = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:8000/api/top-up', 
                { amount: topUpAmount },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setBalance(res.data.new_balance);
            alert(`Pomyślnie doładowano konto o ${topUpAmount} PLN!`);
        } catch (err) {
            alert("Błąd podczas doładowania konta.");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        onLogout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Nawigacja */}
            <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
                <span className="text-xl font-black text-blue-600">CAR-RENT</span>
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate('/profile')} 
                        className="text-gray-600 hover:text-blue-600 font-semibold transition"
                    >
                        Mój Profil
                    </button>
                    <button 
                        onClick={handleLogout} 
                        className="text-gray-600 hover:text-red-600 font-medium border-l pl-6"
                    >
                        Wyloguj
                    </button>
                </div>
            </nav>

            <main className="p-8 max-w-6xl mx-auto">
                {/* Hero Section */}
                <div className="bg-blue-600 rounded-3xl p-10 text-white mb-8 shadow-lg shadow-blue-200">
                    <h1 className="text-4xl font-bold mb-2">Witaj w naszej wypożyczalni!</h1>
                    <p className="text-blue-100">Znajdź idealne auto na swoją kolejną podróż.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* SEKCJA PORTFELA (Pre-paid) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
                        <div>
                            <h2 className="text-xl font-bold mb-1">Twój Portfel</h2>
                            <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-4">Środki pre-paid</p>
                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-4xl font-black text-gray-800">
                                    {loading ? "..." : parseFloat(balance).toFixed(2)}
                                </span>
                                <span className="text-blue-600 font-bold">PLN</span>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <select 
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold outline-none focus:border-blue-500"
                                value={topUpAmount}
                                onChange={(e) => setTopUpAmount(e.target.value)}
                            >
                                <option value="20">20 PLN</option>
                                <option value="50">50 PLN</option>
                                <option value="100">100 PLN</option>
                                <option value="200">200 PLN</option>
                            </select>
                            <button 
                                onClick={handleTopUp}
                                className="w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition shadow-md shadow-green-100"
                            >
                                Doładuj konto
                            </button>
                        </div>
                    </div>

                    {/* TWOJE REZERWACJE */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold mb-4">Twoje rezerwacje</h2>
                        <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl">
                            <p className="text-gray-400 italic text-sm">Brak aktywnych rezerwacji.</p>
                        </div>
                    </div>

                    {/* SZYBKI WYBÓR */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-center">
                        <h2 className="text-xl font-bold mb-4 text-center">Gotowy na drogę?</h2>
                        <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 mb-3">
                            Przeglądaj samochody
                        </button>
                        <p className="text-center text-xs text-gray-400">
                            Pamiętaj o doładowaniu konta przed wynajmem!
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserPanel;