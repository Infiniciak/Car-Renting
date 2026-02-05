<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use PragmaRX\Google2FALaravel\Facade as Google2FA;
use App\Models\User;

class TwoFactorController extends Controller
{
    public function generate(Request $request)
    {
        $user = $request->user();
        if (!$user->google2fa_secret) {
            $user->google2fa_secret = Google2FA::generateSecretKey();
            $user->save();
        }

        $qrCodeUrl = Google2FA::getQRCodeUrl('CarRent-System', $user->email, $user->google2fa_secret);

        return response()->json([
            'secret' => $user->google2fa_secret,
            'qr_code_url' => $qrCodeUrl,
            'enabled' => (bool)$user->two_factor_enabled
        ]);
    }

    public function enable(Request $request)
    {
        $request->validate(['code' => 'required']);
        $user = $request->user();

        if (Google2FA::verifyKey($user->google2fa_secret, $request->code)) {
            $user->two_factor_enabled = true;
            $user->save();
            return response()->json(['message' => '2FA aktywne', 'enabled' => true]);
        }
        return response()->json(['message' => 'Błędny kod'], 422);
    }

    // --- NOWA METODA: Wyłączanie 2FA ---
    public function disable(Request $request)
    {
        try {
            $user = $request->user();
            
            // Resetujemy pola w bazie danych
            $user->google2fa_secret = null;
            $user->two_factor_enabled = false;
            $user->save();

            return response()->json([
                'message' => '2FA zostało wyłączone',
                'enabled' => false
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Błąd serwera przy wyłączaniu 2FA'], 500);
        }
    }
    
    public function verifyLogin(Request $request)
    {
        $request->validate(['user_id' => 'required', 'code' => 'required']);
        $user = User::findOrFail($request->user_id);

        if (Google2FA::verifyKey($user->google2fa_secret, $request->code)) {
            return response()->json([
                'token' => $user->createToken('auth_token')->plainTextToken,
                'role' => $user->role->value ?? $user->role,
                'user' => $user
            ]);
        }
        return response()->json(['message' => 'Błędny kod TOTP'], 401);
    }
}