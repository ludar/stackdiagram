<?php

namespace App\Http\Controllers;

use App\Models\Diagram;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CollaboratorController extends Controller
{
    public function store(Request $request, string $id): RedirectResponse
    {
        $diagram = Diagram::findOrFail($id);
        abort_unless($diagram->owner_id === $request->user()->id, 403);

        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'role' => ['required', 'in:commenter,editor'],
        ]);

        if (strcasecmp($data['email'], $request->user()->email) === 0) {
            return back()->with('status', 'That is you — no invite needed.');
        }

        $diagram->collaborators()->updateOrCreate(
            ['email' => strtolower($data['email'])],
            [
                'role' => $data['role'],
                'user_id' => User::where('email', $data['email'])->value('id'),
                'invited_by' => $request->user()->id,
            ]
        );

        return back()->with('status', $data['email'].' invited as '.$data['role'].'.');
    }

    public function destroy(Request $request, string $id, int $collaboratorId): RedirectResponse
    {
        $diagram = Diagram::findOrFail($id);
        abort_unless($diagram->owner_id === $request->user()->id, 403);

        $diagram->collaborators()->whereKey($collaboratorId)->delete();

        return back()->with('status', 'Invite removed.');
    }
}
