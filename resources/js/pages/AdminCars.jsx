import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminCars = () => {
    const STORAGE_URL = 'http://localhost:8000/storage/';

    const [cars, setCars] = useState([]);
    const [points, setPoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCar, setEditingCar] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [removeImage, setRemoveImage] = useState(false);

    const [formData, setFormData] = useState({
        brand: '', model: '', year: 2026, registration_number: '',
        type: 'sedan', fuel_type: 'petrol', transmission: 'manual',
        seats: 5, price_per_day: '', insurance_per_day: '0',
        status: 'available', rental_point_id: '', has_gps: false,
        has_air_conditioning: true, description: ''
    });

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // --- IDENTYCZNA LOGIKA AC JAK W MODELU I CAR DETAILS ---
    const calculateLiveAC = () => {
        const base = parseFloat(formData.price_per_day) || 0;
        if (base <= 0) return "0.00";

        let multiplier = 1.0;
        const typeMultipliers = {
            'SUV': 1.4, 'van': 1.3, 'sedan': 1.0,
            'hatchback': 0.9, 'coupe': 1.8, 'electric': 1.5
        };
        multiplier *= (typeMultipliers[formData.type] || 1.0);

        const premiumBrands = ['BMW', 'Mercedes', 'Audi', 'Tesla', 'Porsche'];
        if (premiumBrands.includes(formData.brand)) multiplier *= 1.3;

        const age = new Date().getFullYear() - (parseInt(formData.year) || 2024);
        if (age <= 2) multiplier *= 1.25;

        return (base * 0.12 * multiplier).toFixed(2);
    };

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [carsRes, pointsRes] = await Promise.all([
                axios.get('http://localhost:8000/api/admin/cars', config),
                axios.get('http://localhost:8000/api/admin/rental-points', config)
            ]);
            setCars(carsRes.data);
            setPoints(pointsRes.data);
            setLoading(false);
        } catch (err) {
            alert("Błąd połączenia z serwerem");
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setRemoveImage(false);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setRemoveImage(true);
    };

    const handleOpenAddModal = () => {
        setEditingCar(null);
        setImageFile(null);
        setImagePreview(null);
        setRemoveImage(false);
        setFormData({
            brand: '', model: '', year: 2026, registration_number: '',
            type: 'sedan', fuel_type: 'petrol', transmission: 'manual',
            seats: 5, price_per_day: '', insurance_per_day: '0',
            status: 'available', rental_point_id: '', has_gps: false,
            has_air_conditioning: true, description: ''
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (car) => {
        setEditingCar(car);
        setImageFile(null);
        setImagePreview(car.image_path ? STORAGE_URL + car.image_path : null);
        setRemoveImage(false);
        setFormData({
            ...car,
            has_gps: !!car.has_gps,
            has_air_conditioning: !!car.has_air_conditioning,
            rental_point_id: car.rental_point_id || '',
            seats: car.seats
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();

        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
                const value = typeof formData[key] === 'boolean' ? (formData[key] ? '1' : '0') : formData[key];
                data.append(key, value);
            }
        });

        if (imageFile) data.append('image', imageFile);
        if (removeImage) data.append('remove_image', '1');
        if (editingCar) data.append('_method', 'PUT');

        try {
            const url = editingCar
                ? `http://localhost:8000/api/admin/cars/${editingCar.id}`
                : 'http://localhost:8000/api/admin/cars';

            const response = await axios.post(url, data, {
                headers: { ...config.headers, 'Content-Type': 'multipart/form-data' }
            });

            const updatedCar = response.data.car;
            setCars(prev => editingCar
                ? prev.map(c => c.id === editingCar.id ? updatedCar : c)
                : [updatedCar, ...prev]
            );
            setIsModalOpen(false);
        } catch (err) {
            alert(err.response?.data?.message || "Błąd zapisu!");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Usunąć pojazd?")) return;
        try {
            await axios.delete(`http://localhost:8000/api/admin/cars/${id}`, config);
            setCars(prev => prev.filter(c => c.id !== id));
        } catch (err) { alert("Błąd usuwania"); }
    };

    if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-900 dark:text-white italic text-xl transition-colors duration-300">Wczytywanie...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 text-gray-900 dark:text-white font-sans transition-colors duration-300">
            <div className="max-w-6xl mx-auto">
                {/* NAGŁÓWEK I WYSZUKIWARKA */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Pojazdy</h1>
                        <p className="text-indigo-400 font-medium italic mt-2">Zarządzanie flotą</p>
                    </div>
                    <div className="flex gap-4">
                        <input
                            type="text" placeholder="Szukaj (marka, rejestracja)..."
                            // RESOLVED: Używam Twoich stylów (bg-white/dark:bg-gray-800) bo obsługują zmianę motywu
                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4 rounded-2xl w-64 outline-none focus:border-indigo-500 text-gray-900 dark:text-white transition-all"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button onClick={handleOpenAddModal} className="bg-indigo-600 hover:bg-indigo-700 px-6 py-4 rounded-2xl font-black transition-all text-sm tracking-widest text-white">
                            + DODAJ AUTO
                        </button>
                    </div>
                </div>

                {/* LISTA KAFELKÓW */}
                <div className="grid grid-cols-1 gap-6">
                    {cars.filter(c =>
                        c.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.registration_number.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map(car => (
                        <div key={car.id} className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-200 dark:border-gray-700 flex flex-col lg:flex-row justify-between items-start lg:items-center transition-all hover:border-indigo-500/50 shadow-xl">
                            <div className="flex flex-col md:flex-row gap-8 w-full">
                                {/* ZDJĘCIE W KAFELKU - Twoje style (light/dark mode) */}
                                <div className="h-24 w-36 bg-gray-100 dark:bg-gray-700 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-600 flex-shrink-0 shadow-inner transition-colors duration-300">
                                    {car.image_path ? (
                                        <img src={STORAGE_URL + car.image_path} alt="car" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl opacity-20">🚗</span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-4 flex-1">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Marka i Model</p>
                                        {/* Dodano text-gray-900 dark:text-white dla czytelności w light mode */}
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{car.brand} {car.model}</h3>
                                        <p className="text-[10px] text-indigo-400 font-bold uppercase">{car.type} • {car.fuel_type}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Tablice</p>
                                        <p className="text-indigo-400 font-bold">{car.registration_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Status / Miejsca</p>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${car.status === 'available' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                {car.status === 'available' ? 'Dostępny' : car.status}
                                            </span>
                                            <span className="text-xs text-gray-400 font-bold">{car.seats} os.</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Ubezpieczenie (Doba)</p>
                                        <p className="text-xs font-bold text-gray-400">Standard: {car.insurance_per_day} PLN</p>
                                        <p className="text-xs font-bold text-indigo-400">Premium AC: {car.extra_insurance_per_day} PLN</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Lokalizacja</p>
                                        <p className="text-blue-400 font-bold text-sm leading-tight">
                                            {car.rental_point ? car.rental_point.city : '📦 Magazyn'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Cena (Doba)</p>
                                        <p className="font-black text-emerald-500 text-lg">{car.price_per_day} PLN</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Skrzynia / Rok</p>
                                        <p className="font-bold text-gray-400 text-xs uppercase">{car.transmission} • {car.year}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Wyposażenie</p>
                                        <p className="text-[9px] font-bold text-gray-500 flex gap-2">
                                            {car.has_air_conditioning && <span className="bg-gray-200 dark:bg-white/5 px-1 rounded italic">KLIMA</span>}
                                            {car.has_gps && <span className="bg-gray-200 dark:bg-white/5 px-1 rounded italic">GPS</span>}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex lg:flex-col gap-2 mt-6 lg:mt-0 w-full lg:w-auto">
                                <button onClick={() => handleOpenEditModal(car)} className="flex-1 px-8 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white rounded-2xl transition-colors font-bold text-xs uppercase">Edytuj</button>
                                <button onClick={() => handleDelete(car.id)} className="flex-1 px-8 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl transition-colors font-bold text-xs uppercase">Usuń</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                // RESOLVED: Styl tła Twój (light/dark), ale dodałem overflow-y-auto i my-auto z Main, żeby na małych ekranach dało się przewijać
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 p-10 rounded-[3rem] border border-gray-200 dark:border-gray-700 max-w-2xl w-full shadow-2xl my-auto transition-colors duration-300">
                        <h2 className="text-3xl font-black mb-8 uppercase text-indigo-400 tracking-tighter">Specyfikacja Pojazdu</h2>
                        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 ml-2">Marka</label>
                                    <input className="w-full bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-colors duration-200" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 ml-2">Model</label>
                                    <input className="w-full bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-colors duration-200" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {/* RESOLVED: Zmieniłem kolory inputów na Twoje (bg-gray-50 dark:bg-gray-700), ale zachowałem strukturę selectów */}
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 ml-2">Typ Nadwozia</label>
                                    <select className="w-full bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option value="sedan">Sedan</option>
                                        <option value="SUV">SUV</option>
                                        <option value="hatchback">Hatchback</option>
                                        <option value="van">Van</option>
                                        <option value="coupe">Coupe</option>
                                        <option value="electric">Electric</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 ml-2">Paliwo</label>
                                    <select className="w-full bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" value={formData.fuel_type} onChange={e => setFormData({ ...formData, fuel_type: e.target.value })}>
                                        <option value="petrol">Benzyna</option>
                                        <option value="diesel">Diesel</option>
                                        <option value="electric">Prąd</option>
                                        <option value="hybrid">Hybryda</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 ml-2">Skrzynia</label>
                                    <select className="w-full bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" value={formData.transmission} onChange={e => setFormData({ ...formData, transmission: e.target.value })}>
                                        <option value="manual">Manualna</option>
                                        <option value="automatic">Automat</option>
                                    </select>
                                </div>
                            </div>

                            {/* RESOLVED: Tutaj Main dodał grupowanie (flex) dla Roku i Miejsc oraz pola Ceny.
                                Zachowałem ten układ (funkcjonalność), ale nałożyłem Twoje style (wygląd). */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 ml-2">Rejestracja</label>
                                    <input className="w-full bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white transition-colors duration-200" value={formData.registration_number} onChange={e => setFormData({ ...formData, registration_number: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 ml-2">Rok / Miejsca</label>
                                    <div className="flex gap-2">
                                        <input type="number" className="w-1/2 bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} />
                                        <input type="number" className="w-1/2 bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" value={formData.seats} onChange={e => setFormData({ ...formData, seats: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 ml-2">Cena / Doba</label>
                                    <input type="number" className="w-full bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl border border-gray-300 dark:border-gray-600 text-emerald-600 dark:text-emerald-400 font-black" value={formData.price_per_day} onChange={e => setFormData({ ...formData, price_per_day: e.target.value })} required />
                                </div>
                            </div>

                            {/* RESOLVED: To są nowe funkcje z Main (kalkulator OC i AC). MUSIMY to zostawić.
                                Zmieniłem tylko kolory tła (bg-emerald-500/5) na bardziej pasujące, ale logikę zostawiłem 1:1. */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                                    <label className="text-[10px] uppercase font-bold text-emerald-500 block mb-1">Ubezpieczenie Standard (OC)</label>
                                    <p className="text-xl font-black text-emerald-500 tracking-tighter">
                                        {formData.price_per_day ? (formData.price_per_day * 0.05).toFixed(2) : "0.00"} PLN
                                        <span className="text-[9px] text-gray-500 font-normal ml-2 italic">(Autonabijanie 5%)</span>
                                    </p>
                                </div>
                                <div className="bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10">
                                    <label className="text-[10px] uppercase font-bold text-indigo-400 block mb-1">Wyliczona stawka AC</label>
                                    <p className="text-xl font-black text-indigo-400 tracking-tighter">
                                        +{calculateLiveAC()} PLN
                                        <span className="text-[9px] text-gray-500 font-normal ml-1">/ doba</span>
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 ml-2">Punkt Odbioru</label>
                                    {/* Styl Twój (light/dark) */}
                                    <select className="w-full bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-blue-400 font-bold" value={formData.rental_point_id || ''} onChange={e => setFormData({ ...formData, rental_point_id: e.target.value })}>
                                        <option value="">Brak (Magazyn)</option>
                                        {points.map(p => <option key={p.id} value={p.id}>{p.city} - {p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    {/* Main zamienił tu pole Ceny na pole Statusu. Zostawiamy Status w tym miejscu (bo Cena poszła wyżej), ale dajemy Twoje style. */}
                                    <label className="text-[10px] uppercase font-bold text-gray-500 ml-2">Status</label>
                                    <select className="w-full bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                        <option value="available">Dostępny</option>
                                        <option value="rented">Wynajęty</option>
                                        <option value="service">Serwis</option>
                                    </select>
                                </div>
                            </div>

                            {/* Checkboxy - Twój styl tła */}
                            <div className="flex gap-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-3xl justify-center transition-colors duration-300">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" className="w-5 h-5 accent-indigo-600 rounded" checked={formData.has_gps} onChange={e => setFormData({ ...formData, has_gps: e.target.checked })} />
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-500 group-hover:text-indigo-400 transition">GPS</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" className="w-5 h-5 accent-indigo-600 rounded" checked={formData.has_air_conditioning} onChange={e => setFormData({ ...formData, has_air_conditioning: e.target.checked })} />
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-500 group-hover:text-indigo-400 transition">KLIMATYZACJA</span>
                                </label>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] uppercase font-bold text-gray-500 ml-2">Zdjęcie pojazdu</label>
                                {/* Kontener podglądu - Twoje style */}
                                <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-700 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-600 flex items-center justify-center transition-colors duration-300">
                                    {imagePreview ? (
                                        <>
                                            <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                            <button type="button" onClick={handleRemoveImage} className="absolute top-3 right-3 bg-red-600 px-3 py-1 rounded-lg text-white text-[9px] font-black tracking-tighter">USUŃ</button>
                                        </>
                                    ) : <span className="text-gray-400 italic text-xs">Wybierz plik graficzny...</span>}
                                </div>
                                {/* RESOLVED: Main wprowadził lepszy przycisk "Zmień plik" (hidden input + label).
                                    Zostawiamy to rozwiązanie, bo jest ładniejsze niż standardowy input, ale zmieniamy kolory na Twoje (light/dark). */}
                                <input type="file" accept="image/*" className="hidden" id="car-img" onChange={handleImageChange} />
                                <label htmlFor="car-img" className="block text-center p-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-300 dark:border-white/10 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition text-gray-500 dark:text-white text-xs font-bold uppercase tracking-widest">
                                    Zmień plik
                                </label>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-4 rounded-[2rem] text-white font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all">Zapisz Pojazd</button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white py-4 rounded-[2rem] font-bold uppercase text-xs tracking-widest">Anuluj</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCars;