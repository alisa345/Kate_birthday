'use strict';
(() => {
  const stories = [...document.querySelectorAll('#lore .story')];
  const questEntries = [...document.querySelectorAll('#quest-log .quest-entry')];
  if ((!stories.length && !questEntries.length) || typeof HTMLDialogElement === 'undefined') return;
  const loreMemories = stories.map(story => ({
    src: story.querySelector('.story-visual img').getAttribute('src'),
    alt: story.querySelector('.story-visual img').alt,
    date: story.querySelector('time').textContent,
    title: story.querySelector('h3').textContent,
    description: story.querySelector('p').innerText
  }));
  const questMemories = questEntries.map(entry => ({
    src: entry.querySelector('.quest-scene img').getAttribute('src'),
    alt: entry.querySelector('.quest-scene img').alt,
    date: `${entry.querySelector('.quest-type').textContent} / ${entry.querySelector('.quest-status').textContent.replace('✓', '').trim()}`,
    title: entry.querySelector('.quest-title').textContent,
    description: entry.querySelector('.quest-description').textContent
  }));
  let memories = loreMemories;
  const dialog = document.createElement('dialog');
  dialog.className = 'memory-dialog';
  dialog.id = 'lore-memory';
  dialog.setAttribute('aria-labelledby', 'memory-title');
  dialog.setAttribute('aria-describedby', 'memory-description');
  dialog.innerHTML = `
    <div class="memory-header"><span>CUTSCENE / MEMORY</span><button type="button" class="memory-close" aria-label="Закрыть воспоминание" autofocus>X</button></div>
    <div class="memory-picture"><img alt="" width="1536" height="1024"><span class="memory-status" role="status" hidden></span></div>
    <div class="memory-caption" aria-live="polite" aria-atomic="true"><span class="memory-date"></span><h2 class="memory-title" id="memory-title"></h2><p class="memory-description" id="memory-description"></p></div>
    <div class="memory-footer"><button type="button" class="memory-prev" aria-label="Предыдущее воспоминание">←</button><span class="memory-counter"></span><button type="button" class="memory-next" aria-label="Следующее воспоминание">→</button></div>`;
  document.body.append(dialog);
  const image = dialog.querySelector('img');
  const status = dialog.querySelector('.memory-status');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0, request = 0, opener, scrollPosition, savedBody, animation;
  const properties = ['position', 'top', 'left', 'width', 'padding-right', 'box-sizing'];

  async function display(next) {
    index = (next + memories.length) % memories.length;
    const memory = memories[index];
    const ticket = ++request;
    animation?.cancel();
    dialog.querySelector('.memory-date').textContent = memory.date;
    dialog.querySelector('.memory-title').textContent = memory.title;
    dialog.querySelector('.memory-description').textContent = memory.description;
    dialog.querySelector('.memory-counter').textContent = `${String(index + 1).padStart(2, '0')} / ${String(memories.length).padStart(2, '0')}`;
    dialog.querySelector('.memory-caption').scrollTop = 0;
    image.style.visibility = 'hidden';
    image.alt = memory.alt;
    status.textContent = 'ЗАГРУЗКА ВОСПОМИНАНИЯ…';
    status.hidden = false;
    const pending = new Image();
    pending.src = memory.src;
    try {
      await pending.decode();
      if (ticket !== request || !dialog.open) return;
      image.src = pending.src;
      image.style.visibility = 'visible';
      status.hidden = true;
      if (!motion.matches && image.animate) {
        animation = image.animate([{ opacity: .55 }, { opacity: 1, offset: .4 }, { opacity: .83, offset: .6 }, { opacity: 1 }], { duration: 150 });
      }
    } catch {
      if (ticket !== request || !dialog.open) return;
      status.textContent = 'НЕ УДАЛОСЬ ЗАГРУЗИТЬ КАДР. ВЫБЕРИ ДРУГОЕ ВОСПОМИНАНИЕ.';
    }
  }

  function open(next, trigger, collection = loreMemories, label = 'CUTSCENE / MEMORY') {
    if (dialog.open) return;
    if (typeof beep === 'function') beep(520);
    memories = collection;
    const isQuest = collection === questMemories;
    dialog.querySelector('.memory-prev').setAttribute('aria-label', isQuest ? 'Предыдущая катсцена' : 'Предыдущее воспоминание');
    dialog.querySelector('.memory-next').setAttribute('aria-label', isQuest ? 'Следующая катсцена' : 'Следующее воспоминание');
    dialog.querySelector('.memory-close').setAttribute('aria-label', isQuest ? 'Закрыть катсцену' : 'Закрыть воспоминание');
    dialog.querySelector('.memory-header > span').textContent = label;
    opener = trigger;
    scrollPosition = { x: window.scrollX, y: window.scrollY };
    const body = document.body;
    savedBody = properties.map(name => [name, body.style.getPropertyValue(name), body.style.getPropertyPriority(name)]);
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const padding = parseFloat(getComputedStyle(body).paddingRight) || 0;
    body.style.position = 'fixed';
    body.style.top = `-${scrollPosition.y}px`;
    body.style.left = `-${scrollPosition.x}px`;
    body.style.width = '100%';
    body.style.boxSizing = 'border-box';
    body.style.paddingRight = `${padding + scrollbar}px`;
    dialog.showModal();
    display(next);
  }

  stories.forEach((story, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'memory-trigger';
    button.setAttribute('aria-label', `Открыть воспоминание: ${loreMemories[i].date} — ${loreMemories[i].title}`);
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', dialog.id);
    button.addEventListener('click', () => open(i, button));
    story.querySelector('.story-visual').append(button);
  });
  questEntries.forEach((entry, i) => {
    const button = entry.querySelector('.quest-cutscene-trigger');
    button.addEventListener('click', () => open(i, button, questMemories, 'QUEST CUTSCENE'));
  });
  dialog.querySelector('.memory-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.memory-prev').addEventListener('click', () => display(index - 1));
  dialog.querySelector('.memory-next').addEventListener('click', () => display(index + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      event.stopPropagation();
      display(index + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  // Native dialog supplies Escape handling, focus containment and inert background.
  function isBackdrop(event) {
    const bounds = dialog.getBoundingClientRect();
    return event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom);
  }
  let backdropPress = false;
  dialog.addEventListener('pointerdown', event => { backdropPress = isBackdrop(event); });
  dialog.addEventListener('click', event => { if (backdropPress && isBackdrop(event)) dialog.close(); backdropPress = false; });
  dialog.addEventListener('close', () => {
    ++request;
    animation?.cancel();
    for (const [name, value, priority] of savedBody || []) {
      if (value) document.body.style.setProperty(name, value, priority);
      else document.body.style.removeProperty(name);
    }
    opener?.focus({ preventScroll: true });
    if (scrollPosition) window.scrollTo({ left: scrollPosition.x, top: scrollPosition.y, behavior: 'instant' });
  });
  motion.addEventListener('change', () => { if (motion.matches) animation?.cancel(); });
})();
