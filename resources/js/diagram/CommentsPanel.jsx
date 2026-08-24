import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';

function CommentForm({ diagramId, parentId = null, anchor = null, onDone, placeholder }) {
    const [body, setBody] = useState('');
    const submit = (e) => {
        e.preventDefault();
        if (!body.trim()) return;
        router.post(`/d/${diagramId}/comments`, {
            body: body.trim(),
            parent_id: parentId,
            anchor_type: anchor ? 'node' : null,
            anchor_id: anchor?.id ?? null,
        }, {
            preserveScroll: true,
            onSuccess: () => { setBody(''); onDone?.(); },
        });
    };
    return (
        <form onSubmit={submit} className="sd-comment-form">
            {anchor && <span className="sd-anchor-chip">on {anchor.label}</span>}
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={2}
                maxLength={2000} placeholder={placeholder} required />
            <button type="submit" className="sd-btn">Post</button>
        </form>
    );
}

function CommentItem({ c, diagramId, nodeLabel }) {
    const [replying, setReplying] = useState(false);
    return (
        <li className={`sd-comment ${c.resolved ? 'sd-comment-resolved' : ''}`}>
            <div className="sd-comment-head">
                <strong>{c.author}</strong>
                <span className="sd-comment-when">{c.created_at}</span>
                {c.anchor_id && <span className="sd-anchor-chip">{nodeLabel(c.anchor_id)}</span>}
                {c.resolved && <span className="sd-resolved-chip">resolved</span>}
            </div>
            <p className="sd-comment-body">{c.body}</p>
            <div className="sd-comment-actions">
                <button onClick={() => setReplying((v) => !v)}>Reply</button>
                {c.can_manage && (
                    <>
                        <button onClick={() => router.post(`/comments/${c.id}/resolve`, {}, { preserveScroll: true })}>
                            {c.resolved ? 'Reopen' : 'Resolve'}
                        </button>
                        <button onClick={() => confirm('Delete this comment?') && router.delete(`/comments/${c.id}`, { preserveScroll: true })}>
                            Delete
                        </button>
                    </>
                )}
            </div>
            {c.replies?.length > 0 && (
                <ul className="sd-replies">
                    {c.replies.map((r) => (
                        <li key={r.id} className="sd-comment sd-reply">
                            <div className="sd-comment-head"><strong>{r.author}</strong><span className="sd-comment-when">{r.created_at}</span></div>
                            <p className="sd-comment-body">{r.body}</p>
                        </li>
                    ))}
                </ul>
            )}
            {replying && <CommentForm diagramId={diagramId} parentId={c.id} onDone={() => setReplying(false)} placeholder="Reply…" />}
        </li>
    );
}

export default function CommentsPanel({ diagram, comments, selectedNode, onClose }) {
    const { auth } = usePage().props;
    const nodeLabel = (id) => diagram.doc.nodes.find((n) => n.id === id)?.label ?? id;
    const anchor = selectedNode ? { id: selectedNode.id, label: selectedNode.label } : null;

    return (
        <aside className="sd-panel sd-comments">
            <button className="sd-panel-close" onClick={onClose} aria-label="Close comments">×</button>
            <div className="sd-panel-head"><div><h2>Comments</h2>
                <span className="sd-panel-type">{comments.length} thread{comments.length === 1 ? '' : 's'}</span></div></div>

            {diagram.can_comment ? (
                <CommentForm diagramId={diagram.id} anchor={anchor}
                    placeholder={anchor ? `Comment on ${anchor.label}…` : 'Comment on this diagram… (select a node first to attach it there)'} />
            ) : (
                <p className="sd-authnote">
                    {auth?.user ? 'Comments are limited on this diagram.' : <a href="/login">Log in</a>}
                    {!auth?.user && ' to join the discussion.'}
                </p>
            )}

            <ul className="sd-comment-list">
                {comments.map((c) => <CommentItem key={c.id} c={c} diagramId={diagram.id} nodeLabel={nodeLabel} />)}
            </ul>
        </aside>
    );
}
