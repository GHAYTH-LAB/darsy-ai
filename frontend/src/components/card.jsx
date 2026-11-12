import { useState } from 'react';

/* DARSY palette */
const C = {
  champagne: '#F3D9BC',
  bronze: '#E8B887',
  copper: '#D9955B',
};

const css = `
  .ds-card{width:100%;max-width:420px;margin:0 auto;box-sizing:border-box;padding:1.4rem 1.5rem;border-radius:18px;
    background:rgba(18,11,7,.62);border:1px solid rgba(232,184,135,.22);
    backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
    box-shadow:0 20px 60px rgba(0,0,0,.55),0 0 40px rgba(217,149,91,.08);
    opacity:0;animation:ds-in .9s ease-out 1.5s forwards}
  .ds-card h2{margin:0 0 .25rem;font-size:1.4rem;font-weight:700;color:${C.champagne};text-align:center}
  .ds-sub{margin:0 0 1rem;text-align:center;font-size:.92rem;color:rgba(243,217,188,.65)}
  .ds-oauth{display:grid;grid-template-columns:1fr 1fr;gap:.7rem}
  .ds-btn-o{display:flex;align-items:center;justify-content:center;gap:.55rem;padding:.65rem;border-radius:12px;cursor:pointer;
    font-family:inherit;font-size:.92rem;font-weight:600;color:${C.champagne};background:rgba(243,217,188,.06);
    border:1px solid rgba(232,184,135,.28);transition:background .2s,border-color .2s}
  .ds-btn-o:hover{background:rgba(243,217,188,.14);border-color:${C.copper}}
  .ds-div{display:flex;align-items:center;gap:.8rem;margin:.9rem 0;font-size:.8rem;color:rgba(243,217,188,.5)}
  .ds-div::before,.ds-div::after{content:"";flex:1;height:1px;background:rgba(232,184,135,.2)}
  .ds-row{display:grid;grid-template-columns:1fr 1fr;gap:.7rem}
  .ds-field{position:relative;margin-bottom:.6rem}
  .ds-field svg.ico{position:absolute;left:.9rem;top:50%;transform:translateY(-50%);color:${C.bronze};opacity:.75;pointer-events:none}
  .ds-in{width:100%;box-sizing:border-box;padding:.72rem .9rem .72rem 2.6rem;border-radius:12px;font:inherit;font-size:.95rem;
    color:${C.champagne};background:rgba(10,6,4,.55);border:1px solid rgba(232,184,135,.22);outline:none;
    transition:border-color .2s,box-shadow .2s}
  .ds-in::placeholder{color:rgba(243,217,188,.42)}
  .ds-in:focus{border-color:${C.copper};box-shadow:0 0 0 3px rgba(217,149,91,.22)}
  .ds-eye{position:absolute;right:.5rem;top:50%;transform:translateY(-50%);background:none;border:0;padding:.4rem;
    color:${C.bronze};cursor:pointer;border-radius:8px;display:flex}
  .ds-eye:focus-visible,.ds-btn-o:focus-visible,.ds-submit:focus-visible,.ds-link:focus-visible{outline:2px solid ${C.copper};outline-offset:2px}
  .ds-submit{width:100%;margin-top:.3rem;padding:.8rem;border:0;border-radius:12px;cursor:pointer;font:inherit;font-weight:700;
    font-size:1rem;color:#1a0f08;background:linear-gradient(135deg,${C.champagne},${C.copper});
    box-shadow:0 8px 24px rgba(217,149,91,.3);transition:transform .15s,box-shadow .2s,filter .2s}
  .ds-submit:hover{filter:brightness(1.07);box-shadow:0 10px 30px rgba(217,149,91,.45)}
  .ds-submit:active{transform:translateY(1px)}
  .ds-foot{margin:.8rem 0 0;text-align:center;font-size:.9rem;color:rgba(243,217,188,.65)}
  .ds-link{color:${C.champagne};background:none;border:0;padding:0;font:inherit;font-weight:700;cursor:pointer}
  .ds-link:hover{color:${C.copper};text-decoration:underline}
  .ds-legal{margin:.7rem 0 0;text-align:center;font-size:.76rem;color:rgba(243,217,188,.45)}
  @keyframes ds-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @media (max-width:480px){.ds-row,.ds-oauth{grid-template-columns:1fr}}
  @media (prefers-reduced-motion:reduce){.ds-card{animation:none;opacity:1}}
`;

