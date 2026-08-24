import { useCallback, useMemo, useRef, useState } from 'react';
import {
    ReactFlow, Background, Controls, BackgroundVariant,
    applyNodeChanges, useReactFlow, ReactFlowProvider,
} from '@xyflow/react';
import { nodeTypes, toFlow } from './nodes.jsx';
import { save, debounce } from './api.js';
import NodeForm from './NodeForm.jsx';
import { StackDocValidatorTypes } from './constants.js';

/** Owner's editing canvas: drag, connect, add/edit/delete nodes, autosave. */
function EditorInner({ diagram }) {
    const [doc, setDoc] = useState(diagram.doc);
    const [layout, setLayout] = useState(diagram.layout);
    const [selected, setSelected] = useState(null); // {kind:'node'|'edge', id}
    const [saveState, setSaveState] = useState('saved'); // saved | saving | error
    const [error, setError] = useState(null);
    const flow = useReactFlow();

    const initial = useMemo(() => toFlow(doc, layout), []); // eslint-disable-line
    const [rfNodes, setRfNodes] = useState(initial.nodes.map((n) => ({ ...n, draggable: n.type === 'stack' })));

    const { edges } = useMemo(() => toFlow(doc, layout), [doc, layout]);

    // ---- persistence -------------------------------------------------
    const pushDoc = useMemo(() => debounce(async (nextDoc) => {
        setSaveState('saving');
        try {
            await save('PATCH', `/d/${diagram.id}/doc`, nextDoc);
            setSaveState('saved'); setError(null);
        } catch (e) {
            setSaveState('error');
            setError(Object.values(e.errors ?? {}).flat()[0] ?? e.message);
        }
    }, 700), [diagram.id]);

    const pushLayout = useMemo(() => debounce(async (positions) => {
        try { await save('PATCH', `/d/${diagram.id}/layout`, { nodes: positions }); } catch { /* retried on next drag */ }
    }, 500), [diagram.id]);

    const updateDoc = useCallback((mutate) => {
        setDoc((prev) => {
            const next = structuredClone(prev);
            mutate(next);
            pushDoc(next);
            return next;
        });
        setSaveState('saving');
    }, [pushDoc]);

    // ---- canvas interactions ----------------------------------------
    const onNodesChange = useCallback((changes) => {
        setRfNodes((ns) => applyNodeChanges(changes, ns));
    }, []);

    const dragBuffer = useRef({});
    const onNodeDragStop = useCallback((_e, node) => {
        if (node.type !== 'stack') return;
        dragBuffer.current[node.id] = { x: node.position.x, y: node.position.y };
        setLayout((l) => ({ ...l, nodes: { ...(l?.nodes ?? {}), [node.id]: { ...(l?.nodes?.[node.id] ?? {}), ...dragBuffer.current[node.id] } } }));
        pushLayout({ ...dragBuffer.current });
    }, [pushLayout]);

    const onConnect = useCallback((conn) => {
        if (!conn.source || !conn.target || conn.source.startsWith('group:') || conn.target.startsWith('group:')) return;
        updateDoc((d) => {
            d.edges = d.edges ?? [];
            d.edges.push({ from: conn.source, to: conn.target });
        });
    }, [updateDoc]);

    const onNodeClick = useCallback((_e, node) => {
        if (node.type === 'stack') setSelected({ kind: 'node', id: node.id });
    }, []);
    const onEdgeClick = useCallback((_e, edge) => {
        setSelected({ kind: 'edge', id: edge.id });
    }, []);

    // ---- node/edge operations ---------------------------------------
    const addNode = (type) => {
        const base = type;
        let n = 1;
        while (doc.nodes.some((x) => x.id === `${base}${n}`)) n++;
        const id = `${base}${n}`;
        const center = flow.screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        updateDoc((d) => d.nodes.push({ id, type, label: `new ${type}` }));
        setLayout((l) => ({ ...l, nodes: { ...(l?.nodes ?? {}), [id]: { x: center.x, y: center.y, w: 160, h: 52 } } }));
        pushLayout({ [id]: { x: center.x, y: center.y } });
        setRfNodes((ns) => [...ns, {
            id, type: 'stack', position: center, draggable: true,
            data: { id, type, label: `new ${type}`, horizontal: doc.view === 'dataflow' },
        }]);
        setSelected({ kind: 'node', id });
    };

    const patchNode = (id, patch) => {
        updateDoc((d) => {
            const node = d.nodes.find((x) => x.id === id);
            if (!node) return;
            Object.assign(node, patch);
            for (const k of Object.keys(patch)) {
                if (patch[k] === '' || patch[k] == null) delete node[k];
            }
        });
        setRfNodes((ns) => ns.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)));
    };

    const deleteNode = (id) => {
        updateDoc((d) => {
            d.nodes = d.nodes.filter((x) => x.id !== id);
            d.edges = (d.edges ?? []).filter((e) => e.from !== id && e.to !== id);
            d.groups = (d.groups ?? []).map((g) => ({ ...g, children: g.children.filter((c) => c !== id) }))
                .filter((g) => g.children.length > 0);
        });
        setRfNodes((ns) => ns.filter((n) => n.id !== id));
        setSelected(null);
    };

    const patchEdge = (edgeId, label) => {
        const idx = Number(edgeId.slice(1));
        updateDoc((d) => {
            if (!d.edges?.[idx]) return;
            if (label) d.edges[idx].label = label; else delete d.edges[idx].label;
        });
    };

    const deleteEdge = (edgeId) => {
        const idx = Number(edgeId.slice(1));
        updateDoc((d) => d.edges.splice(idx, 1));
        setSelected(null);
    };

    const relayout = async () => {
        setSaveState('saving');
        const { layout: fresh } = await save('POST', `/d/${diagram.id}/relayout`);
        setLayout(fresh);
        setRfNodes((ns) => ns.map((n) => {
            const p = n.type === 'stack' ? fresh?.nodes?.[n.id] : fresh?.groups?.[n.id.replace('group:', '')];
            return p ? { ...n, position: { x: p.x, y: p.y }, ...(n.type === 'sdgroup' ? { style: { width: p.w, height: p.h } } : {}) } : n;
        }));
        setSaveState('saved');
        setTimeout(() => flow.fitView({ duration: 300 }), 50);
    };

    const setTitle = (title) => updateDoc((d) => { d.title = title || d.title; });

    const selectedNode = selected?.kind === 'node' ? doc.nodes.find((n) => n.id === selected.id) : null;
    const selectedEdgeIdx = selected?.kind === 'edge' ? Number(selected.id.slice(1)) : null;
    const selectedEdge = selectedEdgeIdx != null ? doc.edges?.[selectedEdgeIdx] : null;

    return (
        <>
            <div className="sd-editbar">
                <input className="sd-title-input" defaultValue={doc.title} maxLength={200}
                    onBlur={(e) => e.target.value !== doc.title && setTitle(e.target.value)} aria-label="Diagram title" />
                <div className="sd-palette">
                    {StackDocValidatorTypes.map((t) => (
                        <button key={t} className="sd-palette-btn" onClick={() => addNode(t)} title={`Add ${t}`}>+ {t}</button>
                    ))}
                </div>
                <div className="sd-editbar-right">
                    <button className="sd-btn sd-btn-ghost" onClick={relayout}>Re-layout</button>
                    <span className={`sd-savestate sd-save-${saveState}`}>
                        {saveState === 'saved' ? 'Saved' : saveState === 'saving' ? 'Saving…' : `Not saved — ${error}`}
                    </span>
                </div>
            </div>
            <div className="sd-canvas">
                <ReactFlow
                    nodes={rfNodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onNodeDragStop={onNodeDragStop}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    onEdgeClick={onEdgeClick}
                    onPaneClick={() => setSelected(null)}
                    fitView
                    minZoom={0.2}
                    proOptions={{ hideAttribution: true }}
                >
                    <Background variant={BackgroundVariant.Dots} gap={22} size={1.5} />
                    <Controls showInteractive={false} />
                </ReactFlow>
                {selectedNode && (
                    <NodeForm key={selectedNode.id} node={selectedNode}
                        onPatch={(patch) => patchNode(selectedNode.id, patch)}
                        onDelete={() => deleteNode(selectedNode.id)}
                        onClose={() => setSelected(null)} />
                )}
                {selectedEdge && (
                    <aside className="sd-panel">
                        <button className="sd-panel-close" onClick={() => setSelected(null)} aria-label="Close">×</button>
                        <div className="sd-panel-head"><div><h2>Connection</h2>
                            <span className="sd-panel-type">{selectedEdge.from} → {selectedEdge.to}</span></div></div>
                        <label className="sd-field">Label
                            <input defaultValue={selectedEdge.label ?? ''} maxLength={120}
                                onBlur={(e) => patchEdge(selected.id, e.target.value.trim())} />
                        </label>
                        <button className="sd-btn sd-btn-danger" onClick={() => deleteEdge(selected.id)}>Delete connection</button>
                    </aside>
                )}
            </div>
        </>
    );
}

export default function Editor(props) {
    return <ReactFlowProvider><EditorInner {...props} /></ReactFlowProvider>;
}
