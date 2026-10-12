(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const attached = new WeakSet();
  function attach(video) {
    if (attached.has(video)) return;
    attached.add(video);
    let visible = true;
    const update = () => {
      if (document.hidden || !visible || reducedMotion.matches || navigator.connection?.saveData) {
        video.pause();
      } else {
        video.play()?.catch(() => {});
      }
    };
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        update();
      }, { threshold: 0.05 });
      observer.observe(video);
    }
    document.addEventListener('visibilitychange', update);
    reducedMotion.addEventListener?.('change', update);
    video.addEventListener('loadeddata', update);
    update();
  }
  const scan = () => document.querySelectorAll('video[aria-hidden="true"]').forEach(attach);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan, { once: true });
  else scan();
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
})();
