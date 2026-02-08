<!DOCTYPE html>
<html lang="en" class="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tailwind Test</title>
    @vite(['resources/css/app.css','resources/js/main.jsx'])
</head>
<body>
    <div class="min-h-screen bg-gray-100 p-8">
        <div class="max-w-4xl mx-auto">
            <h1 class="text-4xl font-bold text-blue-600 mb-4">Tailwind CSS Test</h1>
            
            <div class="bg-white rounded-3xl shadow-2xl p-8 mb-6 border border-gray-200">
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">✅ Test Card - Formatowanie działa!</h2>
                <p class="text-gray-700 mb-4">Jeśli widzisz tę kartę z:</p>
                <ul class="list-disc list-inside text-gray-600 space-y-2 mb-6">
                    <li>Białym tłem (bg-white)</li>
                    <li>Zaokrąglonymi rogami (rounded-3xl)</li>
                    <li>Cieniem (shadow-2xl)</li>
                    <li>Paddingiem (p-8)</li>
                </ul>
                <p class="text-green-600 font-bold text-lg">→ To znaczy że Tailwind działa poprawnie! 🎉</p>
                <button class="bg-blue-500 hover: text-white font-bold py-3 px-6 rounded-lg mt-4 transition-colors">
                    Test Button
                </button>
            </div>
            
            <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="bg-red-500 text-white p-6 rounded-xl shadow-lg text-center font-bold">Red Card</div>
                <div class="bg-green-500 text-white p-6 rounded-xl shadow-lg text-center font-bold">Green Card</div>
                <div class="bg-purple-500 text-white p-6 rounded-xl shadow-lg text-center font-bold">Purple Card</div>
            </div>
            
            <div class="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white p-8 rounded-2xl shadow-xl">
                <h3 class="text-2xl font-bold mb-2">Gradient Background</h3>
                <p>Jeśli widzisz gradient - Tailwind v4 działa w 100%</p>
            </div>
        </div>
    </div>
</body>
</html>
