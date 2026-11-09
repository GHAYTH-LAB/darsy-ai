'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Counter from './Counter'; // your animated digit component, unchanged

const STORAGE_KEY = 'darsy:study-time';
const PRESETS = [15, 25, 45, 60];

// Wall-clock reader, only ever called from event handlers and timers (never during render).
// Keeping it in a module-level helper stops the React Compiler purity lint from flagging it.
const nowMs = () => Date.now();

const dayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

const readToday = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const data = JSON.parse(raw);
    return data.date === dayKey() ? Number(data.ms) || 0 : 0;
  } catch {
    return 0;
  }
};

const writeToday = ms => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: dayKey(), ms: Math.round(ms) }));
  } catch {
    /* storage unavailable, the timer still works */
  }
};

const formatShort = ms => {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`;
  return `${s}s`;
};

const CREAM = '#f6e3c9';
const GOLD_BTN = 'bg-[linear-gradient(180deg,#f7d3ae_0%,#dd9552_100%)]';

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
    <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
    <rect x="6" y="5" width="4.5" height="14" rx="1.2" />
    <rect x="13.5" y="5" width="4.5" height="14" rx="1.2" />
  </svg>
);

const StopIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);

const ResetIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v5h5" />
  </svg>
);

export default function StudyTimer({ className = '', compact = false }) {
  const [mode, setMode] = useState('stopwatch'); // 'stopwatch' | 'countdown'
  const [goal, setGoal] = useState(25); // minutes, countdown only
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // ms studied in the current session
  const [saved, setSaved] = useState(0); // ms from earlier sessions today
  const [ready, setReady] = useState(false);
  const [finished, setFinished] = useState(false);

  const baseRef = useRef(0); // ms accumulated before the current run
  const startRef = useRef(0); // timestamp when the current run began
  const latest = useRef({ saved: 0, elapsed: 0, ready: false });

  // snapshot for timers and unload handlers (assigned in an effect, never during render)
  useEffect(() => {
    latest.current = { saved, elapsed, ready };
  });

  const goalMs = goal * 60000;

  // load today's total once on the client
  // (deferred one tick so state isn't set synchronously inside the effect)
  useEffect(() => {
    const id = setTimeout(() => {
      setSaved(readToday());
      setReady(true);
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const persist = useCallback(() => {
    const { saved: s, elapsed: e, ready: r } = latest.current;
    if (r) writeToday(s + e);
  }, []);

  // tick from timestamps (stays accurate even if the tab is throttled)
  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => {
      const next = baseRef.current + (nowMs() - startRef.current);
      if (mode === 'countdown' && next >= goalMs) {
        baseRef.current = goalMs;
        setElapsed(goalMs);
        setRunning(false);
        setFinished(true);
        return;
      }
      setElapsed(next);
    }, 200);
    return () => clearInterval(id);
  }, [running, mode, goalMs]);

  // save on pause and every 10s while running, plus when the tab closes or hides
  useEffect(() => {
    persist();
    if (!running) return undefined;
    const id = setInterval(persist, 10000);
    return () => clearInterval(id);
  }, [running, persist]);

  useEffect(() => {
    const save = () => persist();
    window.addEventListener('beforeunload', save);
    document.addEventListener('visibilitychange', save);
    return () => {
      window.removeEventListener('beforeunload', save);
      document.removeEventListener('visibilitychange', save);
    };
  }, [persist]);

  const liveElapsed = () => (running ? baseRef.current + (nowMs() - startRef.current) : baseRef.current);

  const reset = () => {
    const total = latest.current.saved + liveElapsed();
    baseRef.current = 0;
    setRunning(false);
    setFinished(false);
    setElapsed(0);
    setSaved(total);
    if (latest.current.ready) writeToday(total);
  };

  const toggle = () => {
    if (running) {
      const next = baseRef.current + (nowMs() - startRef.current);
      baseRef.current = next;
      setElapsed(next);
      setRunning(false);
      return;
    }
    if (finished) reset();
    startRef.current = nowMs();
    setRunning(true);
  };

  const switchMode = next => {
    if (running || next === mode) return;
    reset();
    setMode(next);
  };

  const pickGoal = minutes => {
    if (running) return;
    if (finished) reset();
    setGoal(minutes);
  };

  // what the digits show
  const countdown = mode === 'countdown';
  const shownSeconds = countdown
    ? Math.ceil(Math.max(0, goalMs - elapsed) / 1000)
    : Math.floor(elapsed / 1000);
  const hours = Math.floor(shownSeconds / 3600);
  const minutes = Math.floor((shownSeconds % 3600) / 60);
  const seconds = shownSeconds % 60;
  const direction = countdown ? 'down' : 'up';
  const progress = countdown ? Math.min(1, elapsed / goalMs) : 0;

  const status = finished
    ? 'Goal reached'
    : running
      ? 'Focusing'
      : elapsed > 0
        ? 'Paused'
        : 'Ready';

  const digitProps = {
    direction,
    minDigits: 2,
    fontSize: 50,
    fontWeight: 600,
    textColor: CREAM,
    fade: 0.25,
    duration: 0.5,
    bounce: 0.15,
    stagger: 0.03
  };

  const colon = (
    <span
      className={`px-0.5 pb-1 text-[38px] leading-none text-[#e0944f] ${running ? 'animate-pulse' : 'opacity-70'}`}
      aria-hidden="true"
    >
      :
    </span>
  );

  return (
    <section
      aria-label="Study timer"
      className={[
        `w-[300px] rounded-[28px] border border-[#e0a064]/20 ${compact ? 'flex min-h-0 flex-1 flex-col justify-between p-3' : 'p-4'} text-[#f1dcc2]`,
        'bg-[linear-gradient(180deg,rgba(24,14,9,0.92)_0%,rgba(14,8,5,0.95)_100%)] backdrop-blur-md',
        'shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,214,170,0.06)]',
        className
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#8f7660]">Study timer</span>
        <span className="flex items-center gap-1.5 text-[11px] text-[#bfa183]">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              running ? 'animate-pulse bg-[#e0944f]' : finished ? 'bg-[#4ade80]' : 'bg-[#6b5645]'
            }`}
          />
          {status}
        </span>
      </div>

      {/* mode toggle */}
      <div className={`${compact ? 'mt-2' : 'mt-3'} grid grid-cols-2 rounded-full border border-[#e0a064]/15 bg-black/25 p-0.5 text-[11px]`}>
        {[
          ['stopwatch', 'Stopwatch'],
          ['countdown', 'Set a goal']
        ].map(([key, text]) => (
          <button
            key={key}
            type="button"
            onClick={() => switchMode(key)}
            disabled={running}
            className={`rounded-full py-1.5 transition-colors disabled:cursor-not-allowed ${
              mode === key
                ? 'border border-[#e0944f]/50 bg-[#e0944f]/15 text-[#f6e3c9]'
                : 'border border-transparent text-[#8f7660] hover:text-[#d9bfa0]'
            }`}
          >
            {text}
          </button>
        ))}
      </div>

      {/* digits */}
      <div className={`${compact ? 'mt-2' : 'mt-4'} flex items-baseline justify-center font-serif`} role="timer">
        <Counter {...digitProps} value={hours} minDigits={2} intro={false} />
        {colon}
        <Counter {...digitProps} value={minutes} />
        {colon}
        <Counter {...digitProps} value={seconds} />
      </div>

      {/* progress + goal presets (fixed height so the card never jumps) */}
      <div className={`${compact ? 'mt-2 min-h-[36px]' : 'mt-3 min-h-[44px]'}`}>
        {countdown ? (
          <>
            <div className="h-[3px] overflow-hidden rounded-full bg-[#e0944f]/15">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#f7d3ae,#dd9552)] transition-[width] duration-300 ease-out"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-center gap-1.5">
              {PRESETS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => pickGoal(p)}
                  disabled={running}
                  className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors disabled:cursor-not-allowed ${
                    goal === p
                      ? 'border-[#e0944f]/60 bg-[#e0944f]/15 text-[#f6e3c9]'
                      : 'border-[#e0a064]/15 text-[#8f7660] hover:text-[#d9bfa0]'
                  }`}
                >
                  {p} min
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className={`${compact ? 'pt-2' : 'pt-3'} text-center font-serif text-[13px] italic text-[#b99a7c]`}>
            “Small steps every day lead to big results.”
          </p>
        )}
      </div>

      {/* controls */}
      <div className={`${compact ? 'mt-2' : 'mt-3'} flex items-center justify-center gap-4`}>
        <button
          type="button"
          onClick={reset}
          disabled={elapsed === 0 && !running}
          aria-label="Reset timer"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e0a064]/25 text-[#d9bfa0] transition-colors hover:border-[#e0944f]/60 hover:text-[#f6e3c9] disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ResetIcon />
        </button>
        <button
          type="button"
          onClick={toggle}
          aria-label={running ? 'Pause timer' : finished ? 'Restart timer' : 'Start timer'}
          className={`flex ${compact ? 'h-12 w-12' : 'h-14 w-14'} items-center justify-center rounded-full text-[#2a160a] shadow-[0_10px_30px_-8px_rgba(221,149,82,0.7)] transition-transform hover:scale-105 active:scale-95 ${GOLD_BTN}`}
        >
          {running ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          type="button"
          onClick={toggle}
          aria-label={running ? 'Stop timer temporarily' : 'Resume timer'}
          title={running ? 'Stop temporarily' : 'Resume timer'}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e0a064]/25 text-[#d9bfa0] transition-colors hover:border-[#e0944f]/60 hover:text-[#f6e3c9] disabled:cursor-not-allowed disabled:opacity-35"
        >
          {running ? <StopIcon /> : <PlayIcon />}
        </button>
      </div>

      {/* today's total */}
      <div className={`${compact ? 'mt-2 pt-2' : 'mt-4 pt-3'} flex items-center justify-between border-t border-[#e0a064]/10`}>
        <span className="text-[10px] uppercase tracking-[0.18em] text-[#8f7660]">Studied today</span>
        <span className="font-serif text-[15px] italic text-[#f1dcc2]">{formatShort(saved + elapsed)}</span>
      </div>
    </section>
  );
}
