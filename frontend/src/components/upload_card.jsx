import { useMemo, useRef, useState } from 'react';
import ShinyText from './text';
import Folder from './folder'; // must match your real file name exactly (folder.jsx vs Folder.jsx)

const GOLD = '#D9955B';
const CREAM = '#F3D9BC';
const FOLDER_MAX = 6; // Folder can only show 6 documents

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

const pillButton = {
  border: 'none',
  cursor: 'pointer',
  borderRadius: 999,
  padding: '0.7rem 1.6rem',
  fontSize: 14,
  fontWeight: 600,
  color: '#1a0f08',
  background: `linear-gradient(180deg, ${CREAM} 0%, ${GOLD} 100%)`,
  boxShadow: '0 8px 24px -10px rgba(217,149,91,0.7)',
};

const ghostButton = {
  background: 'none',
  cursor: 'pointer',
  borderRadius: 999,
  padding: '0.55rem 1.2rem',
  fontSize: 13,
  color: CREAM,
  border: '1px solid rgba(217,149,91,0.4)',
};

export default function UploadCard({
  accept = '.pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg',
  onFiles,
}) {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [stage, setStage] = useState('upload'); // 'upload' | 'folder'
  const [over, setOver] = useState(false);
  const [hover, setHover] = useState(false);

  const add = list => {
    const next = Array.from(list || []);
    if (!next.length) return;
    setFiles(prev => [...prev, ...next]);
    setStage('upload');
    onFiles?.(next);
  };

  const remove = index => setFiles(prev => prev.filter((_, i) => i !== index));

  // every file is shown by name inside the folder
  const folderItems = useMemo(
    () =>
      files.slice(0, FOLDER_MAX).map(file => {
        const dot = file.name.lastIndexOf('.');
        const base = dot > 0 ? file.name.slice(0, dot) : file.name;
        const ext = dot > 0 ? file.name.slice(dot + 1).toUpperCase() : 'FILE';

        return {
          content: (
            <div
              style={{
                boxSizing: 'border-box',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 'calc(12px * var(--folder-scale))',
              }}
            >
              <span
                style={{
                  color: 'var(--folder-paper-text)',
                  fontSize: 'calc(11px * var(--folder-scale))',
                  fontWeight: 600,
                  lineHeight: 1.25,
                  letterSpacing: '-0.01em',
                  wordBreak: 'break-word',
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 5,
                  overflow: 'hidden',
                }}
              >
                {base}
              </span>
              <span
                style={{
                  color: 'var(--folder-paper-ink-strong)',
                  fontSize: 'calc(9px * var(--folder-scale))',
                }}
              >
                {ext} · {(file.size / 1024).toFixed(0)} KB
              </span>
            </div>
          ),
        };
      }),
    [files]
  );

  const extra = Math.max(0, files.length - FOLDER_MAX);
  const showFolder = stage === 'folder' && files.length > 0;

  return (
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

      <div style={{ textAlign: 'center', marginBottom: '1.6rem' }}>
        <ShinyText
          text={showFolder ? 'Your courses' : 'Upload your courses here'}
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
        {showFolder ? (
          /* ---------- FOLDER STAGE ---------- */
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.6rem',
            }}
          >
            <Folder
              label={`${files.length} file${files.length === 1 ? '' : 's'}`}
              items={folderItems}
              theme="dark"
              color={GOLD}
              variant="solid"
              size={0.9}
              layout="spread"
            />
            <div style={{ textAlign: 'center', fontSize: 13, opacity: 0.7 }}>
              Click the folder to open it
              {extra > 0 && <div>+{extra} more file{extra === 1 ? '' : 's'} not shown</div>}
            </div>
            <button type="button" style={ghostButton} onClick={() => inputRef.current?.click()}>
              Add more files
            </button>
          </div>
        ) : (
          /* ---------- UPLOAD STAGE ---------- */
          <>
            <div style={{ flex: 1 }} />

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

            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.9rem',
                paddingTop: '1.5rem',
              }}
            >
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
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

              {files.length > 0 && (
                <button
                  type="button"
                  style={{ ...pillButton, alignSelf: 'center', flex: 'none' }}
                  onClick={() => setStage('folder')}
                >
                  Done
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}