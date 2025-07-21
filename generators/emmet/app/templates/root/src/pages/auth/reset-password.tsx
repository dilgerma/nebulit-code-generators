import {useState} from 'react';
import {createClient} from "../../supabase/component";

export default function ResetPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setErrorMsg(null);
        setLoading(true);
        const client = createClient()
        const {error} = await client.auth.resetPasswordForEmail(email);
        setLoading(false);
        if (error) {
            setErrorMsg(error.message);
        } else {
            setMessage('Password reset email sent! Check your inbox.');
        }
    };

    return (
        <section className="hero is-fullheight">
            <div className="hero-body">
                <div className="container">
                    <div className="columns is-centered">
                        <div className="column is-4-desktop is-6-tablet">
                            <div className="box">
                                <h1 className="title has-text-centered">Reset Password</h1>
                                <p className="subtitle has-text-centered">Enter your email to receive reset instructions</p>
                                
                                {errorMsg && (
                                    <div className="notification is-danger is-light">
                                        <button className="delete" onClick={() => setErrorMsg(null)}></button>
                                        {errorMsg}
                                    </div>
                                )}

                                {message && (
                                    <div className="notification is-success is-light">
                                        <button className="delete" onClick={() => setMessage(null)}></button>
                                        {message}
                                    </div>
                                )}

                                <form onSubmit={handleReset}>
                                    <div className="field">
                                        <label className="label" htmlFor="email">Email Address</label>
                                        <div className="control has-icons-left">
                                            <input
                                                className="input"
                                                id="email"
                                                type="email"
                                                placeholder="Enter your email address"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                disabled={loading}
                                            />
                                            <span className="icon is-small is-left">
                                                <i className="fas fa-envelope"></i>
                                            </span>
                                        </div>
                                        <p className="help">We'll send password reset instructions to this email</p>
                                    </div>

                                    <div className="field">
                                        <div className="control">
                                            <button 
                                                type="submit" 
                                                className={`button is-primary is-fullwidth ${loading ? 'is-loading' : ''}`}
                                                disabled={loading || !email}
                                            >
                                                {loading ? 'Sending...' : 'Send Reset Email'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="has-text-centered">
                                        <p className="is-size-7">Remember your password? <a href="/auth/login">Sign in</a></p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
} 