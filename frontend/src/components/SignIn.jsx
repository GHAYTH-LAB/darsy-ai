import { useState } from 'react';

const GOLD = '#D9955B';
const CREAM = '#F3D9BC';

const STYLE = `
  @keyframes darsy-signin-enter {
    from { opacity: 0; transform: translateY(18px) scale(.98); filter: blur(5px); }
    to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
  }
  .signin-card { width: min(440px, calc(100vw - 2rem)); box-sizing: border-box; padding: 2rem; text-align: left;
    border: 1px solid rgba(232,184,135,.28); border-radius: 28px; color: ${CREAM};
    background: linear-gradient(180deg, rgba(24,14,9,.94), rgba(14,8,5,.96));
    box-shadow: 0 24px 70px -28px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,214,170,.07);
    backdrop-filter: blur(16px); animation: darsy-signin-enter 420ms cubic-bezier(.2,.8,.2,1) both; }
  .signin-field { position: relative; }
  .signin-input { width: 100%; box-sizing: border-box; padding: .9rem 1rem .9rem 2.85rem; border-radius: 14px;
    border: 1px solid rgba(232,184,135,.24); color: ${CREAM}; background: rgba(10,6,4,.72);
    color-scheme: dark; font: 500 15px/1.45 'Segoe UI', system-ui, sans-serif; letter-spacing: .01em;
    outline: none; transition: border-color 180ms ease, box-shadow 180ms ease; }
  .signin-input:focus { border-color: ${GOLD}; box-shadow: 0 0 0 3px rgba(217,149,91,.14); }
  .signin-input::placeholder { color: rgba(243,217,188,.52); }
  .signin-input:-webkit-autofill, .signin-input:-webkit-autofill:hover, .signin-input:-webkit-autofill:focus {
    -webkit-text-fill-color: ${CREAM}; caret-color: ${CREAM};
    -webkit-box-shadow: 0 0 0 1000px #140c09 inset; border: 1px solid rgba(217,149,91,.42);
    transition: background-color 9999s ease-out 0s;
  }
  .signin-field-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); width: 17px; height: 17px;
    color: rgba(217,149,91,.78); pointer-events: none; }
  .signin-label { display: block; margin-bottom: 7px; color: #d1ad89; font-size: 11px; font-weight: 700;
    letter-spacing: .14em; text-transform: uppercase; }
  .signin-label-password { margin: 1rem 0 7px; }
  .signin-reveal { position: absolute; top: 50%; right: .85rem; transform: translateY(-50%); border: 0; padding: .3rem;
    color: #c4a484; background: none; font: inherit; font-size: 11px; cursor: pointer; }
  .signin-reveal:hover { color: ${CREAM}; }
  .signin-submit { width: 100%; margin-top: 1.15rem; padding: .9rem 1rem; border: 0; border-radius: 14px;
    color: #261509; background: linear-gradient(135deg, ${CREAM}, ${GOLD}); font: inherit; font-weight: 700;
    cursor: pointer; transition: transform 180ms ease, box-shadow 180ms ease; }
  .signin-submit:hover { transform: translateY(-2px); box-shadow: 0 12px 24px -10px rgba(217,149,91,.7); }
  .signin-submit:active { transform: scale(.98); }
  .signin-back { border: 0; padding: .25rem 0; color: ${GOLD}; background: none; font: inherit; cursor: pointer; }
  .signin-back:hover { color: ${CREAM}; }
  @media (prefers-reduced-motion: reduce) { .signin-card, .signin-input, .signin-submit { animation: none; transition: none; } }
`;

export default function SignIn({ onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState('');

  const submit = event => {
    event.preventDefault();
    setNotice('Sign-in is not available yet because account authentication is not connected.');
  };

  return (
    <>
      <style>{STYLE}</style>
      <form className="signin-card" onSubmit={submit}>
        <button className="signin-back" type="button" onClick={onBack}>
          ← Create an account
        </button>
        <div style={{ marginTop: '1.4rem', color: GOLD, fontSize: 10, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase' }}>
          Your study space
        </div>
        <h2 style={{ margin: '.5rem 0 .45rem', color: CREAM, fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 32, lineHeight: 1.12 }}>
          Welcome back
        </h2>
        <p style={{ margin: '0 0 1.6rem', color: 'rgba(243,217,188,.62)', fontSize: 14 }}>
          Sign in to return to your courses and study tools.
        </p>

        <label className="signin-label">Email</label>
        <div className="signin-field">
          <svg className="signin-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="3" />
            <path d="m4 7 8 6 8-6" />
          </svg>
          <input
            className="signin-input"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={email}
            onChange={event => setEmail(event.target.value)}
            required
          />
        </div>

        <label className="signin-label signin-label-password">Password</label>
        <div className="signin-field">
          <svg className="signin-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <rect x="4" y="10" width="16" height="11" rx="2.5" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
          </svg>
          <input
            className="signin-input"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            style={{ paddingRight: '4.2rem' }}
            required
          />
          <button
            className="signin-reveal"
            type="button"
            onClick={() => setShowPassword(value => !value)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        {notice && <p role="status" style={{ color: '#e9b783', fontSize: 13, lineHeight: 1.5 }}>{notice}</p>}
        <button className="signin-submit" type="submit">Continue to Darsy</button>
      </form>
    </>
  );
}
