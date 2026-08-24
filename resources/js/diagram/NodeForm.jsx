import { StackDocValidatorTypes } from './constants.js';

/** Property editor for one node. Saves on blur/change; parent debounces. */
export default function NodeForm({ node, onPatch, onDelete, onClose }) {
    return (
        <aside className="sd-panel">
            <button className="sd-panel-close" onClick={onClose} aria-label="Close">×</button>
            <div className="sd-panel-head"><div><h2>Edit node</h2>
                <span className="sd-panel-type">{node.id}</span></div></div>

            <label className="sd-field">Label
                <input defaultValue={node.label} maxLength={120} autoFocus
                    onBlur={(e) => e.target.value.trim() && onPatch({ label: e.target.value.trim() })} />
            </label>
            <label className="sd-field">Type
                <select value={node.type} onChange={(e) => onPatch({ type: e.target.value })}>
                    {StackDocValidatorTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
            </label>
            <label className="sd-field">Tech <span className="sd-field-hint">postgres, laravel, redis… drives the icon</span>
                <input defaultValue={node.tech ?? ''} maxLength={60}
                    onBlur={(e) => onPatch({ tech: e.target.value.trim() })} />
            </label>
            <label className="sd-field">Note <span className="sd-field-hint">why does this exist?</span>
                <textarea defaultValue={node.note ?? ''} maxLength={500} rows={3}
                    onBlur={(e) => onPatch({ note: e.target.value.trim() })} />
            </label>
            {node.type === 'cron' && (
                <label className="sd-field">Schedule
                    <input defaultValue={node.schedule ?? ''} maxLength={60} placeholder="0 2 * * *"
                        onBlur={(e) => onPatch({ schedule: e.target.value.trim() })} />
                </label>
            )}
            {node.type === 'table' && (
                <label className="sd-field">Columns <span className="sd-field-hint">one per line</span>
                    <textarea defaultValue={(node.columns ?? []).join('\n')} rows={5}
                        onBlur={(e) => onPatch({ columns: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })} />
                </label>
            )}
            <button className="sd-btn sd-btn-danger" onClick={onDelete}>Delete node</button>
        </aside>
    );
}
