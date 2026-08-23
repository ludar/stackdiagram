import { Head, Link, router } from '@inertiajs/react';
import Shell from '../Layouts/Shell.jsx';

const VIEW_NAMES = { services: 'services', dataflow: 'data flow', schema: 'schema', deploy: 'deploy' };

export default function Dashboard({ diagrams }) {
    const setVisibility = (id, visibility) =>
        router.patch(`/d/${id}/visibility`, { visibility }, { preserveScroll: true });
    const destroy = (id, title) => {
        if (confirm(`Delete "${title}"? You have 7 days to change your mind (ask us), then it's gone for good.`)) {
            router.delete(`/d/${id}`);
        }
    };

    return (
        <Shell>
            <Head title="My diagrams" />
            <main className="sd-main">
                <h1 className="sd-pagetitle">My diagrams</h1>
                {diagrams.length === 0 ? (
                    <div className="sd-empty">
                        <p>Nothing here yet. Create a diagram through the <a href="/llms.txt">API</a> and
                        open its claim link, or fork the <a href="/d/du5pkQ">example</a>.</p>
                    </div>
                ) : (
                    <table className="sd-table">
                        <thead>
                            <tr><th>Title</th><th>View</th><th>Nodes</th><th>Visibility</th><th>Updated</th><th></th></tr>
                        </thead>
                        <tbody>
                            {diagrams.map((d) => (
                                <tr key={d.id}>
                                    <td>
                                        <Link href={`/d/${d.id}`} className="sd-rowlink">{d.title}</Link>
                                        {d.forked_from_id && <span className="sd-forktag">fork of {d.forked_from_id}</span>}
                                    </td>
                                    <td>{VIEW_NAMES[d.view] ?? d.view}</td>
                                    <td>{d.nodes}</td>
                                    <td>
                                        <select value={d.visibility} onChange={(e) => setVisibility(d.id, e.target.value)} className="sd-select">
                                            <option value="public">public</option>
                                            <option value="unlisted">unlisted</option>
                                            <option value="private">private</option>
                                        </select>
                                    </td>
                                    <td className="sd-dim">{d.updated_at}</td>
                                    <td><button className="sd-btn sd-btn-danger" onClick={() => destroy(d.id, d.title)}>Delete</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </main>
        </Shell>
    );
}
