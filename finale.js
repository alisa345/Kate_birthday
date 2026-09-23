'use strict';
(() => {
  const message = document.querySelector('#player-two-message');
  const level = document.querySelector('#level-24');
  if (!message || !level) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let celebrated = false;
  let particles, cleanupTimer;
  function clearParticles() {
    clearTimeout(cleanupTimer);
    particles?.remove();
    particles = undefined;
  }
  function celebrate() {
    if (celebrated) return;
    celebrated = true;
    level.classList.add('is-received');
    if (motion.matches) return;
    particles = document.createElement('div');
    particles.className = 'level-pixels';
    particles.setAttribute('aria-hidden', 'true');
    const colors = ['var(--pink)', 'var(--gold)', 'var(--text)', 'var(--muted)'];
    for (let i = 0; i < 44; i++) {
      const pixel = document.createElement('i');
      pixel.className = 'level-pixel';
      // Keep the central reading area clear; particles frame the level text.
      const x = i % 2 ? 4 + Math.random() * 19 : 77 + Math.random() * 19;
      pixel.style.cssText = `--x:${x}%;--size:${3 + Math.random() * 4}px;--color:${colors[i % colors.length]};--delay:${Math.random() * .45}s;--drift:${(Math.random() - .5) * 30}px;--fall:${level.clientHeight * .7}px`;
      particles.append(pixel);
    }
    level.append(particles);
    cleanupTimer = setTimeout(clearParticles, 3200);
  }
  message.querySelector('.finale-continue').addEventListener('click', event => {
    event.preventDefault();
    level.scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth', block: 'start' });
    // Move keyboard focus as well, without interrupting the scroll animation.
    const title = level.querySelector('h2');
    title.setAttribute('tabindex', '-1');
    title.focus({ preventScroll: true });
  });
  motion.addEventListener('change', () => { if (motion.matches) clearParticles(); });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (entry.target === level) celebrate();
        else message.classList.add('is-received');
        observer.unobserve(entry.target);
      });
    }, { threshold: .12 });
    observer.observe(message);
    observer.observe(level);
  } else {
    // Older browsers still get readable content and a viewport-triggered finale.
    const check = () => {
      const rect = level.getBoundingClientRect();
      if (rect.top < innerHeight * .88 && rect.bottom > 0) {
        celebrate();
        window.removeEventListener('scroll', check);
      }
    };
    window.addEventListener('scroll', check, { passive: true });
    check();
  }
})();
