/* Native language links work without JS; JS preserves an in-page location. */
(() => {
  function updateLinks() {
    document.querySelectorAll('.language-switch a').forEach(link => {
      const target = new URL(link.getAttribute('href'), location.origin);
      target.search = location.search;
      target.hash = location.hash;
      link.href = target.pathname + target.search + target.hash;
    });
  }
  updateLinks();
  window.addEventListener('hashchange', updateLinks);
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank' || link.hasAttribute('download')) return;
    if (link.matches('[data-service-card]') && link.getAttribute('aria-current') !== 'true') return;
    const target = new URL(link.href, location.href);
    if (target.origin !== location.origin || !/^\/(?:(?:en|yue)\/)?(?:services|about|insights|contact)?\/?$/.test(target.pathname)) return;
    if (link.closest('.language-switch')) updateLinks();
    if (target.pathname === location.pathname && target.search === location.search) return;
    // The original project is a static export. Locale routes use full documents,
    // keeping Next's original unprefixed client router out of locale navigation.
    event.preventDefault();
    event.stopImmediatePropagation();
    location.assign(link.href);
  }, true);
})();
