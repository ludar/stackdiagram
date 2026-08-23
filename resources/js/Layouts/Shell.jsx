import { Link, usePage } from '@inertiajs/react';
import Logo from './Logo.jsx';

export default function Shell({ children, bare = false }) {
    const { auth, flash } = usePage().props;

    return (
        <div className={bare ? 'sd-page' : 'sd-page sd-scroll'}>
            <header className="sd-topbar">
                <Link href="/" className="sd-home" aria-label="StackDiagram home">
                    <Logo size={34} />
                    <span className="sd-wordmark">Stackdiagram</span>
                </Link>
                <nav className="sd-nav">
                    <a href="/llms.txt">API</a>
                    <a href="/d/du5pkQ">Example</a>
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
                </nav>
            </header>
            {flash?.status && <div className="sd-flash">{flash.status}</div>}
            {children}
        </div>
    );
}
