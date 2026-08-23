import { Head } from '@inertiajs/react';
import Shell from '../../Layouts/Shell.jsx';

/** Shared chrome for all auth screens. */
export default function AuthForm({ title, children, errors = {}, status }) {
    const errorList = Object.values(errors).flat();
    return (
        <Shell>
            <Head title={title} />
            <main className="sd-authwrap">
                <div className="sd-authcard">
                    <h1>{title}</h1>
                    {status && <div className="sd-flash sd-flash-inline">{status}</div>}
                    {errorList.length > 0 && (
                        <div className="sd-errors">{errorList.map((e, i) => <p key={i}>{e}</p>)}</div>
                    )}
                    {children}
                </div>
            </main>
        </Shell>
    );
}
