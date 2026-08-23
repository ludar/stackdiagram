<?php

namespace App\StackDoc;

use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

/**
 * The StackDoc format contract. /llms.txt documents exactly what this accepts.
 */
class StackDocValidator
{
    public const VIEWS = ['services', 'dataflow', 'schema', 'deploy'];

    public const NODE_TYPES = [
        'service', 'api', 'database', 'table', 'queue', 'topic', 'cron',
        'cache', 'function', 'storage', 'external', 'client',
    ];

    public const MAX_NODES = 300;
    public const MAX_EDGES = 600;
    public const MAX_GROUPS = 40;
    public const MAX_DOC_BYTES = 262144; // 256 KB

    /** @return array the normalized doc */
    public static function validate(array $input): array
    {
        if (strlen(json_encode($input)) > self::MAX_DOC_BYTES) {
            throw ValidationException::withMessages(['doc' => 'Document exceeds 256 KB.']);
        }

        $v = Validator::make($input, [
            'title' => ['required', 'string', 'max:200'],
            'view' => ['sometimes', 'string', 'in:'.implode(',', self::VIEWS)],
            'nodes' => ['required', 'array', 'min:1', 'max:'.self::MAX_NODES],
            'nodes.*.id' => ['required', 'string', 'max:64', 'regex:/^[A-Za-z0-9_.-]+$/'],
            'nodes.*.type' => ['required', 'string', 'in:'.implode(',', self::NODE_TYPES)],
            'nodes.*.label' => ['required', 'string', 'max:120'],
            'nodes.*.tech' => ['sometimes', 'string', 'max:60'],
            'nodes.*.note' => ['sometimes', 'string', 'max:500'],
            'nodes.*.schedule' => ['sometimes', 'string', 'max:60'],
            'nodes.*.columns' => ['sometimes', 'array', 'max:80'],
            'nodes.*.columns.*' => ['string', 'max:120'],
            'edges' => ['sometimes', 'array', 'max:'.self::MAX_EDGES],
            'edges.*.from' => ['required', 'string', 'max:64'],
            'edges.*.to' => ['required', 'string', 'max:64'],
            'edges.*.label' => ['sometimes', 'string', 'max:120'],
            'edges.*.step' => ['sometimes', 'integer', 'min:1', 'max:999'],
            'groups' => ['sometimes', 'array', 'max:'.self::MAX_GROUPS],
            'groups.*.id' => ['required', 'string', 'max:64', 'regex:/^[A-Za-z0-9_.-]+$/'],
            'groups.*.label' => ['required', 'string', 'max:120'],
            'groups.*.children' => ['required', 'array', 'min:1'],
            'groups.*.children.*' => ['string', 'max:64'],
        ]);

        $doc = $v->validate();

        // Referential integrity beyond field shapes.
        $nodeIds = array_column($doc['nodes'], 'id');
        if (count($nodeIds) !== count(array_unique($nodeIds))) {
            throw ValidationException::withMessages(['nodes' => 'Duplicate node ids.']);
        }
        $known = array_flip($nodeIds);
        foreach ($doc['edges'] ?? [] as $i => $edge) {
            foreach (['from', 'to'] as $end) {
                if (!isset($known[$edge[$end]])) {
                    throw ValidationException::withMessages([
                        "edges.$i.$end" => "Edge references unknown node '{$edge[$end]}'.",
                    ]);
                }
            }
        }
        $groupIds = array_column($doc['groups'] ?? [], 'id');
        if (array_intersect($groupIds, $nodeIds) !== []) {
            throw ValidationException::withMessages(['groups' => 'Group ids must not collide with node ids.']);
        }
        $seen = [];
        foreach ($doc['groups'] ?? [] as $i => $group) {
            foreach ($group['children'] as $child) {
                if (!isset($known[$child])) {
                    throw ValidationException::withMessages([
                        "groups.$i.children" => "Group references unknown node '$child'.",
                    ]);
                }
                if (isset($seen[$child])) {
                    throw ValidationException::withMessages([
                        "groups.$i.children" => "Node '$child' is in more than one group.",
                    ]);
                }
                $seen[$child] = true;
            }
        }

        $doc['view'] = $doc['view'] ?? 'services';

        return $doc;
    }
}
