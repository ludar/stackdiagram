import { Link, useForm } from '@inertiajs/react';
import AuthForm from './Form.jsx';

export default function Login({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '', password: '', remember: true });
    const submit = (e) => { e.preventDefault(); post('/login'); };

    return (
        <AuthForm title="Log in" errors={errors} status={status}>
            <form onSubmit={submit} className="sd-form">
                <label>Email
                    <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required autoFocus autoComplete="username" />
                </label>
                <label>Password
                    <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} required autoComplete="current-password" />
                </label>
                <label className="sd-check">
                    <input type="checkbox" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} />
                    <span>Stay signed in</span>
                </label>
                <button type="submit" className="sd-btn sd-btn-big" disabled={processing}>Log in</button>
                <p className="sd-formfoot">
                    <Link href="/forgot-password">Forgot password?</Link> · <Link href="/register">Create an account</Link>
                </p>
            </form>
        </AuthForm>
    );
}
