<?php

namespace App\StackDoc;

use Illuminate\Support\Facades\Process;

class LayoutService
{
    /** Compute node/group positions for a validated StackDoc. */
    public function layout(array $doc): ?array
    {
        $result = Process::timeout(15)
            ->path(base_path())
            ->input(json_encode($doc))
            ->run(['node', 'resources/layout/layout.mjs']);

        if (!$result->successful()) {
            report(new \RuntimeException('ELK layout failed: '.$result->errorOutput()));
            return null; // viewer falls back to client-side layout
        }

        return json_decode($result->output(), true);
    }
}
