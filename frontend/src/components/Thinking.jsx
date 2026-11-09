import { useEffect, useState } from 'react';

const GOLD = '#D9955B';
const CREAM = '#F3D9BC';
const INK = '#140c09';
const STAGE_MS = 1300;

const TASKS = [
  { task: 'summary', stages: 3, caption: 'Your course, boiled down to what matters.' },
  { task: 'exercises', stages: 4, caption: 'Practice with corrections, not just answers.' },
  { task: 'quiz', stages: 3, caption: 'Test yourself before the exam does.' },
  { task: 'flashcards', stages: 3, caption: 'The terms worth remembering, ready to flip.' }
];

const STAGE_LABELS = {
  summary: ['Reading your course', 'Extracting key ideas', 'Writing the summary'],
  exercises: ['Reading your course', 'Spotting weak points', 'Drafting exercises', 'Adding corrections'],
  quiz: ['Reading your course', 'Picking key concepts', 'Building questions'],
  flashcards: ['Reading your course', 'Finding key terms', 'Making flashcards']
};

const STYLE = `
.darsy-showcase { display: none; }
@media (min-width: 1400px) { .darsy-showcase { display: flex; } }
@keyframes darsy-art-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.darsy-art { animation: darsy-art-in 450ms cubic-bezier(0.23, 1, 0.32, 1); }
@keyframes darsy-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .darsy-art { animation: none; } }
`;

