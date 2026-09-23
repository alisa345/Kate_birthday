'use strict';
(() => {
  const journal = document.querySelector('#quest-log');
  if (!journal) return;
  // Existing buff receives only an anchor; its content and presentation stay intact.
  const buff = document.querySelector('.character-layout .companions');
  if (buff) buff.id = 'character-permanent-buff';
  if (!('IntersectionObserver' in window)) return;
  journal.classList.add('quest-motion');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .04 });
  journal.querySelectorAll('.quest-entry').forEach(entry => observer.observe(entry));
})();
