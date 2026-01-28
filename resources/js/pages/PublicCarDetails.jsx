import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CarDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);

    // Sprawdzamy stan zalogowania na podstawie tokena
    const isLoggedIn = !!localStorage.getItem('token');

    const STORAGE_URL = 'http://localhost:8000/storage/';

    useEffect(() => {
        const fetchCarDetails = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/api/cars/${id}`);
                setCar(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Błąd pobierania szczegółów auta", err);
                setLoading(false);
            }
        };
        fetchCarDetails();
    }, [id]);

    const handleBookingClick = () => {
        if (!isLoggedIn) {
            navigate('/login');
        } else {
            // Logika dla zalogowanych - na razie tylko powiadomienie
            alert("nie mozna zarezerwowac");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!car) return <div className="text-center p-20 text-gray-500 italic">Nie znaleziono pojazdu.</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Nawigacja */}
            <nav className="bg-white shadow-sm p-4 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-black text-indigo-600 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <span>🚗</span> CarRent
                    </h1>
                    <button onClick={() => navigate('/cars')} className="text-gray-600 font-bold hover:text-indigo-600 transition">
                        &larr; Powrót do listy
                    </button>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto p-6 lg:p-12">
                <div className="flex flex-col lg:flex-row gap-12">

                    <div className="lg:w-2/3">
                        <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border border-white h-[400px] lg:h-[500px] group">
                            {car.image_path ? (
                                <img src={STORAGE_URL + car.image_path} alt={car.brand} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-6xl italic opacity-20">🚗</div>
                            )}

                            <div className="absolute top-6 left-6 flex gap-2">
                                <div className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-black text-gray-800 shadow-sm uppercase tracking-tighter">
                                    {car.type}
                                </div>
                                <div className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-black text-gray-800 shadow-sm uppercase tracking-tighter">
                                    {car.year}
                                </div>
                                <div className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-black text-gray-800 shadow-sm uppercase tracking-tighter">
                                    {car.seats} os.
                                </div>
                            </div>
                        </div>

                        <div className="mt-10">
                            <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-2">Specyfikacja techniczna</h2>
                            <h1 className="text-4xl font-black text-gray-900 mb-6">{car.brand} <span className="text-indigo-600">{car.model}</span></h1>

                            <p className="text-gray-600 leading-relaxed text-lg mb-8 italic">
                                {car.description || "Brak dodatkowego opisu dla tego pojazdu. Zapraszamy do kontaktu z punktem odbioru w celu uzyskania szczegółowych informacji."}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm text-center">
                                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1 tracking-widest">Paliwo</p>
                                    <p className="font-bold text-gray-800 uppercase text-sm">{car.fuel_type}</p>
                                </div>
                                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm text-center">
                                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1 tracking-widest">Skrzynia</p>
                                    <p className="font-bold text-gray-800 uppercase text-sm">{car.transmission}</p>
                                </div>
                                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm text-center">
                                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1 tracking-widest">GPS</p>
                                    <p className="font-bold text-gray-800 text-sm">{car.has_gps ? 'TAK' : 'NIE'}</p>
                                </div>
                                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm text-center">
                                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1 tracking-widest">Klimatyzacja</p>
                                    <p className="font-bold text-gray-800 text-sm">{car.has_air_conditioning ? 'TAK' : 'NIE'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-1/3">
                        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100 sticky top-28 transition-all">
                            <div className="mb-8">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cena wynajmu</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-gray-900 tracking-tighter">{car.price_per_day}</span>
                                    <span className="text-indigo-600 font-bold text-lg">PLN / doba</span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-10">
                                <div className="p-5 bg-gray-50 rounded-[2rem] border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Punkt odbioru</p>
                                    <p className="font-bold text-gray-800 text-sm">
                                        📍 {car.rental_point ? `${car.rental_point.name}, ${car.rental_point.city}` : "Magazyn centralny"}
                                    </p>
                                </div>
                                <div className="p-5 bg-emerald-50/50 rounded-[2rem] border border-emerald-100">
                                    <p className="text-[10px] font-black text-emerald-400 uppercase mb-1 tracking-widest">Ubezpieczenie</p>
                                    <p className="font-bold text-emerald-600 text-sm">Pełna ochrona w cenie</p>
                                </div>
                            </div>

                            <button
                                onClick={handleBookingClick}
                                className={`w-full py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] transition-all shadow-lg active:scale-95 ${
                                     "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
                                }`}
                            >
                                {isLoggedIn ? "Zarezerwuj" : "Zaloguj się, aby zarezerwować"}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CarDetails;
