<?php

namespace App\Http\Controllers;

use App\Models\Diagram;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DiagramActionsController extends Controller
{
    /** GET /d/{id}/claim — first signed-in user to claim an unclaimed diagram owns it. */
    public function claim(Request $request, string $id): RedirectResponse
    {
        $diagram = Diagram::findOrFail($id);
        abort_if($diagram->isExpired(), 404);
        abort_if($diagram->visibility === 'private', 404);

        if ($diagram->owner_id !== null) {
            return redirect()->route('diagrams.show', $diagram)
                ->with('status', $diagram->owner_id === $request->user()->id
                    ? 'This diagram is already yours.'
                    : 'This diagram has already been claimed.');
        }

        $diagram->owner_id = $request->user()->id;
        $diagram->claim_token_hash = null;   // token is single-use
        $diagram->expires_at = null;         // claimed diagrams never expire
        $diagram->save();

        return redirect()->route('diagrams.show', $diagram)->with('status', 'Diagram claimed — it now lives forever.');
    }

    public function fork(Request $request, string $id): RedirectResponse
    {
        $diagram = Diagram::findOrFail($id);
        abort_if($diagram->isExpired(), 404);
        if ($diagram->visibility === 'private') {
            abort_unless($diagram->owner_id === $request->user()->id, 404);
        }

        $fork = $diagram->forkFor($request->user());

        return redirect()->route('diagrams.show', $fork)->with('status', 'Forked into your account.');
    }

    public function visibility(Request $request, string $id): RedirectResponse
    {
        $diagram = Diagram::findOrFail($id);
        abort_unless($diagram->owner_id === $request->user()->id, 403);
        $data = $request->validate(['visibility' => ['required', 'in:public,unlisted,private']]);

        $diagram->update(['visibility' => $data['visibility']]);

        return back()->with('status', "Visibility set to {$data['visibility']}.");
    }

    /** Soft delete; purged for real after 7 days. */
    public function destroy(Request $request, string $id): RedirectResponse
    {
        $diagram = Diagram::findOrFail($id);
        abort_unless($diagram->owner_id === $request->user()->id, 403);

        $diagram->delete();

        return redirect()->route('dashboard')->with('status', 'Diagram deleted. It will be gone for good in 7 days.');
    }
}
