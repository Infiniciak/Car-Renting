import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminRentalPoints = () => {
    const [points, setPoints] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        postal_code: '',
        has_charging_station: false
    });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchPoints();
    }, []);

    const fetchPoints = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/admin/rental-points', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPoints(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Błąd pobierania punktów", error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`http://localhost:8000/api/admin/rental-points/${editingId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Zaktualizowano punkt!');
            } else {
                await axios.post('http://localhost:8000/api/admin/rental-points', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Dodano nowy punkt!');
            }
            setFormData({ name: '', address: '', city: '', postal_code: '', has_charging_station: false });
            setEditingId(null);
            fetchPoints();
        } catch (error) {
            console.error(error);
            alert('Wystąpił błąd podczas zapisywania.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Czy na pewno chcesz usunąć ten punkt?")) return;
        try {
            await axios.delete(`http://localhost:8000/api/admin/rental-points/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPoints();
        } catch (error) {
            alert('Nie udało się usunąć punktu.');
        }
    };

    const startEdit = (point) => {
        setFormData({
            name: point.name,
            address: point.address,
            city: point.city,
            postal_code: point.postal_code,
            has_charging_station: Boolean(point.has_charging_station)
        });
        setEditingId(point.id);
    };

    const cancelEdit = () => {
        setFormData({ name: '', address: '', city: '', postal_code: '', has_charging_station: false });
        setEditingId(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-800">Punkty Wypożyczeń</h1>
                        <p className="text-gray-500 font-medium">Zarządzaj lokalizacjami i stacjami ładowania</p>
                    </div>
                    <button onClick={() => navigate('/admin')} className="text-indigo-600 font-bold hover:underline">
                        &larr; Wróć do Panelu
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                        <h2 className="text-xl font-bold mb-6 text-gray-800">
                            {editingId ? 'Edytuj Punkt' : 'Dodaj Nowy Punkt'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nazwa</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-indigo-500 outline-none transition"
                                    placeholder="np. Lotnisko Balice"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Miasto</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={e => setFormData({...formData, city: e.target.value})}
                                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-indigo-500 outline-none transition"
                                    placeholder="np. Kraków"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Adres</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={e => setFormData({...formData, address: e.target.value})}
                                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-indigo-500 outline-none transition"
                                    placeholder="Ulica i numer"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Kod Pocztowy</label>
                                <input
                                    type="text"
                                    value={formData.postal_code}
                                    onChange={e => setFormData({...formData, postal_code: e.target.value})}
                                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-indigo-500 outline-none transition"
                                    placeholder="00-000"
                                    required
                                />
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                                <input
                                    type="checkbox"
                                    id="charger"
                                    checked={formData.has_charging_station}
                                    onChange={e => setFormData({...formData, has_charging_station: e.target.checked})}
                                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                                />
                                <label htmlFor="charger" className="text-sm font-bold text-gray-700 cursor-pointer select-none">
                                    Posiada ładowarkę EV ⚡
                                </label>
                            </div>

                            <div className="pt-4 flex gap-2">
                                <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
                                    {editingId ? 'Zapisz Zmiany' : 'Dodaj Punkt'}
                                </button>
                                {editingId && (
                                    <button type="button" onClick={cancelEdit} className="px-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition">
                                        Anuluj
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                        {loading ? (
                            <p className="text-center text-gray-400">Ładowanie...</p>
                        ) : points.length === 0 ? (
                            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
                                Brak punktów wypożyczeń. Dodaj pierwszy!
                            </div>
                        ) : (
                            points.map(point => (
                                <div key={point.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center group hover:border-indigo-100 transition">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold text-gray-800">{point.name}</h3>
                                            {point.has_charging_station ? (
                                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                                    ⚡ EV Ready
                                                </span>
                                            ) : (
                                                <span className="bg-gray-100 text-gray-400 text-xs px-2 py-1 rounded-full font-bold">
                                                    Brak ładowarki
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-500 mt-1">{point.address}, {point.postal_code} {point.city}</p>
                                    </div>
                                    <div className="flex gap-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEdit(point)}
                                            className="text-indigo-600 font-bold bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition"
                                        >
                                            Edytuj
                                        </button>
                                        <button
                                            onClick={() => handleDelete(point.id)}
                                            className="text-red-500 font-bold bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition"
                                        >
                                            Usuń
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminRentalPoints;
