import React, { useEffect, useState } from 'react';

export const MarketingTab: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  useEffect(() => {
    // Cursor
    const cursor = document.getElementById('market-cursor');
    const ring = document.getElementById('market-cursorRing');
    let mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my;
    let reqId: number;

    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (cursor) {
        cursor.style.left = mx - 4 + 'px';
        cursor.style.top = my - 4 + 'px';
      }
    };

    const animate = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if (ring) {
        ring.style.left = rx - 18 + 'px';
        ring.style.top = ry - 18 + 'px';
      }
      reqId = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', onMouseMove);
    animate();

    // Nav and Progress Scroll
    const nav = document.getElementById('market-mainNav');
    const prog = document.getElementById('market-progressBar');
    const onScroll = () => {
      if (nav) nav.classList.toggle('scrolled', window.scrollY > 80);
      if (prog) {
        const h = document.body.scrollHeight - window.innerHeight;
        prog.style.width = (window.scrollY / h * 100) + '%';
      }
    };
    window.addEventListener('scroll', onScroll);

    // Reveal
    const obs = new IntersectionObserver(es => {
      es.forEach(e => {
        if(e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.market-wrap .reveal').forEach(el => obs.observe(el));

    // Particles
    const pEl = document.getElementById('market-particles');
    if (pEl) {
      pEl.innerHTML = '';
      for(let i=0; i<25; i++){
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.cssText = `left:${Math.random()*100}%;width:${1+Math.random()*2}px;height:${1+Math.random()*2}px;animation-duration:${10+Math.random()*18}s;animation-delay:${Math.random()*14}s;`;
        pEl.appendChild(p);
      }
    }

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(reqId);
      window.removeEventListener('scroll', onScroll);
      obs.disconnect();
    };
  }, []);

  const toggleCheck = (idx: number) => {
    setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const renderCheckItem = (idx: number, title: string, desc: string) => {
    const isChecked = !!checkedItems[idx];
    return (
      <div 
        className={`cl-item ${isChecked ? 'checked' : ''}`} 
        onClick={() => toggleCheck(idx)}
        style={isChecked ? { opacity: 0.5, textDecoration: 'line-through' } : {}}
      >
        <div className="cl-check" style={isChecked ? { background: 'var(--amber)', borderColor: 'var(--amber)' } : {}}>
          <div className="cl-check-mark" style={isChecked ? { opacity: 1 } : {}}>✓</div>
        </div>
        <div>
          <div>{title}</div>
          <div className="cl-done">{desc}</div>
        </div>
      </div>
    );
  };

  // HTML content rendering
  return (
    <div className="market-wrap">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Noto+Serif+KR:wght@300;400;600&display=swap');
        
        .market-wrap {
          width: 100vw;
          position: relative;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
          
          --black: #0e0c0b;
          --dark: #1a1614;
          --charcoal: #2a2420;
          --amber: #C9963A;
          --amber-light: #E8B84B;
          --wine: #6B2737;
          --wine-light: #8B3A4A;
          --cream: #F5EDD8;
          --cream-dim: #D9CFBC;
          --stone: #8A8070;
          --mist: #C4BAA8;
          --teal: #2A6B6B;
          --blue-dim: #2A3A5A;
          
          background: var(--black);
          color: var(--cream);
          font-family: 'Noto Serif KR', serif;
          overflow-x: hidden;
          cursor: none;
        }

        .market-wrap *, .market-wrap *::before, .market-wrap *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
        .market-wrap .cursor { position: fixed; width: 8px; height: 8px; background: var(--amber); border-radius: 50%; pointer-events: none; z-index: 9999; mix-blend-mode: difference; }
        .market-wrap .cursor-ring { position: fixed; width: 36px; height: 36px; border: 1px solid rgba(201,150,58,0.5); border-radius: 50%; pointer-events: none; z-index: 9998; transition: all 0.18s ease; }
        
        .market-wrap::before {
          content: ''; position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 9000; opacity: 0.35;
        }
        
        .market-wrap .progress-bar { position: fixed; top: 0; left: 0; height: 2px; background: var(--amber); z-index: 200; transition: width 0.1s linear; }

        .market-wrap a { text-decoration: none; }

        .market-nav {
          position: sticky; top: 60px; left: 0; right: 0; z-index: 100;
          display: flex; justify-content: space-between; align-items: center;
          padding: 28px 60px;
          background: linear-gradient(to bottom, rgba(14,12,11,0.95) 0%, transparent 100%);
          transition: all 0.3s;
        }
        .market-nav.scrolled { background: rgba(14,12,11,0.97); padding: 16px 60px; }
        
        .nav-logo { font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--amber); }
        .nav-sub { font-size: 0.6rem; letter-spacing: 0.25em; color: var(--stone); text-transform: uppercase; }
        .nav-right { display: flex; gap: 32px; align-items: center; }
        .nav-link { font-size: 0.65rem; letter-spacing: 0.2em; color: var(--mist); text-decoration: none; text-transform: uppercase; transition: color 0.3s; cursor: none; }
        .nav-link:hover { color: var(--amber); }

        .hero {
          position: relative; height: 100vh; min-height: 680px;
          display: flex; align-items: center; overflow: hidden;
        }
        .hero-bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 55% 55% at 70% 40%, rgba(201,150,58,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 20% 70%, rgba(107,39,55,0.3) 0%, transparent 55%),
            radial-gradient(ellipse 100% 100% at 50% 50%, rgba(26,22,20,0.6) 30%, var(--black) 100%);
        }
        .orb { position: absolute; border-radius: 50%; filter: blur(90px); pointer-events: none; animation: orbFloat 14s ease-in-out infinite; }
        .orb-a { width: 600px; height: 400px; background: radial-gradient(circle, rgba(107,39,55,0.4) 0%, transparent 70%); top: -100px; right: -80px; animation-delay: 0s; }
        .orb-b { width: 350px; height: 350px; background: radial-gradient(circle, rgba(201,150,58,0.18) 0%, transparent 70%); bottom: 0; left: 60px; animation-delay: -5s; }
        @keyframes orbFloat {
          0%,100% { transform: translate(0,0) scale(1); }
          40% { transform: translate(20px,-30px) scale(1.04); }
          70% { transform: translate(-15px,15px) scale(0.98); }
        }

        .hero-grid {
          position: relative; z-index: 2;
          width: 100%; max-width: 1300px;
          margin: 0 auto; padding: 0 60px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
        }
        .hero-eyebrow { font-size: 0.65rem; letter-spacing: 0.5em; text-transform: uppercase; color: var(--amber); margin-bottom: 28px; opacity: 0; animation: fadeUp 1s ease 0.3s forwards; }
        .hero-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(3.5rem,6vw,6.5rem); font-weight: 300; line-height: 0.95; letter-spacing: -0.02em; color: var(--cream); opacity: 0; animation: fadeUp 1.2s ease 0.5s forwards; }
        .hero-title em { font-style: italic; color: var(--amber); }
        .hero-body { margin-top: 28px; font-size: 0.9rem; line-height: 2; color: var(--mist); opacity: 0; animation: fadeUp 1s ease 0.9s forwards; }
        .hero-cta-row { margin-top: 36px; display: flex; gap: 16px; opacity: 0; animation: fadeUp 1s ease 1.1s forwards; }
        .btn-primary { padding: 14px 36px; background: var(--amber); color: var(--black); font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; border: none; cursor: none; transition: all 0.3s; text-decoration: none; display: inline-block; }
        .btn-primary:hover { background: var(--amber-light); transform: translateY(-2px); }
        .btn-outline { padding: 14px 36px; background: transparent; color: var(--cream); font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; border: 1px solid rgba(255,255,255,0.2); cursor: none; transition: all 0.3s; text-decoration: none; display: inline-block; }
        .btn-outline:hover { border-color: var(--amber); color: var(--amber); }

        .hero-right { opacity: 0; animation: fadeUp 1s ease 0.8s forwards; }
        .summary-card {
          border: 1px solid rgba(201,150,58,0.2);
          padding: 40px 36px;
          background: rgba(26,22,20,0.8);
          backdrop-filter: blur(12px);
          position: relative;
          overflow: hidden;
        }
        .summary-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(to right, var(--amber), transparent);
        }
        .summary-title { font-family: 'Cormorant Garamond', serif; font-size: 0.65rem; letter-spacing: 0.4em; text-transform: uppercase; color: var(--amber); margin-bottom: 24px; }
        .summary-items { display: flex; flex-direction: column; gap: 0; }
        .sum-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.82rem; }
        .sum-label { color: var(--stone); }
        .sum-val { color: var(--cream); }
        .sum-val.highlight { color: var(--amber); font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; }
        .priority-pills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 20px; }
        .pill { padding: 5px 14px; font-size: 0.62rem; letter-spacing: 0.15em; text-transform: uppercase; border-radius: 0; }
        .pill-p0 { background: rgba(201,150,58,0.15); color: var(--amber); border: 1px solid rgba(201,150,58,0.3); }
        .pill-p1 { background: rgba(255,255,255,0.05); color: var(--mist); border: 1px solid rgba(255,255,255,0.1); }
        
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }

        .market-section { position: relative; overflow: hidden; }
        .section-inner { max-width: 1200px; margin: 0 auto; padding: 0 60px; }
        .section-label { font-family: 'Cormorant Garamond', serif; font-size: 0.65rem; letter-spacing: 0.5em; text-transform: uppercase; color: var(--amber); margin-bottom: 18px; display: flex; align-items: center; gap: 14px; }
        .section-label::before { content:''; display:inline-block; width:36px; height:1px; background:var(--amber); }
        .section-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(2.2rem,3.5vw,3.8rem); font-weight: 300; line-height: 1.1; color: var(--cream); margin-bottom: 20px; }
        .section-title em { font-style: italic; color: var(--amber); }
        .section-body { font-size: 0.88rem; line-height: 2; color: var(--mist); max-width: 560px; }

        .reveal { opacity: 0; transform: translateY(36px); transition: all 0.9s cubic-bezier(0.16,1,0.3,1); }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .rd1 { transition-delay: 0.1s; }
        .rd2 { transition-delay: 0.2s; }
        .rd3 { transition-delay: 0.3s; }
        .rd4 { transition-delay: 0.4s; }

        .channels { padding: 120px 0; background: var(--dark); }
        .channels-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: rgba(201,150,58,0.1); border: 1px solid rgba(201,150,58,0.1); margin-top: 64px; }
        .channel-card { background: var(--dark); padding: 32px 26px; position: relative; transition: background 0.4s; cursor: none; overflow: hidden; }
        .channel-card::after { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at 50% 100%, rgba(201,150,58,0.06) 0%, transparent 70%); opacity:0; transition:opacity 0.4s; }
        .channel-card:hover { background: rgba(42,36,32,0.95); }
        .channel-card:hover::after { opacity: 1; }
        .ch-priority { font-size: 0.55rem; letter-spacing: 0.4em; text-transform: uppercase; margin-bottom: 14px; display: inline-block; padding: 4px 10px; }
        .ch-high { background: rgba(201,150,58,0.15); color: var(--amber); border: 1px solid rgba(201,150,58,0.3); }
        .ch-mid { background: rgba(255,255,255,0.05); color: var(--mist); border: 1px solid rgba(255,255,255,0.1); }
        .ch-low { background: rgba(42,36,32,0.8); color: var(--stone); border: 1px solid rgba(255,255,255,0.05); }
        .ch-icon { font-size: 1.8rem; margin-bottom: 14px; }
        .ch-name { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; color: var(--cream); margin-bottom: 10px; }
        .ch-role { font-size: 0.72rem; color: var(--stone); line-height: 1.7; margin-bottom: 14px; }
        .ch-rule { font-size: 0.72rem; color: var(--mist); line-height: 1.7; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.06); }

        .budget { padding: 120px 0; background: var(--black); }
        .budget-header { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: end; margin-bottom: 70px; }
        .budget-table-wrap { overflow-x: auto; }
        .budget-table { width: 100%; border-collapse: collapse; font-size: 0.83rem; }
        .budget-table thead th { font-family: 'Cormorant Garamond', serif; font-size: 0.62rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--amber); padding: 14px 20px; text-align: left; border-bottom: 1px solid rgba(201,150,58,0.3); white-space: nowrap; }
        .budget-table tbody tr { border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.3s; }
        .budget-table tbody tr:hover { background: rgba(201,150,58,0.04); }
        .budget-table td { padding: 18px 20px; color: var(--mist); vertical-align: top; }
        .budget-table td:first-child { color: var(--cream); font-size: 0.88rem; }
        .budget-table td.amount { font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; color: var(--amber); white-space: nowrap; }
        .budget-table tr.total-row td { color: var(--cream); border-top: 1px solid rgba(201,150,58,0.3); padding-top: 20px; }
        .budget-table tr.total-row td:first-child { font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; color: var(--amber); }
        .budget-bars { margin-top: 50px; display: flex; flex-direction: column; gap: 16px; }
        .bbar-row { display: flex; align-items: center; gap: 16px; }
        .bbar-label { font-size: 0.78rem; color: var(--mist); width: 180px; flex-shrink: 0; }
        .bbar-track { flex: 1; height: 8px; background: rgba(255,255,255,0.06); position: relative; overflow: hidden; }
        .bbar-fill { height: 100%; border-radius: 0; transform-origin: left; animation: bfill 1.5s ease forwards; }
        @keyframes bfill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .bbar-val { font-size: 0.78rem; color: var(--amber); width: 90px; text-align: right; flex-shrink: 0; }

        .segments { padding: 120px 0; background: var(--dark); position: relative; }
        .segments::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 60% 60% at 80% 50%, rgba(107,39,55,0.15) 0%, transparent 60%); pointer-events:none; }
        .seg-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 64px; }
        .seg-card { border: 1px solid rgba(255,255,255,0.07); padding: 36px 32px; position: relative; transition: all 0.4s; overflow: hidden; }
        .seg-card::before { content:''; position:absolute; top:0; left:0; bottom:0; width:3px; }
        .seg-a::before { background: var(--amber); }
        .seg-b::before { background: var(--wine-light); }
        .seg-c::before { background: var(--teal); }
        .seg-d::before { background: var(--stone); }
        .seg-card:hover { transform: translateX(4px); border-color: rgba(201,150,58,0.2); }
        .seg-name { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; color: var(--cream); margin-bottom: 8px; }
        .seg-geo { font-size: 0.65rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--amber); margin-bottom: 16px; }
        .seg-need { font-size: 0.82rem; color: var(--mist); margin-bottom: 16px; line-height: 1.7; }
        .seg-channels { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
        .seg-ch { padding: 4px 12px; font-size: 0.62rem; letter-spacing: 0.1em; background: rgba(255,255,255,0.05); color: var(--stone); border: 1px solid rgba(255,255,255,0.08); }
        .seg-msg { color: var(--cream); font-style: italic; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.06); font-family: 'Cormorant Garamond', serif; font-size: 1rem; }

        .keywords { padding: 120px 0; background: var(--black); }
        .kw-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 64px; }
        .kw-col-title { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; color: var(--cream); margin-bottom: 6px; }
        .kw-col-sub { font-size: 0.65rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--stone); margin-bottom: 24px; }
        .kw-list { display: flex; flex-direction: column; gap: 8px; }
        .kw-item { display: flex; align-items: center; gap: 14px; padding: 12px 16px; border: 1px solid rgba(255,255,255,0.06); font-size: 0.82rem; color: var(--mist); transition: all 0.3s; cursor: none; }
        .kw-item:hover { border-color: rgba(201,150,58,0.3); color: var(--cream); background: rgba(201,150,58,0.03); }
        .kw-type { font-size: 0.55rem; letter-spacing: 0.3em; text-transform: uppercase; padding: 3px 8px; }
        .kw-exact { background: rgba(201,150,58,0.15); color: var(--amber); }
        .kw-broad { background: rgba(255,255,255,0.06); color: var(--stone); }
        .neg-list { margin-top: 28px; padding: 20px 24px; border: 1px solid rgba(107,39,55,0.3); background: rgba(107,39,55,0.06); }
        .neg-title { font-size: 0.6rem; letter-spacing: 0.4em; text-transform: uppercase; color: var(--wine-light); margin-bottom: 12px; }
        .neg-items { display: flex; flex-wrap: wrap; gap: 8px; }
        .neg-tag { padding: 4px 12px; font-size: 0.7rem; color: var(--stone); background: rgba(107,39,55,0.1); border: 1px solid rgba(107,39,55,0.2); }
        .neg-tag::before { content: '−'; margin-right: 6px; color: var(--wine-light); }

        .kpi { padding: 120px 0; background: var(--dark); }
        .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(201,150,58,0.1); border: 1px solid rgba(201,150,58,0.1); margin-top: 64px; }
        .kpi-card { background: var(--dark); padding: 36px 28px; position: relative; overflow: hidden; transition: background 0.3s; }
        .kpi-card:hover { background: rgba(42,36,32,0.9); }
        .kpi-channel { font-size: 0.6rem; letter-spacing: 0.4em; text-transform: uppercase; color: var(--amber); margin-bottom: 14px; }
        .kpi-name { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; color: var(--cream); margin-bottom: 20px; }
        .kpi-rows { display: flex; flex-direction: column; gap: 0; }
        .kpi-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.78rem; }
        .kpi-metric { color: var(--stone); }
        .kpi-conservative { color: var(--mist); }
        .kpi-realistic { color: var(--amber); }
        .kpi-header-row { display: flex; justify-content: space-between; padding: 8px 0 12px; border-bottom: 1px solid rgba(201,150,58,0.2); margin-bottom: 2px; }
        .kpi-hdr { font-size: 0.58rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--stone); }

        .creative { padding: 120px 0; background: var(--black); position: relative; }
        .creative::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 60% 50% at 20% 50%, rgba(201,150,58,0.07) 0%, transparent 60%); pointer-events:none; }
        .creative-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 64px; }
        .creative-card { padding: 36px 32px; border: 1px solid rgba(255,255,255,0.07); position: relative; overflow: hidden; transition: all 0.4s; }
        .creative-card:hover { border-color: rgba(201,150,58,0.25); }
        .cc-num { font-family: 'Cormorant Garamond', serif; font-size: 5rem; font-weight: 300; color: rgba(201,150,58,0.08); position: absolute; top: 12px; right: 20px; line-height: 1; }
        .cc-type { font-size: 0.6rem; letter-spacing: 0.4em; text-transform: uppercase; color: var(--amber); margin-bottom: 14px; }
        .cc-title { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; color: var(--cream); margin-bottom: 20px; }
        .cc-steps { display: flex; flex-direction: column; gap: 10px; }
        .cc-step { display: flex; gap: 14px; align-items: flex-start; font-size: 0.8rem; }
        .cc-step-time { font-size: 0.65rem; color: var(--amber); width: 50px; flex-shrink: 0; padding-top: 2px; }
        .cc-step-desc { color: var(--mist); line-height: 1.6; }

        .copy-section { padding: 100px 0; background: var(--dark); }
        .copy-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(201,150,58,0.1); border: 1px solid rgba(201,150,58,0.1); margin-top: 64px; }
        .copy-card { background: var(--dark); padding: 36px 28px; transition: background 0.3s; }
        .copy-card:hover { background: rgba(42,36,32,0.9); }
        .copy-use { font-size: 0.6rem; letter-spacing: 0.4em; text-transform: uppercase; color: var(--amber); margin-bottom: 16px; }
        .copy-kr { font-size: 0.88rem; color: var(--cream); line-height: 1.9; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .copy-en { font-size: 0.8rem; color: var(--stone); line-height: 1.8; font-style: italic; }

        .format { padding: 100px 0; background: var(--black); }
        .format-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 64px; }
        .fmt-card { padding: 28px 28px; border: 1px solid rgba(255,255,255,0.06); display: flex; gap: 20px; align-items: flex-start; transition: all 0.3s; }
        .fmt-card:hover { border-color: rgba(201,150,58,0.2); }
        .fmt-icon { font-size: 1.5rem; flex-shrink: 0; }
        .fmt-channel { font-size: 0.6rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--amber); margin-bottom: 6px; }
        .fmt-spec { font-family: 'Cormorant Garamond', serif; font-size: 1rem; color: var(--cream); margin-bottom: 8px; }
        .fmt-concept { font-size: 0.78rem; color: var(--mist); line-height: 1.7; }
        .fmt-tip { margin-top: 10px; font-size: 0.72rem; color: var(--stone); padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.05); }

        .timeline { padding: 120px 0; background: var(--dark); }
        .tl-wrap { margin-top: 64px; position: relative; }
        .tl-phases { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(201,150,58,0.1); border: 1px solid rgba(201,150,58,0.1); }
        .tl-phase { background: var(--dark); padding: 36px 28px; }
        .tl-phase-num { font-family: 'Cormorant Garamond', serif; font-size: 4rem; font-weight: 300; color: rgba(201,150,58,0.15); line-height: 1; margin-bottom: 14px; }
        .tl-phase-name { font-size: 0.6rem; letter-spacing: 0.4em; text-transform: uppercase; color: var(--amber); margin-bottom: 10px; }
        .tl-phase-title { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; color: var(--cream); margin-bottom: 20px; }
        .tl-items { display: flex; flex-direction: column; gap: 10px; }
        .tl-item { display: flex; gap: 10px; align-items: flex-start; font-size: 0.78rem; color: var(--mist); line-height: 1.6; }
        .tl-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--amber); margin-top: 6px; flex-shrink: 0; }

        .checklist { padding: 120px 0; background: var(--black); }
        .cl-cols { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 40px; margin-top: 64px; }
        .cl-group-title { font-size: 0.6rem; letter-spacing: 0.4em; text-transform: uppercase; margin-bottom: 20px; padding: 8px 16px; }
        .cl-p0-title { background: rgba(201,150,58,0.12); color: var(--amber); border: 1px solid rgba(201,150,58,0.25); }
        .cl-p1-title { background: rgba(255,255,255,0.04); color: var(--mist); border: 1px solid rgba(255,255,255,0.08); }
        .cl-p2-title { background: rgba(42,36,32,0.6); color: var(--stone); border: 1px solid rgba(255,255,255,0.04); }
        .cl-items { display: flex; flex-direction: column; gap: 2px; }
        .cl-item { padding: 14px 16px; border: 1px solid rgba(255,255,255,0.04); font-size: 0.78rem; color: var(--mist); line-height: 1.6; transition: all 0.3s; cursor: none; display: flex; gap: 12px; align-items: flex-start; }
        .cl-item:hover { background: rgba(201,150,58,0.04); border-color: rgba(201,150,58,0.15); color: var(--cream); }
        .cl-check { width: 16px; height: 16px; border: 1px solid rgba(201,150,58,0.3); flex-shrink: 0; margin-top: 2px; display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
        .cl-item:hover .cl-check { background: var(--amber); border-color: var(--amber); }
        .cl-check-mark { font-size: 10px; color: var(--black); opacity: 0; transition: opacity 0.2s; }
        .cl-item:hover .cl-check-mark { opacity: 1; }
        .cl-done { font-size: 0.6rem; color: var(--stone); margin-top: 4px; letter-spacing: 0.1em; }

        .abt { padding: 100px 0; background: var(--dark); }
        .abt-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(201,150,58,0.1); border: 1px solid rgba(201,150,58,0.1); margin-top: 64px; }
        .abt-card { background: var(--dark); padding: 28px 24px; transition: background 0.3s; }
        .abt-card:hover { background: rgba(42,36,32,0.9); }
        .abt-label { font-size: 0.58rem; letter-spacing: 0.4em; text-transform: uppercase; color: var(--stone); margin-bottom: 14px; }
        .abt-test { font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; color: var(--cream); margin-bottom: 16px; }
        .abt-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px; }
        .abt-opt { padding: 10px 12px; font-size: 0.75rem; line-height: 1.5; }
        .abt-a { background: rgba(201,150,58,0.08); color: var(--amber); border: 1px solid rgba(201,150,58,0.2); }
        .abt-b { background: rgba(255,255,255,0.04); color: var(--mist); border: 1px solid rgba(255,255,255,0.08); }
        .abt-kpi { font-size: 0.68rem; color: var(--stone); padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.05); }
        .abt-kpi span { color: var(--amber); }

        .flow { padding: 100px 0; background: var(--black); }
        .flow-diagram { margin-top: 64px; display: flex; align-items: center; flex-wrap: wrap; gap: 0; }
        .flow-node { flex: 1; min-width: 120px; padding: 20px 16px; border: 1px solid rgba(201,150,58,0.2); background: rgba(26,22,20,0.8); text-align: center; position: relative; transition: all 0.3s; }
        .flow-node:hover { background: rgba(42,36,32,0.9); border-color: var(--amber); }
        .flow-arrow { padding: 0 8px; color: rgba(201,150,58,0.4); font-size: 1.2rem; flex-shrink: 0; }
        .fn-icon { font-size: 1.5rem; margin-bottom: 8px; }
        .fn-label { font-size: 0.62rem; letter-spacing: 0.15em; color: var(--amber); text-transform: uppercase; margin-bottom: 4px; }
        .fn-desc { font-size: 0.72rem; color: var(--stone); line-height: 1.5; }
        .utm-box { margin-top: 50px; padding: 28px 32px; border: 1px solid rgba(201,150,58,0.15); background: rgba(14,12,11,0.7); font-family: monospace; }
        .utm-title { font-family: 'Noto Serif KR', serif; font-size: 0.6rem; letter-spacing: 0.4em; text-transform: uppercase; color: var(--amber); margin-bottom: 16px; }
        .utm-line { font-size: 0.75rem; color: var(--mist); line-height: 2; word-break: break-all; }
        .utm-param { color: var(--amber); }
        .utm-val { color: var(--cream-dim); }

        .cta { padding: 160px 0; text-align: center; background: var(--dark); position: relative; overflow: hidden; }
        .cta::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 70% 70% at 50% 50%, rgba(107,39,55,0.25) 0%, transparent 60%); }
        .cta-eyebrow { font-size: 0.65rem; letter-spacing: 0.5em; text-transform: uppercase; color: var(--amber); margin-bottom: 24px; position: relative; }
        .cta-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(2.8rem,5vw,5.5rem); font-weight: 300; line-height: 1.05; color: var(--cream); margin-bottom: 28px; position: relative; }
        .cta-title em { font-style: italic; color: var(--amber); }
        .cta-body { font-size: 0.88rem; color: var(--stone); line-height: 2; max-width: 520px; margin: 0 auto 44px; position: relative; }
        .cta-btns { display: flex; justify-content: center; gap: 16px; position: relative; flex-wrap: wrap; }

        .market-footer { padding: 50px 60px; background: var(--black); border-top: 1px solid rgba(201,150,58,0.1); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; }
        .footer-logo { font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--amber); }
        .footer-info { font-size: 0.72rem; color: var(--stone); line-height: 1.8; }

        .particles { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
        .particle { position: absolute; width: 1px; height: 1px; background: var(--amber); border-radius: 50%; animation: pFloat linear infinite; opacity: 0; }
        @keyframes pFloat { 0% { transform: translateY(100vh); opacity: 0; } 10% { opacity: 0.4; } 90% { opacity: 0.1; } 100% { transform: translateY(-20px) translateX(30px); opacity: 0; } }

        @media (max-width: 900px) {
          .market-nav { padding: 18px 24px !important; }
          .hero-grid { grid-template-columns: 1fr; gap: 40px; padding: 0 24px; }
          .hero-right { display: none; }
          .section-inner { padding: 0 24px; }
          .channels-grid, .seg-grid, .kpi-grid, .creative-grid, .copy-grid, .format-grid, .tl-phases, .cl-cols, .abt-grid { grid-template-columns: 1fr; }
          .budget-header, .kw-grid { grid-template-columns: 1fr; gap: 40px; }
          .flow-diagram { flex-direction: column; }
          .market-footer { padding: 40px 24px; }
        }
      `}</style>
      
      <div className="cursor" id="market-cursor"></div>
      <div className="cursor-ring" id="market-cursorRing"></div>
      <div className="progress-bar" id="market-progressBar"></div>
      <div className="particles" id="market-particles"></div>

      <nav className="market-nav" id="market-mainNav">
        <div>
          <div className="nav-logo">Terrazza Lounge</div>
          <div className="nav-sub">온라인 마케팅 실행안</div>
        </div>
        <div className="nav-right">
          <a className="nav-link" href="#channels">채널</a>
          <a className="nav-link" href="#budget">예산</a>
          <a className="nav-link" href="#segments">타겟</a>
          <a className="nav-link" href="#kpi">KPI</a>
          <a className="nav-link" href="#timeline">일정</a>
          <a className="nav-link" href="#checklist">체크리스트</a>
        </div>
      </nav>

      <div className="market-section hero">
        <div className="hero-bg"></div>
        <div className="orb orb-a"></div>
        <div className="orb orb-b"></div>
        <div className="hero-grid">
          <div className="hero-left">
            <p className="hero-eyebrow">온라인 광고 · 홍보 · 마케팅 실행안</p>
            <h1 className="hero-title">광고비보다<br/><em>예약 경로</em><br/>설계가 먼저</h1>
            <p className="hero-body">월 120만원 기준. 네이버 플레이스 → 공간대여 플랫폼 → Meta 하이퍼로컬 → Google Search. 낮은 리스크 순서로 쌓는 구조가 맞다. 오픈 첫 90일은 노출을 사는 시기가 아니라 측정 가능한 연결을 만드는 시기다.</p>
            <div className="hero-cta-row">
              <a href="#channels" className="btn-primary">채널 전략 보기</a>
              <a href="#checklist" className="btn-outline">체크리스트 확인</a>
            </div>
          </div>
          <div className="hero-right">
            <div className="summary-card">
              <div className="summary-title">플랜 개요</div>
              <div className="summary-items">
                <div className="sum-row"><span className="sum-label">권장 월 예산</span><span className="sum-val highlight">120만원</span></div>
                <div className="sum-row"><span className="sum-label">확장 예산</span><span className="sum-val">150만원 (성과 기준)</span></div>
                <div className="sum-row"><span className="sum-label">Month 1 핵심 채널</span><span className="sum-val">Meta + Google Search</span></div>
                <div className="sum-row"><span className="sum-label">Month 2 추가</span><span className="sum-val">SpaceCloud / Hourplace</span></div>
                <div className="sum-row"><span className="sum-label">Month 3 목표 (현실적)</span><span className="sum-val">확정 대관 4~7건/월</span></div>
                <div className="sum-row"><span className="sum-label">초반 90일 성공 기준</span><span className="sum-val">리뷰·저장·대관 파이프</span></div>
              </div>
              <div style={{marginTop: '20px', fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: '10px'}}>우선 실행 항목</div>
              <div className="priority-pills">
                <span className="pill pill-p0">P0 네이버 플레이스</span>
                <span className="pill pill-p0">P0 GA4 세팅</span>
                <span className="pill pill-p0">P0 목적 랜딩 2개</span>
                <span className="pill pill-p0">P0 Search 캠페인</span>
                <span className="pill pill-p1">P1 클립·새소식</span>
                <span className="pill pill-p1">P1 리뷰 수집</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="market-section channels" id="channels">
        <div className="section-inner">
          <div className="section-label reveal">매체별 전략</div>
          <h2 className="section-title reveal rd1">낮은 리스크 순서로<br/><em>쌓는 채널 구조</em></h2>
          <p className="section-body reveal rd2">한 번에 모든 채널을 세게 돌리는 건 이 예산에서 비효율적입니다. 리스팅 완성도와 응답 체계가 먼저 갖춰져야 광고비가 덜 샙니다.</p>
          <div className="channels-grid reveal rd2">
            <div className="channel-card">
              <span className="ch-priority ch-high">최고 우선순위</span>
              <div className="ch-icon">📍</div>
              <div className="ch-name">네이버 플레이스</div>
              <div className="ch-role">로컬 발견 · 길찾기 · 저장 · 리뷰 축적. 광고비 0원으로 시작하는 가장 저위험 채널.</div>
              <div className="ch-rule">업체명 정확하게, 대표 사진 1장 전공간 와이드컷. 새로 오픈했어요 오픈 90일 내 반드시 신청. 새소식 주 2회, 클립 주 2~3개. 쿠폰은 마진 훼손 최소 혜택으로.</div>
            </div>
            <div className="channel-card">
              <span className="ch-priority ch-high">높음</span>
              <div className="ch-icon">🏢</div>
              <div className="ch-name">SpaceCloud<br/>Hourplace</div>
              <div className="ch-role">대관 실수요 전환 + 촬영·콘텐츠·감도형 대관. 플랫폼 전환의 핵심 채널.</div>
              <div className="ch-rule">기본 정보·공간 소개·예약 설정 정교하게 먼저. 유료 광고는 리뷰 2개+ 확보 후 테스트. 아워플레이스 슈퍼플레이스 조건을 KPI로 삼는다.</div>
            </div>
            <div className="channel-card">
              <span className="ch-priority ch-high">높음</span>
              <div className="ch-icon">📱</div>
              <div className="ch-name">Meta Ads</div>
              <div className="ch-role">하이퍼로컬 인지도 + 대관 리마케팅. 2개 세그먼트만 운용.</div>
              <div className="ch-rule">로컬 방문 2~4km + 대관 목적 5~10km 분리. 관심사 세분화 과도하면 도달이 막힘. 둘째 달부터 30일 사이트 방문 리타게팅 추가.</div>
            </div>
            <div className="channel-card">
              <span className="ch-priority ch-high">높음</span>
              <div className="ch-icon">🔍</div>
              <div className="ch-name">Google Search</div>
              <div className="ch-role">고의도 키워드 회수. 카페/와인과 공간대여 캠페인 분리 운영.</div>
              <div className="ch-rule">반응형 검색 광고(RSA)로 제목 다양화. 홈페이지 메인이 아닌 목적별 랜딩으로 연결. 처음 90일 Search 중심, YouTube·PMax는 이후.</div>
            </div>
            <div className="channel-card">
              <span className="ch-priority ch-mid">낮음~중간</span>
              <div className="ch-icon">▶</div>
              <div className="ch-name">YouTube</div>
              <div className="ch-role">보조 인지도 + 리마케팅. 6~15초 짧은 영상 1개.</div>
              <div className="ch-rule">Month 2 이후 소액 테스트 권장. 촬영 퀄리티가 낮으면 과감히 생략. 9:16 Shorts 우선.</div>
            </div>
            <div className="channel-card">
              <span className="ch-priority ch-low">낮음 · 나중에</span>
              <div className="ch-icon">⚡</div>
              <div className="ch-name">Google PMax</div>
              <div className="ch-role">확장형 자동화. 모든 Google 인벤토리 접근.</div>
              <div className="ch-rule">전환 시그널이 쌓인 뒤 Month 4 이후 검토. 전환 목표가 명확할수록 쓸모 있음. 공간대여 리드 전용으로만 검토.</div>
            </div>
            <div className="channel-card">
              <span className="ch-priority ch-high">최고 우선순위</span>
              <div className="ch-icon">🗺</div>
              <div className="ch-name">네이버 예약</div>
              <div className="ch-role">대관 상담·투어·프로그램 예약 슬롯.</div>
              <div className="ch-rule">실제 대관 재고와 중복 운영 금지. 초반엔 공간 투어·대관 상담 슬롯부터 시작. 공간대여 예약은 외부 플랫폼 우선.</div>
            </div>
            <div className="channel-card">
              <span className="ch-priority ch-high">높음</span>
              <div className="ch-icon">📊</div>
              <div className="ch-name">GA4 + Supabase</div>
              <div className="ch-role">측정 허브. 광고 → 랜딩 → 문의/예약 클릭 전 구간 추적.</div>
              <div className="ch-rule">generate_lead 이벤트 필수 세팅. UTM 전 채널 통일. Supabase 문의 필드에 utm_source·gclid·fbclid 포함.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="market-section budget" id="budget">
        <div className="section-inner">
          <div className="budget-header">
            <div>
              <div className="section-label reveal">예산 배분</div>
              <h2 className="section-title reveal rd1">월 120만원<br/><em>기준 배분안</em></h2>
              <p className="section-body reveal rd2">순수 미디어비 기준. Google Ads에는 VAT 미포함, Meta 한국 계정은 VAT 적용 가능. 실제 결제액은 더 클 수 있습니다.</p>
            </div>
            <div className="reveal rd2">
              <div style={{padding: '32px', border: '1px solid rgba(201,150,58,0.2)', background: 'rgba(26,22,20,0.7)'}}>
                <div style={{fontSize: '0.62rem', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: '8px'}}>Month 1 → Month 4+</div>
                <div style={{fontFamily: "'Cormorant Garamond', serif", fontSize: '2.8rem', color: 'var(--amber)', lineHeight: 1}}>120만원</div>
                <div style={{fontSize: '0.72rem', color: 'var(--stone)', marginTop: '6px'}}>성과 확인 후 150만원으로 확장</div>
                <div style={{marginTop: '20px', fontSize: '0.78rem', color: 'var(--mist)', lineHeight: 1.9}}>
                  ✓ 100만원 시: YouTube·버퍼 먼저 축소<br/>
                  ✓ 150만원 시: Search·플랫폼 광고 확대
                </div>
              </div>
            </div>
          </div>
          <div className="budget-table-wrap reveal">
            <table className="budget-table">
              <thead>
                <tr>
                  <th>항목</th>
                  <th>Month 1</th>
                  <th>Month 2~3</th>
                  <th>비고</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>네이버 플레이스/지도 운영</td><td className="amount">0원</td><td className="amount">0원</td><td>광고비 아닌 운영 리소스</td></tr>
                <tr><td>Meta Prospecting</td><td className="amount">35만원</td><td className="amount">25만원</td><td>로컬 방문·브랜드 무드</td></tr>
                <tr><td>Meta Retargeting</td><td className="amount">15만원</td><td className="amount">15만원</td><td>사이트·IG 참여자</td></tr>
                <tr><td>Google Search</td><td className="amount">45만원</td><td className="amount">40만원</td><td>공간대여 + 카페/와인 캠페인 분리</td></tr>
                <tr><td>YouTube 짧은 영상</td><td className="amount">10만원</td><td className="amount">10만원</td><td>M2 이후 본격 테스트 권장</td></tr>
                <tr><td>SpaceCloud/Hourplace 유료 노출</td><td className="amount">0~5만원</td><td className="amount">20만원</td><td>리스팅 안정화 후 테스트</td></tr>
                <tr><td>테스트 버퍼</td><td className="amount">15만원</td><td className="amount">10만원</td><td>성과 좋은 채널 증액</td></tr>
                <tr className="total-row">
                  <td>합계</td>
                  <td className="amount" style={{color: 'var(--amber)'}}>120만원</td>
                  <td className="amount" style={{color: 'var(--amber)'}}>120만원</td>
                  <td style={{color: 'var(--stone)'}}>순수 미디어비 기준</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="budget-bars reveal" style={{marginTop: '50px'}}>
            <div style={{fontSize: '0.62rem', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '20px'}}>Month 1 예산 배분 시각화</div>
            <div className="bbar-row"><div className="bbar-label">Google Search</div><div className="bbar-track"><div className="bbar-fill" style={{width: '37.5%', background: 'linear-gradient(to right,#4285F4,#34A853)', animationDelay: '0.1s'}}></div></div><div className="bbar-val">45만원 (37.5%)</div></div>
            <div className="bbar-row"><div className="bbar-label">Meta Prospecting</div><div className="bbar-track"><div className="bbar-fill" style={{width: '29.2%', background: 'linear-gradient(to right,#1877F2,#42B0FF)', animationDelay: '0.25s'}}></div></div><div className="bbar-val">35만원 (29.2%)</div></div>
            <div className="bbar-row"><div className="bbar-label">테스트 버퍼</div><div className="bbar-track"><div className="bbar-fill" style={{width: '12.5%', background: 'linear-gradient(to right,var(--amber),var(--amber-light))', animationDelay: '0.4s'}}></div></div><div className="bbar-val">15만원 (12.5%)</div></div>
            <div className="bbar-row"><div className="bbar-label">Meta Retargeting</div><div className="bbar-track"><div className="bbar-fill" style={{width: '12.5%', background: 'linear-gradient(to right,#1877F2,#42B0FF)', animationDelay: '0.55s'}}></div></div><div className="bbar-val">15만원 (12.5%)</div></div>
            <div className="bbar-row"><div className="bbar-label">YouTube</div><div className="bbar-track"><div className="bbar-fill" style={{width: '8.3%', background: 'linear-gradient(to right,#FF0000,#FF6B6B)', animationDelay: '0.7s'}}></div></div><div className="bbar-val">10만원 (8.3%)</div></div>
          </div>
        </div>
      </div>
      
      <div className="market-section segments" id="segments">
        <div className="section-inner">
          <div className="section-label reveal">타겟 세그먼트</div>
          <h2 className="section-title reveal rd1">4가지 타겟<br/><em>다른 경로 설계</em></h2>
          <p className="section-body reveal rd2">단일 메시지로 묶으면 전부 흐려집니다. 채널별로 다른 메시지, 다른 랜딩을 써야 합니다.</p>
          <div className="seg-grid">
            <div className="seg-card seg-a reveal">
              <div className="seg-name">카페·와인 로컬 방문자</div>
              <div className="seg-geo">방배·내방·서초 2~4km 반경</div>
              <div className="seg-need">조용한 좌석, 감도 있는 분위기, 저녁 와인 한 잔</div>
              <div className="seg-channels">
                <span className="seg-ch">네이버</span><span className="seg-ch">Meta Prospecting</span><span className="seg-ch">Google Search</span>
              </div>
              <div className="seg-msg">"낮엔 커피, 밤엔 와인"</div>
            </div>
            <div className="seg-card seg-b reveal rd1">
              <div className="seg-name">대관 실수요자</div>
              <div className="seg-geo">서초·강남·동작·용산 5~10km</div>
              <div className="seg-need">세미나, 클래스, 소규모 행사, 전시 공간</div>
              <div className="seg-channels">
                <span className="seg-ch">Google Search</span><span className="seg-ch">SpaceCloud</span><span className="seg-ch">Meta 리타게팅</span>
              </div>
              <div className="seg-msg">"대관 가능한 라운지형 공간"</div>
            </div>
            <div className="seg-card seg-c reveal rd2">
              <div className="seg-name">촬영·콘텐츠 수요자</div>
              <div className="seg-geo">서울 남부권 5~10km</div>
              <div className="seg-need">식물, 테라스, 갤러리 무드, 밤 조명</div>
              <div className="seg-channels">
                <span className="seg-ch">Hourplace</span><span className="seg-ch">Meta</span><span className="seg-ch">YouTube</span>
              </div>
              <div className="seg-msg">"지중해 무드·식물·와인 톤"</div>
            </div>
            <div className="seg-card seg-d reveal rd3">
              <div className="seg-name">재방문·예약 검토층</div>
              <div className="seg-geo">사이트 방문자 / IG 반응자</div>
              <div className="seg-need">예약 확정, 문의 전환, 최종 결정</div>
              <div className="seg-channels">
                <span className="seg-ch">Meta 리타게팅</span><span className="seg-ch">Google 리마케팅</span>
              </div>
              <div className="seg-msg">"남은 일정·후기·사례"</div>
            </div>
          </div>
        </div>
      </div>

      <div className="market-section keywords" id="keywords">
        <div className="section-inner">
          <div className="section-label reveal">Google Search 키워드</div>
          <h2 className="section-title reveal rd1">캠페인 2개 분리<br/><em>의도별 랜딩 연결</em></h2>
          <p className="section-body reveal rd2">홈페이지 메인으로 보내지 말고 의도별 랜딩으로 보냅니다. 카페/와인 방문과 공간대여는 완전히 다른 사람입니다.</p>
          <div className="kw-grid">
            <div className="reveal rd1">
              <div className="kw-col-title">카페·와인 캠페인</div>
              <div className="kw-col-sub">→ /visit 랜딩 연결</div>
              <div className="kw-list">
                <div className="kw-item"><span className="kw-type kw-exact">완전일치</span>[방배동 카페]</div>
                <div className="kw-item"><span className="kw-type kw-exact">완전일치</span>[내방역 카페]</div>
                <div className="kw-item"><span className="kw-type kw-exact">완전일치</span>[방배 와인바]</div>
                <div className="kw-item"><span className="kw-type kw-broad">구문일치</span>"서초 조용한 카페"</div>
                <div className="kw-item"><span className="kw-type kw-broad">구문일치</span>"방배 데이트 와인"</div>
              </div>
            </div>
            <div className="reveal rd2">
              <div className="kw-col-title">공간대여 캠페인</div>
              <div className="kw-col-sub">→ /space-rental 랜딩 연결</div>
              <div className="kw-list">
                <div className="kw-item"><span className="kw-type kw-exact">완전일치</span>[방배동 공간대여]</div>
                <div className="kw-item"><span className="kw-type kw-exact">완전일치</span>[서초 세미나 공간]</div>
                <div className="kw-item"><span className="kw-type kw-exact">완전일치</span>[방배 클래스 공간]</div>
                <div className="kw-item"><span className="kw-type kw-exact">완전일치</span>[내방역 대관]</div>
                <div className="kw-item"><span className="kw-type kw-broad">구문일치</span>"서초 갤러리 대관"</div>
                <div className="kw-item"><span className="kw-type kw-broad">구문일치</span>"카페 대관 방배"</div>
              </div>
              <div className="neg-list">
                <div className="neg-title">제외어 키워드</div>
                <div className="neg-items">
                  <span className="neg-tag">알바</span>
                  <span className="neg-tag">창업</span>
                  <span className="neg-tag">인테리어</span>
                  <span className="neg-tag">철거</span>
                  <span className="neg-tag">매물</span>
                  <span className="neg-tag">중고</span>
                  <span className="neg-tag">도매</span>
                  <span className="neg-tag">프랜차이즈</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="market-section kpi" id="kpi">
        <div className="section-inner">
          <div className="section-label reveal">KPI · 벤치마크</div>
          <h2 className="section-title reveal rd1">채널별 목표치<br/><em>보수적 vs 현실적</em></h2>
          <p className="section-body reveal rd2">한국 공식 평균 단가표는 거의 공개되지 않습니다. 공개 벤치마크와 국내 실무 사례를 기준으로 한 계획치입니다.</p>
          <div className="kpi-grid">
            <div className="kpi-card reveal">
              <div className="kpi-channel">Local SEO</div>
              <div className="kpi-name">네이버 플레이스</div>
              <div className="kpi-rows">
                <div className="kpi-header-row"><span className="kpi-hdr">지표</span><span className="kpi-hdr">보수적</span><span className="kpi-hdr" style={{color: 'var(--amber)'}}>현실적</span></div>
                <div className="kpi-row"><span className="kpi-metric">리뷰 수</span><span className="kpi-conservative">20~35개</span><span className="kpi-realistic">35~60개</span></div>
                <div className="kpi-row"><span className="kpi-metric">리뷰 평점</span><span className="kpi-conservative">4.7+</span><span className="kpi-realistic">4.7+</span></div>
                <div className="kpi-row"><span className="kpi-metric">저장 수</span><span className="kpi-conservative">50+</span><span className="kpi-realistic">100+</span></div>
                <div className="kpi-row"><span className="kpi-metric">길찾기 클릭</span><span className="kpi-conservative">60+</span><span className="kpi-realistic">120+</span></div>
              </div>
            </div>
            <div className="kpi-card reveal rd1">
              <div className="kpi-channel">Platform</div>
              <div className="kpi-name">SpaceCloud / Hourplace</div>
              <div className="kpi-rows">
                <div className="kpi-header-row"><span className="kpi-hdr">지표</span><span className="kpi-hdr">보수적</span><span className="kpi-hdr" style={{color: 'var(--amber)'}}>현실적</span></div>
                <div className="kpi-row"><span className="kpi-metric">응답속도</span><span className="kpi-conservative">24h 이내</span><span className="kpi-realistic">1h 이내</span></div>
                <div className="kpi-row"><span className="kpi-metric">Inquiry Rate</span><span className="kpi-conservative">24%</span><span className="kpi-realistic">47%</span></div>
                <div className="kpi-row"><span className="kpi-metric">월 확정 건</span><span className="kpi-conservative">월 24건</span><span className="kpi-realistic">월 47건</span></div>
              </div>
            </div>
            <div className="kpi-card reveal rd2">
              <div className="kpi-channel">Paid Social</div>
              <div className="kpi-name">Meta Ads</div>
              <div className="kpi-rows">
                <div className="kpi-header-row"><span className="kpi-hdr">지표</span><span className="kpi-hdr">보수적</span><span className="kpi-hdr" style={{color: 'var(--amber)'}}>현실적</span></div>
                <div className="kpi-row"><span className="kpi-metric">CPM</span><span className="kpi-conservative">8,000~16,000</span><span className="kpi-realistic">—</span></div>
                <div className="kpi-row"><span className="kpi-metric">CPC</span><span className="kpi-conservative">1,800원 이하</span><span className="kpi-realistic">1,200원 이하</span></div>
                <div className="kpi-row"><span className="kpi-metric">CTR</span><span className="kpi-conservative">0.9%+</span><span className="kpi-realistic">1.3%+</span></div>
                <div className="kpi-row"><span className="kpi-metric">LPV Rate</span><span className="kpi-conservative">55%+</span><span className="kpi-realistic">65%+</span></div>
              </div>
            </div>
            <div className="kpi-card reveal">
              <div className="kpi-channel">Paid Search</div>
              <div className="kpi-name">Google Search</div>
              <div className="kpi-rows">
                <div className="kpi-header-row"><span className="kpi-hdr">지표</span><span className="kpi-hdr">보수적</span><span className="kpi-hdr" style={{color: 'var(--amber)'}}>현실적</span></div>
                <div className="kpi-row"><span className="kpi-metric">CPC</span><span className="kpi-conservative">3,000원 이하</span><span className="kpi-realistic">2,000원 이하</span></div>
                <div className="kpi-row"><span className="kpi-metric">CTR</span><span className="kpi-conservative">5%+</span><span className="kpi-realistic">8%+</span></div>
                <div className="kpi-row"><span className="kpi-metric">전환율</span><span className="kpi-conservative">5%+</span><span className="kpi-realistic">8~12%</span></div>
              </div>
            </div>
            <div className="kpi-card reveal rd1">
              <div className="kpi-channel">Video</div>
              <div className="kpi-name">YouTube</div>
              <div className="kpi-rows">
                <div className="kpi-header-row"><span className="kpi-hdr">지표</span><span className="kpi-hdr">보수적</span><span className="kpi-hdr" style={{color: 'var(--amber)'}}>현실적</span></div>
                <div className="kpi-row"><span className="kpi-metric">CPV</span><span className="kpi-conservative">100원 이하</span><span className="kpi-realistic">60원 이하</span></div>
                <div className="kpi-row"><span className="kpi-metric">tCPM</span><span className="kpi-conservative">3,000~8,000</span><span className="kpi-realistic">—</span></div>
                <div className="kpi-row"><span className="kpi-metric">VTR</span><span className="kpi-conservative">20%+</span><span className="kpi-realistic">30%+</span></div>
              </div>
            </div>
            <div className="kpi-card reveal rd2">
              <div className="kpi-channel">Overall · Month 3</div>
              <div className="kpi-name">통합 목표치</div>
              <div className="kpi-rows">
                <div className="kpi-header-row"><span className="kpi-hdr">지표</span><span className="kpi-hdr">보수적</span><span className="kpi-hdr" style={{color: 'var(--amber)'}}>현실적</span></div>
                <div className="kpi-row"><span className="kpi-metric">유료 유입 세션</span><span className="kpi-conservative">550~800</span><span className="kpi-realistic">850~1,400</span></div>
                <div className="kpi-row"><span className="kpi-metric">외부 예약 클릭</span><span className="kpi-conservative">12~20건</span><span className="kpi-realistic">25~40건</span></div>
                <div className="kpi-row"><span className="kpi-metric">대관 실질 문의</span><span className="kpi-conservative">4~7건</span><span className="kpi-realistic">8~12건</span></div>
                <div className="kpi-row"><span className="kpi-metric">확정 대관</span><span className="kpi-conservative">2~4건</span><span className="kpi-realistic">4~7건</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="market-section creative" id="creative">
        <div className="section-inner">
          <div className="section-label reveal">크리에이티브 전략</div>
          <h2 className="section-title reveal rd1">채널별 다른 메시지<br/><em>장면 전환을 판다</em></h2>
          <p className="section-body reveal rd2">검색은 정확한 이유. Meta·YouTube는 기능보다 장면 전환. 플랫폼 리스팅은 감성보다 신뢰와 이용조건 먼저.</p>
          <div className="creative-grid">
            <div className="creative-card reveal">
              <div className="cc-num">01</div>
              <div className="cc-type">Meta / YouTube Reel</div>
              <div className="cc-title">Day → Night<br/>Transition</div>
              <div className="cc-steps">
                <div className="cc-step"><div className="cc-step-time">0~2초</div><div className="cc-step-desc">간판·외관 첫 장면. 위치와 공간 전달.</div></div>
                <div className="cc-step"><div className="cc-step-time">2~6초</div><div className="cc-step-desc">커피 추출 + 좌석 전경. 낮 카페 무드.</div></div>
                <div className="cc-step"><div className="cc-step-time">6~10초</div><div className="cc-step-desc">와인 잔 + 낮은 조도. 저녁 라운지 전환.</div></div>
                <div className="cc-step"><div className="cc-step-time">10~12초</div><div className="cc-step-desc">공간대여 가능 / 예약 플랫폼 보기 CTA.</div></div>
              </div>
            </div>
            <div className="creative-card reveal rd1">
              <div className="cc-num">02</div>
              <div className="cc-type">Meta Feed Carousel</div>
              <div className="cc-title">Use-case<br/>카드 3+1장</div>
              <div className="cc-steps">
                <div className="cc-step"><div className="cc-step-time">1장</div><div className="cc-step-desc">카페·와인 라운지 — 낮과 밤의 분위기.</div></div>
                <div className="cc-step"><div className="cc-step-time">2장</div><div className="cc-step-desc">세미나·클래스 — 가변홀 세팅 예시.</div></div>
                <div className="cc-step"><div className="cc-step-time">3장</div><div className="cc-step-desc">전시·촬영·프라이빗 모임.</div></div>
                <div className="cc-step"><div className="cc-step-time">4장</div><div className="cc-step-desc">방배동 / 예약 가능 / 문의 CTA.</div></div>
              </div>
            </div>
            <div className="creative-card reveal rd2">
              <div className="cc-num">03</div>
              <div className="cc-type">Search Landing Hero</div>
              <div className="cc-title">목적별<br/>랜딩 2개</div>
              <div className="cc-steps">
                <div className="cc-step"><div className="cc-step-time">/visit</div><div className="cc-step-desc">위치·영업시간·대표 사진·네이버 플레이스 CTA. 카페·와인 방문 목적.</div></div>
                <div className="cc-step"><div className="cc-step-time">/space</div><div className="cc-step-desc">용도·좌석·요금 구조·장비·사례·FAQ·예약 버튼·문의 폼. 대관 목적.</div></div>
                <div className="cc-step"><div className="cc-step-time">Sticky</div><div className="cc-step-desc">예약 플랫폼 보기 / 대관 문의. 스크롤 끝까지 고정 CTA.</div></div>
              </div>
            </div>
            <div className="creative-card reveal rd3">
              <div className="cc-num">04</div>
              <div className="cc-type">네이버 클립</div>
              <div className="cc-title">6~15초<br/>장소 클립</div>
              <div className="cc-steps">
                <div className="cc-step"><div className="cc-step-time">포맷</div><div className="cc-step-desc">9:16 세로형. 장소 태그·스티커 필수 포함.</div></div>
                <div className="cc-step"><div className="cc-step-time">주 2~3개</div><div className="cc-step-desc">낮 커피 무드 → 밤 와인 전환. 대관 세팅 예시.</div></div>
                <div className="cc-step"><div className="cc-step-time">순서</div><div className="cc-step-desc">전공간 → 낮 → 밤 → 대관 → 부대시설.</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="market-section copy-section">
        <div className="section-inner">
          <div className="section-label reveal">카피 예시</div>
          <h2 className="section-title reveal rd1">용도별<br/><em>카피 가안</em></h2>
          <div className="copy-grid">
            <div className="copy-card reveal">
              <div className="copy-use">로컬 방문</div>
              <div className="copy-kr">방배동의 낮과 밤을 담은 한 공간. 낮에는 커피, 저녁에는 와인. 조용히 머물고 싶은 날의 Terrazza Lounge.</div>
              <div className="copy-en">Coffee by day, wine by night. A calm lounge in Bangbae for slow afternoons and quieter evenings.</div>
            </div>
            <div className="copy-card reveal rd1">
              <div className="copy-use">공간 대관</div>
              <div className="copy-kr">세미나, 클래스, 전시 오프닝까지. 카페 무드가 살아있는 라운지형 공간대여.</div>
              <div className="copy-en">A flexible lounge for seminars, classes, private gatherings and small exhibitions.</div>
            </div>
            <div className="copy-card reveal rd2">
              <div className="copy-use">오픈 초반</div>
              <div className="copy-kr">오픈 기념, 공간 투어·대관 상담 오픈. 실제 동선과 사용 예시를 직접 확인해보세요.</div>
              <div className="copy-en">Opening weeks: book a short venue tour and see the layout, flow and use cases in person.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="market-section format">
        <div className="section-inner">
          <div className="section-label reveal">포맷 · 규격</div>
          <h2 className="section-title reveal rd1">채널별<br/><em>권장 규격</em></h2>
          <div className="format-grid">
            <div className="fmt-card reveal"><div className="fmt-icon">📍</div><div><div className="fmt-channel">네이버 대표 사진</div><div className="fmt-spec">1200×750px 권장</div><div className="fmt-concept">전공간 와이드 · 식물·테라스·좌석 구조</div><div className="fmt-tip">첫 장이 대표 사진이 되도록 순서 통제</div></div></div>
            <div className="fmt-card reveal rd1"><div className="fmt-icon">🎬</div><div><div className="fmt-channel">네이버 클립</div><div className="fmt-spec">9:16 세로형</div><div className="fmt-concept">낮 커피 → 밤 와인 전환 · 6~15초</div><div className="fmt-tip">장소 태그·스티커 포함 필수</div></div></div>
            <div className="fmt-card reveal rd2"><div className="fmt-icon">📸</div><div><div className="fmt-channel">Meta Feed</div><div className="fmt-spec">1080×1350 또는 1080×1080</div><div className="fmt-concept">use-case 카드 3장 · 카페/와인/대관</div><div className="fmt-tip">텍스트는 이미지보다 캡션에 실음</div></div></div>
            <div className="fmt-card reveal rd3"><div className="fmt-icon">📲</div><div><div className="fmt-channel">Meta Stories · Reels</div><div className="fmt-spec">1080×1920 (9:16)</div><div className="fmt-concept">3초 훅 + 공간 전환 + CTA</div><div className="fmt-tip">상하단 안전영역 비우기</div></div></div>
            <div className="fmt-card reveal"><div className="fmt-icon">🖼</div><div><div className="fmt-channel">Google Image Assets</div><div className="fmt-spec">1.91:1 (1200×628) · 1:1 (1200×1200)</div><div className="fmt-concept">공간 전경 + 손님 장면 + 좌석 구조</div><div className="fmt-tip">향후 PMax 자산으로 재사용 가능</div></div></div>
            <div className="fmt-card reveal rd1"><div className="fmt-icon">▶</div><div><div className="fmt-channel">YouTube Shorts · Video</div><div className="fmt-spec">9:16 · 16:9 · 1:1</div><div className="fmt-concept">공간 무드 숏컷 · 6~15초</div><div className="fmt-tip">촬영 퀄리티가 낮으면 과감히 생략</div></div></div>
          </div>
        </div>
      </div>

      <div className="market-section flow">
        <div className="section-inner">
          <div className="section-label reveal">예약 플로우 · 기술 연동</div>
          <h2 className="section-title reveal rd1">광고 → 랜딩 →<br/><em>예약·문의 전환</em></h2>
          <p className="section-body reveal rd2">광고를 홈페이지 메인으로 던지지 마세요. 방문용과 공간대여용 목적 페이지 2개를 분리해야 합니다. GitHub Pages + Supabase 조합이면 충분합니다.</p>
          <div className="flow-diagram reveal rd2" style={{marginTop: '50px'}}>
            <div className="flow-node"><div className="fn-icon">📣</div><div className="fn-label">광고 유입</div><div className="fn-desc">Meta·Google·네이버·인스타</div></div>
            <div className="flow-arrow">→</div>
            <div className="flow-node"><div className="fn-icon">🎯</div><div className="fn-label">목적 랜딩</div><div className="fn-desc">/visit 또는 /space-rental</div></div>
            <div className="flow-arrow">→</div>
            <div className="flow-node"><div className="fn-icon">👆</div><div className="fn-label">CTA 클릭</div><div className="fn-desc">플랫폼 이동 또는 문의 제출</div></div>
            <div className="flow-arrow">→</div>
            <div className="flow-node"><div className="fn-icon">💾</div><div className="fn-label">Supabase</div><div className="fn-desc">리드 DB + UTM 저장</div></div>
            <div className="flow-arrow">→</div>
            <div className="flow-node"><div className="fn-icon">🔔</div><div className="fn-label">알림·회신</div><div className="fn-desc">당일 1차 회신 필수</div></div>
            <div className="flow-arrow">→</div>
            <div className="flow-node" style={{borderColor: 'var(--amber)'}}><div className="fn-icon">✅</div><div className="fn-label">예약 확정</div><div className="fn-desc">계약금 20% 입금</div></div>
          </div>

          <div style={{marginTop: '60px'}} className="reveal">
            <div style={{fontSize: '0.62rem', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '24px'}}>GA4 필수 이벤트</div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(201,150,58,0.1)', border: '1px solid rgba(201,150,58,0.1)'}}>
              <div style={{background: 'var(--black)', padding: '20px 18px'}}>
                <div style={{fontSize: '0.7rem', color: 'var(--amber)', fontFamily: 'monospace', marginBottom: '8px'}}>generate_lead</div>
                <div style={{fontSize: '0.75rem', color: 'var(--mist)'}}>Supabase 문의 제출 성공</div>
                <div style={{fontSize: '0.65rem', color: 'var(--stone)', marginTop: '6px'}}>GA4 · Google Ads 전환 · Meta Lead</div>
              </div>
              <div style={{background: 'var(--black)', padding: '20px 18px'}}>
                <div style={{fontSize: '0.7rem', color: 'var(--amber)', fontFamily: 'monospace', marginBottom: '8px'}}>click_booking_spacecloud</div>
                <div style={{fontSize: '0.75rem', color: 'var(--mist)'}}>스페이스클라우드 CTA 클릭</div>
                <div style={{fontSize: '0.65rem', color: 'var(--stone)', marginTop: '6px'}}>GA4 custom event</div>
              </div>
              <div style={{background: 'var(--black)', padding: '20px 18px'}}>
                <div style={{fontSize: '0.7rem', color: 'var(--amber)', fontFamily: 'monospace', marginBottom: '8px'}}>click_booking_hourplace</div>
                <div style={{fontSize: '0.75rem', color: 'var(--mist)'}}>아워플레이스 CTA 클릭</div>
                <div style={{fontSize: '0.65rem', color: 'var(--stone)', marginTop: '6px'}}>GA4 custom event</div>
              </div>
              <div style={{background: 'var(--black)', padding: '20px 18px'}}>
                <div style={{fontSize: '0.7rem', color: 'var(--amber)', fontFamily: 'monospace', marginBottom: '8px'}}>click_naver_place</div>
                <div style={{fontSize: '0.75rem', color: 'var(--mist)'}}>방문·길찾기 CTA 클릭</div>
                <div style={{fontSize: '0.65rem', color: 'var(--stone)', marginTop: '6px'}}>GA4 custom event</div>
              </div>
              <div style={{background: 'var(--black)', padding: '20px 18px'}}>
                <div style={{fontSize: '0.7rem', color: 'var(--amber)', fontFamily: 'monospace', marginBottom: '8px'}}>view_location_map</div>
                <div style={{fontSize: '0.75rem', color: 'var(--mist)'}}>지도 열기</div>
                <div style={{fontSize: '0.65rem', color: 'var(--stone)', marginTop: '6px'}}>GA4 custom event</div>
              </div>
              <div style={{background: 'var(--black)', padding: '20px 18px'}}>
                <div style={{fontSize: '0.7rem', color: 'var(--amber)', fontFamily: 'monospace', marginBottom: '8px'}}>call_click</div>
                <div style={{fontSize: '0.75rem', color: 'var(--mist)'}}>전화 클릭</div>
                <div style={{fontSize: '0.65rem', color: 'var(--stone)', marginTop: '6px'}}>GA4 custom event</div>
              </div>
            </div>
          </div>

          <div className="utm-box reveal" style={{marginTop: '40px'}}>
            <div className="utm-title">UTM 예시</div>
            <div className="utm-line">
              https://terrazza-lounge.kr/space-rental<br/>
              ?<span className="utm-param">utm_source</span>=<span className="utm-val">meta</span><br/>
              &amp;<span className="utm-param">utm_medium</span>=<span className="utm-val">paid_social</span><br/>
              &amp;<span className="utm-param">utm_campaign</span>=<span className="utm-val">launch_bangbae_m1</span><br/>
              &amp;<span className="utm-param">utm_content</span>=<span className="utm-val">reel_daynight_v1</span><br/>
              &amp;<span className="utm-param">utm_term</span>=<span className="utm-val">radius_3km</span>
            </div>
          </div>
        </div>
      </div>

      <div className="market-section abt">
        <div className="section-inner">
          <div className="section-label reveal">A/B 테스트</div>
          <h2 className="section-title reveal rd1">우선 검증해야 할<br/><em>6가지 실험</em></h2>
          <div className="abt-grid">
            <div className="abt-card reveal"><div className="abt-label">Meta 크리에이티브</div><div className="abt-test">영상 포맷 테스트</div><div className="abt-cols"><div className="abt-opt abt-a">A: 낮→밤 전환 Reel</div><div className="abt-opt abt-b">B: 정적 와이드컷</div></div><div className="abt-kpi">판단 기준: <span>CTR, LPV rate</span></div></div>
            <div className="abt-card reveal rd1"><div className="abt-label">Hero 메시지</div><div className="abt-test">랜딩 메인 카피</div><div className="abt-cols"><div className="abt-opt abt-a">A: 낮엔 커피, 밤엔 와인</div><div className="abt-opt abt-b">B: 세미나·전시·대관</div></div><div className="abt-kpi">판단 기준: <span>대관 리드수</span></div></div>
            <div className="abt-card reveal rd2"><div className="abt-label">CTA 문구</div><div className="abt-test">버튼 텍스트</div><div className="abt-cols"><div className="abt-opt abt-a">A: 예약 플랫폼 보기</div><div className="abt-opt abt-b">B: 대관 문의</div></div><div className="abt-kpi">판단 기준: <span>outbound click / lead ratio</span></div></div>
            <div className="abt-card reveal"><div className="abt-label">네이버 대표 사진</div><div className="abt-test">썸네일 이미지</div><div className="abt-cols"><div className="abt-opt abt-a">A: 전공간 와이드</div><div className="abt-opt abt-b">B: 야간 와인 무드</div></div><div className="abt-kpi">판단 기준: <span>네이버 저장·클릭</span></div></div>
            <div className="abt-card reveal rd1"><div className="abt-label">Search 헤드라인</div><div className="abt-test">광고 제목 순서</div><div className="abt-cols"><div className="abt-opt abt-a">A: 공간대여 먼저</div><div className="abt-opt abt-b">B: 카페 라운지 먼저</div></div><div className="abt-kpi">판단 기준: <span>CTR, 전환율</span></div></div>
            <div className="abt-card reveal rd2"><div className="abt-label">플랫폼 리스팅</div><div className="abt-test">제목 프레이밍</div><div className="abt-cols"><div className="abt-opt abt-a">A: 용도 우선</div><div className="abt-opt abt-b">B: 무드 우선</div></div><div className="abt-kpi">판단 기준: <span>inquiry rate, 예약율</span></div></div>
          </div>
        </div>
      </div>

      <div className="market-section timeline" id="timeline">
        <div className="section-inner">
          <div className="section-label reveal">첫 3개월 + 6개월 로드맵</div>
          <h2 className="section-title reveal rd1">세팅 → 최적화 →<br/><em>확장의 순서</em></h2>
          <div className="tl-phases">
            <div className="tl-phase reveal">
              <div className="tl-phase-num">01</div>
              <div className="tl-phase-name">Month 1 · 세팅</div>
              <div className="tl-phase-title">측정 가능한<br/>연결 만들기</div>
              <div className="tl-items">
                <div className="tl-item"><div className="tl-dot"></div>GA4·UTM·Pixel·Supabase 이벤트 세팅</div>
                <div className="tl-item"><div className="tl-dot"></div>네이버 플레이스 리스팅 완성</div>
                <div className="tl-item"><div className="tl-dot"></div>SpaceCloud/Hourplace 리스팅 완성</div>
                <div className="tl-item"><div className="tl-dot"></div>사진·영상 1차 촬영</div>
                <div className="tl-item"><div className="tl-dot"></div>Meta 하이퍼로컬 캠페인 시작</div>
                <div className="tl-item"><div className="tl-dot"></div>Google Search 2캠페인 분리 시작</div>
                <div className="tl-item"><div className="tl-dot"></div>네이버 새로오픈·새소식·쿠폰 운영</div>
                <div className="tl-item"><div className="tl-dot"></div>/visit, /space-rental 랜딩 오픈</div>
              </div>
            </div>
            <div className="tl-phase reveal rd1">
              <div className="tl-phase-num">02</div>
              <div className="tl-phase-name">Month 2~3 · 최적화</div>
              <div className="tl-phase-title">리타게팅 +<br/>플랫폼 광고</div>
              <div className="tl-items">
                <div className="tl-item"><div className="tl-dot"></div>랜딩 페이지 A/B 테스트 시작</div>
                <div className="tl-item"><div className="tl-dot"></div>리타게팅 세그먼트 가동</div>
                <div className="tl-item"><div className="tl-dot"></div>SpaceCloud/Hourplace 소액 광고 테스트</div>
                <div className="tl-item"><div className="tl-dot"></div>YouTube 짧은 영상 테스트</div>
                <div className="tl-item"><div className="tl-dot"></div>네이버 클립 주 2~3개 운영</div>
                <div className="tl-item"><div className="tl-dot"></div>리뷰 수집 동선 설계 및 운영</div>
                <div className="tl-item"><div className="tl-dot"></div>예산 재배분 (성과 기준)</div>
              </div>
            </div>
            <div className="tl-phase reveal rd2">
              <div className="tl-phase-num">03</div>
              <div className="tl-phase-name">Month 4~6 · 확장</div>
              <div className="tl-phase-title">성과 기반<br/>채널 확장</div>
              <div className="tl-items">
                <div className="tl-item"><div className="tl-dot"></div>저성과 크리에이티브 컷 + 고성과 증액</div>
                <div className="tl-item"><div className="tl-dot"></div>실제 행사 사진·후기형 광고 전환</div>
                <div className="tl-item"><div className="tl-dot"></div>Hourplace 슈퍼플레이스 조건 추적</div>
                <div className="tl-item"><div className="tl-dot"></div>Google PMax 공간대여 리드 전용 검토</div>
                <div className="tl-item"><div className="tl-dot"></div>채널 컷 및 예산 집중화</div>
                <div className="tl-item"><div className="tl-dot"></div>150만원 확장 여부 판단</div>
              </div>
            </div>
          </div>
          <div style={{marginTop: '40px', padding: '28px 32px', border: '1px solid rgba(201,150,58,0.15)', background: 'rgba(201,150,58,0.04)', fontSize: '0.85rem', color: 'var(--mist)', lineHeight: 2}} className="reveal">
            💡 <strong style={{color: 'var(--amber)'}}>핵심 한 줄</strong>: Terrazza Lounge는 "예쁜 공간 광고"보다 "방배동에서 실제로 찾아오고 예약하게 만드는 경로 설계"가 먼저다. 오픈 첫 90일은 노출을 사는 시기가 아니라, 네이버와 예약 플랫폼과 홈페이지 사이의 측정 가능한 연결을 만드는 시기다.
          </div>
        </div>
      </div>

      <div className="market-section checklist" id="checklist">
        <div className="section-inner">
          <div className="section-label reveal">우선순위 체크리스트</div>
          <h2 className="section-title reveal rd1">P0 → P1 → P2<br/><em>순서대로 완료</em></h2>
          <div className="cl-cols">
            <div className="cl-group reveal">
              <div className="cl-group-title cl-p0-title">P0 · 즉시 실행</div>
              <div className="cl-items">
                {renderCheckItem(0, '네이버 업체명·카테고리·설명 정비', '상호 정확, 키워드 억지 삽입 없음')}
                {renderCheckItem(1, '대표 사진 1장 + 추가 사진 15~20장', '낮/밤/대관 컷 포함, 순서 확정')}
                {renderCheckItem(2, '새로 오픈했어요 신청', '오픈 90일 이내 등록 필수')}
                {renderCheckItem(3, '/visit, /space-rental 목적 페이지', '각 페이지 CTA 2개 이상')}
                {renderCheckItem(4, 'Supabase 문의 폼 + UTM 필드', '테스트 문의 3회 이상 성공')}
                {renderCheckItem(5, 'GA4 generate_lead + 외부예약 이벤트', 'DebugView에서 수집 확인')}
                {renderCheckItem(6, 'Google Search 캠페인 2개 분리', '카페/와인 vs 공간대여 분리')}
                {renderCheckItem(7, 'Meta 캠페인 2개 분리', '로컬 방문 vs 대관 목적 분리')}
              </div>
            </div>
            <div className="cl-group reveal rd1">
              <div className="cl-group-title cl-p1-title">P1 · 1개월 내</div>
              <div className="cl-items">
                {renderCheckItem(8, '네이버 새소식 주 2회 운영', '4주 연속 게시')}
                {renderCheckItem(9, '네이버 클립 주 2~3개 운영', '장소 태그 포함 8개+ 누적')}
                {renderCheckItem(10, 'SpaceCloud/Hourplace 사례컷 업로드', 'use-case별 사진 묶음 완성')}
                {renderCheckItem(11, '리뷰 수집 동선 설계', '카페·와인·대관별 요청 문구 준비')}
                {renderCheckItem(12, 'Hourplace 응답·캘린더 KPI 운영', '응답 누락 0, 일정 최신화')}
                {renderCheckItem(13, 'Meta 리타게팅 세그먼 가동', '사이트 30일 / IG 365일')}
              </div>
            </div>
            <div className="cl-group reveal rd2">
              <div className="cl-group-title cl-p2-title">P2 · 데이터 확인 후</div>
              <div className="cl-items">
                {renderCheckItem(14, 'YouTube 짧은 영상 테스트', '영상 자산 제작 후 소액 집행')}
                {renderCheckItem(15, '플랫폼 유료 노출 테스트', '리스팅 안정화 후 2주 테스트')}
                {renderCheckItem(16, 'Google PMax 검토', '전환 데이터 누적 후 판단')}
                {renderCheckItem(17, '저성과 채널 컷', '무드형 클릭만 많고 예약 없는 크리에이티브 종료')}
                {renderCheckItem(18, '예산 150만원 확장 여부 판단', 'Search·플랫폼 광고 우선 증액')}
                {renderCheckItem(19, '후기형 광고 크리에이티브 전환', '실제 행사 사진·사례 기반')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="market-section cta" id="cta">
        <p className="cta-eyebrow">운영계획서와 함께 보기</p>
        <h2 className="cta-title">광고보다<br/><em>경로 설계</em>가 먼저</h2>
        <p className="cta-body">이 예산으로 카페·와인 매출 ROAS를 깔끔하게 뽑아내긴 어렵습니다. 대신 로컬 발견 신호와 대관 파이프라인을 키우는 데는 충분합니다. 초반 90일의 성공 기준은 광고 수익률이 아니라 리뷰 속도, 저장·길찾기, 외부예약 클릭, 문의 응답속도, 확정 대관입니다.</p>
        <div className="cta-btns">
          <a href="#checklist" className="btn-primary">P0 체크리스트 시작</a>
          <a href="#channels" className="btn-outline">채널 전략 다시 보기</a>
        </div>
        <div style={{marginTop: '80px', display: 'flex', justifyContent: 'center', gap: '60px', flexWrap: 'wrap', position: 'relative'}}>
          <div style={{textAlign: 'center'}}><div style={{fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: '8px'}}>월 예산</div><div style={{fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', color: 'var(--amber)'}}>120만원</div></div>
          <div style={{width: '1px', background: 'rgba(201,150,58,0.15)'}}></div>
          <div style={{textAlign: 'center'}}><div style={{fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: '8px'}}>Month 1 핵심</div><div style={{fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', color: 'var(--amber)'}}>Meta + Search</div></div>
          <div style={{width: '1px', background: 'rgba(201,150,58,0.15)'}}></div>
          <div style={{textAlign: 'center'}}><div style={{fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: '8px'}}>90일 목표</div><div style={{fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', color: 'var(--amber)'}}>측정 가능한 연결</div></div>
        </div>
      </div>

      <div className="market-footer">
        <div>
          <div className="footer-logo">Terrazza Lounge</div>
          <div style={{fontSize: '0.6rem', color: 'var(--stone)', marginTop: '4px', letterSpacing: '0.15em'}}>온라인 마케팅 실행안</div>
        </div>
        <div className="footer-info">서울 서초구 방배동 807-17<br/>월 120만원 기준 · 순수 미디어비 기준 (VAT 별도)</div>
        <div style={{fontSize: '0.65rem', color: 'rgba(138,128,112,0.4)'}}>GitHub Pages + Supabase + GA4 조합 권장</div>
      </div>
    </div>
  );
};
