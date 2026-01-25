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
        seats: 5, price_per_day: '', insurance_per_day: '50',
        status: 'available', rental_point_id: '', has_gps: false,
        has_air_conditioning: true, description: ''
    });

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

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
            brand: '', model: '', year: 2024, registration_number: '',
            type: 'sedan', fuel_type: 'petrol', transmission: 'manual',
            seats: 5, price_per_day: '', insurance_per_day: '50',
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

    if (loading) return <div className="min-h-screen bg-[#11111d] flex items-center justify-center text-white italic text-xl">Wczytywanie...</div>;

    return (
        <div className="min-h-screen bg-[#11111d] p-8 text-white font-sans">
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
                            className="bg-[#1e1e2d] border border-white/10 p-4 rounded-2xl w-64 outline-none focus:border-indigo-500 transition-all"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button onClick={handleOpenAddModal} className="bg-indigo-600 hover:bg-indigo-700 px-6 py-4 rounded-2xl font-black transition-all">
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
                        <div key={car.id} className="bg-[#1e1e2d] p-8 rounded-[2.5rem] border border-white/5 flex flex-col lg:flex-row justify-between items-start lg:items-center transition-all hover:border-indigo-500/50 shadow-xl">
                            <div className="flex flex-col md:flex-row gap-8 w-full">
                                {/* ZDJĘCIE W KAFELKU */}
                                <div className="h-24 w-36 bg-black/40 rounded-2xl overflow-hidden flex items-center justify-center border border-white/5 flex-shrink-0 shadow-inner">
                                    {car.image_path ? (
                                        <img src={STORAGE_URL + car.image_path} alt="car" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl opacity-20">🚗</span>
                                    )}
                                </div>

                                {/* INFO W KAFELKU */}
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-4 flex-1">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Marka i Model</p>
                                        <h3 className="font-bold text-lg text-white">{car.brand} {car.model}</h3>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Tablice</p>
                                        <p className="text-indigo-400 font-bold">{car.registration_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Miejsca</p>
                                        <p className="font-bold text-gray-200">{car.seats} os.</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Status</p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${car.status === 'available' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {car.status === 'available' ? 'Dostępny' : car.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Lokalizacja</p>
                                        <p className="text-blue-400 font-bold text-sm leading-tight">
                                            {car.rental_point
                                                ? `${car.rental_point.name} (${car.rental_point.city})`
                                                : '📦 Magazyn / Brak przypisania'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Cena (doba)</p>
                                        <p className="font-bold text-emerald-400">{car.price_per_day} PLN</p>
                                    </div>
                                                                        <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Rok Produkcji</p>
                                        <p className="font-bold text-gray-400">{car.year}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Wyposażenie</p>
                                        <p className="text-[10px] font-bold text-gray-500">
                                            {car.has_air_conditioning ? 'KLIMATYZACJA' : ''} {car.has_gps ? 'GPS' : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* PRZYCISKI AKCJI */}
                            <div className="flex lg:flex-col gap-2 mt-6 lg:mt-0 w-full lg:w-auto">
                                <button onClick={() => handleOpenEditModal(car)} className="flex-1 px-8 py-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors font-bold text-sm uppercase">Edytuj</button>
                                <button onClick={() => handleDelete(car.id)} className="flex-1 px-8 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl transition-colors font-bold text-sm uppercase">Usuń</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-[#1e1e2d] p-10 rounded-[3rem] border border-white/10 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh]">
                        <h2 className="text-3xl font-black mb-8 uppercase text-indigo-400 tracking-tighter">Specyfikacja Pojazdu</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 ml-2">Marka</label>
                                    <input className="w-full bg-[#11111d] p-4 rounded-2xl border-none text-white focus:ring-2 focus:ring-indigo-500" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 ml-2">Model</label>
                                    <input className="w-full bg-[#11111d] p-4 rounded-2xl border-none text-white focus:ring-2 focus:ring-indigo-500" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 ml-2">Rejestracja</label>
                                    <input className="w-full bg-[#11111d] p-4 rounded-2xl border-none text-white" value={formData.registration_number} onChange={e => setFormData({...formData, registration_number: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 ml-2">Rok Produkcji</label>
                                    <input type="number" className="w-full bg-[#11111d] p-4 rounded-2xl border-none text-white" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 ml-2">Miejsca</label>
                                    <input type="number" className="w-full bg-[#11111d] p-4 rounded-2xl border-none text-white" value={formData.seats} onChange={e => setFormData({...formData, seats: e.target.value})} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 ml-2">Punkt Odbioru</label>
                                    <select className="w-full bg-[#11111d] p-4 rounded-2xl border-none text-gray-400" value={formData.rental_point_id || ''} onChange={e => setFormData({...formData, rental_point_id: e.target.value})}>
                                        <option value="">Brak (Magazyn)</option>
                                        {points.map(p => <option key={p.id} value={p.id}>{p.city} - {p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 ml-2">Cena za dobę</label>
                                    <input type="number" className="w-full bg-[#11111d] p-4 rounded-2xl border-none text-emerald-400 font-bold" value={formData.price_per_day} onChange={e => setFormData({...formData, price_per_day: e.target.value})} required />
                                </div>
                            </div>

                            <div className="flex gap-8 p-6 bg-[#11111d] rounded-3xl justify-center">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" className="w-6 h-6 accent-indigo-600 rounded" checked={formData.has_gps} onChange={e => setFormData({...formData, has_gps: e.target.checked})} />
                                    <span className="text-sm font-black group-hover:text-indigo-400 transition">GPS</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" className="w-6 h-6 accent-indigo-600 rounded" checked={formData.has_air_conditioning} onChange={e => setFormData({...formData, has_air_conditioning: e.target.checked})} />
                                    <span className="text-sm font-black group-hover:text-indigo-400 transition uppercase text-xs">Klimatyzacja</span>
                                </label>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] uppercase font-bold text-gray-500 ml-2">Zdjęcie pojazdu</label>
                                <div className="relative h-48 w-full bg-black/40 rounded-3xl overflow-hidden border border-white/5 flex items-center justify-center">
                                    {imagePreview ? (
                                        <>
                                            <img src={imagePreview} className="w-full h-full object-cover" alt="Podgląd" />
                                            <button
                                                type="button" onClick={handleRemoveImage}
                                                className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl text-[10px] font-black transition-all shadow-xl"
                                            >
                                                USUŃ
                                            </button>
                                        </>
                                    ) : (
                                        <span className="text-gray-600 italic text-sm">Brak wybranego zdjęcia</span>
                                    )}
                                </div>
                                <input
                                    type="file" accept="image/*"
                                    className="w-full bg-[#11111d] p-4 rounded-2xl text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 transition-all cursor-pointer"
                                    onChange={handleImageChange}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-4 rounded-[2rem] font-black uppercase shadow-lg shadow-indigo-500/20 transition-all">Zapisz</button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white/5 hover:bg-white/10 py-4 rounded-[2rem] font-bold uppercase transition-all">Anuluj</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCars;
