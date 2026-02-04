import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Pagination from '../components/Pagination';

const UserRentals = () => {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 10
    });

    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const STORAGE_URL = 'http://localhost:8000/storage/';

    useEffect(() => {
        fetchRentals(1);
    }, []);

    const fetchRentals = async (page = 1) => {
        try {
            const res = await axios.get(`http://localhost:8000/api/user/rentals?page=${page}`, config);

            if (res.data.data) {
                setRentals(res.data.data || []);
                setPagination({
                    current_page: res.data.current_page || 1,
                    last_page: res.data.last_page || 1,
                    total: res.data.total || 0,
                    per_page: res.data.per_page || 10
                });
            } else {
                setRentals(Array.isArray(res.data) ? res.data : []);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching rentals:', error);
            setRentals([]);
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            reserved: 'bg-indigo-500 text-white',
            active: 'bg-emerald-500 text-white',
            completed: 'bg-blue-500 text-white',
            cancelled: 'bg-gray-400 text-white',
            early_return: 'bg-yellow-500 text-white',
            pending_return: 'bg-orange-500 text-white'
        };
        const labels = {
            reserved: 'Zarezerwowane',
            active: 'Aktywne',
            completed: 'Zakończone',
            cancelled: 'Anulowane',
            early_return: 'Wcześniejszy zwrot',
            pending_return: 'Oczekuje na weryfikację'
        };
        return (
            <span className={`text-xs px-3 py-1 rounded-full font-bold ${styles[status] || 'bg-gray-300 text-white'}`}>
                {labels[status]}
            </span>
        );
    };

    const handleCancel = async (rentalId) => {
        if (!window.confirm("Czy na pewno chcesz anulować to wypożyczenie?")) return;

        try {
            const res = await axios.post(`http://localhost:8000/api/user/rentals/${rentalId}/cancel`, {}, config);
            alert(`${res.data.message}. Zwrócono: ${res.data.refund_amount} PLN`);
            fetchRentals(pagination.current_page);
        } catch (err) {
            alert(err.response?.data?.message || "Błąd podczas anulowania");
        }
    };

    const handleRequestReturn = async (rentalId) => {
        if (!window.confirm('Czy jesteś gotowy zwrócić pojazd? Upewnij się, że auto jest czyste i bak pełny.')) return;

        try {
            const res = await axios.post(`http://localhost:8000/api/user/rentals/${rentalId}/request-return`, {}, config);
            fetchRentals(pagination.current_page);
            alert(res.data.message);
        } catch (err) {
            alert(err.response?.data?.message || 'Błąd podczas zgłaszania zwrotu');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm p-4 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-black text-indigo-600 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <span>🚗</span> CarRent
                    </h1>
                    <div className="flex gap-4">
                        <button onClick={() => navigate('/cars')} className="text-gray-600 font-bold hover:text-indigo-600 transition">
                            Przeglądaj samochody
                        </button>
                        <button onClick={() => navigate('/profile')} className="text-gray-600 font-bold hover:text-indigo-600 transition">
                            Profil
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto p-6 lg:p-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-gray-900 mb-2">Moje wypożyczenia</h1>
                    <p className="text-gray-500">Historia wszystkich Twoich rezerwacji</p>
                </div>

                {!rentals || rentals.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
                        <p className="text-gray-400 text-lg mb-4">Nie masz jeszcze żadnych wypożyczeń</p>
                        <button
                            onClick={() => navigate('/cars')}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition"
                        >
                            Przeglądaj samochody
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-6">
                            {rentals.map(rental => (
                                <div key={rental.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition">
                                    <div className="flex flex-col lg:flex-row">
                                        <div className="lg:w-1/3 h-48 lg:h-auto bg-gray-100">
                                            {rental.car?.image_path ? (
                                                <img src={STORAGE_URL + rental.car.image_path} alt={rental.car.model} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">🚗</div>
                                            )}
                                        </div>

                                        <div className="lg:w-2/3 p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-2xl font-black text-gray-900">{rental.car?.brand} {rental.car?.model}</h3>
                                                    <p className="text-gray-500 text-sm">{rental.car?.year} • {rental.car?.type}</p>
                                                </div>
                                                {getStatusBadge(rental.status)}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div className="bg-gray-50 rounded-2xl p-4">
                                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Okres wypożyczenia</p>
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {new Date(rental.start_date).toLocaleDateString('pl-PL')}
                                                    </p>
                                                    <p className="text-xs text-gray-500">do</p>
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {new Date(rental.planned_end_date).toLocaleDateString('pl-PL')}
                                                    </p>
                                                </div>

                                                <div className="bg-gray-50 rounded-2xl p-4">
                                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Trasa</p>
                                                    <p className="text-sm font-bold text-indigo-600">
                                                        {rental.rental_point_start?.city || 'N/A'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">→</p>
                                                    <p className="text-sm font-bold text-indigo-600">
                                                        {rental.rental_point_end?.city || 'N/A'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">{rental.distance_km} km</p>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase">Całkowity koszt</p>
                                                    <p className="text-2xl font-black text-gray-900">{rental.total_price} PLN</p>
                                                    {rental.discount_amount > 0 && (
                                                        <p className="text-xs text-emerald-600 font-bold">Zaoszczędzono: {rental.discount_amount} PLN</p>
                                                    )}
                                                    {rental.refund_amount > 0 && (
                                                        <p className="text-xs text-yellow-600 font-bold">Zwrot: {rental.refund_amount} PLN</p>
                                                    )}
                                                </div>

                                                {rental.status === 'reserved' && (
                                                    <button
                                                        onClick={() => handleCancel(rental.id)}
                                                        className="bg-rose-50 text-rose-600 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-rose-100 transition border border-rose-100"
                                                    >
                                                        Anuluj rezerwację
                                                    </button>
                                                )}

                                                {rental.status === 'active' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleRequestReturn(rental.id)}
                                                            className="bg-green-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-green-700 transition"
                                                        >
                                                            Zakończ wynajem
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancel(rental.id)}
                                                            className="bg-yellow-500 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-yellow-600 transition"
                                                            title="Wcześniejszy zwrot z 20% karą"
                                                        >
                                                            Zwróć wcześniej
                                                        </button>
                                                    </div>
                                                )}

                                                {rental.status === 'pending_return' && (
                                                    <div className="text-orange-600 font-bold text-sm text-right">
                                                        <p className="flex items-center gap-2">
                                                            Oczekuje na weryfikację
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">Pracownik sprawdza stan pojazdu</p>
                                                    </div>
                                                )}
                                            </div>

                                            {rental.notes && (
                                                <div className="mt-4 p-3 bg-blue-50 rounded-2xl">
                                                    <p className="text-xs font-bold text-blue-400 uppercase mb-1">Uwagi</p>
                                                    <p className="text-sm text-gray-700">{rental.notes}</p>
                                                </div>
                                            )}

                                            {rental.cancellation_reason && (
                                                <div className="mt-4 p-3 bg-yellow-50 rounded-2xl">
                                                    <p className="text-xs font-bold text-yellow-600 uppercase mb-1">Powód anulowania</p>
                                                    <p className="text-sm text-gray-700">{rental.cancellation_reason}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {pagination.last_page > 1 && (
                            <Pagination
                                currentPage={pagination.current_page}
                                lastPage={pagination.last_page}
                                total={pagination.total}
                                perPage={pagination.per_page}
                                onPageChange={fetchRentals}
                            />
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default UserRentals;
