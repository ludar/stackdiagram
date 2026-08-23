<?php

namespace App\Http\Controllers;

use App\Models\Diagram;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $diagrams = Diagram::where('owner_id', $request->user()->id)
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn (Diagram $d) => [
                'id' => $d->id,
                'title' => $d->title,
                'view' => $d->view,
                'visibility' => $d->visibility,
                'forked_from_id' => $d->forked_from_id,
                'nodes' => count($d->doc['nodes'] ?? []),
                'updated_at' => $d->updated_at->diffForHumans(),
            ]);

        return Inertia::render('Dashboard', ['diagrams' => $diagrams]);
    }
}
