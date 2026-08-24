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
        $user = $request->user();
        $mine = $diagram->owner_id !== null && $diagram->owner_id === $user?->id;

        $comments = $diagram->comments()
            ->with('author:id,email')
            ->whereNull('parent_id')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($c) => $this->commentJson($c, $user?->id, $mine));

        return Inertia::render('DiagramView', [
            'diagram' => [
                'id' => $diagram->id,
                'title' => $diagram->title,
                'view' => $diagram->view,
                'doc' => $diagram->doc,
                'layout' => $diagram->layout,
                'expires_at' => $diagram->expires_at?->toDateString(),
                'owned' => $diagram->owner_id !== null,
                'mine' => $mine,
                'visibility' => $diagram->visibility,
                'forked_from_id' => $diagram->forked_from_id,
                'claimable' => $diagram->owner_id === null && $diagram->visibility !== 'private',
                'editable' => $diagram->canBeEditedBy($user),
                'can_comment' => $user !== null && $diagram->canBeViewedBy($user),
            ],
            'comments' => $comments,
            'collaborators' => $mine
                ? $diagram->collaborators->map(fn ($c) => [
                    'id' => $c->id, 'email' => $c->email, 'role' => $c->role, 'joined' => $c->user_id !== null,
                ])->values()
                : null,
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

    private function commentJson($c, ?int $userId, bool $mine): array
    {
        return [
            'id' => $c->id,
            'author' => strstr($c->author->email, '@', true) ?: $c->author->email,
            'body' => $c->body,
            'anchor_type' => $c->anchor_type,
            'anchor_id' => $c->anchor_id,
            'resolved' => $c->resolved_at !== null,
            'created_at' => $c->created_at->diffForHumans(),
            'can_manage' => $userId !== null && ($c->author_id === $userId || $mine),
            'replies' => $c->replies()->with('author:id,email')->get()
                ->map(fn ($r) => $this->commentJson($r, $userId, $mine))->values(),
        ];
    }

    private function visible(Request $request, string $id): Diagram
    {
        $diagram = Diagram::findOrFail($id);
        abort_if($diagram->isExpired(), 404);
        abort_unless($diagram->canBeViewedBy($request->user()), 404);

        return $diagram;
    }
}
