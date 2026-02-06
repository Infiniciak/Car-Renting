<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Car Renting</title>
    
        <!-- Cache bust: {{ now()->timestamp }} -->
    
    <!-- Aplikuj motyw ZARAZ na starcie PRZED renderem React'a -->
    <script>
        (function() {
            const theme = localStorage.getItem('theme') || 'light';
            const root = document.documentElement;
            
            // Ustaw atrybut data-theme
            root.setAttribute('data-theme', theme);
            
            // ZAWSZE usuń obie klasy najpierw
            root.classList.remove('dark', 'light');
            
            // Dodaj odpowiednią klasę (WAŻNE: dodaj light lub dark, nie tylko dark!)
            if (theme === 'dark') {
                root.classList.add('dark');
            } else {
                root.classList.add('light');
            }
        })();
    </script>
    
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/main.jsx'])
</head>
<body>
    <div id="app"></div>
</body>
</html>