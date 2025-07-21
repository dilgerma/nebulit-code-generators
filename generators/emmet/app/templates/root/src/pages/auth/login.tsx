import {useRouter} from 'next/router'
import {useState} from 'react'

import {createClient} from '../../supabase/component'

export default function LoginPage() {
    const router = useRouter()
    const supabase = createClient()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function logIn() {
        setError(null)
        setLoading(true)
        const {error} = await supabase.auth.signInWithPassword({email, password})
        setLoading(false)
        if (error) {
            setError(error.message)
        } else {
            router.push('/')
        }
    }

    async function signUp() {
        setError(null)
        setLoading(true)
        const {error} = await supabase.auth.signUp({email, password})
        setLoading(false)
        if (error) {
            setError(error.message)
        } else {
            router.push('/')
        }
    }

    return (
        <section className="hero is-fullheight">
            <div className="hero-body">
                <div className="container">
                    <div className="columns is-centered">
                        <div className="column is-4-desktop is-6-tablet">
                            <div className="box">
                                <h1 className="title has-text-centered">Welcome Back</h1>
                                <p className="subtitle has-text-centered">Sign in to your account</p>
                                
                                {error && (
                                    <div className="notification is-danger is-light">
                                        <button className="delete" onClick={() => setError(null)}></button>
                                        {error}
                                    </div>
                                )}

                                <form>
                                    <div className="field">
                                        <label className="label" htmlFor="email">Email</label>
                                        <div className="control has-icons-left">
                                            <input 
                                                className="input" 
                                                id="email" 
                                                type="email" 
                                                placeholder="Enter your email"
                                                value={email} 
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={loading}
                                            />
                                            <span className="icon is-small is-left">
                                                <i className="fas fa-envelope"></i>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="field">
                                        <label className="label" htmlFor="password">Password</label>
                                        <div className="control has-icons-left">
                                            <input
                                                className="input"
                                                id="password"
                                                type="password"
                                                placeholder="Enter your password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                disabled={loading}
                                            />
                                            <span className="icon is-small is-left">
                                                <i className="fas fa-lock"></i>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="field is-grouped">
                                        <div className="control is-expanded">
                                            <button 
                                                type="button" 
                                                className={`button is-primary is-fullwidth ${loading ? 'is-loading' : ''}`}
                                                onClick={logIn}
                                                disabled={loading || !email || !password}
                                            >
                                                Log In
                                            </button>
                                        </div>
                                    </div>

                                    <div className="field">
                                        <div className="control">
                                            <button 
                                                type="button" 
                                                className={`button is-light is-fullwidth ${loading ? 'is-loading' : ''}`}
                                                onClick={signUp}
                                                disabled={loading || !email || !password}
                                            >
                                                Create Account
                                            </button>
                                        </div>
                                    </div>

                                    <div className="has-text-centered">
                                        <a href="/auth/reset-password" className="is-size-7">Forgot your password?</a>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}