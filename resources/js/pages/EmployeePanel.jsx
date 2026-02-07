import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const EmployeePanel = () => {
    const STORAGE_URL = 'http://localhost:8000/storage/';
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCar, setSelectedCar] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [promoPrice, setPromoPrice] = useState('');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [formData, setFormData] = useState({
        brand: '', model: '', year: 2026, registration_number: '',
        type: 'sedan', fuel_type: 'petrol', transmission: 'manual',
        seats: 5, price_per_day: '', insurance_per_day: '0',
        status: 'available', rental_point_id: '', has_gps: false,
        has_air_conditioning: true, description: ''
    });

    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const calculateLiveAC = () => {
        const base = parseFloat(formData.price_per_day) || 0;
        if (base <= 0) return "0.00";
        let multiplier = 1.0;
        const typeMultipliers = { 'SUV': 1.4, 'van': 1.3, 'sedan': 1.0, 'hatchback': 0.9, 'coupe': 1.8, 'electric': 1.5 };
        multiplier *= (typeMultipliers[formData.type] || 1.0);
        const premiumBrands = ['BMW', 'Mercedes', 'Audi', 'Tesla', 'Porsche'];
        if (premiumBrands.includes(formData.brand)) multiplier *= 1.3;
        const age = new Date().getFullYear() - (parseInt(formData.year) || 2026);
        if (age <= 2) multiplier *= 1.25;
        return (base * 0.12 * multiplier).toFixed(2);
    };

    const calculateOC = () => {
        const base = parseFloat(formData.price_per_day) || 0;
        return (base * 0.05).toFixed(2);
    };

    const calculateAC = () => calculateLiveAC();

        const fetchCars = useCallback(async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:8000/api/employee/cars', config);
                setCars(response.data);

            if (response.data.length > 0 && response.data[0].rental_point_id) {
                setFormData(prev => ({ ...prev, rental_point_id: response.data[0].rental_point_id }));
            }

                setLoading(false);
            } catch (err) {
                console.error("Błąd pobierania floty:", err);
                setError("Nie udało się załadować listy pojazdów.");
                setLoading(false);
            }
        }, [token]);

      useEffect(() => {
        fetchCars();
    }, [fetchCars]);


    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleAddCar = async (e) => {
        e.preventDefault();
        const data = new FormData();

        const finalData = {
            ...formData,
            insurance_per_day: calculateOC(),
            extra_insurance_per_day: calculateLiveAC()
        };

        Object.keys(finalData).forEach(key => {
            const value = typeof finalData[key] === 'boolean' ? (finalData[key] ? '1' : '0') : finalData[key];
            data.append(key, value);
        });

        if (imageFile) data.append('image', imageFile);

        try {
            await axios.post('http://localhost:8000/api/employee/cars', data, {
                headers: { ...config.headers, 'Content-Type': 'multipart/form-data' }
            });
            setIsAddModalOpen(false);
            setImagePreview(null);
            setImageFile(null);
            fetchCars();
            alert("Pojazd dodany pomyślnie!");
        } catch (err) {
            alert(err.response?.data?.message || "Błąd podczas dodawania auta.");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
    };

    const openEditModal = (car) => {
        setSelectedCar(car);
        setNewStatus(car.status);
        setPromoPrice(car.promotion_price || '');
        setIsModalOpen(true);
    };

    const handleUpdateCar = async (e) => {
    e.preventDefault();
    try {
        await axios.patch(
            `http://localhost:8000/api/employee/cars/${selectedCar.id}/status`,
            { status: newStatus },
            config
        );

        await axios.patch(
            `http://localhost:8000/api/employee/cars/${selectedCar.id}/promotion`,
            { promotion_price: promoPrice === '' ? null : promoPrice },
            config
        );

        setIsModalOpen(false);
        fetchCars();
        alert("Pojazd zaktualizowany pomyślnie!");

    } catch (err) {
        console.error("Pełny obiekt błędu:", err);

        let message = "Wystąpił błąd.";

        if (err.response) {
            message = err.response.data.message || "Błąd serwera (405/422/500)";

            if (err.response.data.errors) {
                const firstError = Object.values(err.response.data.errors)[0][0];
                message = firstError;
            }
        } else if (err.request) {
            message = "Brak połączenia z serwerem (sprawdź czy backend działa).";
        }

        alert("Szczegóły błędu: " + message);
    }
};


    const handleDelete = async (id, brand, model) => {
        if (window.confirm(`Czy na pewno chcesz trwale usunąć pojazd ${brand} ${model} z floty?`)) {
            try {
                await axios.delete(`http://localhost:8000/api/employee/cars/${id}`, config);
                fetchCars();
            } catch (err) {
                alert("Błąd podczas usuwania pojazdu.");
            }
        }
    };


   const getCarStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'available':
                return { color: 'emerald', label: 'DOSTĘPNY', icon: '🚗' };
            case 'rented':
                return { color: 'amber', label: 'WYNAJĘTY', icon: '🔑' };
            case 'maintenance':
                return { color: 'red', label: 'SERWIS', icon: '🔧' };
            default:
                return { color: 'indigo', label: status?.toUpperCase(), icon: '📋' };
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#11111d] flex items-center justify-center text-indigo-400 italic text-xl">
            Wczytywanie floty...
        </div>
    );

    return (
        <div className="min-h-screen bg-[#11111d] p-8 text-white font-sans">
            <div className="max-w-6xl mx-auto">

                {/* NAGŁÓWEK (Styl jak u Admina) */}
                <div className="flex flex-col lg:flex-row justify-between items-center mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase">Panel Pracownika</h1>
                        <p className="text-indigo-400 italic">Zarządzanie flotą punktu</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 w-full lg:w-auto">
                        <input
                            type="text"
                            placeholder="Szukaj (marka, rejestracja)..."
                            className="bg-[#1e1e2d] border border-white/10 p-4 rounded-2xl w-full md:w-80 outline-none focus:border-indigo-500 transition-all text-sm"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 px-6 py-4 rounded-2xl font-black transition-all text-sm tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                        >
                            ➕ DODAJ AUTO
                        </button>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-6 py-4 rounded-2xl font-black transition-all text-sm tracking-widest border border-red-500/20"
                        >
                            WYLOGUJ
                        </button>
                    </div>
                </div>

                {/* LISTA POJAZDÓW */}
                <div className="grid grid-cols-1 gap-6">
                    {cars.filter(c => c.brand.toLowerCase().includes(searchTerm.toLowerCase()) || c.registration_number.toLowerCase().includes(searchTerm.toLowerCase())).map(car => {
                        const style = getCarStatusStyle(car.status);
                        return (
                            <div key={car.id} className="bg-[#1e1e2d] p-8 rounded-[2.5rem] border border-white/5 flex flex-col lg:flex-row justify-between items-center gap-8 hover:border-indigo-500/40 transition-all">
                                <div className="flex flex-col md:flex-row gap-8 w-full items-center">
                                    <div className="h-28 w-44 bg-black/40 rounded-2xl overflow-hidden border border-white/5 shadow-inner flex items-center justify-center">
                                        {car.image_path ? <img src={STORAGE_URL + car.image_path} className="w-full h-full object-cover" alt="car" /> : <span className="text-4xl opacity-20">🚗</span>}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-6 flex-1 text-center md:text-left">
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase font-black">Marka i Model</p>
                                            <h3 className="font-bold text-lg leading-tight">{car.brand} {car.model}</h3>
                                            <p className="text-[10px] text-indigo-400 font-bold uppercase">{car.type}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase font-black">Rejestracja</p>
                                            <p className="text-indigo-400 font-bold uppercase">{car.registration_number}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase font-black">Status</p>
                                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold bg-${style.color}-500/10 text-${style.color}-400 border border-${style.color}-500/20`}>{style.label}</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase font-black">Cena / Doba</p>
                                            <p className="font-black text-emerald-400 text-lg">{car.price_per_day} PLN</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex lg:flex-col gap-2 w-full lg:w-auto">
                                    <button onClick={() => { setSelectedCar(car); setNewStatus(car.status); setPromoPrice(car.promotion_price || ''); setIsModalOpen(true); }} className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-[10px] uppercase tracking-widest">Edytuj</button>
                                    <button onClick={() => handleDelete(car.id, car.brand, car.model)} className="flex-1 px-6 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl font-bold text-[10px] uppercase transition-all">Usuń</button>
                                </div>
                            </div>
                        );
                    })}
                </div>




                  {/* MODAL DODAWANIA */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 z-50 overflow-y-auto">
                        <div className="bg-[#1a1a2e] p-10 rounded-[3rem] border border-white/10 max-w-3xl w-full shadow-2xl my-auto">
                            <h2 className="text-4xl font-black mb-10 uppercase italic tracking-tighter text-indigo-500">Nowy pojazd</h2>

                            <form onSubmit={handleAddCar} className="space-y-6">
                                {/* Zdjęcie Preview */}
                                <div className="flex justify-center mb-6">
                                    <label className="relative cursor-pointer group">
                                        <div className="w-64 h-36 bg-[#0f0f1a] rounded-[2rem] border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden group-hover:border-indigo-500/50 transition-all">
                                            {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <span className="text-gray-500 text-xs font-black uppercase tracking-widest">Dodaj zdjęcie</span>}
                                        </div>
                                        <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                    </label>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 ml-4">Marka</label>
                                        <input className="bg-[#0f0f1a] p-5 rounded-2xl border-none text-white w-full outline-none" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 ml-4">Model</label>
                                        <input className="bg-[#0f0f1a] p-5 rounded-2xl border-none text-white w-full outline-none" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} required />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 ml-4">Nadwozie</label>
                                        <select className="bg-[#0f0f1a] p-5 rounded-2xl border-none text-white w-full outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                            <option value="sedan">Sedan</option><option value="SUV">SUV</option><option value="hatchback">Hatchback</option><option value="van">Van</option><option value="coupe">Coupe</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 ml-4">Rejestracja</label>
                                        <input className="bg-[#0f0f1a] p-5 rounded-2xl border-none text-white w-full outline-none" value={formData.registration_number} onChange={e => setFormData({...formData, registration_number: e.target.value})} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 ml-4">Cena/Doba</label>
                                        <input type="number" className="bg-[#0f0f1a] p-5 rounded-2xl border-none text-emerald-400 w-full outline-none font-bold" value={formData.price_per_day} onChange={e => setFormData({...formData, price_per_day: e.target.value})} required />
                                    </div>
                                </div>

                                {/* PRZEGLĄD STAWEK */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-[#11111d] p-6 rounded-[2rem] border border-emerald-500/10">
                                        <p className="text-[10px] font-black text-emerald-500 uppercase mb-2">OC (Stałka 5%)</p>
                                        <p className="text-2xl font-black text-emerald-400">{calculateOC()} PLN</p>
                                    </div>
                                    <div className="bg-[#11111d] p-6 rounded-[2rem] border border-indigo-500/10">
                                        <p className="text-[10px] font-black text-indigo-500 uppercase mb-2">AC (Wyliczone)</p>
                                        <p className="text-2xl font-black text-indigo-400">+{calculateAC()} PLN</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 px-4 py-6 bg-[#252538] hover:bg-[#2d2d44] rounded-[2rem] font-black uppercase italic transition-all">Anuluj</button>
                                    <button type="submit" className="flex-1 px-4 py-6 bg-indigo-600 hover:bg-indigo-700 rounded-[2rem] font-black uppercase italic transition-all shadow-xl shadow-indigo-600/20">Zatwierdź i dodaj</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL EDYCJI (STATUS/PROMOCJA) */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
                        <div className="bg-[#1a1a2e] p-8 rounded-[2rem] border border-white/10 max-w-md w-full">
                            <h2 className="text-2xl font-black mb-6 uppercase">Szybka Edycja</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Status Pojazdu</label>
                                    <select className="bg-[#0f0f1a] p-4 rounded-xl w-full text-white mt-1 outline-none" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                                        <option value="available">Dostępny</option>
                                        <option value="rented">Wynajęty</option>
                                        <option value="maintenance">Serwis</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Cena Promocyjna (opcjonalnie)</label>
                                    <input type="number" className="bg-[#0f0f1a] p-4 rounded-xl w-full text-white mt-1 outline-none" value={promoPrice} onChange={e => setPromoPrice(e.target.value)} placeholder="Brak promocji" />
                                </div>
                                <div className="flex gap-2 pt-4">
                                    <button onClick={() => setIsModalOpen(false)} className="flex-1 p-4 bg-white/5 rounded-xl font-bold uppercase text-xs">Anuluj</button>
                                    <button onClick={handleUpdateCar} className="flex-1 p-4 bg-indigo-600 rounded-xl font-bold uppercase text-xs">Zapisz</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STOPKA */}
                <div className="mt-12 p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] text-center">
                    <p className="text-gray-400 text-sm mb-4">Wymagana zmiana hasła lub dane bezpieczeństwa?</p>
                    <Link
                        to="/profile"
                        className="inline-block bg-white/5 hover:bg-white/10 px-8 py-3 rounded-xl text-indigo-400 font-black text-xs uppercase tracking-[0.2em] transition-all"
                    >
                        Konfiguracja Profilu
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default EmployeePanel;
