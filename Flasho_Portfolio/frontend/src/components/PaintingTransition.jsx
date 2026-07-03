import { useEffect, useRef } from 'react';

export default function PaintingTransition({ onComplete }) {
  const stageRef = useRef(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const wipe = el.querySelector('.pa-wipe');
    const logo = el.querySelector('.pa-logo');
    const drops = el.querySelectorAll('.pa-drop');

    wipe.animate(
      [{ height: '0%' }, { height: '100%' }],
      { duration: 380, easing: 'cubic-bezier(0.4,0,0.2,1)', fill: 'forwards' }
    );

    setTimeout(() => {
      logo.animate(
        [{ opacity: 0, transform: 'translate(-50%,-50%) scale(0.88)' },
        { opacity: 1, transform: 'translate(-50%,-50%) scale(1)' }],
        { duration: 220, fill: 'forwards' }
      );
    }, 280);

    drops.forEach((d, i) => {
      setTimeout(() => {
        d.animate(
          [{ opacity: 0, transform: 'translateY(-20px) scale(0)' },
          { opacity: 0.8, transform: `translateY(${40 + i * 20}px) scale(1)`, offset: 0.5 },
          { opacity: 0, transform: `translateY(${120 + i * 30}px) scale(0.5)` }],
          { duration: 700, easing: 'ease-in', fill: 'forwards' }
        );
      }, 100 + i * 60);
    });

    setTimeout(() => {
      wipe.animate(
        [{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }],
        { duration: 340, easing: 'cubic-bezier(0.4,0,0.2,1)', fill: 'forwards' }
      );
      logo.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        { duration: 200, fill: 'forwards' }
      );
    }, 1100);

    const t = setTimeout(() => onComplete?.(), 1500);
    return () => clearTimeout(t);
  }, []);

  const dropPositions = [12, 28, 45, 60, 75, 88];

  return (
    <div ref={stageRef} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      pointerEvents: 'none', overflow: 'hidden'
    }}>
      <div className="pa-wipe" style={{
        position: 'absolute', left: 0, right: 0,
        top: 0, height: 0, background: '#e11d48'
      }} />

      {dropPositions.map((left, i) => (
        <div key={i} className="pa-drop" style={{
          position: 'absolute',
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          width: 8 + (i % 3) * 4,
          height: 14 + (i % 3) * 6,
          left: `${left}%`,
          top: '20%',
          opacity: 0,
        }} />
      ))}

      <div className="pa-logo" style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%,-50%)', opacity: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
        <svg width="40" height="40" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="17" stroke="white" strokeWidth="1.5" />
          <path d="M12 14h12M12 14v-4a2 2 0 012-2h8a2 2 0 012 2v4M18 14v8M16 26h4" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span style={{
          fontSize: 13, fontWeight: 500, color: 'white',
          letterSpacing: '0.05em', marginTop: 8, textAlign: 'center'
        }}>Painting…</span>
      </div>
    </div>
  );
}
