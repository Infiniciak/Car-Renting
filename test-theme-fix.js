// ===== TEST MOTYWU - WKLEJ DO KONSOLI PRZEGLĄDARKI (F12) =====

console.clear();
console.log('%c🧪 TEST ZMIANY MOTYWU', 'font-size: 20px; font-weight: bold; color: #22c55e');

// 1. Sprawdź aktualny stan
console.log('\n📊 AKTUALNY STAN:');
console.log('localStorage.theme:', localStorage.getItem('theme'));
console.log('html.classList:', document.documentElement.classList.toString());
console.log('html.data-theme:', document.documentElement.getAttribute('data-theme'));

// 2. Funkcja testowa zmiany motywu
window.testTheme = (newTheme) => {
    console.log(`\n🔄 ZMIANA NA: ${newTheme}`);
    
    // Zapisz do localStorage
    localStorage.setItem('theme', newTheme);
    console.log('✅ Zapisano do localStorage');
    
    // Wyślij event (jak Profile.jsx)
    window.dispatchEvent(new CustomEvent('themeChanged', { 
        detail: { theme: newTheme } 
    }));
    console.log('✅ Wysłano event');
    
    // Sprawdź wynik
    setTimeout(() => {
        console.log('\n📊 STAN PO ZMIANIE:');
        console.log('localStorage.theme:', localStorage.getItem('theme'));
        console.log('html.classList:', document.documentElement.classList.toString());
        console.log('html.data-theme:', document.documentElement.getAttribute('data-theme'));
        
        // Sprawdź czy motyw się zastosował
        const hasCorrectClass = document.documentElement.classList.contains(newTheme);
        if (hasCorrectClass) {
            console.log('%c✅ MOTYW ZASTOSOWANY POPRAWNIE!', 'color: #22c55e; font-weight: bold; font-size: 16px');
        } else {
            console.log('%c❌ MOTYW NIE ZOSTAŁ ZASTOSOWANY!', 'color: #ef4444; font-weight: bold; font-size: 16px');
            console.log('Sprawdź czy App.jsx ma listener na "themeChanged"');
        }
    }, 100);
};

// 3. Instrukcje
console.log('\n📝 INSTRUKCJE:');
console.log('Aby przetestować zmianę motywu, wpisz w konsoli:');
console.log('%ctestTheme("light")', 'background: #f3f4f6; color: #000; padding: 4px 8px; border-radius: 4px');
console.log('lub');
console.log('%ctestTheme("dark")', 'background: #111827; color: #fff; padding: 4px 8px; border-radius: 4px');

// 4. Wyczyść wszystko i zacznij od nowa (opcjonalnie)
window.resetTheme = () => {
    console.log('\n🔄 RESET MOTYWU...');
    localStorage.removeItem('theme');
    localStorage.setItem('theme', 'light');
    location.reload();
};

console.log('\nAby wyczyścić i zrestartować: %cresetTheme()', 'background: #ef4444; color: #fff; padding: 4px 8px; border-radius: 4px');
