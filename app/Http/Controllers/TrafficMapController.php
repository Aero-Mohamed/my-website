<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class TrafficMapController extends Controller
{
    /**
     * @return Response
     */
    public function __invoke(): Response
    {
        return Inertia::render('TrafficMap/Index', [
            'page' => [
                'title' => 'Traffic Map',
                'seo'   => [
                    'description' => 'Traffic Map',
                    'image'       => null,
                ],
            ],
        ]);
    }

}
