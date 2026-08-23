<?php

namespace App\Http\Controllers;

use App\Models\Diagram;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DiagramViewController extends Controller
{
    public function show(Request $request, string $id): Response
    {
        $diagram = Diagram::findOrFail($id);
        abort_if($diagram->isExpired(), 404);
        if ($diagram->visibility === 'private') {
            abort_unless(
                $diagram->owner_id !== null && $request->user()?->id === $diagram->owner_id,
                404
            );
        }

        return Inertia::render('DiagramView', [
            'diagram' => [
                'id' => $diagram->id,
                'title' => $diagram->title,
                'view' => $diagram->view,
                'doc' => $diagram->doc,
                'layout' => $diagram->layout,
                'expires_at' => $diagram->expires_at?->toDateString(),
            ],
        ]);
    }
}
