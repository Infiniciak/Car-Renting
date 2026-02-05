import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CarWizard = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [answers, setAnswers] = useState({
        routeType: '',
        transmission: '',
        passengers: 2,
        days: 1,
        isEco: false,
        budget: 2000
    });
    const [recommendations, setRecommendations] = useState([]);
    const navigate = useNavigate();
    const STORAGE_URL = 'http://localhost:8000/storage/';

    useEffect(() => {
        const saved = sessionStorage.getItem('wizard_cache');
        if (saved) {
            try {
                setRecommendations(JSON.parse(saved));
                setStep(7);
            } catch (e) {
                console.error("Błąd parsowania cache", e);
            }
        }
    }, []);

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const findMatch = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:8000/api/cars');
            const allCars = res.data.data || res.data;

            const totalBudget = parseFloat(answers.budget) || 0;
            const days = parseInt(answers.days) || 1;
            const MAX_SCORE = 130;

            const scored = allCars.map(car => {
                let score = 0;

                const carPrice = parseFloat(car.price_per_day) || 0;
                const carInsurance = parseFloat(car.insurance_per_day) || 0;
                const carSeats = parseInt(car.seats) || 0;

                const totalCost = (carPrice + carInsurance) * days;

                if (car.status !== 'available') return null;
                if (carSeats < parseInt(answers.passengers)) return null;
                if (totalCost > totalBudget) return null;

                const budgetRatio = 1 - (totalCost / totalBudget);
                score += Math.max(0, Math.floor(budgetRatio * 30));

                if (answers.transmission === 'any' || car.transmission === answers.transmission) score += 20;

                if (answers.routeType === 'city') {
                    if (car.fuel_type === 'electric') score += 40;
                    else if (car.type === 'hatchback') score += 20;
                }
                if (answers.routeType === 'mountains') {
                    if (car.type === 'SUV') score += 40;
                    else if (car.fuel_type === 'diesel') score += 20;
                }
                if (answers.routeType === 'long-distance') {
                    if (car.type === 'sedan' || car.type === 'SUV') score += 40;
                }

                if (answers.isEco) {
                    if (car.fuel_type === 'electric') score += 40;
                    else if (car.fuel_type === 'hybrid') score += 25;
                } else {
                    score += 20;
                }

                const matchPercentage = Math.min(100, Math.round((score / MAX_SCORE) * 100));

                return {
                    ...car,
                    matchScore: matchPercentage || 0,
                    totalCostCalculated: totalCost || 0
                };
            })
            .filter(car => car !== null)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 3);

            setRecommendations(scored);
            sessionStorage.setItem('wizard_cache', JSON.stringify(scored));
            setStep(7);
        } catch (err) {
            console.error("Błąd asystenta:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        sessionStorage.removeItem('wizard_cache');
        setAnswers({
            routeType: '',
            transmission: '',
            passengers: 2,
            days: 1,
            isEco: false,
            budget: 2000
        });
        setStep(1);
    };

    return (
        <div className="min-h-screen bg-[#0f0f17] text-white flex items-center justify-center p-4 font-sans">
            <div className="max-w-xl w-full bg-[#1e1e2d] rounded-[3rem] p-8 md:p-12 border border-white/5 shadow-2xl relative">

                {step < 7 && (
                    <div className="mb-10 text-center">
                        <div className="flex gap-2 mb-4">
                            {[1,2,3,4,5,6].map(s => (
                                <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-white/5'}`}></div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Krok {step} z 6</span>
                            {step > 1 && (
                                <button onClick={handleBack} className="text-[10px] text-gray-500 hover:text-white uppercase font-bold transition">Wróć</button>
                            )}
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div className="animate-in fade-in zoom-in duration-300">
                        <h2 className="text-3xl font-black mb-6 uppercase tracking-tighter">Cel <span className="text-indigo-500 text-shadow-glow">podróży?</span></h2>
                        <div className="space-y-3">
                            {[{id:'city', l:'Miasto', i:'🏙️'}, {id:'mountains', l:'Góry', i:'🏔️'}, {id:'long-distance', l:'Trasa', i:'🛣️'}].map(o => (
                                <button key={o.id} onClick={()=>{setAnswers({...answers, routeType:o.id}); setStep(2)}}
                                    className="w-full p-6 bg-[#11111d] rounded-2xl border border-white/5 hover:border-indigo-500 transition-all text-left flex items-center gap-4 group active:scale-95">
                                    <span className="text-3xl group-hover:scale-110 transition-transform">{o.i}</span>
                                    <span className="font-bold text-lg group-hover:text-indigo-400">{o.l}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in fade-in">
                        <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter">Ilu <span className="text-indigo-500">pasażerów?</span></h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[2, 5, 7, 9].map(n => (
                                <button key={n} onClick={()=>{setAnswers({...answers, passengers:n}); setStep(3)}}
                                    className="p-8 bg-[#11111d] rounded-3xl border border-white/5 hover:border-indigo-500 transition-all font-black text-2xl active:scale-95">
                                    {n} <span className="text-xs block text-gray-500 font-bold uppercase">osób</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-in fade-in">
                        <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter">Skrzynia <span className="text-indigo-500">biegów?</span></h2>
                        <div className="space-y-3">
                            {['manual', 'automatic', 'any'].map(t => (
                                <button key={t} onClick={()=>{setAnswers({...answers, transmission:t}); setStep(4)}}
                                    className="w-full p-6 bg-[#11111d] rounded-2xl border border-white/5 hover:border-indigo-500 font-bold uppercase tracking-widest text-xs active:scale-95 transition-all">
                                    {t === 'any' ? 'Bez znaczenia' : t === 'manual' ? 'Manualna' : 'Automatyczna'}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="animate-in fade-in text-center">
                        <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter text-emerald-400">Ekologia?</h2>
                        <p className="text-gray-500 text-sm mb-8">Czy szukasz auta elektrycznego lub hybrydy?</p>
                        <div className="flex gap-4">
                            <button onClick={()=>{setAnswers({...answers, isEco:true}); setStep(5)}} className="flex-1 py-6 bg-emerald-600 rounded-2xl font-black uppercase text-xs hover:bg-emerald-500 transition-all active:scale-95">Tak</button>
                            <button onClick={()=>{setAnswers({...answers, isEco:false}); setStep(5)}} className="flex-1 py-6 bg-white/5 rounded-2xl font-black uppercase text-xs hover:bg-white/10 transition-all active:scale-95">Nie</button>
                        </div>
                    </div>
                )}

                {step === 5 && (
                    <div className="animate-in fade-in">
                        <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter">Na ile <span className="text-indigo-500">dni?</span></h2>
                        <input type="range" min="1" max="30" value={answers.days} onChange={e=>setAnswers({...answers, days:e.target.value})} className="w-full accent-indigo-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer mb-6" />
                        <div className="text-center text-5xl font-black text-indigo-400">{answers.days} <span className="text-lg">DNI</span></div>
                        <button onClick={()=>setStep(6)} className="w-full mt-10 py-5 bg-indigo-600 rounded-2xl font-black uppercase text-xs active:scale-95 hover:bg-indigo-500 shadow-xl transition-all">Dalej</button>
                    </div>
                )}

                {step === 6 && (
                    <div className="animate-in fade-in">
                        <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter text-center">Budżet <span className="text-indigo-500">całkowity</span></h2>
                        <input type="number" value={answers.budget} onChange={e=>setAnswers({...answers, budget:e.target.value})}
                               className="w-full bg-[#11111d] p-6 rounded-3xl border border-white/5 font-black text-3xl text-center text-indigo-400 focus:border-indigo-500 outline-none transition-all shadow-inner" />
                        <p className="text-center text-[10px] text-gray-600 mt-4 uppercase font-bold tracking-widest">Suma za {answers.days} dni (PLN)</p>
                        <button onClick={findMatch} disabled={loading} className="w-full mt-10 py-5 bg-indigo-600 rounded-2xl font-black uppercase text-xs shadow-2xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50">
                            {loading ? "Analizuję flotę..." : "Pokaż najlepsze auta"}
                        </button>
                    </div>
                )}

                {step === 7 && (
                    <div className="animate-in zoom-in duration-500 w-full">
                        <h2 className="text-2xl font-black mb-8 uppercase tracking-tighter text-center">
                            <span className="text-indigo-500 text-shadow-glow">Top 3 Aut</span>
                        </h2>
                        <div className="space-y-4">
                            {recommendations.length > 0 ? recommendations.map((car, i) => (
                                <div key={car.id} onClick={() => navigate(`/car/${car.id}`)}
                                    className="p-6 bg-[#11111d] rounded-[2.5rem] border border-white/5 hover:border-indigo-500/50 transition-all cursor-pointer group relative overflow-hidden">

                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-black text-xl uppercase group-hover:text-indigo-400 transition-colors">
                                                {car.brand} {car.model}
                                            </h3>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                                                {car.type} • {car.fuel_type} • {car.seats} miejsc
                                            </p>
                                        </div>
                                        <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                            {car.matchScore}%
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Do zapłaty łącznie</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-2xl font-black text-white">
                                                    {Number(car.totalCostCalculated).toLocaleString() || "0"}
                                                </span>
                                                <span className="text-indigo-400 font-bold text-[10px] uppercase">PLN</span>
                                                <span className="text-gray-500 text-[10px] font-bold">/ {answers.days} dni</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter italic opacity-70">
                                                ~ {Math.round(car.totalCostCalculated / answers.days)} PLN / dzień
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {parseInt(car.seats) >= parseInt(answers.passengers) && (
                                            <span className="text-[8px] bg-indigo-500/10 text-indigo-300 px-2 py-1 rounded uppercase font-black italic tracking-widest border border-indigo-500/10">✓ Pojemny</span>
                                        )}
                                        {car.totalCostCalculated <= answers.budget && (
                                            <span className="text-[8px] bg-emerald-500/10 text-emerald-300 px-2 py-1 rounded uppercase font-black italic tracking-widest border border-emerald-500/10">✓ Budżetowy</span>
                                        )}
                                        {car.fuel_type === 'electric' && answers.routeType === 'city' && (
                                            <span className="text-[8px] bg-blue-500/10 text-blue-300 px-2 py-1 rounded uppercase font-black italic tracking-widest border border-blue-500/10">✓ Eko-Miasto</span>
                                        )}
                                    </div>

                                    <div className="absolute right-4 bottom-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">
                                        <span className="text-indigo-400 font-black text-xl">→</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center p-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                                    <p className="text-gray-400 italic mb-6">Brak aut spełniających Twoje wymagania (sprawdź budżet lub liczbę miejsc).</p>
                                    <button onClick={handleReset} className="px-8 py-4 bg-indigo-600 rounded-2xl font-black uppercase text-xs hover:bg-indigo-500 transition-all active:scale-95 shadow-lg">
                                        Zmień parametry
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mt-10 flex flex-col items-center gap-4">
                            <button onClick={handleReset} className="text-gray-500 hover:text-white font-black uppercase text-[10px] tracking-[0.3em] transition-colors border-b border-transparent hover:border-gray-500 pb-1">
                                Resetuj i zacznij od nowa
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CarWizard;
