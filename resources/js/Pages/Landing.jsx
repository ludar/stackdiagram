import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import Shell from '../Layouts/Shell.jsx';
import SupremArt from '../Layouts/SupremArt.jsx';
import Logo from '../Layouts/Logo.jsx';

const MAPS = [
    ['Services', 'Every API, worker, queue, and cron job — who calls whom, and why each piece exists. The default picture of a system.'],
    ['Databases', 'Tables with their columns, relations between them, and which services read or write each one.'],
    ['Data flow', 'One request traced end to end, step by step — from click to queue to disk. Numbered, left to right.'],
    ['Deploys', 'Servers, regions, clusters, and network boundaries — where the code actually runs, drawn as containers.'],
];

const FAQ = [
    ['What is StackDiagram?', 'A place where AI agents (and humans) turn a description of a software system into a shareable diagram. The AI POSTs one JSON document; the result is a living diagram at a short URL — every box clickable, every component explained in plain language.'],
    ['Is it free?', 'Yes — everything is free during beta. Diagrams created without an account live for at least one year. Claimed diagrams are free forever; that promise survives any paid plans we add later.'],
    ['What does “claiming” mean?', 'Any unclaimed diagram can be claimed by the first signed-in user who clicks Claim. Claiming puts it in your account, removes the expiry date, and unlocks editing — rearrange nodes, rewrite notes, change visibility.'],
    ['Can I edit a diagram by hand?', 'Once it\'s yours: drag boxes around, connect them, add or delete components, edit every label and note. Or click Re-layout and let the engine redraw it. Every save keeps a version history.'],
    ['How do I move a stack between AIs?', 'Every diagram has an LLM-ready twin at the same URL with .md appended — or click “Copy for AI” on the diagram. Paste it into a new Claude, ChatGPT, or Cursor conversation and the next AI starts with your architecture as ground truth.'],
    ['Who can see my diagram?', 'Diagrams are unlisted by default — visible only to people with the link. Owners can flip them to public (listed on Explore, forkable) or private (only you and people you invite).'],
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

            <section className="sd-section sd-handoff">
                <h2>Your stack, remembered between AIs</h2>
                <div className="sd-handoff-grid">
                    <p>
                        Conversations end; architecture shouldn't. Every diagram doubles as an
                        <strong> LLM-ready context document</strong> — click <em>Copy for AI</em> or fetch the
                        diagram URL with <code>.md</code> appended. Start a fresh session with any model,
                        paste it in, and the new AI knows every service, connection, and boundary —
                        with the reasons why. When it changes something, it updates the diagram
                        through the API, and the next conversation inherits the new truth.
                    </p>
                    <pre className="sd-code sd-code-tight"><code>{`# in your next AI chat:
"Here is my architecture: read
 https://stackdiagram.com/d/x7Kq2v.md
 — treat it as ground truth."`}</code></pre>
                </div>
            </section>

            <section className="sd-section sd-faq">
                <h2>Questions, answered</h2>
                <div className="sd-faq-list">
                    {FAQ.map(([q, a]) => (
                        <details key={q} className="sd-faq-item">
                            <summary>{q}</summary>
                            <p>{a}</p>
                        </details>
                    ))}
                </div>
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
