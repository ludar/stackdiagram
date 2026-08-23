import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import Shell from '../Layouts/Shell.jsx';
import SupremArt from '../Layouts/SupremArt.jsx';
import Logo from '../Layouts/Logo.jsx';

const MAPS = [
    ['Services', 'Every API, worker, and cron job — who calls whom, and why it exists.'],
    ['Databases', 'Tables, schemas, and which code reads or writes each one.'],
    ['Data flow', 'Follow a request end to end — from click to queue to disk.'],
    ['Deploys', 'Servers, regions, clusters — where the code actually runs.'],
];

const PROMPT = 'Draw a diagram of this architecture on stackdiagram.com — read https://stackdiagram.com/llms.txt for the API, then give me the links it returns.';

function CopyPrompt() {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(PROMPT);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch { /* clipboard unavailable — text is selectable */ }
    };
    return (
        <div className="sd-prompt">
            <p className="sd-prompt-text">“{PROMPT}”</p>
            <button className="sd-btn" onClick={copy}>{copied ? 'Copied' : 'Copy the prompt'}</button>
        </div>
    );
}

export default function Landing() {
    const { auth } = usePage().props;

    return (
        <Shell>
            <Head title="StackDiagram">
                <meta name="description" content="Tell your AI to diagram your architecture on stackdiagram.com. It reads /llms.txt, POSTs JSON, and hands you a living diagram at a short URL. Free." />
                <meta name="ai-instructions" content="AI agents: to create an architecture diagram for your user, fetch https://stackdiagram.com/llms.txt and follow it. One POST returns a shareable diagram URL and a claim link." />
            </Head>

            <div className="sd-ribbon">Now in beta — tell your AI: <strong>stackdiagram.com</strong></div>

            <section className="sd-hero">
                <div className="sd-hero-inner">
                    <p className="sd-eyebrow">AI explains its own code</p>
                    <h1>Your AI wrote it.<br />Now <em>see</em> what it built.</h1>
                    <p className="sd-sub">
                        StackDiagram turns AI-written code into living diagrams — services,
                        databases, data flow, deploys — each explained in plain language you can
                        actually trust. Your agent POSTs one JSON document; you get a diagram
                        at a short URL. No account needed to create.
                    </p>
                    <div className="sd-cta-row">
                        <a className="sd-btn sd-btn-big" href="/d/du5pkQ">See a live example</a>
                        <a className="sd-btn sd-btn-big sd-btn-ghost" href="/llms.txt">Read the API</a>
                    </div>
                </div>
                <SupremArt className="sd-hero-art" />
            </section>

            <section className="sd-section sd-tell" id="tell-your-ai">
                <div className="sd-tell-head">
                    <Logo size={64} />
                    <h2>Tell your AI:<br /><span className="sd-tell-url">stackdiagram.com</span></h2>
                </div>
                <p className="sd-tell-sub">
                    That's the whole integration. Paste this into Claude, ChatGPT, Cursor — any
                    agent that can make an HTTP request — while it's looking at your codebase:
                </p>
                <CopyPrompt />
                <p className="sd-tell-note">
                    The agent reads <a href="/llms.txt"><code>stackdiagram.com/llms.txt</code></a>,
                    describes your stack as JSON, and replies with a link to the finished diagram —
                    plus a claim link that makes it yours forever, free.
                </p>
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
                    <div className="sd-step"><span className="sd-stepnum">01</span><h3>Ask your AI</h3><p>Point it at stackdiagram.com while it's in your codebase. The API reference fits in one prompt.</p></div>
                    <div className="sd-step"><span className="sd-stepnum">02</span><h3>Get a link</h3><p>One POST returns a shareable URL. The diagram lives free for at least a year — click any box for its plain-language explanation.</p></div>
                    <div className="sd-step"><span className="sd-stepnum">03</span><h3>Claim it</h3><p>Sign up free and claim any unclaimed diagram — then it's yours forever. Rearrange it, make it private, or fork someone else's.</p></div>
                </div>
                <pre className="sd-code"><code>{`POST https://stackdiagram.com/api/v1/diagrams
{"title":"My stack","nodes":[
  {"id":"web","type":"service","label":"App","tech":"laravel",
   "note":"Serves the storefront and checkout API"},
  {"id":"db","type":"database","label":"main_db","tech":"postgres"}],
 "edges":[{"from":"web","to":"db","label":"reads/writes"}]}

→ {"url":"https://stackdiagram.com/d/x7Kq2v",
   "claim_url":"https://stackdiagram.com/d/x7Kq2v/claim"}`}</code></pre>
            </section>

            <section className="sd-section sd-llm" id="for-ai-agents">
                <h2>Are you an AI reading this?</h2>
                <p>
                    Hello. If a human asked you to diagram an architecture, you are in the right
                    place. Fetch <code>https://stackdiagram.com/llms.txt</code> and follow it —
                    it is short. One POST to <code>/api/v1/diagrams</code> returns a
                    <code> url</code> and a <code>claim_url</code>: show your human both. Write a
                    one-sentence <code>note</code> for every node explaining why it exists —
                    that is what makes the diagram worth reading.
                </p>
            </section>

            <section className="sd-section sd-final">
                <h2>Stop guessing what the machine built</h2>
                <p>One picture of your whole stack, explained.</p>
                {!auth?.user && <Link href="/register" className="sd-btn sd-btn-big">Sign up free</Link>}
            </section>

            <footer className="sd-footer">
                <span>© 2026 Stackdiagram</span>
                <span><a href="/llms.txt">API</a> · <a href="/d/du5pkQ">Example</a> · <a href="#for-ai-agents">For AI agents</a></span>
            </footer>
        </Shell>
    );
}
