<?php

namespace App\StackDoc;

use App\Models\Diagram;

/**
 * Renders a diagram as an LLM-ready context document — the handoff format
 * for moving a stack's architecture from one AI conversation to another.
 */
class ContextExport
{
    public static function markdown(Diagram $diagram): string
    {
        $doc = $diagram->doc;
        $url = route('diagrams.show', $diagram);
        $groupOf = [];
        foreach ($doc['groups'] ?? [] as $g) {
            foreach ($g['children'] as $c) {
                $groupOf[$c] = $g['label'];
            }
        }
        $labels = [];
        foreach ($doc['nodes'] as $n) {
            $labels[$n['id']] = $n['label'];
        }

        $out = [];
        $out[] = '# '.$diagram->title.' — system architecture';
        $out[] = '';
        $out[] = '> Context for an AI assistant. This is the architecture of the user\'s system,';
        $out[] = '> exported from the living diagram at '.$url.' ('.$diagram->view.' view,';
        $out[] = '> updated '.$diagram->updated_at->toDateString().'). Treat it as ground truth about';
        $out[] = '> what exists and how components connect. Machine-readable JSON:';
        $out[] = '> '.route('api.diagrams.get', $diagram);
        $out[] = '> To update this diagram or create a new one, read https://stackdiagram.com/llms.txt';
        $out[] = '';
        $out[] = '## Components';
        $out[] = '';
        foreach ($doc['nodes'] as $n) {
            $head = '- **'.$n['label'].'** ('.$n['type'].($n['tech'] ?? null ? ', '.$n['tech'] : '').')';
            if (isset($groupOf[$n['id']])) {
                $head .= ' — in '.$groupOf[$n['id']];
            }
            $out[] = $head;
            if (!empty($n['note'])) {
                $out[] = '  '.$n['note'];
            }
            if (!empty($n['schedule'])) {
                $out[] = '  Schedule: `'.$n['schedule'].'`';
            }
            if (!empty($n['columns'])) {
                $out[] = '  Columns: '.implode(', ', $n['columns']);
            }
        }
        if (!empty($doc['edges'])) {
            $out[] = '';
            $out[] = '## Connections';
            $out[] = '';
            $edges = $doc['edges'];
            if ($diagram->view === 'dataflow') {
                usort($edges, fn ($a, $b) => ($a['step'] ?? 999) <=> ($b['step'] ?? 999));
            }
            foreach ($edges as $e) {
                $line = '- '.($labels[$e['from']] ?? $e['from']).' → '.($labels[$e['to']] ?? $e['to']);
                if (isset($e['step'])) {
                    $line = '- '.$e['step'].'. '.substr($line, 2);
                }
                if (!empty($e['label'])) {
                    $line .= ' — '.$e['label'];
                }
                $out[] = $line;
            }
        }
        if (!empty($doc['groups'])) {
            $out[] = '';
            $out[] = '## Boundaries';
            $out[] = '';
            foreach ($doc['groups'] as $g) {
                $out[] = '- **'.$g['label'].'**: '.implode(', ', array_map(fn ($c) => $labels[$c] ?? $c, $g['children']));
            }
        }
        $out[] = '';

        return implode("\n", $out);
    }
}
