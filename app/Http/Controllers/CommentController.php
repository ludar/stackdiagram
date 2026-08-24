<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Diagram;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function store(Request $request, string $id): RedirectResponse
    {
        $diagram = Diagram::findOrFail($id);
        abort_if($diagram->isExpired(), 404);
        abort_unless($diagram->canBeViewedBy($request->user()), 404);

        $data = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
            'anchor_type' => ['nullable', 'in:node,edge'],
            'anchor_id' => ['nullable', 'string', 'max:64', 'required_with:anchor_type'],
            'parent_id' => ['nullable', 'integer', 'exists:comments,id'],
        ]);

        if (!empty($data['parent_id'])) {
            $parent = Comment::findOrFail($data['parent_id']);
            abort_unless($parent->diagram_id === $diagram->id && $parent->parent_id === null, 422);
        }

        $diagram->comments()->create([
            'author_id' => $request->user()->id,
            'parent_id' => $data['parent_id'] ?? null,
            'anchor_type' => $data['anchor_type'] ?? null,
            'anchor_id' => $data['anchor_id'] ?? null,
            'body' => $data['body'],
        ]);

        return back()->with('status', 'Comment posted.');
    }

    public function resolve(Request $request, int $commentId): RedirectResponse
    {
        $comment = Comment::with('diagram')->findOrFail($commentId);
        $canResolve = $comment->author_id === $request->user()->id
            || $comment->diagram->owner_id === $request->user()->id;
        abort_unless($canResolve, 403);

        $comment->update(['resolved_at' => $comment->resolved_at ? null : now()]);

        return back();
    }

    public function destroy(Request $request, int $commentId): RedirectResponse
    {
        $comment = Comment::with('diagram')->findOrFail($commentId);
        $canDelete = $comment->author_id === $request->user()->id
            || $comment->diagram->owner_id === $request->user()->id;
        abort_unless($canDelete, 403);

        $comment->delete();

        return back()->with('status', 'Comment deleted.');
    }
}
