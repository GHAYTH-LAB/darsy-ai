import { useRef, useState } from 'react';
import ShinyText from './text';

const GOLD = '#D9955B';
const CREAM = '#F3D9BC';

const UploadIcon = ({ size = 26 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 16V4" />
    <path d="M7 9l5-5 5 5" />
    <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
  </svg>
);

export default function UploadCard({
  accept = '.pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg',
  onFiles,
}) {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [over, setOver] = useState(false);
  const [hover, setHover] = useState(false);

  const add = list => {
    const next = Array.from(list || []);
    if (!next.length) return;
    setFiles(prev => [...prev, ...next]);
    onFiles?.(next);
  };

  const remove = index => setFiles(prev => prev.filter((_, i) => i !== index));

  return (
    /* Outer card */
    <div
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); add(e.dataTransfer.files); }}
      style={{
        width: 'min(520px, 90vw)',
        height: 'min(84vh, 760px)',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.8rem 1.4rem 1.4rem',
        borderRadius: 28,
        color: CREAM,
        background: over ? 'rgba(40, 24, 14, 0.7)' : 'rgba(18, 10, 6, 0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: `1px solid ${over ? CREAM : 'rgba(217,149,91,0.35)'}`,
        boxShadow: '0 30px 60px -30px rgba(0,0,0,0.8), inset 0 1px 0 rgba(243,217,188,0.1)',
        transition: 'all .2s ease',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        hidden
        onChange={e => { add(e.target.files); e.target.value = ''; }}
      />

      {/* Title: outside the inner rectangle */}
      <div style={{ textAlign: 'center', marginBottom: '1.6rem' }}>
        <ShinyText
          text="Upload your courses here"
          color={CREAM}
          shineColor="#FFFFFF"
          speed={3}
          delay={1}
          shineWidth={70}
          glow={0.5}
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 'clamp(1.7rem, 3.6vw, 2.3rem)',
            fontWeight: 600,
            lineHeight: 1.35,
            paddingBottom: '0.1em',
            letterSpacing: '-0.01em',
          }}
        />
      </div>

      {/* Inner transparent rectangle */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.4rem',
          borderRadius: 20,
          border: `1.5px dashed ${over ? CREAM : 'rgba(217,149,91,0.4)'}`,
          background: over ? 'rgba(217,149,91,0.1)' : 'rgba(255,255,255,0.03)',
          transition: 'all .2s ease',
        }}
      >
        <div style={{ flex: 1 }} />

        {/* Button in the exact middle */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          aria-label="Add files"
          title="Add files"
          style={{
            alignSelf: 'center',
            width: 96,
            height: 96,
            flex: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            color: '#1a0f08',
            background: `linear-gradient(180deg, ${CREAM} 0%, ${GOLD} 100%)`,
            boxShadow: hover
              ? '0 14px 34px -6px rgba(217,149,91,0.85)'
              : '0 8px 24px -8px rgba(217,149,91,0.6)',
            transform: hover ? 'scale(1.06)' : 'none',
            transition: 'all .2s ease',
          }}
        >
          <UploadIcon size={40} />
        </button>

        {/* Bottom half: file list */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            paddingTop: '1.5rem',
            overflowY: 'auto',
          }}
        >
          {files.map((f, i) => (
            <div
              key={`${f.name}-${i}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                padding: '0.7rem 1rem',
                borderRadius: 12,
                background: 'rgba(217,149,91,0.12)',
                fontSize: 14,
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {f.name}
                <span style={{ opacity: 0.5 }}> · {(f.size / 1024).toFixed(0)} KB</span>
              </span>
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`Remove ${f.name}`}
                style={{ background: 'none', border: 'none', color: CREAM, cursor: 'pointer', fontSize: 18, opacity: 0.6 }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}