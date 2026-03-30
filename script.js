/* ============================================================
   BODA GERSON & EMILY · 09·05·2026
   script.js v2 — Canvas de partículas, pétalos, slides, formulario
   ============================================================ */
'use strict';

/* ⚠️  Reemplaza con tu URL de Google Apps Script */
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyVjhlEUq7rE6kIEN0abimNN3rW0WZmPgLKiC-lJUa1Kij3KfnAj7CirefAigHiJ1dR/exec';

/* ============================================================
   CANVAS DE PARTÍCULAS DORADAS
   ============================================================ */

(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  /* Colores dorados / marfil */
  const PALETTE = [
    'rgba(201,168,76,',   // gold principal
    'rgba(226,200,122,',  // gold claro
    'rgba(240,224,168,',  // gold muy claro
    'rgba(255,253,246,',  // marfil
    'rgba(139,105,20,',   // gold oscuro
  ];

  function Particle() {
    this.reset();
  }

  Particle.prototype.reset = function() {
    this.x    = Math.random() * (W || 800);
    this.y    = Math.random() * (H || 600);
    this.r    = Math.random() * 2.2 + .4;
    this.vx   = (Math.random() - .5) * .4;
    this.vy   = (Math.random() - .5) * .4;
    this.life = Math.random();       // 0..1 fase
    this.speed= Math.random() * .004 + .001;
    this.col  = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    /* Tipo: 0=punto, 1=estrella pequeña, 2=rombo */
    this.type = Math.floor(Math.random() * 3);
  };

  /* Crea las partículas */
  function buildParticles(n) {
    particles = [];
    for (let i = 0; i < n; i++) {
      const p = new Particle();
      p.life = Math.random(); // arrancan en fases aleatorias
      particles.push(p);
    }
  }

  /* Dibuja una estrellita de 4 puntas */
  function drawStar(ctx, x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const len = i % 2 === 0 ? r : r * .4;
      const px  = x + Math.cos(ang) * len;
      const py  = y + Math.sin(ang) * len;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  /* Dibuja un rombo */
  function drawDiamond(ctx, x, y, r) {
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.lineTo(x + r * .55, y);
    ctx.lineTo(x, y + r);
    ctx.lineTo(x - r * .55, y);
    ctx.closePath();
    ctx.fill();
  }

  let last = 0;
  function loop(ts) {
    const dt = Math.min(ts - last, 50); last = ts;
    ctx.clearRect(0, 0, W, H);

    for (const p of particles) {
      p.life += p.speed;
      if (p.life > 1) p.life = 0;

      /* Opacidad con curva senoidal suave */
      const alpha = Math.sin(p.life * Math.PI) * .55;
      if (alpha < .01) continue;

      p.x += p.vx;
      p.y += p.vy;

      /* Rebote suave en bordes */
      if (p.x < -20 || p.x > W + 20) p.vx *= -1;
      if (p.y < -20 || p.y > H + 20) p.vy *= -1;

      ctx.fillStyle = p.col + alpha + ')';

      if (p.type === 0) {
        /* Punto con glow */
        ctx.shadowBlur  = p.r * 6;
        ctx.shadowColor = p.col + '.6)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (p.type === 1) {
        drawStar(ctx, p.x, p.y, p.r * 1.8);
      } else {
        drawDiamond(ctx, p.x, p.y, p.r * 1.5);
      }
    }

    /* Líneas muy tenues entre partículas cercanas */
    const maxDist = 110;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * .04;
          ctx.strokeStyle = `rgba(201,168,76,${alpha})`;
          ctx.lineWidth   = .5;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => { resize(); buildParticles(count()); });

  function count() {
    return window.innerWidth < 600 ? 45 : 80;
  }

  resize();
  buildParticles(count());
  requestAnimationFrame(loop);
})();

/* ============================================================
   PÉTALOS FLOTANTES
   ============================================================ */

