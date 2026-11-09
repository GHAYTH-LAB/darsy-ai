import { useEffect, useRef, useState } from 'react';

const GOLD = '#D9955B';
const CREAM = '#F3D9BC';

const PANEL = {
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 28,
  color: CREAM,
  background: 'rgba(18, 10, 6, 0.55)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: '1px solid rgba(217,149,91,0.35)',
  boxShadow: '0 30px 60px -30px rgba(0,0,0,0.8), inset 0 1px 0 rgba(243,217,188,0.1)',
};

const gradient = `linear-gradient(180deg, ${CREAM} 0%, ${GOLD} 100%)`;

const ghostButton = {
  background: 'none',
  cursor: 'pointer',
  borderRadius: 999,
  padding: '0.5rem 1.1rem',
  fontSize: 13,
  color: CREAM,
  border: '1px solid rgba(217,149,91,0.4)',
};

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 19V5" />
    <path d="M5 12l7-7 7 7" />
  </svg>
);

const SparkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9L12 2z" />
    <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" opacity=".7" />
  </svg>
);

const MicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0" />
    <path d="M12 18v3" />
  </svg>
);

const Bars = () => (
  <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: 2.5, height: 16 }}>
    {[0, 1, 2, 3].map(i => (
      <span
        key={i}
        className="cw-bar"
        style={{
          width: 3,
          height: 16,
          borderRadius: 2,
          background: 'currentColor',
          transformOrigin: 'center',
          animation: `cw-bar ${0.9 + (i % 2) * 0.25}s ${i * 0.12}s infinite ease-in-out`,
        }}
      />
    ))}
  </span>
);

const SUGGESTIONS = ['Summarize my files', 'List the key topics', 'Make me a study plan'];

const defaultAsk = async ({ message, files }) => {
  await new Promise(r => setTimeout(r, 900));
  return files.length
    ? `(placeholder) You asked: "${message}". I can see ${files.length} file${files.length === 1 ? '' : 's'}. Pass an onAsk prop to connect your agent.`
    : `(placeholder) You asked: "${message}". Add files and press Done first so I can answer from them.`;
};

