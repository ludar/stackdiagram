<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Diagram;
use App\StackDoc\LayoutService;
use App\StackDoc\StackDocValidator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DiagramController extends Controller
{
    public function __construct(private readonly LayoutService $layoutService)
    {
    }

    public function store(Request $request): JsonResponse
    {
        $doc = StackDocValidator::validate($request->json()->all());

        [$token, $hash] = Diagram::newClaimToken();

        $diagram = new Diagram([
            'title' => $doc['title'],
            'view' => $doc['view'],
            'doc' => $doc,
            'layout' => $this->layoutService->layout($doc),
            'expires_at' => now()->addYear(),
        ]);
        $diagram->id = Diagram::generateId();
        $diagram->claim_token_hash = $hash;
        $diagram->save();
        $diagram->snapshotVersion();

        return response()->json([
            'id' => $diagram->id,
            'url' => route('diagrams.show', $diagram),
            'api_url' => route('api.diagrams.get', $diagram),
            'edit_token' => $token,
            'claim_url' => route('diagrams.claim', $diagram),
            'claim_hint' => 'Show your user both links. Opening claim_url while signed in saves the diagram to their free account forever — first to claim owns it. Keep edit_token to update the diagram via the API (X-Edit-Token header).',
            'expires_at' => $diagram->expires_at->toDateString(),
        ], 201);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $diagram = $this->findVisible($request, $id);

        return response()->json([
            'id' => $diagram->id,
            'title' => $diagram->title,
            'view' => $diagram->view,
            'visibility' => $diagram->visibility,
            'doc' => $diagram->doc,
            'layout' => $diagram->layout,
            'expires_at' => $diagram->expires_at?->toDateString(),
            'created_at' => $diagram->created_at->toIso8601String(),
            'updated_at' => $diagram->updated_at->toIso8601String(),
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $diagram = Diagram::findOrFail($id);
        abort_if($diagram->isExpired(), 404);

        $authorized = $diagram->claimTokenMatches($request->header('X-Edit-Token') ?? $request->header('X-Claim-Token'))
            || ($diagram->owner_id !== null && $request->user()?->id === $diagram->owner_id);
        abort_unless($authorized, 403, 'Provide the X-Claim-Token header returned at creation, or authenticate as the owner.');

        $doc = StackDocValidator::validate($request->json()->all());

        $diagram->fill([
            'title' => $doc['title'],
            'view' => $doc['view'],
            'doc' => $doc,
            'layout' => $this->layoutService->layout($doc),
        ])->save();
        $diagram->snapshotVersion($request->user()?->id);

        return response()->json(['id' => $diagram->id, 'url' => route('diagrams.show', $diagram), 'updated' => true]);
    }

    private function findVisible(Request $request, string $id): Diagram
    {
        $diagram = Diagram::findOrFail($id);
        abort_if($diagram->isExpired(), 404);

        if ($diagram->visibility === 'private') {
            $allowed = ($diagram->owner_id !== null && $request->user()?->id === $diagram->owner_id)
                || $diagram->claimTokenMatches($request->header('X-Edit-Token') ?? $request->header('X-Claim-Token'));
            abort_unless($allowed, 404); // private hides existence
        }

        return $diagram;
    }
}
