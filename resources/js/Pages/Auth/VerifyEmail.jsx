import { useForm } from '@inertiajs/react';
import AuthForm from './Form.jsx';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});
    const submit = (e) => { e.preventDefault(); post('/email/verification-notification'); };

    return (
        <AuthForm title="Check your email" status={status === 'verification-link-sent' ? 'A fresh verification link is on its way.' : null}>
            <p className="sd-authnote">
                We sent a verification link to your email. Click it to finish setting up —
                claiming diagrams needs a verified address.
            </p>
            <form onSubmit={submit} className="sd-form">
                <button type="submit" className="sd-btn sd-btn-big" disabled={processing}>Resend the link</button>
            </form>
        </AuthForm>
    );
}
