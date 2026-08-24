<?php

namespace App\Http\Controllers;

use App\Models\Diagram;
use Inertia\Inertia;
use Inertia\Response;

class ExploreController extends Controller
{
    public function __invoke(): Response
    {
        $diagrams = Diagram::where('visibility', 'public')
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->orderByDesc('updated_at')
            ->limit(60)
            ->get()
            ->map(fn (Diagram $d) => [
                'id' => $d->id,
                'title' => $d->title,
                'view' => $d->view,
                'nodes' => count($d->doc['nodes'] ?? []),
                'forked' => $d->forked_from_id !== null,
                'updated_at' => $d->updated_at->diffForHumans(),
            ]);

        return Inertia::render('Explore', ['diagrams' => $diagrams]);
    }
}
