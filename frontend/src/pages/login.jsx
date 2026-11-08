import AeroShards from '../components/AeroShards';
import Shuffle from '../components/Darsy.JSX';
import Card from '../components/card';
import TargetCursor from '../components/cursor';
const css = `
  .ds-page{position:fixed;top:0;left:0;right:0;bottom:0;z-index:10;overflow-y:auto;display:flex;flex-direction:column;align-items:center;
    padding:clamp(2.5rem,11vh,7rem) 1.25rem 2rem;box-sizing:border-box;width:100%;text-align:center}
  .ds-tag{margin:1rem 0 2.4rem;font-size:.95rem;letter-spacing:.22em;text-transform:uppercase;color:#E8B887;
    text-shadow:0 0 12px rgba(217,149,91,.35);text-align:center;opacity:0;animation:ds-tag-in 1s ease-out 1.2s forwards}
  @keyframes ds-tag-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @media (prefers-reduced-motion:reduce){.ds-tag{animation:none;opacity:1}}
`;

function Login() {
  return (
    <>
      <style>{css}</style>

      <div style={{ position: 'fixed', inset: 0, background: '#0a0604', overflow: 'hidden' }}>
        <AeroShards
          shardColor="#e3a17a"
          accentColor="#f97316"
          backgroundColor="#0a0604"
          material="chrome"
          markers="dots"
          twist={1.3}
          speed={0.9}
          onError={(e) => console.error('AeroShards failed:', e)}
        />
      </div>

      <div className="ds-page">
        <Shuffle
          text="DARSY"
          tag="h1"
          color="#F3D9BC"
          accentColor="#D9955B"
          style={{
            display: 'inline-block',
            margin: 0,
            fontSize: 'clamp(3rem, 7vw, 4.75rem)',
            lineHeight: 1,
            letterSpacing: '0.08em',
            textShadow: '0 0 30px rgba(217, 149, 91, 0.5)',
          }}
          effect="slide"
          shuffleDirection="right"
          duration={0.35}
          animationMode="evenodd"
          shuffleTimes={10}
          ease="power3.out"
          stagger={0.03}
          threshold={0.1}
          triggerOnce
          triggerOnHover
          hoverRadius={0}
          motionBlur={false}
          respectReducedMotion
          maxDelay={0}
          scrambleCharset=""
          loop={false}
          loopDelay={0}
        />

        <p className="ds-tag">AI-powered platform for learning</p>
        <TargetCursor></TargetCursor>
        <Card
          onSubmit={(data) => console.log('Create account:', data)}
          onOAuth={(provider) => console.log('OAuth with', provider)}
          onSignIn={() => console.log('Go to sign in')}
        />
      </div>
    </>
  );
}

export default Login;