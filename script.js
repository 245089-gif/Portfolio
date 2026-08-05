// ============================================
// YEAR
// ============================================
document.getElementById('year').textContent = new Date().getFullYear();

// ============================================
// CUSTOM CURSOR
// ============================================
const cursorDot = document.getElementById('cursorDot');
if (window.matchMedia('(hover: hover)').matches) {
  window.addEventListener('mousemove', (e) => {
    cursorDot.style.left = e.clientX + 'px';
    cursorDot.style.top = e.clientY + 'px';
    cursorDot.classList.add('active');
  });
  document.querySelectorAll('a, button, .tag, .project-card, input, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => cursorDot.classList.add('grow'));
    el.addEventListener('mouseleave', () => cursorDot.classList.remove('grow'));
  });
}

// ============================================
// MATRIX RAIN BACKGROUND
// ============================================
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');
let matrixCols = [];
const chars = '01アイウエオカキクケコサシスセソ$#&%{}[]<>/\\';

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = document.documentElement.scrollHeight;
  const fontSize = 15;
  const colCount = Math.floor(canvas.width / fontSize);
  matrixCols = new Array(colCount).fill(0).map(() => Math.random() * -100);
}
resizeCanvas();

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function drawMatrix() {
  const fontSize = 15;
  ctx.fillStyle = 'rgba(10, 14, 20, 0.06)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = fontSize + 'px monospace';

  for (let i = 0; i < matrixCols.length; i++) {
    const text = chars[Math.floor(Math.random() * chars.length)];
    const x = i * fontSize;
    const y = matrixCols[i] * fontSize;
    ctx.fillStyle = Math.random() > 0.97 ? '#29b6ff' : '#00e6a8';
    ctx.fillText(text, x, y);
    if (y > canvas.height && Math.random() > 0.975) {
      matrixCols[i] = 0;
    }
    matrixCols[i] += 0.6;
  }
}

let matrixInterval;
if (!prefersReducedMotion) {
  matrixInterval = setInterval(drawMatrix, 50);
}
window.addEventListener('resize', () => {
  resizeCanvas();
});

// ============================================
// HERO TERMINAL TYPING SEQUENCE
// ============================================
function typeText(el, text, speed, callback) {
  let i = 0;
  el.textContent = '';
  const interval = setInterval(() => {
    el.textContent += text.charAt(i);
    i++;
    if (i >= text.length) {
      clearInterval(interval);
      if (callback) callback();
    }
  }, speed);
}

function fadeIn(el) {
  el.style.transition = 'opacity .5s ease';
  el.style.opacity = '1';
}

function runHeroSequence() {
  const line1 = document.getElementById('typeLine1');
  const blink1 = document.getElementById('blink1');
  const out1 = document.getElementById('outLine1');
  const line2Wrap = document.getElementById('line2Wrap');
  const line2 = document.getElementById('typeLine2');
  const blink2 = document.getElementById('blink2');
  const out2 = document.getElementById('outLine2');
  const line3Wrap = document.getElementById('line3Wrap');
  const line3 = document.getElementById('typeLine3');
  const blink3 = document.getElementById('blink3');
  const termTags = document.getElementById('termTags');
  const heroActions = document.getElementById('heroActions');

  typeText(line1, 'whoami', 90, () => {
    blink1.style.display = 'none';
    setTimeout(() => {
      out1.textContent = 'Zoha Aziz — Learning Ethical Hacking | Web Developer';
      fadeIn(out1);
      fadeIn(line2Wrap);
      setTimeout(() => {
        typeText(line2, "cat status.txt", 90, () => {
          blink2.style.display = 'none';
          setTimeout(() => {
            out2.textContent = 'BS Cybersecurity @ Air University — Semester 4';
            fadeIn(out2);
            fadeIn(line3Wrap);
            setTimeout(() => {
              typeText(line3, 'ls interests/', 90, () => {
                blink3.style.display = 'none';
                termTags.innerHTML = ['security','web-dev','ctf','books','basketball']
                  .map(t => `<span class="tchip">${t}</span>`).join('');
                fadeIn(termTags);
                fadeIn(heroActions);
              });
            }, 400);
          }, 300);
        });
      }, 400);
    }, 300);
  });
}
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(runHeroSequence, 500);
});

// ============================================
// SCROLL REVEAL FOR SECTIONS
// ============================================
const revealTargets = document.querySelectorAll('.section');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
    }
  });
}, { threshold: 0.15 });
revealTargets.forEach(sec => revealObserver.observe(sec));

// ============================================
// COUNTER ANIMATION (about stats)
// ============================================
const statNums = document.querySelectorAll('.stat-num');
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 40));
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = current;
      }, 30);
      statObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
statNums.forEach(el => statObserver.observe(el));

// ============================================
// NAV: active link + scroll shadow + mobile toggle
// ============================================
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen);
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

const sections = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('.nav-link');
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinkEls.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
      });
    }
  });
}, { threshold: 0.4, rootMargin: '-80px 0px -40% 0px' });
sections.forEach(sec => navObserver.observe(sec));

// ============================================
// CONTACT FORM (FormSubmit — sends a real email, no backend/DB needed)
// ============================================
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const sendBtn = document.getElementById('sendBtn');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  sendBtn.disabled = true;
  formStatus.textContent = '> sending...';

  try {
    const formData = new FormData(contactForm);
    const response = await fetch(contactForm.action, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      formStatus.textContent = '> message sent successfully. I\'ll reply soon!';
      contactForm.reset();
    } else {
      throw new Error('Submission failed');
    }
  } catch (err) {
    formStatus.textContent = '> something went wrong — please email me directly instead.';
  } finally {
    sendBtn.disabled = false;
  }
});