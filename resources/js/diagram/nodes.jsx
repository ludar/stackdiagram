import { Handle, Position } from '@xyflow/react';

// Suprematist node set: hard edges, one accent shape per type.
// Palette: ink #141413, cream #f0e9d8, red #cf3f2e, gold #e0b83a, green #3f7a4e.

const ACCENTS = {
    service:  { el: <span className="sd-accent sd-sq" />,        cls: 'sd-service' },
    api:      { el: <span className="sd-accent sd-bar" />,       cls: 'sd-api' },
    database: { el: <span className="sd-accent sd-bar-green" />, cls: 'sd-database' },
    table:    { el: <span className="sd-accent sd-bar-green" />, cls: 'sd-table' },
    queue:    { el: <span className="sd-accent sd-diag" />,      cls: 'sd-queue' },
    topic:    { el: <span className="sd-accent sd-diag" />,      cls: 'sd-queue' },
    cron:     { el: <span className="sd-accent sd-dot" />,       cls: 'sd-cron' },
    cache:    { el: <span className="sd-accent sd-half" />,      cls: 'sd-cache' },
    function: { el: <span className="sd-accent sd-tri" />,       cls: 'sd-function' },
    storage:  { el: <span className="sd-accent sd-sq-green" />,  cls: 'sd-storage' },
    external: { el: <span className="sd-accent sd-ring" />,      cls: 'sd-external' },
    client:   { el: <span className="sd-accent sd-ring" />,      cls: 'sd-client' },
};

function StackNode({ data }) {
    const acc = ACCENTS[data.type] ?? ACCENTS.service;
    return (
        <div className={`sd-node ${acc.cls}`} title={data.note ?? ''}>
            <Handle type="target" position={data.horizontal ? Position.Left : Position.Top} className="sd-handle" />
            <div className="sd-node-head">
                {acc.el}
                <span className="sd-label">{data.label}</span>
            </div>
            {data.tech && <div className="sd-tech">{data.tech}</div>}
            {data.schedule && <div className="sd-schedule">{data.schedule}</div>}
            {data.type === 'table' && data.columns?.length > 0 && (
                <ul className="sd-columns">
                    {data.columns.slice(0, 12).map((c, i) => <li key={i}>{c}</li>)}
                    {data.columns.length > 12 && <li className="sd-more">+{data.columns.length - 12} more</li>}
                </ul>
            )}
            <Handle type="source" position={data.horizontal ? Position.Right : Position.Bottom} className="sd-handle" />
        </div>
    );
}

function GroupNode({ data }) {
    return (
        <div className="sd-group">
            <div className="sd-group-label">{data.label}</div>
        </div>
    );
}

export const nodeTypes = { stack: StackNode, sdgroup: GroupNode };

/** StackDoc + server layout -> React Flow nodes/edges. */
export function toFlow(doc, layout) {
    const horizontal = doc.view === 'dataflow';
    const nodes = [];

    for (const g of doc.groups ?? []) {
        const pos = layout?.groups?.[g.id];
        nodes.push({
            id: `group:${g.id}`,
            type: 'sdgroup',
            position: pos ? { x: pos.x, y: pos.y } : { x: 0, y: 0 },
            style: pos ? { width: pos.w, height: pos.h } : undefined,
            data: { label: g.label },
            draggable: false,
            selectable: false,
            zIndex: -1,
        });
    }

    doc.nodes.forEach((n, i) => {
        const pos = layout?.nodes?.[n.id];
        nodes.push({
            id: n.id,
            type: 'stack',
            position: pos ? { x: pos.x, y: pos.y } : { x: (i % 5) * 220, y: Math.floor(i / 5) * 130 },
            data: { ...n, horizontal },
            draggable: false,
        });
    });

    const edges = (doc.edges ?? []).map((e, i) => ({
        id: `e${i}`,
        source: e.from,
        target: e.to,
        label: e.step != null ? `${e.step}. ${e.label ?? ''}`.trim() : e.label,
        type: 'smoothstep',
        className: 'sd-edge',
    }));

    return { nodes, edges };
}
