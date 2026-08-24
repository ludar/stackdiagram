import { Head, Link } from '@inertiajs/react';
import Shell from '../Layouts/Shell.jsx';

const VIEW_NAMES = { services: 'services', dataflow: 'data flow', schema: 'schema', deploy: 'deploy' };

export default function Explore({ diagrams }) {
    return (
        <Shell>
            <Head title="Explore" />
            <main className="sd-main">
                <h1 className="sd-pagetitle">Public diagrams</h1>
                <p className="sd-dim" style={{ marginBottom: 20 }}>
                    Stacks their owners chose to publish. Fork anything into your own account.
                </p>
                {diagrams.length === 0 ? (
                    <div className="sd-empty"><p>Nothing public yet. Make one of yours public from the dashboard, or start with the <a href="/d/du5pkQ">example</a>.</p></div>
                ) : (
                    <div className="sd-grid4">
                        {diagrams.map((d) => (
                            <Link key={d.id} href={`/d/${d.id}`} className="sd-card sd-card-link">
                                <h3>{d.title}</h3>
                                <p>{VIEW_NAMES[d.view] ?? d.view} · {d.nodes} nodes{d.forked ? ' · fork' : ''}</p>
                                <p className="sd-dim">{d.updated_at}</p>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </Shell>
    );
}
