<?php

namespace App\Http\Controllers;

use App\Models\Diagram;
use App\StackDoc\ContextExport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DiagramViewController extends Controller
{
    public function show(Request $request, string $id): Response
    {
        $diagram = $this->visible($request, $id);

        return Inertia::render('DiagramView', [
            'diagram' => [
                'id' => $diagram->id,
                'title' => $diagram->title,
                'view' => $diagram->view,
                'doc' => $diagram->doc,
                'layout' => $diagram->layout,
                'expires_at' => $diagram->expires_at?->toDateString(),
                'owned' => $diagram->owner_id !== null,
                'mine' => $diagram->owner_id !== null && $diagram->owner_id === $request->user()?->id,
                'visibility' => $diagram->visibility,
                'forked_from_id' => $diagram->forked_from_id,
                'claimable' => $diagram->owner_id === null && $diagram->visibility !== 'private',
                'editable' => $diagram->owner_id !== null && $diagram->owner_id === $request->user()?->id,
            ],
        ]);
    }

    /** GET /d/{id}.md — LLM-ready context document for AI-to-AI handoff. */
    public function context(Request $request, string $id)
    {
        $diagram = $this->visible($request, $id);

        return response(ContextExport::markdown($diagram))
            ->header('Content-Type', 'text/markdown; charset=utf-8')
            ->header('Content-Disposition', 'inline; filename="'.$diagram->id.'.md"');
    }

    private function visible(Request $request, string $id): Diagram
    {
        $diagram = Diagram::findOrFail($id);
        abort_if($diagram->isExpired(), 404);
        if ($diagram->visibility === 'private') {
            abort_unless(
                $diagram->owner_id !== null && $request->user()?->id === $diagram->owner_id,
                404
            );
        }

        return $diagram;
    }
}
