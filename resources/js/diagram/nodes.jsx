import { Handle, Position } from '@xyflow/react';
import { BrandIcon, TypeIcon, brandFor } from './icons.jsx';

// Node chrome: brand icon when tech is recognized, geometric type icon otherwise.
// Type is still color-coded via a left strip in the Suprematist palette.

const TYPE_COLOR = {
    service: 'var(--sd-red)', api: 'var(--sd-red)',
    database: 'var(--sd-green)', table: 'var(--sd-green)', storage: 'var(--sd-green)',
    queue: 'var(--sd-red)', topic: 'var(--sd-red)',
    cron: 'var(--sd-gold)', cache: 'var(--sd-gold)', function: 'var(--sd-gold)',
    external: 'var(--sd-muted)', client: 'var(--sd-muted)',
};

function StackNode({ data, selected }) {
    const brand = brandFor(data.tech) ?? brandFor(data.label);
    const outlined = data.type === 'external' || data.type === 'client';
    return (
        <div
            className={`sd-node ${outlined ? 'sd-outlined' : ''} ${selected ? 'sd-selected' : ''}`}
            style={{ '--sd-type': TYPE_COLOR[data.type] ?? 'var(--sd-red)' }}
        >
            <Handle type="target" position={data.horizontal ? Position.Left : Position.Top} className="sd-handle" />
            <div className="sd-node-body">
                <div className="sd-icon">
                    {brand ? <BrandIcon tech={data.tech} size={22} /> : <TypeIcon type={data.type} size={22} />}
                </div>
                <div className="sd-text">
                    <span className="sd-label">{data.label}</span>
                    {data.tech && <span className="sd-tech">{data.tech}</span>}
                    {data.schedule && <span className="sd-schedule">{data.schedule}</span>}
                </div>
                {data.note && <span className="sd-info" title="Has a note — click to read">i</span>}
            </div>
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
        markerEnd: { type: 'arrowclosed', width: 16, height: 16, color: 'var(--sd-ink, #141413)' },
    }));

    return { nodes, edges };
}
