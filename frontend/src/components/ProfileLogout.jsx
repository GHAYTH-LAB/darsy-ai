const GOLD = '#D9955B';
const CREAM = '#F3D9BC';
const STYLE = `
.profile-logout-card { transition: background 180ms ease, border-color 180ms ease, transform 180ms ease, box-shadow 180ms ease, opacity 220ms ease; }
.profile-logout-card:not(.is-logging-out):hover { background: rgba(30,17,10,0.96) !important; border-color: rgba(217,149,91,0.52) !important; transform: translateY(-2px) scale(1.015); box-shadow: 0 16px 38px rgba(0,0,0,0.38), 0 0 20px rgba(217,149,91,0.1) !important; }
.profile-logout-card.is-logging-out { transform: translateY(-4px); }
.profile-logout-button { transition: background 180ms ease, border-color 180ms ease, color 180ms ease, transform 180ms ease; }
.profile-logout-button:not(:disabled):active { transform: scale(0.97); }
.profile-logout-button:focus-visible { outline: 2px solid #f3d9bc; outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) { .profile-logout-card, .profile-logout-button { transition: none; } }
@media (max-width: 639px) {
  .profile-logout-card { top: 0.75rem !important; right: 0.75rem !important; gap: 0.45rem !important; padding: 0.4rem !important; }
  .profile-logout-name { display: none; }
  .profile-logout-avatar { width: 30px !important; height: 30px !important; }
  .profile-logout-button { padding: 0.45rem 0.65rem !important; }
}
`;

export default function ProfileLogout({ name = 'Student', loggingOut = false, onLogout }) {
  return (
    <>
    <style>{STYLE}</style>
    <div
      className={`profile-logout-card flex${loggingOut ? ' is-logging-out' : ''}`}
      style={{
        position: 'absolute',
        top: 'clamp(1.75rem, 3vh, 2.25rem)',
        right: 'clamp(1rem, 2vw, 2rem)',
        zIndex: 3,
        alignItems: 'center',
        gap: '0.8rem',
        padding: '0.65rem 0.75rem 0.65rem 0.85rem',
        borderRadius: 999,
        border: '1px solid rgba(217,149,91,0.28)',
        background: 'rgba(18,10,6,0.84)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 12px 32px rgba(0,0,0,0.28)',
        opacity: loggingOut ? 0.55 : 1,
      }}
    >
      <span
        className="profile-logout-avatar"
        aria-hidden="true"
        style={{
          display: 'grid',
          placeItems: 'center',
          width: 40,
          height: 40,
          flexShrink: 0,
          borderRadius: '50%',
          color: '#261509',
          fontWeight: 700,
          background: `linear-gradient(135deg, ${CREAM}, ${GOLD})`,
        }}
      >
        {name.charAt(0).toUpperCase()}
      </span>
      <span
        className="profile-logout-name"
        style={{
          color: CREAM,
          fontSize: 14,
          fontWeight: 600,
          maxWidth: 170,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </span>
      <button
        type="button"
        className="profile-logout-button"
        onClick={onLogout}
        disabled={loggingOut}
        style={{
          border: '1px solid rgba(217,149,91,0.3)',
          borderRadius: 999,
          padding: '0.55rem 0.9rem',
          color: CREAM,
          background: 'rgba(217,149,91,0.1)',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          opacity: loggingOut ? 0.65 : 1,
        }}
      >
        {loggingOut ? 'Logging out...' : 'Log out'}
      </button>
    </div>
    </>
  );
}
