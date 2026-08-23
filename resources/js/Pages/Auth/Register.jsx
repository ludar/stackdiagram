import { Link, useForm } from '@inertiajs/react';
import AuthForm from './Form.jsx';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({ email: '', password: '', password_confirmation: '' });
    const submit = (e) => { e.preventDefault(); post('/register'); };

    return (
        <AuthForm title="Sign up free" errors={errors}>
            <form onSubmit={submit} className="sd-form">
                <label>Email
                    <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required autoFocus autoComplete="username" />
                </label>
                <label>Password
                    <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} required autoComplete="new-password" />
                </label>
                <label>Confirm password
                    <input type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} required autoComplete="new-password" />
                </label>
                <button type="submit" className="sd-btn sd-btn-big" disabled={processing}>Create account</button>
                <p className="sd-formfoot">Your email is your username. Claimed diagrams are free, forever.</p>
                <p className="sd-formfoot"><Link href="/login">Already have an account? Log in</Link></p>
            </form>
        </AuthForm>
    );
}
