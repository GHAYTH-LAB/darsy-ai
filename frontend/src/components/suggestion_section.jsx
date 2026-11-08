import { useState } from 'react';

const GOLD = '#D9955B';
const CREAM = '#F3D9BC';
const gradient = `linear-gradient(180deg, ${CREAM} 0%, ${GOLD} 100%)`;

const defaultSubmit = async data => {
  await new Promise(r => setTimeout(r, 700));
  console.log('suggestion', data);
};

const Icon = ({ children }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const UserIcon = () => (
  <Icon>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
  </Icon>
);

const MailIcon = () => (
  <Icon>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="M3 7l9 6 9-6" />
  </Icon>
);

const IdeaIcon = () => (
  <Icon>
    <path d="M9 18h6" />
    <path d="M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" />
  </Icon>
);

const fieldStyle = {
  boxSizing: 'border-box',
  width: '100%',
  padding: '0.85rem 1.1rem',
  borderRadius: 16,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(217,149,91,0.3)',
  outline: 'none',
  color: CREAM,
  fontSize: 14.5,
  fontFamily: 'inherit',
  transition: 'all .2s ease',
};

const Field = ({ id, icon, label, required, children }) => (
  <div>
    <label
      htmlFor={id}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        marginBottom: 8,
      }}
    >
      <span
        style={{
          width: 26,
          height: 26,
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 9,
          color: GOLD,
          background: 'rgba(217,149,91,0.14)',
          border: '1px solid rgba(217,149,91,0.3)',
        }}
      >
        {icon}
      </span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: CREAM,
        }}
      >
        {label}
      </span>
      <span
        style={{
          marginLeft: 'auto',
          fontSize: 11,
          letterSpacing: '0.04em',
          padding: '0.15rem 0.55rem',
          borderRadius: 999,
          color: required ? GOLD : 'rgba(243,217,188,0.55)',
          border: `1px solid ${required ? 'rgba(217,149,91,0.45)' : 'rgba(243,217,188,0.2)'}`,
        }}
      >
        {required ? 'Required' : 'Optional'}
      </span>
    </label>
    {children}
  </div>
);

export default function SuggestionBox({
  onSubmit = defaultSubmit,
  title = 'Have an idea to improve Darsy?',
  subtitle = 'Send it straight to me.',
}) {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');

  const canSend = name.trim() && surname.trim() && message.trim() && status !== 'sending';

  const submit = async e => {
    e.preventDefault();
    if (!canSend) return;
    setStatus('sending');
    try {
      await onSubmit({
        name: name.trim(),
        surname: surname.trim(),
        email: email.trim(),
        message: message.trim(),
      });
      setStatus('sent');
      setName('');
      setSurname('');
      setEmail('');
      setMessage('');
      setTimeout(() => setStatus('idle'), 5000);
    } catch {
      setStatus('error');
    }
  };

  return (
    <div
      style={{
        boxSizing: 'border-box',
        width: 'min(560px, 92vw)',
        padding: '2.2rem 1.9rem',
        borderRadius: 28,
        color: CREAM,
        background: 'rgba(18, 10, 6, 0.6)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(217,149,91,0.35)',
        boxShadow: '0 30px 60px -30px rgba(0,0,0,0.9), inset 0 1px 0 rgba(243,217,188,0.1)',
      }}
    >
      <style>{`
        .sb-input::placeholder { color: rgba(243,217,188,0.35); }
        .sb-input:hover { border-color: rgba(217,149,91,0.55); }
        .sb-input:focus {
          border-color: ${CREAM};
          background: rgba(255,255,255,0.08);
          box-shadow: 0 0 0 4px rgba(217,149,91,0.18);
        }
      `}</style>

      <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
        <div
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 600,
            lineHeight: 1.25,
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </div>
        <div
          style={{
            width: 56,
            height: 2,
            margin: '0.9rem auto',
            borderRadius: 2,
            background: gradient,
          }}
        />
        <div style={{ fontSize: 14, opacity: 0.65 }}>{subtitle}</div>
      </div>

      {status === 'sent' ? (
        <div style={{ padding: '2rem 0', fontSize: 16, textAlign: 'center' }}>
          Thank you! Your suggestion was sent.
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <Field id="sb-name" icon={<UserIcon />} label="Name" required>
            <input
              id="sb-name"
              className="sb-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              required
              style={fieldStyle}
            />
          </Field>

          <Field id="sb-surname" icon={<UserIcon />} label="Surname" required>
            <input
              id="sb-surname"
              className="sb-input"
              value={surname}
              onChange={e => setSurname(e.target.value)}
              placeholder="Your surname"
              required
              style={fieldStyle}
            />
          </Field>

          <Field id="sb-email" icon={<MailIcon />} label="Email">
            <input
              id="sb-email"
              className="sb-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={fieldStyle}
            />
          </Field>

          <Field id="sb-message" icon={<IdeaIcon />} label="Suggestion" required>
            <textarea
              id="sb-message"
              className="sb-input"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Tell me what you would improve…"
              required
              rows={5}
              style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.5 }}
            />
          </Field>

          <button
            type="submit"
            disabled={!canSend}
            style={{
              marginTop: 6,
              padding: '0.9rem 2rem',
              borderRadius: 999,
              border: 'none',
              cursor: canSend ? 'pointer' : 'default',
              fontSize: 15,
              fontWeight: 600,
              color: '#1a0f08',
              background: gradient,
              opacity: canSend ? 1 : 0.4,
              boxShadow: '0 10px 28px -10px rgba(217,149,91,0.75)',
              transition: 'opacity .2s ease',
            }}
          >
            {status === 'sending' ? 'Sending…' : 'Send suggestion'}
          </button>
        </form>
      )}

      {status === 'error' && (
        <div style={{ marginTop: 14, fontSize: 13, color: '#f08a8a', textAlign: 'center' }}>
          Something went wrong. Please try again.
        </div>
      )}
    </div>
  );
}