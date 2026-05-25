export default function AuthSplit({ mode = 'login', authData, setAuthData, errors = {}, onSubmit, switchMode, successMessage }) {
  return (
    <div className="auth-split">
      <div className="auth-left">
        <h3>Welcome to JobReady AI</h3>
        <p className="muted">Practice interviews and polish your resume with AI-style feedback.</p>
      </div>
      <div className="auth-right">
        <h4>{mode === 'login' ? 'Login' : 'Create account'}</h4>
        <form className="auth-form" onSubmit={onSubmit}>
          {mode === 'register' && (
            <label>
              <span>Name</span>
              <input value={authData.name} onChange={(e) => setAuthData({ ...authData, name: e.target.value })} />
              {errors.name && <div className="error-text">{errors.name}</div>}
            </label>
          )}
          <label>
            <span>Email</span>
            <input value={authData.email} onChange={(e) => setAuthData({ ...authData, email: e.target.value })} />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </label>
          <label>
            <span>Password</span>
            <input type="password" value={authData.password} onChange={(e) => setAuthData({ ...authData, password: e.target.value })} />
            {errors.password && <div className="error-text">{errors.password}</div>}
          </label>
          <button className="primary" type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
        </form>
        {successMessage && <div className="success-text">{successMessage}</div>}
        <button className="ghost switch-button" onClick={switchMode}>{mode === 'login' ? 'Create account' : 'Have an account? Login'}</button>
      </div>
    </div>
  );
}