(function initPetals() {
  const layer  = document.getElementById('petalsLayer');
  const COLORS = [
    'rgba(201,168,76,.55)',
    'rgba(226,200,122,.45)',
    'rgba(240,224,168,.5)',
    'rgba(255,253,246,.65)',
  ];

  function createPetal() {
    const el     = document.createElement('div');
    el.className = 'petal';

    /* Posición inicial y parámetros aleatorios */
    const size    = Math.random() * 10 + 7;
    const left    = Math.random() * 110 - 5;
    const duration= Math.random() * 12 + 10;
    const delay   = Math.random() * 8;
    const drift   = (Math.random() - .5) * 180; /* desplazamiento lateral */

    el.style.cssText = `
      left: ${left}%;
      width: ${size}px;
      height: ${size * 1.35}px;
      background: ${COLORS[Math.floor(Math.random() * COLORS.length)]};
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      --drift: ${drift}px;
    `;

    layer.appendChild(el);

    /* Remover y recrear al terminar */
    el.addEventListener('animationend', () => {
      el.remove();
      createPetal();
    });
  }

  /* Número de pétalos según pantalla */
  const n = window.innerWidth < 600 ? 10 : 18;
  for (let i = 0; i < n; i++) createPetal();

  /* Hacer que los pétalos deriven lateralmente con translateX */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes petalFall {
      0%   { opacity:0;   transform:translateY(0)     translateX(0)          rotate(0deg)   scale(.7); }
      5%   { opacity:.35; }
      50%  {              transform:translateY(50vh)  translateX(var(--drift,0px)) rotate(270deg) scale(.9); }
      90%  { opacity:.2; }
      100% { opacity:0;   transform:translateY(115vh) translateX(var(--drift,0px)) rotate(540deg) scale(.8); }
    }
  `;
  document.head.appendChild(style);
})();

/* ============================================================
   SISTEMA DE SLIDES
   ============================================================ */

const slides   = document.querySelectorAll('.slide');
const dots     = document.querySelectorAll('.dot');
const prevBtn  = document.getElementById('prevBtn');
const nextBtn  = document.getElementById('nextBtn');
let current    = 0;
let animating  = false;

function goTo(idx) {
  if (animating || idx === current) return;
  if (idx < 0 || idx >= slides.length) return;

  animating = true;

  const leaving  = slides[current];
  const entering = slides[idx];

  leaving.classList.remove('active');
  if (idx > current) leaving.classList.add('exit-left');

  dots[current].classList.remove('active');
  dots[idx].classList.add('active');

  current = idx;
  entering.classList.add('active');
  entering.scrollTop = 0;

  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === slides.length - 1;

  setTimeout(() => {
    document.querySelectorAll('.slide.exit-left')
            .forEach(s => s.classList.remove('exit-left'));
    animating = false;
  }, 700);
}

prevBtn.addEventListener('click', () => goTo(current - 1));
nextBtn.addEventListener('click', () => goTo(current + 1));
dots.forEach(d => d.addEventListener('click', () => goTo(+d.dataset.slide)));

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(current + 1);
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goTo(current - 1);
});

let tx = 0, ty = 0;
document.addEventListener('touchstart', e => {
  tx = e.changedTouches[0].screenX;
  ty = e.changedTouches[0].screenY;
}, { passive: true });

document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].screenX - tx;
  const dy = e.changedTouches[0].screenY - ty;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 45) {
    goTo(dx < 0 ? current + 1 : current - 1);
  }
}, { passive: true });

prevBtn.disabled = true;

/* ============================================================
   CUENTA REGRESIVA
   ============================================================ */

const WEDDING = new Date('2026-05-09T17:00:00-06:00');
const [elD, elH, elM, elS] = ['c-days','c-hours','c-minutes','c-seconds']
  .map(id => document.getElementById(id));

function pad2(n) { return String(n).padStart(2, '0'); }

function tick(el) {
  el.classList.remove('tick');
  void el.offsetWidth;
  el.classList.add('tick');
  setTimeout(() => el.classList.remove('tick'), 250);
}

function updateCountdown() {
  const diff = WEDDING - Date.now();
  if (diff <= 0) {
    [elD, elH, elM, elS].forEach(e => e && (e.textContent = '00'));
    return;
  }
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  if (elS && elS.textContent !== pad2(s)) tick(elS);

  if (elD) elD.textContent = pad2(d);
  if (elH) elH.textContent = pad2(h);
  if (elM) elM.textContent = pad2(m);
  if (elS) elS.textContent = pad2(s);
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* ============================================================
   FORMULARIO
   ============================================================ */

const formWrap   = document.getElementById('formWrap');
const successCard= document.getElementById('successCard');
const successIcon= document.getElementById('successIcon');
const successText= document.getElementById('successText');
const fieldError = document.getElementById('fieldError');
const sendingMsg = document.getElementById('sendingMsg');
const btnConfirm = document.getElementById('btnConfirm');
const btnDecline = document.getElementById('btnDecline');

function showError(msg) { if (fieldError) fieldError.textContent = msg; }
function setBtns(disabled) {
  if (btnConfirm) btnConfirm.disabled = disabled;
  if (btnDecline) btnDecline.disabled = disabled;
  if (sendingMsg) sendingMsg.style.display = disabled ? 'block' : 'none';
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;')
           .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showSuccess(familia, asiste) {
  if (formWrap) formWrap.style.display = 'none';
  if (asiste === 'Sí') {
    if (successIcon) successIcon.textContent = '🎊';
    if (successText) successText.innerHTML =
      `¡Gracias, <em>Familia ${escHtml(familia)}</em>!<br>
       Estamos emocionados de celebrar este día con ustedes.`;
  } else {
    if (successIcon) successIcon.textContent = '💛';
    if (successText) successText.innerHTML =
      `Gracias, <em>Familia ${escHtml(familia)}</em>.<br>
       Los tendremos presentes en nuestro corazón.`;
  }
  if (successCard) successCard.style.display = 'block';
}

async function submit(asiste) {
  const familiaEl  = document.getElementById('familia');
  const cantidadEl = document.getElementById('cantidad');
  const familia    = familiaEl ? familiaEl.value.trim() : '';
  const cantidad   = cantidadEl ? cantidadEl.value : '0';

  showError('');
  if (!familia) {
    showError('Por favor ingresa el nombre de tu familia.');
    if (familiaEl) familiaEl.focus();
    return;
  }

  /* Modo desarrollo: simular si no se configuró la URL */
  if (APPS_SCRIPT_URL === 'PEGA_AQUI_TU_URL_DE_GOOGLE_APPS_SCRIPT') {
    console.warn('[DEV] URL no configurada — simulando envío.');
    showSuccess(familia, asiste);
    return;
  }

  setBtns(true);
  try {
    const params = new URLSearchParams({ familia, cantidad, asiste });
    await fetch(APPS_SCRIPT_URL, { method:'POST', mode:'no-cors', body:params });
    showSuccess(familia, asiste);
  } catch(e) {
    console.error(e);
    setBtns(false);
    showError('Hubo un problema. Por favor intenta de nuevo.');
  }
}

/* ============================================================
   REPRODUCTOR SPOTIFY — Toggle
   ============================================================ */

(function initSpotify() {
  const player = document.getElementById('spotifyPlayer');
  const toggle = document.getElementById('spotifyToggle');
  if (!player || !toggle) return;

  /* Inicia expandido */
  let collapsed = false;

  toggle.addEventListener('click', () => {
    collapsed = !collapsed;
    player.classList.toggle('collapsed', collapsed);
    /* Actualizar texto del botón */
    const lbl = toggle.querySelector('.spotify-label-btn');
    if (lbl) lbl.textContent = collapsed ? 'Música' : 'Ocultar';
  });
})();

if (btnConfirm) btnConfirm.addEventListener('click', () => submit('Sí'));
if (btnDecline) btnDecline.addEventListener('click', () => submit('No'));