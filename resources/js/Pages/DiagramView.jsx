import { useCallback, useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import { ReactFlow, Background, Controls, BackgroundVariant } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes, toFlow } from '../diagram/nodes.jsx';
import { BrandIcon, TypeIcon, brandFor } from '../diagram/icons.jsx';

const VIEW_NAMES = { services: 'Services', dataflow: 'Data flow', schema: 'Schema', deploy: 'Deploy' };

function DetailsPanel({ node, doc, onClose }) {
    const inbound = (doc.edges ?? []).filter((e) => e.to === node.id);
    const outbound = (doc.edges ?? []).filter((e) => e.from === node.id);
    const group = (doc.groups ?? []).find((g) => g.children.includes(node.id));
    const labelOf = (id) => doc.nodes.find((n) => n.id === id)?.label ?? id;

    return (
        <aside className="sd-panel">
            <button className="sd-panel-close" onClick={onClose} aria-label="Close details">×</button>
            <div className="sd-panel-head">
                {brandFor(node.tech) ?? brandFor(node.label) ? <BrandIcon tech={brandFor(node.tech) ? node.tech : node.label} size={28} /> : <TypeIcon type={node.type} size={28} />}
                <div>
                    <h2>{node.label}</h2>
                    <span className="sd-panel-type">{node.type}{node.tech ? ` · ${node.tech}` : ''}</span>
                </div>
            </div>
            {node.note && <p className="sd-panel-note">{node.note}</p>}
            {node.schedule && (
                <div className="sd-panel-row"><span className="sd-panel-key">schedule</span><code>{node.schedule}</code></div>
            )}
            {group && (
                <div className="sd-panel-row"><span className="sd-panel-key">in group</span><span>{group.label}</span></div>
            )}
            {node.columns?.length > 0 && (
                <div className="sd-panel-block">
                    <span className="sd-panel-key">columns</span>
                    <ul className="sd-panel-cols">{node.columns.map((c, i) => <li key={i}>{c}</li>)}</ul>
                </div>
            )}
            {(inbound.length > 0 || outbound.length > 0) && (
                <div className="sd-panel-block">
                    <span className="sd-panel-key">connections</span>
                    <ul className="sd-panel-edges">
                        {inbound.map((e, i) => (
                            <li key={`i${i}`}><span className="sd-dir sd-in">←</span> {labelOf(e.from)}{e.label ? <em> — {e.label}</em> : null}</li>
                        ))}
                        {outbound.map((e, i) => (
                            <li key={`o${i}`}><span className="sd-dir sd-out">→</span> {labelOf(e.to)}{e.label ? <em> — {e.label}</em> : null}</li>
                        ))}
                    </ul>
                </div>
            )}
        </aside>
    );
}

export default function DiagramView({ diagram }) {
    const { nodes, edges } = useMemo(() => toFlow(diagram.doc, diagram.layout), [diagram]);
    const [selectedId, setSelectedId] = useState(null);
    const selected = selectedId ? diagram.doc.nodes.find((n) => n.id === selectedId) : null;

    const onNodeClick = useCallback((_e, node) => {
        setSelectedId(node.type === 'stack' ? node.id : null);
    }, []);

    return (
        <div className="sd-page">
            <Head title={diagram.title} />
            <header className="sd-topbar">
                <a href="/" className="sd-mark" aria-label="StackDiagram home">
                    <i className="sd-mark-sq" /><i className="sd-mark-bar" /><i className="sd-mark-dot" />
                </a>
                <h1>{diagram.title}</h1>
                <span className="sd-viewtag">{VIEW_NAMES[diagram.view] ?? diagram.view}</span>
                <div className="sd-topbar-right">
                    {diagram.expires_at && <span className="sd-expiry">expires {diagram.expires_at} — claim to keep</span>}
                    <a className="sd-btn" href={`/api/v1/diagrams/${diagram.id}`}>JSON</a>
                </div>
            </header>
            <main className="sd-canvas">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    fitView
                    minZoom={0.2}
                    nodesConnectable={false}
                    onNodeClick={onNodeClick}
                    onPaneClick={() => setSelectedId(null)}
                    proOptions={{ hideAttribution: true }}
                >
                    <Background variant={BackgroundVariant.Dots} gap={22} size={1.5} />
                    <Controls showInteractive={false} />
                </ReactFlow>
                {selected && <DetailsPanel node={selected} doc={diagram.doc} onClose={() => setSelectedId(null)} />}
            </main>
        </div>
    );
}
