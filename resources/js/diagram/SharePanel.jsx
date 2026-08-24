import { useState } from 'react';
import { router } from '@inertiajs/react';

/** Owner-only: invite people by email as commenter or editor. */
export default function SharePanel({ diagram, collaborators, onClose }) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('commenter');

    const invite = (e) => {
        e.preventDefault();
        router.post(`/d/${diagram.id}/collaborators`, { email, role }, {
            preserveScroll: true,
            onSuccess: () => setEmail(''),
        });
    };

    return (
        <aside className="sd-panel">
            <button className="sd-panel-close" onClick={onClose} aria-label="Close">×</button>
            <div className="sd-panel-head"><div><h2>Share</h2>
                <span className="sd-panel-type">{diagram.visibility} · invite by email</span></div></div>

            <form onSubmit={invite} className="sd-form">
                <label>Email
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="teammate@company.com" />
                </label>
                <label>Role
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="commenter">commenter — view private, discuss</option>
                        <option value="editor">editor — can also change the diagram</option>
                    </select>
                </label>
                <button type="submit" className="sd-btn">Invite</button>
                <p className="sd-formfoot">No account yet? The invite attaches when they sign up with this email.</p>
            </form>

            {collaborators?.length > 0 && (
                <ul className="sd-collab-list">
                    {collaborators.map((c) => (
                        <li key={c.id}>
                            <span>{c.email}</span>
                            <span className="sd-collab-meta">{c.role}{c.joined ? '' : ' · not signed up yet'}</span>
                            <button onClick={() => router.delete(`/d/${diagram.id}/collaborators/${c.id}`, { preserveScroll: true })} aria-label={`Remove ${c.email}`}>×</button>
                        </li>
                    ))}
                </ul>
            )}
        </aside>
    );
}
