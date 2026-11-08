import { useState } from 'react';
import GhostFibers from '../components/Home_backround';
import TargetCursor from '../components/cursor';
import UploadCard from '../components/upload_card';
import ChatWindow from '../components/chat_window';
import TechText from '../components/Darsy_Home';
import HelpCenter from '../components/FAQ';
import SuggestionBox from '../components/suggestion_section';

const GOLD = '#D9955B';
const CREAM = '#F3D9BC';
const TAGLINE = 'Drop it. Ask it. Learn it.';
const SUBLINE = 'Upload your courses and chat with them.';

function Home() {
  const [files, setFiles] = useState([]);
  const [readyFiles, setReadyFiles] = useState([]);

  const handleDone = e => {
    const btn = e.target.closest('button');
    if (btn && btn.textContent.trim() === 'Done') setReadyFiles(files);
  };

  return (
    <>
      <TargetCursor />

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
        <section style={{ position: 'relative', height: '100vh', minHeight: 640 }}>
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
            style={{
              position: 'absolute',
              left: '50%',
              top: '61%',
              transform: 'translate(-50%, -50%) scale(0.9)',
              transformOrigin: 'center center',
              display: 'flex',
              gap: '1.2rem',
              alignItems: 'center',
            }}
          >
            <div onClick={handleDone}>
              <UploadCard onFiles={list => setFiles(prev => [...prev, ...list])} />
            </div>

            <ChatWindow files={readyFiles} agentName="Course Assistant" />
          </div>
        </section>
        <section
  style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 1rem',
    boxSizing: 'border-box',
  }}
>
  <SuggestionBox />
</section>
      </div>

      <HelpCenter />
    </>
  );
}

export default Home;