import { useForm } from '@inertiajs/react';
import AuthForm from './Form.jsx';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });
    const submit = (e) => { e.preventDefault(); post('/forgot-password'); };

    return (
        <AuthForm title="Reset password" errors={errors} status={status}>
            <form onSubmit={submit} className="sd-form">
                <label>Email
                    <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required autoFocus />
                </label>
                <button type="submit" className="sd-btn sd-btn-big" disabled={processing}>Email me a reset link</button>
            </form>
        </AuthForm>
    );
}
