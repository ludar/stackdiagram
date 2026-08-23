import { useForm } from '@inertiajs/react';
import AuthForm from './Form.jsx';

export default function ResetPassword({ email, token }) {
    const { data, setData, post, processing, errors } = useForm({ email: email ?? '', token, password: '', password_confirmation: '' });
    const submit = (e) => { e.preventDefault(); post('/reset-password'); };

    return (
        <AuthForm title="Choose a new password" errors={errors}>
            <form onSubmit={submit} className="sd-form">
                <label>Email
                    <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                </label>
                <label>New password
                    <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} required autoFocus autoComplete="new-password" />
                </label>
                <label>Confirm password
                    <input type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} required autoComplete="new-password" />
                </label>
                <button type="submit" className="sd-btn sd-btn-big" disabled={processing}>Set password</button>
            </form>
        </AuthForm>
    );
}
