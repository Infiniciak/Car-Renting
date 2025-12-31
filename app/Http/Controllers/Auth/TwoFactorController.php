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
            return response()->json(['message' => '2FA aktywne']);
        }
        return response()->json(['message' => 'Błędny kod'], 422);
    }

    public function verifyLogin(Request $request)
    {
        $request->validate(['user_id' => 'required', 'code' => 'required']);
        $user = User::findOrFail($request->user_id);

        if (Google2FA::verifyKey($user->google2fa_secret, $request->code)) {
            return response()->json([
                'token' => $user->createToken('auth_token')->plainTextToken,
                // POPRAWKA: Pobieramy wartość tekstową z Enuma, aby JS nie zapisał "[object Object]"
                'role' => $user->role->value ?? $user->role,
                'user' => $user
            ]);
        }
        return response()->json(['message' => 'Błędny kod TOTP'], 401);
    }
}