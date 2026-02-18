import React, { useRef, useEffect, useState } from 'react';
import './App.css';

const App = () => {
  const canvasRef = useRef(null);
  const [note, setNote] = useState("");
  const [timeLeft, setTimeLeft] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [speed, setSpeed] = useState(1); // Growth speed state
  const mouseRef = useRef({ x: 0, y: 0 });

  const seededRandom = (s) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  const loveNotes = [
    "A special pink bouquet for my favorite girl.",
    "I hope your day is as lovely and aesthetic as you are.",
    "Just like these roses, you make everything more beautiful.",
    "Sending you all the pink vibes and all my love.",
    "You're the most beautiful flower in the whole world, Sara.",
    "Thinking of you always makes my heart bloom.",
    "To the girl who deserves all the flowers in the world.",
    "Stay sweet, stay girly, stay you. Love you, Sara."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow - now;
      setTimeLeft(`${Math.floor(diff / 3600000)}h ${Math.floor((diff / 60000) % 60)}m`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const today = new Date();
    const isAnniversary = today.getMonth() === 4 && today.getDate() === 24;
    const daySeed = today.getFullYear() * 1000 + today.getMonth() * 100 + today.getDate();

    setNote(isAnniversary ? "Happy Anniversary, Sara! May 24th is our day. ❤️" : loveNotes[daySeed % loveNotes.length]);

    let frame = 0;
    const bouquet = [];
    const types = ['round', 'pointed', 'berry', 'sprig', 'rose'];
    
    for (let i = 0; i < 15; i++) {
      const hue = isAnniversary ? 0 : (330 + seededRandom(daySeed + i) * 30);
      const flowerColor = `hsl(${hue}, ${70 + seededRandom(daySeed + i) * 20}%, ${75 + seededRandom(daySeed + i) * 10}%)`;

      bouquet.push({
        x: 60 + seededRandom(daySeed + i) * 280,
        y: 50 + seededRandom(daySeed + i + 1) * 240,
        z: seededRandom(daySeed + i + 9), 
        type: isAnniversary ? 'rose' : types[Math.floor(seededRandom(daySeed + i + 2) * types.length)],
        size: 15 + seededRandom(daySeed + i + 3) * 25,
        petals: 5 + Math.floor(seededRandom(daySeed + i + 4) * 8),
        color: flowerColor,
        tilt: (seededRandom(daySeed + i + 6) - 0.5) * 0.8,
        delay: i * 8,
        curveX: 150 + seededRandom(daySeed + i + 7) * 100 
      });
    }

    bouquet.sort((a, b) => a.z - b.z);

    const drawPetal = (c, size, angle, color) => {
      c.save();
      c.rotate(angle);
      c.beginPath();
      c.moveTo(0, 0);
      c.bezierCurveTo(-size, -size * 1.2, size, -size * 1.2, 0, 0);
      c.fillStyle = color;
      c.fill();
      c.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.4)';
      c.stroke();
      c.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bx = 200, by = 470; 
      const globalSway = Math.sin(frame * 0.02) * 5;

      bouquet.forEach((f) => {
        const p = Math.max(0, Math.min((frame - f.delay) / 80, 1));
        if (p <= 0) return;

        // Interaction: Calculate distance to mouse
        const dx = mouseRef.current.x - f.x;
        const dy = mouseRef.current.y - f.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const jiggle = dist < 50 ? (50 - dist) * 0.2 * Math.sin(frame * 0.5) : 0;

        const currentSway = (p === 1) ? (globalSway * f.z) + jiggle : 0;
        const startX = bx + (f.z - 0.5) * 35;
        const cx = (startX + (f.x - startX) * p) + currentSway;
        const cy = (by + (f.y - by) * p);

        ctx.strokeStyle = isDark ? '#4a6340' : '#6d8c60';
        ctx.lineWidth = 1.5 + (f.z * 1.5);
        ctx.beginPath();
        ctx.moveTo(startX, by);
        ctx.quadraticCurveTo(f.curveX + currentSway, 350, cx, cy);
        ctx.stroke();

        if (p > 0.95) {
          const bP = Math.min((frame - f.delay - 80) / 40, 1);
          if (bP <= 0) return;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(f.tilt + (currentSway * 0.01));
          const s = f.size * bP;

          if (f.type === 'rose') {
            for (let layer = 3; layer > 0; layer--) {
              const layerSize = s * (layer / 3);
              const layerColor = layer === 1 ? f.color : `hsl(${f.color.split(',')[0].slice(4)}, 80%, ${isDark ? 30 + (layer * 8) : 60 + (layer * 8)}%)`;
              for (let j = 0; j < 6; j++) drawPetal(ctx, layerSize, (j * 1.05) + (layer * 0.5), layerColor);
            }
          } else {
            ctx.fillStyle = f.color;
            for (let j = 0; j < f.petals; j++) {
              ctx.rotate((Math.PI * 2) / f.petals);
              ctx.beginPath(); ctx.moveTo(0, 0);
              ctx.bezierCurveTo(-s, -s*1.2, s, -s*1.2, 0, 0);
              ctx.fill(); ctx.stroke();
            }
          }
          ctx.restore();
        }
      });

      // Ribbon
      ctx.fillStyle = isDark ? '#ad1457' : '#ffc1e3';
      ctx.beginPath();
      ctx.ellipse(bx - 18, 400, 18, 12, -0.4, 0, Math.PI * 2);
      ctx.ellipse(bx + 18, 400, 18, 12, 0.4, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      frame += speed; // Use speed state
      requestAnimationFrame(animate);
    };
    animate();
  }, [isDark, speed]);

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const downloadImage = async () => {
    await document.fonts.load('10pt "Dancing Script"');
    const bouquetCanvas = canvasRef.current;
    const finalCanvas = document.createElement('canvas');
    const fCtx = finalCanvas.getContext('2d');
    finalCanvas.width = 500; finalCanvas.height = 850;
    fCtx.fillStyle = isDark ? "#1a1a1a" : "#fffcfd"; 
    fCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
    fCtx.textAlign = "center";
    fCtx.fillStyle = isDark ? "#ff80ab" : "#ad1457"; 
    fCtx.font = "italic 36px 'Dancing Script', cursive";
    fCtx.fillText("Todays flowers for Sara", 250, 80);
    fCtx.drawImage(bouquetCanvas, 50, 130);
    fCtx.fillStyle = isDark ? "#f48fb1" : "#d81b60"; 
    fCtx.font = "italic 24px 'Dancing Script', cursive"; 
    fCtx.fillText(`"${note}"`, 250, 700);
    fCtx.fillStyle = isDark ? "#ad1457" : "#d81b60"; 
    fCtx.fillText("Made with love by Coco", 250, 805);
    const link = document.createElement('a'); 
    link.download = `sara-bouquet.png`; 
    link.href = finalCanvas.toDataURL(); link.click();
  };

  return (
    <div className={`container ${isDark ? 'dark-theme' : ''}`}>
      <button className="theme-toggle" onClick={() => setIsDark(!isDark)}>
        {isDark ? '☀️ Light' : '🌙 Dark'}
      </button>
      
      <div className="card aesthetic">
        <h1 className="title pink">Todays flowers for Sara</h1>
        
        <div className="canvas-wrapper">
          <canvas 
            ref={canvasRef} 
            width={400} 
            height={500} 
            onMouseMove={handleMouseMove}
          />
        </div>

        <p className="love-note pink">"{note}"</p>

        {/* Growth Speed Slider */}
        <div className="slider-container">
          <label>Growth Speed</label>
          <input 
            type="range" 
            min="0.1" 
            max="3" 
            step="0.1" 
            value={speed} 
            onChange={(e) => setSpeed(parseFloat(e.target.value))} 
            className="pink-slider"
          />
        </div>

        <div className="actions">
          <button className="btn pink-btn" onClick={() => window.location.reload()}>Replay</button>
          <button className="btn primary pink-btn-main" onClick={downloadImage}>Save Card</button>
        </div>

        <div className="footer">
          <p className="date-text">{new Date().toDateString()}</p>
          <p className="countdown pink">Next surprise in: {timeLeft}</p>
        </div>
      </div>
    </div>
  );
};

export default App;
