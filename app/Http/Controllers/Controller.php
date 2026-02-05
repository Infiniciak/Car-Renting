<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: "1.0.0",
    title: "Car Rental API",
    description: "Dokumentacja systemu wypożyczalni"
)]
#[OA\Server(url: "http://localhost:8000/api", description: "Local Server")]
#[OA\Get(
    path: "/test-swagger",
    summary: "Test endpoint",
    responses: [
        new OA\Response(response: 200, description: "OK")
    ]
)]
abstract class Controller
{
    //
}
