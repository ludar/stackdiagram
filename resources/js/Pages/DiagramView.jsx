import { Head } from '@inertiajs/react';
import { ReactFlow, Background, Controls, BackgroundVariant } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes, toFlow } from '../diagram/nodes.jsx';

const VIEW_NAMES = { services: 'Services', dataflow: 'Data flow', schema: 'Schema', deploy: 'Deploy' };

export default function DiagramView({ diagram }) {
    const { nodes, edges } = toFlow(diagram.doc, diagram.layout);

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
                    elementsSelectable={false}
                    proOptions={{ hideAttribution: true }}
                >
                    <Background variant={BackgroundVariant.Dots} gap={22} size={1.5} />
                    <Controls showInteractive={false} />
                </ReactFlow>
            </main>
        </div>
    );
}
