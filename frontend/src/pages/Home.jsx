import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GhostFibers from '../components/Home_backround';
import TargetCursor from '../components/cursor';
import UploadCard from '../components/upload_card';
import ChatWindow from '../components/chat_window';
import TechText from '../components/Darsy_Home';
import HelpCenter from '../components/FAQ';
import SuggestionBox from '../components/suggestion_section';
import LaserFlow from '../components/Laser';
import GradualBlur from '../components/Blur_effect';
import DarsyShowcase from '../components/Thinking';
import StudyTimer from '../components/StudyTimer';
import ProfileLogout from '../components/ProfileLogout';

const GOLD = '#D9955B';
const CREAM = '#F3D9BC';
const TAGLINE = 'Drop it. Ask it. Learn it.';
const SUBLINE = 'Upload your courses and chat with them.';
const CHAT_RADIUS = 26;
const BEAM_OFFSET = 0.06;
const HOME_LAYOUT_STYLE = `
.home-hero-row { left: 50%; width: max-content; justify-content: center; }
@media (min-width: 1700px) {
  .home-hero-row { left: calc(50% + 130px); width: min(1200px, calc(100vw - 6rem)); justify-content: space-between; }
}
`;

function Home() {
  const [files, setFiles] = useState([]);
  const [readyFiles, setReadyFiles] = useState([]);
  const [profileName] = useState(() => {
    try {
      const profile = JSON.parse(localStorage.getItem('darsy:profile') || 'null');
      return [profile?.name, profile?.surname].filter(Boolean).join(' ').trim() || 'Student';
    } catch {
      return 'Student';
    }
  });
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  const heroRef = useRef(null);
  const chatRef = useRef(null);
  const [beam, setBeam] = useState(0.63);
  const blurHostRef = useRef(null);
  const suggestRef = useRef(null);
  const logoutTimerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(logoutTimerRef.current), []);

  const handleLogout = () => {
    localStorage.removeItem('darsy:profile');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      navigate('/');
      return;
    }
    setLoggingOut(true);
    logoutTimerRef.current = window.setTimeout(() => navigate('/'), 320);
  };

  useEffect(() => {
    const hero = heroRef.current;
    const chat = chatRef.current;
    if (!hero || !chat) return undefined;

    const update = () => {
      const h = hero.getBoundingClientRect();
      const c = chat.getBoundingClientRect();
      if (h.width > 0) setBeam((c.left - h.left + c.width / 2) / h.width + BEAM_OFFSET);
    };

    const ro = new ResizeObserver(update);
    ro.observe(hero);
    ro.observe(chat);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  useEffect(() => {
    const host = blurHostRef.current;
    const section = suggestRef.current;
    if (!host || !section) return undefined;

    let shown = false;
    const update = () => {
      const next = section.getBoundingClientRect().top < window.innerHeight * 0.6;
      if (next === shown) return;
      shown = next;
      host.style.setProperty('--gradual-blur-reveal', next ? '1' : '0');
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const handleDone = e => {
    const btn = e.target.closest('button');
    if (btn && btn.textContent.trim() === 'Done') setReadyFiles(files);
  };

  return (
    <>
      <TargetCursor />
      <style>{HOME_LAYOUT_STYLE}</style>

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#0a0604',
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        <GhostFibers
          lightMode={false}
          glowColor="#D9955B"
          secondaryColor="#B8743F"
          lineColor="#F3D9BC"
          brightness={1.1}
          glow={0.9}
          vignette={0.3}
        />
      </div>

      <div style={{ position: 'relative', zIndex: 1, color: CREAM }}>
        <section ref={heroRef} style={{ position: 'relative', height: '100vh', minHeight: 640 }}>
          <ProfileLogout name={profileName} loggingOut={loggingOut} onLogout={handleLogout} />

          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
              overflow: 'hidden',
              opacity: 0.7,
            }}
          >
            <LaserFlow
              surfaceRef={chatRef}
              dpr={0.75}
              introSpeed={0.5}
              introRepeat={6}
              beamPosition={beam}
              color="#D9955B"
              intensity={0.6}
              beamWidth={0.8}
              flare={1}
              spread={0.8}
              spill={0.6}
              fog={0.1}
              dust={0.8}
              streaks={0.8}
              theme="dark"
            />
          </div>

          <div
            style={{
              position: 'absolute',
              top: '1rem',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '1.6rem',
              zIndex: 2,
            }}
          >
            <div style={{ position: 'relative', width: 'min(460px, 50vw)', height: 'min(170px, 18vh)' }}>
              <TechText
                text="Darsy"
                fontWeight={600}
                fontSize={130}
                reveal="letter"
                dashLength={4}
                dashGap={2}
                specks={14}
                intro="none"
                introDuration={2}
                clickKick
                guides={false}
                fontFamily="Georgia, 'Times New Roman', serif"
                letterSpacing={-0.03}
                accentColor={GOLD}
                reach={160}
                softness={0.7}
                lineStyle="dashed"
                strokeWidth={1.5}
                speed={1}
                bounce={0.4}
                selection
                labels={false}
                color={CREAM}
                align="center"
                draggable
                sweep
              />
            </div>

            <div
              style={{
                paddingLeft: '1.6rem',
                borderLeft: `1px solid ${GOLD}`,
                maxWidth: 'min(320px, 30vw)',
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontStyle: 'italic',
                  fontSize: 'clamp(1.1rem, 2vw, 1.7rem)',
                  lineHeight: 1.25,
                }}
              >
                {TAGLINE}
              </div>
              <div style={{ marginTop: 8, fontSize: 13, opacity: 0.6 }}>{SUBLINE}</div>
            </div>
          </div>

          <div
            className="home-hero-row"
            style={{
              position: 'absolute',
              zIndex: 1,
              top: '61%',
              transform: 'translate(-50%, -50%)',
              transformOrigin: 'center center',
              display: 'flex',
              gap: '1.2rem',
              alignItems: 'center',
            }}
          >
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  right: 'calc(100% + 1.2rem)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 300,
                  height: 'min(84vh, 760px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
                className="hidden min-[1700px]:flex"
              >
                <DarsyShowcase fileCount={readyFiles.length} stacked />
                <StudyTimer compact />
              </div>
              <div onClick={handleDone}>
                <UploadCard onFiles={list => setFiles(prev => [...prev, ...list])} />
              </div>
            </div>

            <div ref={chatRef} style={{ display: 'flex', borderRadius: CHAT_RADIUS }}>
              <ChatWindow files={readyFiles} agentName="Course Assistant" width="min(620px, 90vw)" />
            </div>

          </div>
        </section>

        <section
          ref={suggestRef}
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 1rem 14rem',
            boxSizing: 'border-box',
          }}
        >
          <SuggestionBox />
        </section>
      </div>

      <div
        ref={blurHostRef}
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          height: '10rem',
          zIndex: 2,
          pointerEvents: 'none',
          '--gradual-blur-reveal': 0,
        }}
      >
        <GradualBlur
          position="bottom"
          target="parent"
          height="10rem"
          strength={2}
          layers={10}
          curve="ease-in-out"
          duration={0.5}
          exponential
          tint="rgba(10, 6, 4, 0.35)"
          zIndex={1}
        />
      </div>

      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          pointerEvents: loggingOut ? 'auto' : 'none',
          background: '#0a0604',
          opacity: loggingOut ? 1 : 0,
          transition: 'opacity 320ms ease',
        }}
      />

      <HelpCenter />
    </>
  );
}

export default Home;
