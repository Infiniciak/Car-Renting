import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [rentalPoints, setRentalPoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user', rental_point_id: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchData = async () => {
        try {
            const [usersRes, pointsRes] = await Promise.all([
                axios.get('http://localhost:8000/api/admin/users', config),
                axios.get('http://localhost:8000/api/admin/rental-points', config)
            ]);
            setUsers(usersRes.data);
            setRentalPoints(pointsRes.data);
            setLoading(false);
        } catch (err) {
            alert("Błąd połączenia z serwerem");
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8000/api/admin/users', newUser, config);
            setUsers([...users, res.data.user]);
            setIsAdding(false);
            setNewUser({ name: '', email: '', password: '', role: 'user', rental_point_id: '' });
            alert("Użytkownik dodany!");
        } catch (err) {
            alert(err.response?.data?.message || "Błąd podczas dodawania");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Usunąć tego użytkownika na stałe?")) return;
        try {
            await axios.delete(`http://localhost:8000/api/admin/users/${id}`, config);
            setUsers(users.filter(u => u.id !== id));
        } catch (err) {
            alert(err.response?.data?.message || "Błąd usuwania");
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`http://localhost:8000/api/admin/users/${editingUser.id}`, editingUser, config);
            setUsers(users.map(u => u.id === editingUser.id ? res.data.user : u));
            setEditingUser(null);
        } catch (err) {
            alert("Błąd aktualizacji");
        }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 text-gray-900 dark:text-white transition-colors duration-300">
            <div className="max-w-6xl mx-auto">
                {/* Header z przyciskiem DODAJ */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase text-gray-900 dark:text-white">Zarządzanie Kadrami</h1>
                        <p className="text-indigo-600 dark:text-indigo-400 font-medium">Panel administracyjny pracowników</p>
                    </div>
                    <div className="flex gap-4">
                        <input 
                            type="text" placeholder="Szukaj..." 
                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4 rounded-2xl w-64 outline-none focus:border-indigo-500 text-gray-900 dark:text-white transition-colors duration-200"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button 
                            onClick={() => setIsAdding(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 px-6 py-4 rounded-2xl font-black transition-all shadow-lg shadow-indigo-500/20"
                        >
                            + DODAJ PRACOWNIKA
                        </button>
                    </div>
                </div>

                {/* Lista Użytkowników */}
                <div className="grid grid-cols-1 gap-4">
                    {filteredUsers.map(user => (
                        <div key={user.id} className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-200 dark:border-gray-700 flex justify-between items-center transition-colors duration-300">
                            <div className="flex items-center gap-6">
                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold bg-indigo-500/10 text-indigo-400`}>
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{user.name}</h3>
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-[10px] bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-400 uppercase font-bold">{user.role}</span>
                                        {user.rental_point && (
                                            <span className="text-[10px] bg-emerald-500/10 px-2 py-1 rounded text-emerald-400 uppercase font-bold">
                                                {user.rental_point.city}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setEditingUser(user)} className="p-3 hover:text-indigo-400 transition-colors">Edytuj</button>
                                <button onClick={() => handleDelete(user.id)} className="p-3 hover:text-red-500 transition-colors">Usuń</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL: DODAWANIE (isAdding) LUB EDYCJA (editingUser) */}
            {(isAdding || editingUser) && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 p-10 rounded-[3rem] border border-gray-200 dark:border-gray-700 max-w-lg w-full transition-colors duration-300">
                        <h2 className="text-2xl font-black mb-6 uppercase text-gray-900 dark:text-white">
                            {isAdding ? "Nowy Użytkownik" : "Edycja Uprawnień"}
                        </h2>
                        <form onSubmit={isAdding ? handleCreate : handleUpdate} className="space-y-4">
                            <input 
                                className="w-full bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                                placeholder="Imię i Nazwisko"
                                value={isAdding ? newUser.name : editingUser.name}
                                onChange={e => isAdding ? setNewUser({...newUser, name: e.target.value}) : setEditingUser({...editingUser, name: e.target.value})}
                                required
                            />
                            <input 
                                className="w-full bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white transition-colors duration-200"
                                placeholder="Email"
                                type="email"
                                value={isAdding ? newUser.email : editingUser.email}
                                onChange={e => isAdding ? setNewUser({...newUser, email: e.target.value}) : setEditingUser({...editingUser, email: e.target.value})}
                                required
                            />
                            {isAdding && (
                                <input 
                                    className="w-full bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white transition-colors duration-200"
                                    placeholder="Hasło"
                                    type="password"
                                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                                    required
                                />
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <select 
                                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl border border-gray-300 dark:border-gray-600 text-indigo-600 dark:text-indigo-400 font-bold transition-colors duration-200"
                                    value={isAdding ? newUser.role : editingUser.role}
                                    onChange={e => isAdding ? setNewUser({...newUser, role: e.target.value}) : setEditingUser({...editingUser, role: e.target.value})}
                                >
                                    <option value="user">User</option>
                                    <option value="employee">Employee</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <select 
                                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white transition-colors duration-200"
                                    value={isAdding ? newUser.rental_point_id : (editingUser.rental_point_id || '')}
                                    onChange={e => isAdding ? setNewUser({...newUser, rental_point_id: e.target.value}) : setEditingUser({...editingUser, rental_point_id: e.target.value})}
                                >
                                    <option value="">Brak punktu</option>
                                    {rentalPoints.map(p => <option key={p.id} value={p.id}>{p.city}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="submit" className="flex-1 bg-indigo-600 py-4 rounded-2xl font-black uppercase">
                                    {isAdding ? "Stwórz" : "Zapisz"}
                                </button>
                                <button type="button" onClick={() => {setIsAdding(false); setEditingUser(null)}} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-4 rounded-2xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200">ANULUJ</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;