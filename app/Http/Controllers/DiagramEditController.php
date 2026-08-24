<?php

namespace App\Http\Controllers;

use App\Models\Diagram;
use App\StackDoc\LayoutService;
use App\StackDoc\StackDocValidator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DiagramEditController extends Controller
{
    public function __construct(private readonly LayoutService $layoutService)
    {
    }

    private function owned(Request $request, string $id): Diagram
    {
        $diagram = Diagram::findOrFail($id);
        abort_unless($diagram->canBeEditedBy($request->user()), 403);

        return $diagram;
    }

    /** Full document replace from the editor; snapshots a version. */
    public function doc(Request $request, string $id): JsonResponse
    {
        $diagram = $this->owned($request, $id);
        $doc = StackDocValidator::validate($request->json()->all());

        $diagram->fill(['title' => $doc['title'], 'view' => $doc['view'], 'doc' => $doc])->save();
        $diagram->snapshotVersion($request->user()->id);

        return response()->json(['saved' => true, 'updated_at' => $diagram->updated_at->toIso8601String()]);
    }

    /** Position changes from dragging; merged, no version snapshot. */
    public function layout(Request $request, string $id): JsonResponse
    {
        $diagram = $this->owned($request, $id);
        $data = $request->validate([
            'nodes' => ['required', 'array'],
            'nodes.*.x' => ['required', 'numeric'],
            'nodes.*.y' => ['required', 'numeric'],
        ]);

        $layout = $diagram->layout ?? ['nodes' => [], 'groups' => []];
        foreach ($data['nodes'] as $nodeId => $pos) {
            $layout['nodes'][$nodeId] = array_merge($layout['nodes'][$nodeId] ?? [], ['x' => $pos['x'], 'y' => $pos['y']]);
        }
        $diagram->update(['layout' => $layout]);

        return response()->json(['saved' => true]);
    }

    /** Recompute layout from the doc with ELK. */
    public function relayout(Request $request, string $id): JsonResponse
    {
        $diagram = $this->owned($request, $id);
        $layout = $this->layoutService->layout($diagram->doc);
        if ($layout !== null) {
            $diagram->update(['layout' => $layout]);
        }

        return response()->json(['layout' => $diagram->layout]);
    }
}
