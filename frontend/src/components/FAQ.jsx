import { useEffect, useRef, useState } from 'react';

const GOLD = '#D9955B';
const CREAM = '#F3D9BC';
const gradient = `linear-gradient(180deg, ${CREAM} 0%, ${GOLD} 100%)`;

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 19V5" />
    <path d="M5 12l7-7 7 7" />
  </svg>
);

/* Placeholder agent. Replace by passing your own onAsk prop. */
const defaultAsk = async ({ message }) => {
  await new Promise(r => setTimeout(r, 700));
  return `(placeholder) You asked: "${message}". Pass an onAsk prop to connect your agent.`;
};

export default function HelpCenter({
  onAsk = defaultAsk, // async ({ message, history }) => string
  title = 'Help Center',
  subtitle = 'Ask about errors on the platform',
  greeting = 'Describe the error you are seeing and I will try to help.',
  placeholder = 'Describe your error…',
  errorText = 'Sorry, something went wrong. Please try again.',
}) {
  const rootRef = useRef(null);
  const scrollRef = useRef(null);
  const idRef = useRef(1);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [thread, setThread] = useState([{ id: 0, role: 'assistant', text: greeting }]);

  // close on Escape or outside click
  useEffect(() => {
    if (!open) return undefined;
    const onKey = e => e.key === 'Escape' && setOpen(false);
    const onDown = e => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [thread, loading, open]);

  const ask = async () => {
    const q = draft.trim();
    if (!q || loading) return;
    const history = thread;
    setThread(prev => [...prev, { id: idRef.current++, role: 'user', text: q }]);
    setDraft('');
    setLoading(true);
    try {
      const reply = await onAsk({ message: q, history });
      setThread(prev => [...prev, { id: idRef.current++, role: 'assistant', text: String(reply ?? '') }]);
    } catch {
      setThread(prev => [
        ...prev,
        { id: idRef.current++, role: 'assistant', text: errorText, error: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const canSend = draft.trim().length > 0 && !loading;

  return (
    <div
      ref={rootRef}
      style={{ position: 'fixed', right: '1.5rem', bottom: '1.5rem', zIndex: 5, color: CREAM }}
    >
      <style>{`
        @keyframes hc-pop { from { opacity: 0; transform: translateY(12px) scale(.97); } to { opacity: 1; transform: none; } }
        @keyframes hc-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes hc-dot { 0%, 80%, 100% { opacity: .25; } 40% { opacity: 1; } }
        .hc-scroll::-webkit-scrollbar { width: 6px; }
        .hc-scroll::-webkit-scrollbar-thumb { background: rgba(217,149,91,0.3); border-radius: 999px; }
        .hc-input::placeholder { color: rgba(243,217,188,0.45); }
      `}</style>

      {open && (
        <div
          role="dialog"
          aria-label={title}
          style={{
            position: 'absolute',
            right: 0,
            bottom: '4.5rem',
            width: 'min(420px, 92vw)',
            height: 'min(70vh, 600px)',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 24,
            background: 'rgba(18, 10, 6, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(217,149,91,0.35)',
            boxShadow: '0 30px 60px -30px rgba(0,0,0,0.9), inset 0 1px 0 rgba(243,217,188,0.1)',
            animation: 'hc-pop .22s ease',
          }}
        >
          {/* header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.1rem 1.2rem',
              borderBottom: '1px solid rgba(217,149,91,0.2)',
              flex: 'none',
            }}
          >
            <div>
              <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 20, fontWeight: 600 }}>
                {title}
              </div>
              <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>{subtitle}</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close help"
              style={{ background: 'none', border: 'none', color: CREAM, cursor: 'pointer', fontSize: 22, opacity: 0.6 }}
            >
              ×
            </button>
          </div>

          {/* messages */}
          <div
            ref={scrollRef}
            className="hc-scroll"
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              padding: '1rem 1.2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {thread.map(m => {
              const mine = m.role === 'user';
              return (
                <div
                  key={m.id}
                  style={{
                    alignSelf: mine ? 'flex-end' : 'flex-start',
                    maxWidth: '88%',
                    padding: '0.65rem 0.95rem',
                    borderRadius: mine ? '16px 16px 5px 16px' : '16px 16px 16px 5px',
                    fontSize: 13.5,
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    animation: 'hc-in .25s ease',
                    ...(mine
                      ? { color: '#1a0f08', background: gradient }
                      : {
                          color: CREAM,
                          background: m.error ? 'rgba(220,60,60,0.15)' : 'rgba(217,149,91,0.12)',
                          border: `1px solid ${m.error ? 'rgba(220,60,60,0.4)' : 'rgba(217,149,91,0.22)'}`,
                        }),
                  }}
                >
                  {m.text}
                </div>
              );
            })}

            {loading && (
              <div
                aria-label="Assistant is typing"
                style={{
                  alignSelf: 'flex-start',
                  display: 'flex',
                  gap: 5,
                  padding: '0.8rem 1rem',
                  borderRadius: '16px 16px 16px 5px',
                  background: 'rgba(217,149,91,0.12)',
                  border: '1px solid rgba(217,149,91,0.22)',
                }}
              >
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: CREAM,
                      animation: `hc-dot 1.2s ${i * 0.15}s infinite ease-in-out`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* composer */}
          <div style={{ padding: '0 1rem 1rem', flex: 'none' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '0.4rem 0.4rem 0.4rem 1rem',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(217,149,91,0.35)',
              }}
            >
              <input
                className="hc-input"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    ask();
                  }
                }}
                placeholder={placeholder}
                aria-label="Describe your error"
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: CREAM,
                  fontSize: 14,
                  fontFamily: 'inherit',
                }}
              />
              <button
                type="button"
                onClick={ask}
                disabled={!canSend}
                aria-label="Send"
                style={{
                  width: 34,
                  height: 34,
                  flex: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  border: 'none',
                  cursor: canSend ? 'pointer' : 'default',
                  color: '#1a0f08',
                  background: gradient,
                  opacity: canSend ? 1 : 0.35,
                }}
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* floating button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close help' : 'Open help'}
        aria-expanded={open}
        style={{
          width: 56,
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          fontSize: 24,
          fontWeight: 700,
          fontFamily: "Georgia, 'Times New Roman', serif",
          color: '#1a0f08',
          background: gradient,
          boxShadow: '0 12px 30px -8px rgba(217,149,91,0.75)',
          transform: open ? 'rotate(90deg)' : 'none',
          transition: 'transform .25s ease',
        }}
      >
        {open ? '×' : '?'}
      </button>
    </div>
  );
}