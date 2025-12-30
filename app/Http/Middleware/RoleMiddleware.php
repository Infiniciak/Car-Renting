<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
 public function handle($request, Closure $next, ...$roles)
{
    $user = $request->user();

    // 1. Sprawdzamy czy użytkownik jest zalogowany
    if (!$user) {
        return response()->json(['message' => 'Niezalogowany'], 401);
    }

    // 2. Pobieramy wartość roli (obsługuje zarówno Enum jak i zwykły string)
    $userRole = ($user->role instanceof \UnitEnum) ? $user->role->value : $user->role;

    // 3. Sprawdzamy, czy rola użytkownika jest na liście dozwolonych
    if (!in_array($userRole, $roles)) {
        return response()->json([
            'message' => 'Brak uprawnień. Wymagana rola: ' . implode(' lub ', $roles),
            'twoja_rola' => $userRole
        ], 403);
    }

    return $next($request);
}

}
