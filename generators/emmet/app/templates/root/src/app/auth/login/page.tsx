import { login, signup } from './actions'

export default function LoginPage() {
    return (
        <section className="hero is-fullheight">
            <div className="hero-body">
                <div className="container">
                    <div className="columns is-centered">
                        <div className="column">
                            <div className="box">
                                <h1 className="title has-text-centered">Welcome</h1>
                                <form>
                                    <div className="field">
                                        <label className="label" htmlFor="email">Email</label>
                                        <div className="control has-icons-left">
                                            <input
                                                className="input"
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="Enter your email"
                                                required
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
                                                name="password"
                                                type="password"
                                                placeholder="Enter your password"
                                                required
                                            />
                                            <span className="icon is-small is-left">
                        <i className="fas fa-lock" aria-hidden="true"></i>
                      </span>
                                        </div>
                                    </div>

                                    <div className="field is-grouped">
                                        <div className="control is-expanded">
                                            <button
                                                className="button is-primary is-fullwidth"
                                                formAction={login}
                                            >
                                                Log in
                                            </button>
                                        </div>
                                    </div>

                                    <div className="field">
                                        <div className="control">
                                            <button
                                                className="button is-light is-fullwidth"
                                                formAction={signup}
                                            >
                                                Sign up
                                            </button>
                                        </div>
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