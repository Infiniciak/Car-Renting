import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null); // Stan dla modalu edycji
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8000/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            alert("Błąd pobierania danych");
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    // USUWANIE UŻYTKOWNIKA
    const handleDelete = async (id) => {
        if (!window.confirm("Czy na pewno chcesz usunąć tego użytkownika?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8000/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.filter(u => u.id !== id)); // Usuń z widoku bez przeładowania
        } catch (err) {
            alert(err.response?.data?.message || "Błąd usuwania");
        }
    };

    // AKTUALIZACJA UŻYTKOWNIKA
    const handleUpdate = async (e) => {
        e.preventDefault();
        console.log("Wysyłane dane:", editingUser);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`http://localhost:8000/api/admin/users/${editingUser.id}`, editingUser, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.map(u => u.id === editingUser.id ? res.data.user : u));
            setEditingUser(null);
            alert("Dane zaktualizowane pomyślnie!");
        } catch (err) {
        console.error("Błąd z serwera:", err.response.data); // To powie Ci dokładnie co Laravelowi się nie podoba
        alert("Błąd aktualizacji: " + (err.response.data.message || "Sprawdź email"));
    }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center font-bold text-indigo-400">Synchronizacja z bazą...</div>;

    return (
        <div className="min-h-screen bg-[#11111d] p-8 text-white">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase">Zarządzanie Użytkownikami</h1>
                        <p className="text-indigo-400 font-medium">Baza wszystkich zarejestrowanych kont</p>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Szukaj po nazwie lub email..." 
                        className="bg-[#1e1e2d] border border-white/10 p-4 rounded-2xl w-80 outline-none focus:border-indigo-500 transition-all"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {filteredUsers.map(user => (
                        <div key={user.id} className="bg-[#1e1e2d] p-6 rounded-[2rem] border border-white/5 flex justify-between items-center group hover:border-indigo-500/50 transition-all">
                            <div className="flex items-center gap-6">
                                <div className="h-14 w-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 font-black text-xl">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{user.name}</h3>
                                    <p className="text-gray-500 text-sm">{user.email}</p>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/5 px-2 py-1 rounded-md mt-2 inline-block">
                                        Rola: {user.role}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setEditingUser(user)}
                                    className="px-6 py-3 bg-white/5 hover:bg-indigo-600 rounded-2xl font-bold transition-all"
                                >
                                    Edytuj
                                </button>
                                <button 
                                    onClick={() => handleDelete(user.id)}
                                    className="px-6 py-3 bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white rounded-2xl font-bold transition-all"
                                >
                                    Usuń
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL EDYCJI (WYŚWIETLANY WARUNKOWO) */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-[#1e1e2d] p-10 rounded-[3rem] border border-white/10 max-w-md w-full shadow-2xl">
                        <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter text-white">Edycja profilu</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase ml-2">Imię i Nazwisko</label>
                                <input 
                                    className="w-full bg-[#11111d] border-none p-4 rounded-2xl mt-1 focus:ring-2 focus:ring-indigo-500"
                                    value={editingUser.name}
                                    onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase ml-2">Email</label>
                                <input 
                                    className="w-full bg-[#11111d] border-none p-4 rounded-2xl mt-1 focus:ring-2 focus:ring-indigo-500"
                                    value={editingUser.email}
                                    onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase ml-2">Rola</label>
                                <select 
                                    className="w-full bg-[#11111d] border-none p-4 rounded-2xl mt-1 font-bold text-indigo-400"
                                    value={editingUser.role}
                                    onChange={e => setEditingUser({...editingUser, role: e.target.value})}
                                >
                                    <option value="user">User</option>
                                    <option value="employee">Employee</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase ml-2">Nowe Hasło (opcjonalnie)</label>
                                <input 
                                    type="password"
                                    placeholder="Pozostaw puste, aby nie zmieniać"
                                    className="w-full bg-[#11111d] border-none p-4 rounded-2xl mt-1 focus:ring-2 focus:ring-indigo-500"
                                    onChange={e => setEditingUser({...editingUser, password: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="submit" className="flex-1 bg-indigo-600 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all">ZAPISZ</button>
                                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 bg-white/5 py-4 rounded-2xl font-bold">ANULUJ</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;