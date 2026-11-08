import GhostFibers from '../components/Home_backround';
import TargetCursor from '../components/cursor';
import UploadCard from '../components/upload_card';

function Home() {
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

      <div
        style={{
          position: 'fixed',
          left: '6rem',
          top: '53%',
          transform: 'translateY(-50%)',
          zIndex: 1,
          color: '#F3D9BC',
        }}
      >
        <UploadCard onFiles={files => console.log(files)} />
      </div>
    </>
  );
}

export default Home;