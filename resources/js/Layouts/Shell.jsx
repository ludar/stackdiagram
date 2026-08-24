import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Logo from './Logo.jsx';

export default function Shell({ children, bare = false }) {
    const { auth, flash } = usePage().props;
    const [open, setOpen] = useState(false);

    const links = (
        <>
            <a href="/llms.txt">API</a>
            <a href="/d/du5pkQ">Example</a>
            <Link href="/explore">Explore</Link>
            {auth?.user ? (
                <>
                    <Link href="/dashboard">My diagrams</Link>
                    <Link href="/logout" method="post" as="button" className="sd-btn sd-btn-ghost">Log out</Link>
                </>
            ) : (
                <>
                    <Link href="/login">Log in</Link>
                    <Link href="/register" className="sd-btn">Sign up free</Link>
                </>
            )}
        </>
    );

    return (
        <div className={bare ? 'sd-page' : 'sd-page sd-scroll'}>
            <header className="sd-topbar">
                <Link href="/" className="sd-home" aria-label="StackDiagram home">
                    <Logo size={34} />
                    <span className="sd-wordmark">Stackdiagram</span>
                </Link>
                <nav className="sd-nav">{links}</nav>
                <button className="sd-burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
                    <i /><i /><i />
                </button>
            </header>
            {open && <nav className="sd-mobilenav" onClick={() => setOpen(false)}>{links}</nav>}
            {flash?.status && <div className="sd-flash">{flash.status}</div>}
            {children}
        </div>
    );
}
