/* Mobile-only companion to the existing desktop reveal. No layout transforms. */
(() => {
  const mobile = matchMedia('(max-width: 767px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let observer;
  const animations = new Set();
  const cancel = () => { for (const animation of animations) animation.cancel(); animations.clear(); };
  function configure() {
    observer?.disconnect();
    cancel();
    if (!mobile.matches || reduced.matches || !Element.prototype.animate || !window.IntersectionObserver) return;
    const paragraphs = document.querySelectorAll('#services .scroll-reveal__text');
    const entered = new WeakSet();
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) { entered.delete(entry.target); continue; }
        if (entered.has(entry.target)) continue;
        entered.add(entry.target);
        const characters = [...entry.target.querySelectorAll('[data-scroll-reveal-character]')];
        characters.forEach((character, index) => {
          const animation = character.animate([{ opacity: .32 }, { opacity: 1 }], {
            duration: 700,
            delay: 1200 * index / Math.max(1, characters.length - 1),
            easing: 'ease-out',
            fill: 'backwards',
          });
          animations.add(animation);
          animation.onfinish = () => { animations.delete(animation); animation.cancel(); };
          animation.oncancel = () => animations.delete(animation);
        });
      }
    }, { rootMargin: '0px 0px -25% 0px', threshold: 0 });
    paragraphs.forEach(paragraph => observer.observe(paragraph));
  }
  const listen = query => query.addEventListener ? query.addEventListener('change', configure) : query.addListener(configure);
  listen(mobile);
  listen(reduced);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', configure, { once: true });
  else configure();
  window.addEventListener('pagehide', cancel);
  window.addEventListener('pageshow', event => { if (event.persisted) configure(); });
})();
