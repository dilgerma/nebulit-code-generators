import {useState} from 'react';
import {createClient} from "../../supabase/component";

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setErrorMsg(null);
        setLoading(true);
        const client = createClient()
        const {data, error} = await client.auth.signInWithOtp({email});
        setLoading(false);
        if (error) {
            setErrorMsg(error.message);
        } else {
            setMessage('Check your email for a magic link to complete registration.');
        }
    };

    return (
        <section className="hero is-fullheight">
            <div className="hero-body">
                <div className="container">
                    <div className="columns is-centered">
                        <div className="column is-4-desktop is-6-tablet">
                            <div className="box">
                                <h1 className="title has-text-centered">Create Account</h1>
                                <p className="subtitle has-text-centered">Register with your email address</p>
                                
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

                                <form onSubmit={handleRegister}>
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
                                        <p className="help">We'll send you a magic link to complete registration</p>
                                    </div>

                                    <div className="field">
                                        <div className="control">
                                            <button 
                                                type="submit" 
                                                className={`button is-primary is-fullwidth ${loading ? 'is-loading' : ''}`}
                                                disabled={loading || !email}
                                            >
                                                {loading ? 'Sending...' : 'Send Magic Link'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="has-text-centered">
                                        <p className="is-size-7">Already have an account? <a href="/auth/login">Sign in</a></p>
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