export default function ChatWindow({
  files = [],
  onAsk = defaultAsk,
  onMicStart,
  onMicStop,
  agentName = 'Course Assistant',
  width = 'min(520px, 90vw)',
  height = 'min(84vh, 760px)',
}) {
  const scrollRef = useRef(null);
  const idRef = useRef(1);
  const seenRef = useRef(0);
  const uid = () => idRef.current++;

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    if (files.length > seenRef.current) {
      const fresh = files.slice(seenRef.current);
      setMessages(prev => [
        ...prev,
        {
          id: uid(),
          role: 'assistant',
          text: `Added ${fresh.length} file${fresh.length === 1 ? '' : 's'}: ${fresh.map(f => f.name).join(', ')}. Ask me anything about ${fresh.length === 1 ? 'it' : 'them'}.`,
        },
      ]);
    }
    seenRef.current = files.length;
  }, [files]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const send = async text => {
    const q = (text ?? draft).trim();
    if (!q || loading) return;
    const history = messages;
    setMessages(prev => [...prev, { id: uid(), role: 'user', text: q }]);
    setDraft('');
    setLoading(true);
    try {
      const reply = await onAsk({ message: q, files, history });
      setMessages(prev => [...prev, { id: uid(), role: 'assistant', text: String(reply ?? '') }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { id: uid(), role: 'assistant', text: 'Sorry, something went wrong. Please try again.', error: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = async () => {
    if (loading) return;
    if (!listening) {
      setListening(true);
      try {
        await onMicStart?.();
      } catch {
        setListening(false);
      }
      return;
    }
    setListening(false);
    try {
      const transcript = await onMicStop?.();
      if (typeof transcript === 'string' && transcript.trim()) {
        setDraft(prev => (prev ? `${prev} ${transcript.trim()}` : transcript.trim()));
      }
    } catch {
      return;
    }
  };

  const onKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const canSend = draft.trim().length > 0 && !loading;
  const statusColor = loading || listening ? GOLD : '#22c55e';
  const statusText = loading ? 'Thinking…' : listening ? 'Listening…' : 'Online';

  return (
    <div style={{ ...PANEL, width, height, overflow: 'hidden' }}>
      <style>{`
        @keyframes cw-dot { 0%, 80%, 100% { opacity: .25; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-3px); } }
        @keyframes cw-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes cw-ring { 0% { transform: scale(1); opacity: .6; } 100% { transform: scale(1.7); opacity: 0; } }
        @keyframes cw-bar { 0%, 100% { transform: scaleY(.3); } 50% { transform: scaleY(1); } }
        @keyframes cw-glow { 0%, 100% { box-shadow: 0 0 0 0 rgba(217,149,91,0.5), 0 6px 18px -6px rgba(217,149,91,0.8); } 50% { box-shadow: 0 0 0 6px rgba(217,149,91,0), 0 6px 22px -4px rgba(217,149,91,1); } }
        .cw-scroll::-webkit-scrollbar { width: 6px; }
        .cw-scroll::-webkit-scrollbar-thumb { background: rgba(217,149,91,0.3); border-radius: 999px; }
        .cw-input::placeholder { color: rgba(243,217,188,0.45); }
        .cw-mic { transition: transform .2s ease, background .25s ease, color .25s ease, border-color .25s ease, opacity .2s ease; }
        .cw-mic:hover:not(:disabled) { transform: scale(1.08); border-color: ${CREAM}; }
        .cw-mic:active:not(:disabled) { transform: scale(0.94); }
        .cw-mic:focus-visible { outline: 2px solid ${CREAM}; outline-offset: 3px; }
        @media (prefers-reduced-motion: reduce) {
          .cw-ring, .cw-bar, .cw-mic-on { animation: none !important; }
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          padding: '1.1rem 1.3rem',
          borderBottom: '1px solid rgba(217,149,91,0.2)',
          flex: 'none',
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1a0f08',
            background: gradient,
            boxShadow: '0 6px 18px -8px rgba(217,149,91,0.8)',
            flex: 'none',
          }}
        >
          <SparkIcon />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 18, fontWeight: 600, lineHeight: 1.2 }}>
            {agentName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, opacity: 0.65, marginTop: 2 }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: statusColor,
                boxShadow: `0 0 8px ${statusColor}`,
                transition: 'background .25s ease, box-shadow .25s ease',
              }}
            />
            {statusText}
          </div>
        </div>
        <span
          style={{
            fontSize: 12,
            padding: '0.35rem 0.75rem',
            borderRadius: 999,
            background: 'rgba(217,149,91,0.14)',
            border: '1px solid rgba(217,149,91,0.3)',
            whiteSpace: 'nowrap',
          }}
        >
          {files.length} file{files.length === 1 ? '' : 's'} in context
        </span>
      </div>

      <div
        ref={scrollRef}
        className="cw-scroll"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '1.2rem 1.3rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.8rem',
        }}
      >
        {messages.length === 0 && !loading && (
          <div style={{ margin: 'auto', textAlign: 'center', opacity: 0.55, fontSize: 14, maxWidth: 260 }}>
            Add your files and press <b>Done</b>. I'll start here.
          </div>
        )}

        {messages.map(m => {
          const mine = m.role === 'user';
          return (
            <div
              key={m.id}
              style={{
                alignSelf: mine ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                padding: '0.7rem 1rem',
                borderRadius: mine ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
                fontSize: 14,
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                animation: 'cw-in .25s ease',
                ...(mine
                  ? { color: '#1a0f08', background: gradient, boxShadow: '0 8px 20px -12px rgba(217,149,91,0.8)' }
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
              padding: '0.85rem 1rem',
              borderRadius: '18px 18px 18px 6px',
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
                  animation: `cw-dot 1.2s ${i * 0.15}s infinite ease-in-out`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {files.length > 0 && messages.length <= 1 && !loading && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '0 1.3rem 0.8rem', flex: 'none' }}>
          {SUGGESTIONS.map(s => (
            <button key={s} type="button" style={ghostButton} onClick={() => send(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div style={{ padding: '0 1.1rem 1.1rem', flex: 'none' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '0.45rem 0.45rem 0.45rem 1.1rem',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${listening ? 'rgba(243,217,188,0.6)' : 'rgba(217,149,91,0.35)'}`,
            transition: 'border-color .25s ease',
          }}
        >
          <input
            className="cw-input"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={listening ? 'Listening…' : files.length ? 'Ask about your files…' : 'Press Done after adding files…'}
            aria-label="Message"
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

          <div style={{ position: 'relative', width: 38, height: 38, flex: 'none' }}>
            {listening &&
              [0, 1].map(i => (
                <span
                  key={i}
                  className="cw-ring"
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    border: `1.5px solid ${GOLD}`,
                    pointerEvents: 'none',
                    animation: `cw-ring 1.7s ${i * 0.85}s infinite ease-out`,
                  }}
                />
              ))}
            <button
              type="button"
              className={`cw-mic${listening ? ' cw-mic-on' : ''}`}
              onClick={toggleMic}
              disabled={loading}
              aria-pressed={listening}
              aria-label={listening ? 'Stop recording' : 'Start recording'}
              style={{
                position: 'relative',
                width: 38,
                height: 38,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                cursor: loading ? 'default' : 'pointer',
                opacity: loading ? 0.35 : 1,
                color: listening ? '#1a0f08' : CREAM,
                background: listening ? gradient : 'rgba(217,149,91,0.12)',
                border: listening ? '1px solid transparent' : '1px solid rgba(217,149,91,0.4)',
                animation: listening ? 'cw-glow 1.7s infinite ease-in-out' : 'none',
              }}
            >
              {listening ? <Bars /> : <MicIcon />}
            </button>
          </div>

          <button
            type="button"
            onClick={() => send()}
            disabled={!canSend}
            aria-label="Send message"
            style={{
              width: 38,
              height: 38,
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
              transition: 'opacity .2s ease',
            }}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}