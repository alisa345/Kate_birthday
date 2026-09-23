'use strict';
(() => {
  const viewer = document.querySelector('.character-viewer');
  if (!viewer) return;
  const stage = viewer.querySelector('.viewer-stage');
  const render = viewer.querySelector('#character-render');
  const announcement = viewer.querySelector('#viewer-announcement');
  const error = viewer.querySelector('.viewer-error');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const outfits = {
    default: { label: 'DEFAULT', description: 'Серый лонгслив, свободные джинсы. Базовая комплектация легенды.' },
    dress: { label: 'DRESS', description: 'Чёрное платье и высокие сапоги. Особый случай — каждый день.' },
    casual: { label: 'CASUAL', description: 'Белая майка, любимые джинсы и татуировки. Режим свободной игры.' }
  };
  let current = { outfit: 'default', view: 'front' };
  let desired = { ...current };
  let version = 0;
  let animation;
  const cache = new Map();
  const source = (outfit, view) => `assets/character/${outfit}/${view}.png`;

  function preload(path) {
    if (!cache.has(path)) {
      const image = new Image();
      const ready = new Promise((resolve, reject) => {
        image.onload = () => image.decode().then(() => resolve(image), reject);
        image.onerror = () => reject(new Error(`Cannot load character asset: ${path}`));
      });
      image.src = path;
      cache.set(path, ready);
      ready.catch(() => cache.delete(path));
    }
    return cache.get(path);
  }

  async function fade(frames, duration) {
    if (motion.matches || !render.animate) return;
    animation = render.animate(frames, { duration, easing: 'ease-out', fill: 'forwards' });
    try { await animation.finished; } catch { /* Superseded by a newer selection. */ }
  }

  function updateControls() {
    viewer.querySelectorAll('[data-outfit]').forEach(button => {
      const active = button.dataset.outfit === current.outfit;
      button.classList.toggle('selected', active);
      button.setAttribute('aria-pressed', String(active));
      button.querySelector('small').textContent = active ? 'EQUIPPED' : 'AVAILABLE';
    });
    viewer.querySelectorAll('[data-view]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.view === current.view));
    });
    viewer.querySelector('#outfit-name').textContent = outfits[current.outfit].label;
    viewer.querySelector('#outfit-description').textContent = outfits[current.outfit].description;
    viewer.querySelector('.viewer-angle').textContent = current.view === 'front' ? '000°' : '180°';
    const viewName = current.view === 'front' ? 'Вид спереди' : 'Вид сзади';
    render.alt = `Low-poly персонаж Катя: ${outfits[current.outfit].label}, ${viewName.toLowerCase()}`;
    announcement.textContent = `${outfits[current.outfit].label}. ${viewName}.`;
  }

  async function change(next, isTurn = false) {
    desired = { ...next };
    const ticket = ++version;
    animation?.cancel();
    stage.setAttribute('aria-busy', 'true');
    stage.classList.remove('turning');
    error.hidden = true;
    try {
      const image = await preload(source(next.outfit, next.view));
      if (ticket !== version) return;
      stage.classList.toggle('turning', isTurn);
      // Two separately rendered views. No rotateY, mirroring or flattened pseudo-3D.
      await fade([{ opacity: 1 }, { opacity: .12 }], isTurn ? 110 : 90);
      if (ticket !== version) return;
      render.src = image.src;
      current = { ...next };
      updateControls();
      await fade([{ opacity: .12 }, { opacity: 1 }], isTurn ? 160 : 130);
      if (ticket !== version) return;
      animation?.cancel();
    } catch {
      if (ticket !== version) return;
      desired = { ...current };
      error.hidden = false;
      announcement.textContent = 'Не удалось загрузить образ. Предыдущий образ сохранён.';
    } finally {
      if (ticket === version) {
        stage.setAttribute('aria-busy', 'false');
        stage.classList.remove('turning');
      }
    }
  }

  function turn() {
    change({ ...desired, view: desired.view === 'front' ? 'back' : 'front' }, true);
    if (typeof beep === 'function') beep(420);
  }
  viewer.querySelectorAll('.view-arrow').forEach(button => button.addEventListener('click', turn));
  viewer.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.view !== desired.view) {
      change({ ...desired, view: button.dataset.view }, true);
      if (typeof beep === 'function') beep(420);
    }
  }));
  viewer.querySelectorAll('[data-outfit]').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.outfit !== desired.outfit || !error.hidden) {
      change({ ...desired, outfit: button.dataset.outfit });
      if (typeof beep === 'function') beep(560);
    }
  }));
  viewer.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      turn();
    }
  });
  motion.addEventListener('change', () => { if (motion.matches) animation?.finish(); });
  // Warm the alternate views on approaching the viewer, keeping the initial hero lightweight.
  function warmAssets() {
    for (const outfit of Object.keys(outfits)) {
      for (const view of ['front', 'back']) preload(source(outfit, view)).catch(() => {});
    }
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { warmAssets(); observer.disconnect(); }
    }, { rootMargin: '250px' });
    observer.observe(viewer);
  } else warmAssets();
})();
