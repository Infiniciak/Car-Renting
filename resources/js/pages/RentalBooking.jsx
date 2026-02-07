import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const RentalBooking = () => {
    const { carId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const STORAGE_URL = 'http://localhost:8000/storage/';

    const [car, setCar] = useState(null);
    const [points, setPoints] = useState([]);
    const [rentalStats, setRentalStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [calculating, setCalculating] = useState(false);

    const [formData, setFormData] = useState({
        rental_point_end_id: '',
        start_date: '',
        planned_end_date: '',
        notes: '',
        use_extra_insurance: location.state?.extraInsurance || false
    });

    const [endPointSearch, setEndPointSearch] = useState('');
    const [showEndPointDropdown, setShowEndPointDropdown] = useState(false);
    const [priceCalculation, setPriceCalculation] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (formData.rental_point_end_id && formData.start_date && formData.planned_end_date && car) {
            calculatePrice();
        }
    }, [formData.rental_point_end_id, formData.start_date, formData.planned_end_date, formData.use_extra_insurance]);

    const fetchData = async () => {
        try {
            const [carRes, pointsRes, statsRes] = await Promise.all([
                axios.get(`http://localhost:8000/api/cars/${carId}`),
                axios.get('http://localhost:8000/api/rental-points'),
                axios.get('http://localhost:8000/api/user/rental-stats', config)
            ]);

            setCar(carRes.data);
            setPoints(pointsRes.data);
            setRentalStats(statsRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error:', error);
            setLoading(false);
        }
    };

    const calculatePrice = async () => {
        setCalculating(true);
        try {
            const res = await axios.post('http://localhost:8000/api/user/calculate-price', {
                car_id: carId,
                rental_point_start_id: car.rental_point_id,
                rental_point_end_id: formData.rental_point_end_id,
                start_date: formData.start_date,
                planned_end_date: formData.planned_end_date,
                use_extra_insurance: formData.use_extra_insurance
            }, config);

            setPriceCalculation(res.data);
            setCalculating(false);
        } catch (error) {
            console.error('Calculation error:', error);
            setCalculating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/api/user/rentals', {
                ...formData,
                car_id: carId,
                rental_point_start_id: car.rental_point_id,
            }, config);

            alert('Rezerwacja utworzona pomyślnie!');
            navigate('/user/rentals');
        } catch (error) {
            alert(error.response?.data?.message || 'Błąd rezerwacji');
        }
    };

    const handleEndPointSelect = (point) => {
        setFormData({...formData, rental_point_end_id: point.id});
        setEndPointSearch(point.name);
        setShowEndPointDropdown(false);
    };

    const filteredEndPoints = ((points?.data || points) || []).filter(point =>
        point.name?.toLowerCase().includes(endPointSearch.toLowerCase()) ||
        point.city?.toLowerCase().includes(endPointSearch.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!car) return <div className="text-center p-20 text-gray-500 italic">Nie znaleziono pojazdu.</div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <nav className="bg-white shadow-sm p-4 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-black text-indigo-600 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <span>🚗</span> CarRent
                    </h1>
                    <button onClick={() => navigate(`/car/${carId}`)} className="text-gray-600 font-bold hover:text-indigo-600 transition">
                        &larr; Wróć do szczegółów
                    </button>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto p-6 lg:p-12">
                {rentalStats && rentalStats.rentals_until_discount === 0 && (
                    <div className="mb-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6 rounded-3xl shadow-lg">
                        <p className="text-sm font-bold uppercase tracking-widest mb-1">Gratulacje!</p>
                        <p className="text-2xl font-black">To Twoje {rentalStats.completed_rentals + 1}. wypożyczenie - {rentalStats.next_discount}% rabatu!</p>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-5/12">
                        <div className="bg-white rounded-[2.5rem] shadow-lg border border-gray-100 overflow-hidden sticky top-24">
                            <div className="h-64 bg-gray-100">
                                {car.image_path ? (
                                    <img src={STORAGE_URL + car.image_path} alt={car.model} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">🚗</div>
                                )}
                            </div>

                            <div className="p-6">
                                <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tighter">{car.brand} {car.model}</h2>
                                <p className="text-gray-400 font-bold text-xs uppercase mb-6 tracking-widest">{car.type} • {car.year}</p>

                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Stawka dobowa</span>
                                        <span className="text-xl font-black text-gray-900">{car.price_per_day} PLN</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Punkt odbioru</span>
                                        <span className="text-sm font-bold text-indigo-600 uppercase italic tracking-tighter">{car.rental_point?.city}</span>
                                    </div>
                                    {rentalStats && (
                                        <div className="mt-4 p-4 bg-indigo-50 rounded-2xl">
                                            <p className="text-xs font-bold text-indigo-400 uppercase mb-1">Twoje wypożyczenia</p>
                                            <p className="text-2xl font-black text-indigo-600">{rentalStats.completed_rentals}</p>
                                            {rentalStats.rentals_until_discount > 0 && (
                                                <p className="text-xs text-indigo-500 mt-2">
                                                    Za {rentalStats.rentals_until_discount + 1} wypożyczeń: {rentalStats.next_discount}% rabatu
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-7/12">
                        <div className="bg-white rounded-[2.5rem] shadow-lg border border-gray-100 p-10">
                            <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tighter">Konfiguracja Rezerwacji</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="relative">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Punkt zwrotu pojazdu</label>
                                    <input
                                        type="text"
                                        value={endPointSearch}
                                        onChange={e => {
                                            setEndPointSearch(e.target.value);
                                            setShowEndPointDropdown(true);
                                            if (!e.target.value) setFormData({...formData, rental_point_end_id: ''});
                                        }}
                                        onFocus={() => setShowEndPointDropdown(true)}
                                        placeholder="Wpisz miasto lub nazwę punktu..."
                                        className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-indigo-500 outline-none transition"
                                        required
                                    />
                                    {showEndPointDropdown && filteredEndPoints.length > 0 && (
                                        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-60 overflow-y-auto p-2">
                                            {filteredEndPoints.map(point => (
                                                <div key={point.id} onClick={() => handleEndPointSelect(point)} className="p-3 hover:bg-indigo-50 rounded-xl cursor-pointer transition">
                                                    <p className="font-black text-gray-800 text-sm">{point.name}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase font-bold">{point.city}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Data i godzina odbioru</label>
                                        <input type="datetime-local" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:border-indigo-500 transition" required />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Planowana data zwrotu</label>
                                        <input type="datetime-local" value={formData.planned_end_date} onChange={e => setFormData({...formData, planned_end_date: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:border-indigo-500 transition" required />
                                    </div>
                                </div>

                                <div
                                    onClick={() => setFormData({...formData, use_extra_insurance: !formData.use_extra_insurance})}
                                    className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                                        formData.use_extra_insurance ? 'border-emerald-500 bg-emerald-50 shadow-inner' : 'border-gray-100 bg-gray-50 hover:border-indigo-100'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl">{formData.use_extra_insurance ? '💎' : '🛡️'}</span>
                                        <div>
                                            <p className="font-black text-gray-800 uppercase text-xs tracking-widest">Ubezpieczenie AC Premium</p>
                                            <p className="text-[10px] text-gray-500 italic">Ochrona przed kradzieżą i uszkodzeniami</p>
                                        </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.use_extra_insurance ? 'bg-emerald-500 border-emerald-500 shadow-md' : 'border-gray-300'}`}>
                                        {formData.use_extra_insurance && <span className="text-white text-[10px]">✓</span>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-2">Uwagi do rezerwacji</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={e => setFormData({...formData, notes: e.target.value})}
                                        className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-indigo-500 outline-none"
                                        rows="3"
                                        placeholder="Dodatkowe informacje..."
                                    />
                                </div>

                                {/* PODSUMOWANIE KOSZTÓW - DOPASOWANA KOLORYSTYKA */}
                                {priceCalculation && (
                                    <div className="bg-white rounded-3xl p-8 shadow-sm border-2 border-gray-50 animate-in slide-in-from-top-4">
                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-6">Podsumowanie kosztów</p>

                                        <div className="space-y-4">
                                            <div className="flex justify-between text-xs font-bold text-gray-500">
                                                <span>Najem pojazdu ({priceCalculation.days} dni)</span>
                                                <span className="text-gray-900">{priceCalculation.base_price} PLN</span>
                                            </div>

                                            {!formData.use_extra_insurance ? (
                                                <div className="flex justify-between text-xs font-bold text-emerald-600 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="text-xs">🛡️</span> Ochrona Standard (OC/NW)
                                                    </span>
                                                    <span>+{priceCalculation.insurance_price} PLN</span>
                                                </div>
                                            ) : (
                                                <div className="flex justify-between text-xs font-bold text-indigo-600 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="text-xs">💎</span> Pełna ochrona AC (SCDW)
                                                    </span>
                                                    <span>+{priceCalculation.insurance_price} PLN</span>
                                                </div>
                                            )}

                                            {parseFloat(priceCalculation.distance_fee) > 0 && (
                                                <div className="flex justify-between text-xs font-bold text-gray-500">
                                                    <span>Opłata relokacyjna</span>
                                                    <span className="text-gray-900">{priceCalculation.distance_fee} PLN</span>
                                                </div>
                                            )}

                                            {parseFloat(priceCalculation.discount_amount) > 0 && (
                                                <div className="flex justify-between text-xs font-bold text-emerald-600 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                                                    <span className="flex items-center gap-1.5">🎁 Rabat lojalnościowy</span>
                                                    <span>-{priceCalculation.discount_amount} PLN</span>
                                                </div>
                                            )}

                                            <div className="pt-6 mt-2 border-t border-gray-100 flex justify-between items-end">
                                                <div>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Razem do zapłaty</p>
                                                    <span className="text-4xl font-black text-indigo-600 tracking-tighter">
                                                        {priceCalculation.total_price}
                                                    </span>
                                                    <span className="text-xs ml-1 text-indigo-600 font-bold italic">PLN</span>
                                                </div>
                                                <div className="text-right pb-1">
                                                     <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter italic">
                                                        {priceCalculation.days} {priceCalculation.days === 1 ? 'doba' : 'dni'}
                                                     </span>
                                                </div>
                                            </div>

                                            <div className="pt-4 flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Twoje aktualne saldo</span>
                                                    <span className={`text-sm font-black ${priceCalculation.has_enough_balance ? "text-emerald-500" : "text-rose-500"}`}>
                                                        {priceCalculation.user_balance} PLN
                                                    </span>
                                                </div>
                                                {!priceCalculation.has_enough_balance && (
                                                    <div className="px-3 py-1.5 bg-rose-50 rounded-lg border border-rose-100">
                                                        <p className="text-[9px] text-rose-500 font-black uppercase tracking-tighter italic">Niewystarczające środki</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={!priceCalculation || !priceCalculation.has_enough_balance || calculating}
                                    className="w-full py-6 rounded-3xl bg-indigo-600 text-white font-black uppercase text-xs tracking-[0.3em] hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-30"
                                >
                                    {calculating ? 'Przeliczam dane...' : 'Potwierdź rezerwację'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RentalBooking;