const Icon = ({ d, size = 18 }) => (
  <svg className="ico" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const GoogleG = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M21.35 11.1H12v2.9h5.35c-.23 1.4-1.6 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.95S8.78 6.2 12 6.2c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.68 3.65 14.55 2.7 12 2.7 6.9 2.7 2.8 6.8 2.8 12s4.1 9.3 9.2 9.3c5.3 0 8.8-3.73 8.8-8.98 0-.6-.07-1.06-.15-1.52z" />
  </svg>
);

const GitHubMark = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.38 7.86 10.9.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 015.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.79.56A11.5 11.5 0 0023.5 12C23.5 5.65 18.35.5 12 .5z" />
  </svg>
);

const USER = 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z';
const MAIL = 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6';
const LOCK = 'M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zM7 11V7a5 5 0 0 1 10 0v4';

function Card({ onSubmit, onOAuth, onSignIn, isSubmitting = false, submitError = "" }) {
  const [form, setForm] = useState({ name: '', surname: '', email: '', password: '' });
  const [show, setShow] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(form);
    else console.log('Create account:', form);
  };

  const handleOAuth = (provider) => {
    if (onOAuth) onOAuth(provider);
    else console.log('OAuth with', provider);
  };

  return (
    <>
      <style>{css}</style>

      <form className="ds-card" onSubmit={handleSubmit}>
        <h2>Create your account</h2>
        <p className="ds-sub">Start learning in less than a minute.</p>

        <div className="ds-oauth">
          <button type="button" className="ds-btn-o" onClick={() => handleOAuth('google')}>
            <GoogleG /> Google
          </button>
          <button type="button" className="ds-btn-o" onClick={() => handleOAuth('github')}>
            <GitHubMark /> GitHub
          </button>
        </div>

        <div className="ds-div">or with email</div>

        <div className="ds-row">
          <div className="ds-field">
            <Icon d={USER} />
            <input className="ds-in" type="text" placeholder="Name" autoComplete="given-name"
              value={form.name} onChange={update('name')} required />
          </div>
          <div className="ds-field">
            <Icon d={USER} />
            <input className="ds-in" type="text" placeholder="Surname" autoComplete="family-name"
              value={form.surname} onChange={update('surname')} required />
          </div>
        </div>

        <div className="ds-field">
          <Icon d={MAIL} />
          <input className="ds-in" type="email" placeholder="Email address" autoComplete="email"
            value={form.email} onChange={update('email')} required />
        </div>

        <div className="ds-field">
          <Icon d={LOCK} />
          <input className="ds-in" type={show ? 'text' : 'password'} placeholder="Password (8+ characters)"
            autoComplete="new-password" minLength={8} value={form.password} onChange={update('password')}
            style={{ paddingRight: '2.8rem' }} required />
          <button type="button" className="ds-eye" onClick={() => setShow(!show)}
            aria-label={show ? 'Hide password' : 'Show password'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {show ? (
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24M1 1l22 22" />
              ) : (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              )}
            </svg>
          </button>
        </div>

        {submitError && <p role="alert" style={{ margin: ".65rem 0", color: "#ffb4a8", fontSize: ".88rem" }}>{submitError}</p>}
        <button type="submit" className="ds-submit" disabled={isSubmitting}>{isSubmitting ? "Creating account..." : "Create account"}</button>

        <p className="ds-legal">By signing up, you agree to our Terms and Privacy Policy.</p>
        <p className="ds-foot">
          Already have an account?{' '}
          <button type="button" className="ds-link" onClick={onSignIn}>Sign in</button>
        </p>
      </form>
    </>
  );
}

export default Card;