import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminRentals = () => {
    const [rentals, setRentals] = useState([]);
    const [users, setUsers] = useState([]);
    const [cars, setCars] = useState([]);
    const [points, setPoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRental, setEditingRental] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        user_id: '',
        car_id: '',
        rental_point_start_id: '',
        rental_point_end_id: '',
        start_date: '',
        planned_end_date: '',
        notes: ''
    });

    const [filters, setFilters] = useState({
        status: '',
        user_id: '',
        rental_point_id: ''
    });

    const [userSearch, setUserSearch] = useState('');
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [carSearch, setCarSearch] = useState('');
    const [showCarDropdown, setShowCarDropdown] = useState(false);
    const [startPointSearch, setStartPointSearch] = useState('');
    const [showStartPointDropdown, setShowStartPointDropdown] = useState(false);
    const [endPointSearch, setEndPointSearch] = useState('');
    const [showEndPointDropdown, setShowEndPointDropdown] = useState(false);

    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchData();
    }, [filters]);

   const fetchData = async () => {
        try {
            const cleanFilters = {};
            if (filters.status) cleanFilters.status = filters.status;
            if (filters.user_id) cleanFilters.user_id = filters.user_id;
            if (filters.rental_point_id) cleanFilters.rental_point_id = filters.rental_point_id;

            const [rentalsRes, usersRes, carsRes, pointsRes] = await Promise.all([
                axios.get('http://localhost:8000/api/admin/rentals', {
                    ...config,
                    params: cleanFilters
                }),
                axios.get('http://localhost:8000/api/admin/users', config),
                axios.get('http://localhost:8000/api/admin/cars', config),
                axios.get('http://localhost:8000/api/admin/rental-points', config)
            ]);

            setRentals(rentalsRes.data.data || rentalsRes.data || []);
            setUsers(usersRes.data || []);
            setCars(carsRes.data || []);
            setPoints(pointsRes.data || []);
            setLoading(false);
        } catch (error) {
            console.error("Błąd", error);
            setLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setEditingRental(null);
        resetForm();
        setIsModalOpen(true);
    };


    const handleOpenEditModal = (rental) => {
        setEditingRental(rental);
        setFormData({
            user_id: rental.user_id,
            car_id: rental.car_id,
            rental_point_start_id: rental.rental_point_start_id,
            rental_point_end_id: rental.rental_point_end_id,
            start_date: rental.start_date?.substring(0, 16),
            planned_end_date: rental.planned_end_date?.substring(0, 16),
            notes: rental.notes || ''
        });

        const selectedUser = users.find(u => u.id === rental.user_id);
        if (selectedUser) setUserSearch(`${selectedUser.name} (${selectedUser.email})`);

        const selectedCar = cars.find(c => c.id === rental.car_id);
        if (selectedCar) setCarSearch(`${selectedCar.brand} ${selectedCar.model} (${selectedCar.registration_number})`);

        const selectedStartPoint = points.find(p => p.id === rental.rental_point_start_id);
        if (selectedStartPoint) setStartPointSearch(selectedStartPoint.name);

        const selectedEndPoint = points.find(p => p.id === rental.rental_point_end_id);
        if (selectedEndPoint) setEndPointSearch(selectedEndPoint.name);

        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingRental) {
                await axios.put(`http://localhost:8000/api/admin/rentals/${editingRental.id}`, formData, config);
            } else {
                await axios.post('http://localhost:8000/api/admin/rentals', formData, config);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Błąd zapisu.');
        }
    };

    const resetForm = () => {
        setFormData({
            user_id: '', car_id: '', rental_point_start_id: '',
            rental_point_end_id: '', start_date: '', planned_end_date: '', notes: ''
        });
        setUserSearch('');
        setCarSearch('');
        setStartPointSearch('');
        setEndPointSearch('');
        setShowUserDropdown(false);
        setShowCarDropdown(false);
        setShowStartPointDropdown(false);
        setShowEndPointDropdown(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Usunąć wypożyczenie?")) return;
        try {
            await axios.delete(`http://localhost:8000/api/admin/rentals/${id}`, config);
            fetchData();
        } catch (error) {
            alert("Błąd usuwania");
        }
    };

    const handleCancel = async (id) => {
        const reason = prompt("Podaj powód anulowania:");
        if (!reason) return;

        try {
            await axios.post(`http://localhost:8000/api/admin/rentals/${id}/cancel`,
                { cancellation_reason: reason },
                config
            );
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Błąd anulowania.');
        }
    };

    const filteredUsers = (users || []).filter(user =>
        user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.email?.toLowerCase().includes(userSearch.toLowerCase())
    );

    const filteredCars = (cars || []).filter(car =>
        car.brand?.toLowerCase().includes(carSearch.toLowerCase()) ||
        car.model?.toLowerCase().includes(carSearch.toLowerCase()) ||
        car.registration_number?.toLowerCase().includes(carSearch.toLowerCase())
    );

    const filteredStartPoints = (points || []).filter(point =>
        point.name?.toLowerCase().includes(startPointSearch.toLowerCase()) ||
        point.city?.toLowerCase().includes(startPointSearch.toLowerCase())
    );

    const filteredEndPoints = (points || []).filter(point =>
        point.name?.toLowerCase().includes(endPointSearch.toLowerCase()) ||
        point.city?.toLowerCase().includes(endPointSearch.toLowerCase())
    );

    const handleUserSelect = (user) => {
        setFormData({...formData, user_id: user.id});
        setUserSearch(`${user.name} (${user.email})`);
        setShowUserDropdown(false);
    };

    const handleCarSelect = (car) => {
        setFormData({
            ...formData,
            car_id: car.id,
            rental_point_start_id: car.rental_point_id
        });

        setCarSearch(`${car.brand} ${car.model} (${car.registration_number})`);

        const carPoint = points.find(p => p.id === car.rental_point_id);
        if (carPoint) {
            setStartPointSearch(carPoint.name);
        }

        setShowCarDropdown(false);
    };

    const handleStartPointSelect = (point) => {
        setFormData({...formData, rental_point_start_id: point.id});
        setStartPointSearch(point.name);
        setShowStartPointDropdown(false);
    };

    const handleEndPointSelect = (point) => {
        setFormData({...formData, rental_point_end_id: point.id});
        setEndPointSearch(point.name);
        setShowEndPointDropdown(false);
    };

    const getStatusBadge = (status) => {
        const styles = {
            reserved: 'bg-indigo-500/10 text-indigo-400',
            active: 'bg-emerald-500/10 text-emerald-400',
            completed: 'bg-blue-500/10 text-blue-400',
            cancelled: 'bg-gray-500/10 text-gray-400',
            early_return: 'bg-yellow-500/10 text-yellow-400'
        };
        const labels = {
            reserved: 'Oczekujące',
            active: 'Aktywne',
            completed: 'Zakończone',
            cancelled: 'Anulowane',
            early_return: 'Wcześniejszy zwrot'
        };
        return (
            <span className={`text-[10px] px-2 py-1 rounded uppercase font-bold ${styles[status] || 'bg-white/5 text-gray-400'}`}>
                {labels[status]}
            </span>
        );
    };

    const filteredRentals = rentals.filter(rental => {
        const searchLower = searchTerm.toLowerCase();
        const userName = rental.user?.name?.toLowerCase() || '';
        const carBrand = rental.car?.brand?.toLowerCase() || '';
        const carModel = rental.car?.model?.toLowerCase() || '';
        const startCity = rental.rental_point_start?.city?.toLowerCase() || '';
        const endCity = rental.rental_point_end?.city?.toLowerCase() || '';
        const rentalId = rental.id?.toString() || '';

        return userName.includes(searchLower)
            || carBrand.includes(searchLower)
            || carModel.includes(searchLower)
            || startCity.includes(searchLower)
            || endCity.includes(searchLower)
            || rentalId.includes(searchLower);
    });


    if (loading) return (
        <div className="min-h-screen bg-[#11111d] flex items-center justify-center text-white italic">
            Ładowanie...
        </div>
    );

    return (
        <div className="min-h-screen bg-[#11111d] p-8 text-white font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase">Zarządzanie Wypożyczeniami</h1>
                        <p className="text-indigo-400 font-medium">Rejestr wypożyczeń</p>
                    </div>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Szukaj wypożyczenia..."
                            className="bg-[#1e1e2d] border border-white/10 p-4 rounded-2xl w-64 outline-none focus:border-indigo-500 transition-all"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button
                            onClick={handleOpenAddModal}
                            className="bg-indigo-600 hover:bg-indigo-700 px-6 py-4 rounded-2xl font-black transition-all"
                        >
                            + DODAJ WYPOŻYCZENIE
                        </button>
                    </div>
                </div>

                <div className="bg-[#1e1e2d] p-4 rounded-2xl border border-white/10 mb-6">
                    {/* Zmieniamy flex na grid z 4 kolumnami */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                        <select
                            value={filters.status}
                            onChange={e => setFilters({...filters, status: e.target.value})}
                            className="bg-[#11111d] p-3 rounded-xl border border-white/5 text-gray-400 outline-none w-full cursor-pointer hover:border-white/10 transition-colors"
                        >
                            <option value="">Wszystkie statusy</option>
                            <option value="active">Aktywne</option>
                            <option value="completed">Zakończone</option>
                            <option value="cancelled">Anulowane</option>
                            <option value="early_return">Wcześniejszy zwrot</option>
                        </select>

                        <select
                            value={filters.user_id}
                            onChange={e => setFilters({...filters, user_id: e.target.value})}
                            className="bg-[#11111d] p-3 rounded-xl border border-white/5 text-gray-400 outline-none w-full cursor-pointer hover:border-white/10 transition-colors"
                        >
                            <option value="">Wszyscy użytkownicy</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>

                        <select
                            value={filters.rental_point_id}
                            onChange={e => setFilters({...filters, rental_point_id: e.target.value})}
                            className="bg-[#11111d] p-3 rounded-xl border border-white/5 text-gray-400 outline-none w-full cursor-pointer hover:border-white/10 transition-colors"
                        >
                            <option value="">Wszystkie punkty</option>
                            {points.map(point => (
                                <option key={point.id} value={point.id}>{point.name}</option>
                            ))}
                        </select>

                        <button
                            onClick={() => setFilters({ status: '', user_id: '', rental_point_id: '' })}
                            className="w-full py-3 bg-white/5 hover:bg-red-500/10 hover:text-red-400 rounded-xl font-bold text-sm transition-all duration-200 border border-transparent hover:border-red-500/20"
                        >
                            Wyczyść filtry
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {filteredRentals.length === 0 ? (
                        <div className="bg-[#1e1e2d] p-12 rounded-[2rem] border border-white/5 text-center text-gray-400 italic">
                            Brak wypożyczeń
                        </div>
                    ) : (
                        filteredRentals.map(rental => (
                            <div key={rental.id} className="bg-[#1e1e2d] p-6 rounded-[2rem] border border-white/5">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                    <div className="flex items-start gap-6 w-full">
                                        <div className="h-16 w-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                                            🚗
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                <h3 className="font-bold text-xl">Wypożyczenie #{rental.id}</h3>
                                                {getStatusBadge(rental.status)}
                                            </div>
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                <span className="text-[10px] bg-rose-500/20 px-2 py-1 rounded text-rose-400 font-bold">
                                                    {rental.user?.name}
                                                </span>
                                                <span className="text-[10px] bg-rose-500/20 px-2 py-1 rounded text-rose-400 font-bold">
                                                    {rental.car?.brand} {rental.car?.model}
                                                </span>
                                                <span className="text-[10px] bg-rose-500/20 px-2 py-1 rounded text-rose-400 font-bold">
                                                    {rental.rental_point_start?.city} → {rental.rental_point_end?.city}
                                                </span>
                                                <span className="text-[10px] bg-rose-500/20 px-2 py-1 rounded text-rose-400 font-bold">
                                                   {rental.distance_km} km
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                                                <div>
                                                    <p className="text-gray-400 text-xs uppercase font-bold mb-1">Okres</p>
                                                    <p className="text-gray-300">{new Date(rental.start_date).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}</p>
                                                    <p className="text-gray-500">↓</p>
                                                    <p className="text-gray-300">{new Date(rental.planned_end_date).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400 text-xs uppercase font-bold mb-1">Cena</p>
                                                    <p className="text-emerald-400 text-2xl font-black">{rental.total_price} PLN</p>
                                                    {rental.discount_amount > 0 && (
                                                        <p className="text-xs text-emerald-500">Rabat: -{rental.discount_amount} PLN</p>
                                                    )}
                                                </div>
                                            </div>

                                            {rental.notes && (
                                                <div className="mt-3 p-3 bg-[#11111d] rounded-xl">
                                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Uwagi</p>
                                                    <p className="text-sm text-gray-300">{rental.notes}</p>
                                                </div>
                                            )}

                                            {rental.refund_amount > 0 && (
                                                <div className="mt-3 p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                                                    <p className="text-xs text-yellow-400 uppercase font-bold mb-1">Zwrot środków</p>
                                                    <p className="text-sm text-yellow-300">Zwrócono: {rental.refund_amount} PLN</p>
                                                    {rental.cancellation_reason && (
                                                        <p className="text-xs text-yellow-400 mt-1">Powód: {rental.cancellation_reason}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        {(rental.status === 'active' || rental.status === 'reserved') && (
                                            <button
                                                onClick={() => handleCancel(rental.id)}
                                                className="px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded-xl font-bold text-sm"
                                            >
                                               Anuluj i zwróć środki
                                            </button>
                                        )}
                                        {(rental.status === 'active' || rental.status === 'reserved') && (
                                            <button
                                                onClick={() => handleOpenEditModal(rental)}
                                                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-sm"
                                            >
                                                Edytuj
                                            </button>
                                        )}
                                        {(rental.status === 'completed' || rental.status === 'cancelled' || rental.status === 'early_return') && (
                                            <button
                                                onClick={() => handleDelete(rental.id)}
                                                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-bold text-sm"
                                            >
                                                Usuń
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md">
                    <div className="flex min-h-full items-center justify-center p-4">
                       <div className="bg-[#1e1e2d] p-10 rounded-[3rem] border border-white/10 max-w-2xl w-full shadow-2xl my-8">
                            <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter text-white">
                                {editingRental ? "Edytuj" : "Nowe"} Wypożyczenie
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6 text-left">
                                <div className="relative">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Użytkownik</label>
                                    <input
                                        type="text"
                                        value={userSearch}
                                        onChange={e => {
                                            setUserSearch(e.target.value);
                                            setShowUserDropdown(true);
                                            if (!e.target.value) setFormData({...formData, user_id: ''});
                                        }}
                                        onFocus={() => setShowUserDropdown(true)}
                                        placeholder="Wyszukaj użytkownika..."
                                        className="bg-[#11111d] p-4 rounded-2xl border-none text-white w-full focus:ring-2 focus:ring-indigo-500 outline-none"
                                        required={!formData.user_id}
                                    />
                                    {showUserDropdown && filteredUsers.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-[#11111d] border border-white/10 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
                                            {filteredUsers.map(user => (
                                                <div
                                                    key={user.id}
                                                    onClick={() => handleUserSelect(user)}
                                                    className="p-3 hover:bg-indigo-500/10 cursor-pointer border-b border-white/5 last:border-b-0"
                                                >
                                                    <p className="font-bold text-sm text-white">{user.name}</p>
                                                    <p className="text-xs text-gray-400">{user.email}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="relative">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Samochód</label>
                                    <input
                                        type="text"
                                        value={carSearch}
                                        onChange={e => {
                                            setCarSearch(e.target.value);
                                            setShowCarDropdown(true);
                                            if (!e.target.value) setFormData({ ...formData, car_id: '', rental_point_start_id: '' });
                                        }}
                                        onFocus={() => setShowCarDropdown(true)}
                                        placeholder="Wyszukaj samochód..."
                                        className="bg-[#11111d] p-4 rounded-2xl border-none text-white w-full focus:ring-2 focus:ring-indigo-500 outline-none"
                                        required={!formData.car_id}
                                    />
                                    {showCarDropdown && filteredCars.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-[#11111d] border border-white/10 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
                                            {filteredCars.map(car => (
                                                <div
                                                    key={car.id}
                                                    onClick={() => handleCarSelect(car)}
                                                    className="p-3 hover:bg-indigo-500/10 cursor-pointer border-b border-white/5 last:border-b-0"
                                                >
                                                    <p className="font-bold text-sm text-white">{car.brand} {car.model}</p>
                                                    <p className="text-xs text-gray-400">{car.registration_number}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative opacity-70">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                                            Punkt początkowy
                                        </label>
                                        <input
                                            type="text"
                                            value={startPointSearch}
                                            readOnly
                                            placeholder="Wybierz najpierw samochód..."
                                            className="bg-[#0a0a14] p-4 rounded-2xl border border-white/5 text-gray-500 w-full outline-none cursor-not-allowed"
                                        />
                                    </div>

                                    <div className="relative">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Punkt końcowy</label>
                                        <input
                                            type="text"
                                            value={endPointSearch}
                                            onChange={e => {
                                                setEndPointSearch(e.target.value);
                                                setShowEndPointDropdown(true);
                                                if (!e.target.value) setFormData({ ...formData, rental_point_end_id: '' });
                                            }}
                                            onFocus={() => setShowEndPointDropdown(true)}
                                            placeholder="Wyszukaj punkt..."
                                            className="bg-[#11111d] p-4 rounded-2xl border-none text-white w-full focus:ring-2 focus:ring-indigo-500 outline-none"
                                            required={!formData.rental_point_end_id}
                                        />
                                        {showEndPointDropdown && filteredEndPoints.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-[#11111d] border border-white/10 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
                                                {filteredEndPoints.map(point => (
                                                    <div
                                                        key={point.id}
                                                        onClick={() => handleEndPointSelect(point)}
                                                        className="p-3 hover:bg-indigo-500/10 cursor-pointer border-b border-white/5 last:border-b-0"
                                                    >
                                                        <p className="font-bold text-sm text-white">{point.name}</p>
                                                        <p className="text-xs text-gray-400">{point.city}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Data rozpoczęcia</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.start_date}
                                            onChange={e => setFormData({...formData, start_date: e.target.value})}
                                            className="bg-[#11111d] p-4 rounded-2xl border-none text-white w-full focus:ring-2 focus:ring-indigo-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Planowana data zakończenia</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.planned_end_date}
                                            onChange={e => setFormData({...formData, planned_end_date: e.target.value})}
                                            className="bg-[#11111d] p-4 rounded-2xl border-none text-white w-full focus:ring-2 focus:ring-indigo-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Uwagi (opcjonalne)</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={e => setFormData({...formData, notes: e.target.value})}
                                        className="bg-[#11111d] p-4 rounded-2xl border-none text-white w-full focus:ring-2 focus:ring-indigo-500 outline-none"
                                        rows="3"
                                        placeholder="Dodatkowe informacje..."
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-4 rounded-2xl font-black uppercase shadow-lg shadow-indigo-500/20 transition-all"
                                    >
                                        Zapisz
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 bg-white/5 hover:bg-white/10 py-4 rounded-2xl font-bold uppercase transition-all"
                                    >
                                        Anuluj
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRentals;
