import { useCallback, useMemo, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ReactFlow, Background, Controls, BackgroundVariant } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes, toFlow } from '../diagram/nodes.jsx';
import Logo from '../Layouts/Logo.jsx';
import Editor from '../diagram/Editor.jsx';
import CommentsPanel from '../diagram/CommentsPanel.jsx';
import SharePanel from '../diagram/SharePanel.jsx';
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

export default function DiagramView({ diagram, comments = [], collaborators = null }) {
    const { auth, flash } = usePage().props;
    const { nodes, edges } = useMemo(() => toFlow(diagram.doc, diagram.layout), [diagram]);
    const [selectedId, setSelectedId] = useState(null);
    const [editing, setEditing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [panel, setPanel] = useState(null); // 'comments' | 'share' | null
    const openComments = comments.filter((c) => !c.resolved).length;
    const copyForAI = async () => {
        try {
            const md = await fetch(`/d/${diagram.id}.md`).then((r) => r.text());
            await navigator.clipboard.writeText(md);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch { window.open(`/d/${diagram.id}.md`, '_blank'); }
    };
    const selected = selectedId ? diagram.doc.nodes.find((n) => n.id === selectedId) : null;

    const onNodeClick = useCallback((_e, node) => {
        setSelectedId(node.type === 'stack' ? node.id : null);
    }, []);

    return (
        <div className="sd-page">
            <Head title={diagram.title} />
            <header className="sd-topbar">
                <a href="/" className="sd-home" aria-label="StackDiagram home"><Logo size={30} /></a>
                <h1>{diagram.title}</h1>
                <span className="sd-viewtag">{VIEW_NAMES[diagram.view] ?? diagram.view}</span>
                {diagram.forked_from_id && (
                    <a className="sd-forkline" href={`/d/${diagram.forked_from_id}`}>forked from {diagram.forked_from_id}</a>
                )}
                <div className="sd-topbar-right">
                    {diagram.claimable && diagram.expires_at && (
                        <span className="sd-expiry">unclaimed — expires {diagram.expires_at}</span>
                    )}
                    {diagram.claimable && (
                        <a className="sd-btn sd-btn-claim" href={`/d/${diagram.id}/claim`}>
                            {auth?.user ? 'Claim this diagram' : 'Log in to claim'}
                        </a>
                    )}
                    {diagram.editable && (
                        <button className={editing ? 'sd-btn' : 'sd-btn sd-btn-ghost'} onClick={() => setEditing((v) => !v)}>
                            {editing ? 'Done editing' : 'Edit'}
                        </button>
                    )}
                    {auth?.user && !diagram.editable && (
                        <button className="sd-btn sd-btn-ghost" onClick={() => router.post(`/d/${diagram.id}/fork`)}>Fork</button>
                    )}
                    <button className="sd-btn sd-btn-ghost" onClick={copyForAI} title="Copy an LLM-ready summary — paste it into any AI chat">
                        {copied ? 'Copied' : 'Copy for AI'}
                    </button>
                    <button className={panel === 'comments' ? 'sd-btn' : 'sd-btn sd-btn-ghost'}
                        onClick={() => setPanel(panel === 'comments' ? null : 'comments')}>
                        Comments{openComments > 0 ? ` (${openComments})` : ''}
                    </button>
                    {diagram.mine && (
                        <button className={panel === 'share' ? 'sd-btn' : 'sd-btn sd-btn-ghost'}
                            onClick={() => setPanel(panel === 'share' ? null : 'share')}>Share</button>
                    )}
                    {auth?.user
                        ? <Link href="/dashboard" className="sd-navlink">My diagrams</Link>
                        : <Link href="/login" className="sd-navlink">Log in</Link>}
                    <a className="sd-btn" href={`/api/v1/diagrams/${diagram.id}`}>JSON</a>
                </div>
            </header>
            {flash?.status && <div className="sd-flash">{flash.status}</div>}
            {editing ? <Editor diagram={diagram} /> : (
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
                {panel === null && selected && <DetailsPanel node={selected} doc={diagram.doc} onClose={() => setSelectedId(null)} />}
                {panel === 'comments' && (
                    <CommentsPanel diagram={diagram} comments={comments} selectedNode={selected} onClose={() => setPanel(null)} />
                )}
                {panel === 'share' && diagram.mine && (
                    <SharePanel diagram={diagram} collaborators={collaborators} onClose={() => setPanel(null)} />
                )}
            </main>
            )}
        </div>
    );
}