function Art({ task }) {
  const common = {
    viewBox: '0 0 200 120',
    width: '100%',
    height: '100%',
    fill: 'none',
    stroke: CREAM,
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true
  };

  if (task === 'summary') {
    return (
      <svg {...common}>
        <rect x="26" y="12" width="66" height="96" rx="7" />
        <path d="M38 32h42M38 44h36M38 56h42M38 68h30M38 80h40M38 92h26" strokeDasharray="3 3" opacity="0.5" />
        <path d="M102 60h28m-7-7 7 7-7 7" stroke={GOLD} />
        <rect x="140" y="30" width="48" height="60" rx="7" stroke={GOLD} fill="rgba(217,149,91,0.12)" />
        <path d="M150 48h28M150 60h22M150 72h26" stroke={GOLD} />
      </svg>
    );
  }

  if (task === 'exercises') {
    return (
      <svg {...common}>
        <rect x="26" y="10" width="92" height="100" rx="7" />
        <rect x="38" y="30" width="10" height="10" rx="2" />
        <rect x="38" y="54" width="10" height="10" rx="2" />
        <rect x="38" y="78" width="10" height="10" rx="2" />
        <path d="M40 35l3 3 5-7M40 59l3 3 5-7" stroke={GOLD} />
        <path d="M58 35h48M58 59h40M58 83h44" strokeDasharray="3 3" opacity="0.5" />
        <g transform="rotate(35 160 60)">
          <rect x="153" y="16" width="14" height="66" rx="2" stroke={GOLD} />
          <path d="M153 82l7 16 7-16z" stroke={GOLD} fill="rgba(217,149,91,0.3)" />
          <path d="M153 28h14" stroke={GOLD} />
        </g>
      </svg>
    );
  }

  if (task === 'quiz') {
    return (
      <svg {...common}>
        <rect x="28" y="8" width="144" height="24" rx="12" />
        <text x="100" y="27" textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize="17" fill={GOLD} stroke="none">
          ?
        </text>
        <circle cx="44" cy="52" r="5" opacity="0.6" />
        <path d="M58 52h90" strokeDasharray="3 3" opacity="0.5" />
        <rect x="32" y="60" width="136" height="20" rx="10" stroke={GOLD} fill="rgba(217,149,91,0.1)" />
        <circle cx="44" cy="70" r="5" stroke={GOLD} fill={GOLD} />
        <path d="M58 70h82" stroke={GOLD} strokeDasharray="3 3" />
        <circle cx="44" cy="90" r="5" opacity="0.6" />
        <path d="M58 90h70" strokeDasharray="3 3" opacity="0.5" />
        <circle cx="44" cy="108" r="5" opacity="0.6" />
        <path d="M58 108h96" strokeDasharray="3 3" opacity="0.5" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <g transform="rotate(-10 100 60)">
        <rect x="46" y="24" width="100" height="68" rx="9" opacity="0.45" />
      </g>
      <g transform="rotate(6 100 60)">
        <rect x="54" y="26" width="100" height="68" rx="9" stroke={GOLD} fill={INK} />
        <text x="104" y="70" textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize="34" fill={GOLD} stroke="none">
          ?
        </text>
      </g>
      <path d="M168 16v12M162 22h12" stroke={GOLD} />
    </svg>
  );
}

function DarsyThinking({ task, fileCount, stage, working }) {
  const labels = STAGE_LABELS[task] || [];
  const taskLabel = task.charAt(0).toUpperCase() + task.slice(1);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          fontSize: 11,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: GOLD,
          opacity: 0.75,
          marginBottom: 10
        }}
      >
        <span>{taskLabel}</span>
        <span style={{ opacity: 0.7 }}>
          {working ? `Step ${stage + 1} of ${labels.length}` : 'Done'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {labels.map((label, i) => {
          const text =
            i === 0 && fileCount
              ? `${label} (${fileCount} file${fileCount === 1 ? '' : 's'})`
              : label;
          const done = i < stage || (!working && i <= stage);
          const active = working && i === stage;
          const isLast = i === labels.length - 1;

          return (
            <div key={label} style={{ display: 'flex', gap: 10 }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: 14
                }}
              >
                <span
                  style={{
                    width: 12,
                    height: 12,
                    flexShrink: 0,
                    borderRadius: '50%',
                    border: `1.5px solid ${GOLD}`,
                    background: done ? GOLD : 'transparent',
                    position: 'relative'
                  }}
                >
                  {active && (
                    <span
                      style={{
                        position: 'absolute',
                        inset: -3,
                        borderRadius: '50%',
                        border: `1.5px solid ${GOLD}`,
                        borderTopColor: 'transparent',
                        animation: 'darsy-spin 900ms linear infinite'
                      }}
                    />
                  )}
                </span>
                {!isLast && (
                  <span
                    style={{
                      width: 1,
                      flex: 1,
                      minHeight: 12,
                      background: done ? GOLD : 'rgba(217,149,91,0.25)',
                      opacity: done ? 0.6 : 1,
                      transition: 'background 300ms ease'
                    }}
                  />
                )}
              </div>

              <div
                style={{
                  fontSize: 13,
                  lineHeight: '18px',
                  paddingBottom: isLast ? 0 : 6,
                  opacity: done ? 0.9 : active ? 1 : 0.35,
                  transition: 'opacity 300ms ease'
                }}
              >
                {text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DarsyShowcase({ fileCount = 0, stacked = false }) {
  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState(0);
  const [working, setWorking] = useState(true);

  useEffect(() => {
    const n = TASKS[index].stages;
    const timers = [];
    for (let s = 1; s < n; s += 1) timers.push(setTimeout(() => setStage(s), s * STAGE_MS));
    const finish = n * STAGE_MS + 400;
    timers.push(setTimeout(() => setWorking(false), finish));
    timers.push(
      setTimeout(() => {
        setIndex(i => (i + 1) % TASKS.length);
        setStage(0);
        setWorking(true);
      }, finish + 2600)
    );
    return () => timers.forEach(clearTimeout);
  }, [index]);

  const current = TASKS[index];

  return (
    <aside
      className="darsy-showcase"
      style={{
        position: stacked ? 'relative' : 'absolute',
        top: stacked ? 'auto' : '50%',
        right: stacked ? 'auto' : 'calc(100% + 1rem)',
        transform: stacked ? 'none' : 'translateY(-50%)',
        width: 300,
        height: stacked ? '42%' : undefined,
        flex: stacked ? '0 0 42%' : undefined,
        minHeight: stacked ? 0 : undefined,
        flexDirection: 'column',
        gap: stacked ? 8 : 14,
        padding: stacked ? 12 : '20px 20px 18px',
        boxSizing: 'border-box',
        borderRadius: 26,
        border: '1px solid rgba(217,149,91,0.28)',
        background: 'linear-gradient(180deg, rgba(30,18,12,0.72), rgba(14,8,5,0.72))',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
    >
      <style>{STYLE}</style>

      <div
        key={current.task}
        className="darsy-art"
        style={{
          height: stacked ? 88 : 150,
          padding: 10,
          boxSizing: 'border-box',
          borderRadius: 16,
          border: '1px dashed rgba(217,149,91,0.3)',
          background: 'rgba(255,255,255,0.02)'
        }}
      >
        <Art task={current.task} />
      </div>

      <div
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontStyle: 'italic',
          fontSize: stacked ? 16 : 19,
          lineHeight: 1.35,
          minHeight: stacked ? 42 : 52
        }}
      >
        {current.caption}
      </div>

      <div
        style={{
          padding: '12px 14px',
          boxSizing: 'border-box',
          borderRadius: 16,
          border: '1px solid rgba(217,149,91,0.18)',
          background: 'rgba(255,255,255,0.015)'
        }}
      >
        <DarsyThinking key={current.task} task={current.task} fileCount={fileCount} stage={stage} working={working} />
      </div>

      <div style={{ display: 'flex', gap: 6 }} aria-hidden="true">
        {TASKS.map((t, i) => (
          <span
            key={t.task}
            style={{
              width: i === index ? 18 : 6,
              height: 6,
              borderRadius: 3,
              background: i === index ? GOLD : 'rgba(243,217,188,0.25)',
              transition: 'width 300ms cubic-bezier(0.23, 1, 0.32, 1), background 300ms ease'
            }}
          />
        ))}
      </div>
    </aside>
  );
}
