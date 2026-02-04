import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminRentalPoints = () => {
    const [points, setPoints] = useState([]);
    const [formData, setFormData] = useState({
        name: '', address: '', city: '', postal_code: '', has_charging_station: false, latitude: '',  longitude: ''
    });

    const [imageFile, setImageFile] = useState(null);

    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');


    const STORAGE_URL = 'http://localhost:8000/storage/';

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
            console.error("Błąd", error);
            setLoading(false);
        }
    };


    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();


        const data = new FormData();
        data.append('name', formData.name);
        data.append('address', formData.address);
        data.append('city', formData.city);
        data.append('postal_code', formData.postal_code);
        data.append('has_charging_station', formData.has_charging_station ? '1' : '0');
        if (formData.latitude) {
            data.append('latitude', formData.latitude.toString().replace(',', '.'));
    }

        if (formData.longitude) {
            data.append('longitude', formData.longitude.toString().replace(',', '.'));
    }

        if (imageFile) {
            data.append('image', imageFile);
        }


        if (editingId) {
            data.append('_method', 'PUT');
        }

        try {
            const url = editingId
                ? `http://localhost:8000/api/admin/rental-points/${editingId}`
                : 'http://localhost:8000/api/admin/rental-points';


            await axios.post(url, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert(editingId ? 'Zaktualizowano!' : 'Dodano!');
            resetForm();
            fetchPoints();
        } catch (error) {
            console.error(error);
            alert('Błąd zapisu.');
        }
    };

    const resetForm = () => {
        setFormData({ name: '', address: '', city: '', postal_code: '', has_charging_station: false, latitude: '', longitude: '' });
        setImageFile(null);
        setEditingId(null);

        document.getElementById('fileInput').value = "";
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Usunąć?")) return;
        try {
            await axios.delete(`http://localhost:8000/api/admin/rental-points/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPoints();
        } catch (error) {
            alert('Błąd usuwania.');
        }
    };

    const startEdit = (point) => {
        setFormData({
            name: point.name,
            address: point.address,
            city: point.city,
            postal_code: point.postal_code,
            has_charging_station: Boolean(point.has_charging_station),
            latitude: point.latitude || '',
            longitude: point.longitude || ''
        });
        setImageFile(null);
        setEditingId(point.id);
    };

    const handleGeocode = async () => {
        const city = formData.city?.trim();
        const address = formData.address?.trim();

        if (!city || !address) {
            alert("Musisz wpisać zarówno miasto, jak i adres!");
            return;
        }

        const query = `${address}, ${city}, Polska`;

        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                params: {
                    q: query,
                    format: 'json',
                    limit: 1
                }
            });

            if (response.data && response.data.length > 0) {
                const location = response.data[0];


                setFormData(prev => ({
                    ...prev,
                    latitude: location.lat,
                    longitude: location.lon
                }));

                alert(`Znaleziono: ${location.display_name}`);
            } else {
                alert("Nie znaleziono takiej lokalizacji. Sprawdź literówki.");
            }
        } catch (error) {
            console.error(error);
            alert("Błąd połączenia z mapą.");
        }
    };
    const isGeocodeDisabled = !formData.city?.trim() || !formData.address?.trim();

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-black text-gray-800">Punkty Wypożyczeń</h1>
                    <button onClick={() => navigate('/admin')} className="text-indigo-600 font-bold">Wróć</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                        <h2 className="text-xl font-bold mb-6 text-gray-800">{editingId ? 'Edytuj' : 'Dodaj'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" placeholder="Nazwa" className="w-full p-3 bg-gray-50 rounded-xl border" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            <input type="text" placeholder="Miasto" className="w-full p-3 bg-gray-50 rounded-xl border" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required />
                            <input type="text" placeholder="Adres" className="w-full p-3 bg-gray-50 rounded-xl border" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
                            <input type="text" placeholder="Kod pocztowy" className="w-full p-3 bg-gray-50 rounded-xl border" value={formData.postal_code} onChange={e => setFormData({...formData, postal_code: e.target.value})} required />

                            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-xs font-bold text-indigo-800 uppercase">Lokalizacja na mapie</label>

                                    <button
                                        type="button"
                                        onClick={handleGeocode}
                                        disabled={isGeocodeDisabled}
                                       className={`text-xs px-3 py-1 rounded transition flex items-center gap-1 ${
                                         isGeocodeDisabled
                                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                                       }`}
                                    >
                                        📍 Pobierz z adresu
                                    </button>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            step="any"
                                            placeholder="Szerokość (Lat)"
                                            className="w-full p-2 bg-white rounded border border-indigo-200 text-sm"
                                            value={formData.latitude}
                                            onChange={e => setFormData({...formData, latitude: e.target.value})}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            step="any"
                                            placeholder="Długość (Lng)"
                                            className="w-full p-2 bg-white rounded border border-indigo-200 text-sm"
                                            value={formData.longitude}
                                            onChange={e => setFormData({...formData, longitude: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Zdjęcie punktu</label>

                                <div className="relative">
                                <input
                                    id="fileInput"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="fileInput"
                                    className="flex items-center justify-center w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-500 cursor-pointer hover:bg-gray-100 hover:border-indigo-300 transition border-dashed border-2"
                                >
                                    <span className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>


                                    <span className="font-medium text-sm">
                                        {imageFile ? imageFile.name : "Kliknij, aby wybrać zdjęcie"}
                                    </span>
                             </span>
                    </label>
            </div>
    </div>

                            <div className="flex items-center gap-2 p-2">
                                <input
                                    type="checkbox"
                                    checked={formData.has_charging_station}
                                    onChange={e => setFormData({...formData, has_charging_station: e.target.checked})}
                                    className="w-5 h-5"
                                />
                                <label className="font-bold text-gray-700">Stacja ładowania ⚡</label>
                            </div>

                            <div className="flex gap-2">
                                <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700">Zapisz</button>
                                {editingId && <button type="button" onClick={resetForm} className="px-4 bg-gray-200 rounded-xl font-bold">Anuluj</button>}
                            </div>
                        </form>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                        {points.map(point => (
                            <div key={point.id} className="bg-white p-6 rounded-2xl shadow-sm border flex gap-4 items-start">
                                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    {point.image_path ? (
                                        <img
                                            src={STORAGE_URL + point.image_path}
                                            alt={point.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-1">
                                            Brak zdjęcia
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                                {point.name}
                                                {point.has_charging_station && <span className="text-yellow-500" title="Ma ładowarkę">⚡</span>}
                                            </h3>
                                            <p className="text-gray-500">{point.address}, {point.city}, {point.postal_code}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => startEdit(point)} className="text-indigo-600 font-bold px-3 py-1 bg-indigo-50 rounded text-sm">Edytuj</button>
                                            <button onClick={() => handleDelete(point.id)} className="text-red-600 font-bold px-3 py-1 bg-red-50 rounded text-sm">Usuń</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminRentalPoints;
