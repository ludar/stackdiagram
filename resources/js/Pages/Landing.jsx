import { Head, Link, usePage } from '@inertiajs/react';
import Shell from '../Layouts/Shell.jsx';

const MAPS = [
    ['Services', 'Every API, worker, and cron job — who calls whom, and why it exists.'],
    ['Databases', 'Tables, schemas, and which code reads or writes each one.'],
    ['Data flow', 'Follow a request end to end — from click to queue to disk.'],
    ['Deploys', 'Servers, regions, clusters — where the code actually runs.'],
];

const STEPS = [
    ['Ask your AI', 'Tell your agent to describe the stack it built and POST it to our API — the whole reference fits in its context window.'],
    ['Get a link', 'One request returns a shareable URL. No account, no key. The diagram lives free for at least a year.'],
    ['Claim it', 'Sign up free and the diagram is yours forever — rearrange it, keep it private, or share it with the team.'],
];

const CURL = `curl -X POST https://stackdiagram.com/api/v1/diagrams \\
  -H "Content-Type: application/json" \\
  -d '{"title":"My stack","nodes":[
    {"id":"web","type":"service","label":"App","tech":"laravel"},
    {"id":"db","type":"database","label":"main_db","tech":"postgres"}],
    "edges":[{"from":"web","to":"db"}]}'

# → {"url":"https://stackdiagram.com/d/x7Kq2v", ...}`;

export default function Landing() {
    const { auth } = usePage().props;

    return (
        <Shell>
            <Head title="StackDiagram">
                <meta name="description" content="AI posts JSON, you get an architecture diagram at a short URL. Free, no account needed to create." />
            </Head>

            <section className="sd-hero">
                <div className="sd-hero-inner">
                    <p className="sd-eyebrow">Diagrams as a URL — built for AI callers</p>
                    <h1>Your AI wrote it.<br />Now <em>see</em> what it built.</h1>
                    <p className="sd-sub">
                        StackDiagram turns a JSON description of a stack into a living diagram —
                        services, databases, data flow, deploys — each piece explained in plain
                        language you can actually trust. One POST, one short URL, no account needed.
                    </p>
                    <div className="sd-cta-row">
                        <a className="sd-btn sd-btn-big" href="/d/du5pkQ">See a live example</a>
                        <a className="sd-btn sd-btn-big sd-btn-ghost" href="/llms.txt">Read the API</a>
                    </div>
                </div>
                <div className="sd-hero-art" aria-hidden="true">
                    <i className="ha ha-sq" /><i className="ha ha-bar" /><i className="ha ha-circle" />
                    <i className="ha ha-diag" /><i className="ha ha-sq2" /><i className="ha ha-line" />
                </div>
            </section>

            <section className="sd-section">
                <h2>What it maps</h2>
                <div className="sd-grid4">
                    {MAPS.map(([t, d]) => (
                        <div className="sd-card" key={t}><h3>{t}</h3><p>{d}</p></div>
                    ))}
                </div>
            </section>

            <section className="sd-section sd-section-dark">
                <h2>How it works</h2>
                <div className="sd-steps">
                    {STEPS.map(([t, d], i) => (
                        <div className="sd-step" key={t}>
                            <span className="sd-stepnum">{String(i + 1).padStart(2, '0')}</span>
                            <h3>{t}</h3><p>{d}</p>
                        </div>
                    ))}
                </div>
                <pre className="sd-code"><code>{CURL}</code></pre>
            </section>

            <section className="sd-section sd-final">
                <h2>Stop guessing what the machine built</h2>
                <p>Point your AI at <code>stackdiagram.com/llms.txt</code> — that's the whole integration.</p>
                {!auth?.user && <Link href="/register" className="sd-btn sd-btn-big">Sign up free</Link>}
            </section>

            <footer className="sd-footer">
                <span>© 2026 Stackdiagram</span>
                <span><a href="/llms.txt">API</a> · <a href="/d/du5pkQ">Example</a></span>
            </footer>
        </Shell>
    );
}
