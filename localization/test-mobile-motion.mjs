import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../home-introduction-motion-20261014-1.js', import.meta.url), 'utf8');
function scenario(mobile, reduced, supported = true) {
  const calls = [], observers = [], events = {}, listeners = [];
  const media = [{ matches: mobile }, { matches: reduced }];
  media.forEach(query => query.addEventListener = (event, callback) => listeners.push(callback));
  const chars = Array.from({ length: 8 }, () => ({ animate(frames, options) {
    const animation = { cancelled: false, cancel() { this.cancelled = true; this.oncancel?.(); } };
    calls.push({ frames, options, animation });
    return animation;
  } }));
  const paragraph = { querySelectorAll: () => chars };
  class Observer {
    constructor(callback, options) { this.callback = callback; this.options = options; this.targets = []; observers.push(this); }
    observe(target) { this.targets.push(target); }
    disconnect() { this.disconnected = true; }
  }
  vm.runInNewContext(source, {
    matchMedia: query => query.includes('767px') ? media[0] : media[1],
    Element: { prototype: { animate: supported ? function() {} : undefined } },
    IntersectionObserver: Observer,
    window: { IntersectionObserver: Observer, addEventListener: (name, callback) => events[name] = callback },
    document: { readyState: 'complete', querySelectorAll: selector => {
      assert.equal(selector, '#services .scroll-reveal__text');
      return [paragraph];
    } },
  });
  return { calls, observers, events, listeners, media, paragraph };
}
for (const [mobile, reduced, supported] of [[false, false, true], [true, true, true], [true, false, false]]) {
  const s = scenario(mobile, reduced, supported);
  assert.equal(s.observers.length, 0, 'Desktop, reduced motion and unsupported browsers remain readable without a new animation');
  assert.equal(s.calls.length, 0);
}
const s = scenario(true, false);
assert.equal(s.observers[0].options.rootMargin, '0px 0px -25% 0px');
s.observers[0].callback([{ target: s.paragraph, isIntersecting: true }]);
assert.equal(s.calls.length, 8);
for (const { frames, options } of s.calls) {
  assert.deepEqual(Object.keys(frames[0]), ['opacity'], 'No rotations, scales or position changes');
  assert.equal(frames[0].opacity, .32, 'The text is never fully hidden');
  assert.equal(frames[1].opacity, 1);
  assert.equal(options.fill, 'backwards', 'After completion the normal readable style resumes');
}
assert.equal(s.calls[0].options.delay, 0);
assert.equal(s.calls[7].options.delay, 1200);
s.observers[0].callback([{ target: s.paragraph, isIntersecting: true }]);
assert.equal(s.calls.length, 8, 'No repeated trigger while the text remains visible');
s.observers[0].callback([{ target: s.paragraph, isIntersecting: false }]);
s.observers[0].callback([{ target: s.paragraph, isIntersecting: true }]);
assert.equal(s.calls.length, 16, 'Re-entering the section replays the effect');
s.media[1].matches = true;
s.listeners[1]();
assert(s.calls.every(call => call.animation.cancelled), 'Enabling reduced motion cancels pending animations');
const back = scenario(true, false);
back.events.pageshow({ persisted: false });
assert.equal(back.observers.length, 1, 'Normal page load does not restart the initial effect');
back.events.pageshow({ persisted: true });
assert.equal(back.observers.length, 2, 'Browser back-cache restoration reconnects the observer');
assert(back.observers[0].disconnected);
back.observers[1].callback([{ target: back.paragraph, isIntersecting: true }]);
back.events.pagehide();
assert(back.calls.every(call => call.animation.cancelled), 'Leaving the page cancels its animations');
console.log('Mobile fade tests passed: scoped, opacity-only, readable fallback, replay, reduced motion and browser back support.');
